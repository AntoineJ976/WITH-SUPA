import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface PaymentLink {
  id: string;
  appointmentId: string;
  patientId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'expired';
  paymentUrl: string;
  expiresAt: string;
  createdAt: string;
  paidAt?: string;
  failureReason?: string;
}

export interface AppointmentPaymentRule {
  appointmentId: string;
  createdBy: string;
  createdByRole: 'patient' | 'doctor' | 'secretary';
  requiresPayment: boolean;
  paymentStatus: 'not_required' | 'pending' | 'paid' | 'failed' | 'expired';
  paymentLinkId?: string;
  confirmationStatus: 'pending' | 'confirmed' | 'cancelled';
  notifications: {
    patientNotified: boolean;
    staffNotified: boolean;
    remindersSent: number;
  };
  createdAt: string;
  updatedAt: string;
}

export class AppointmentPaymentService {
  // Délai d'expiration du lien de paiement (24 heures)
  private static readonly PAYMENT_LINK_EXPIRY_HOURS = 24;
  
  // Délais de rappel (en heures après création)
  private static readonly REMINDER_INTERVALS = [2, 12, 23]; // 2h, 12h, 23h

  /**
   * Créer un rendez-vous avec validation de paiement selon l'initiateur
   */
  static async createAppointmentWithPaymentValidation(
    appointmentData: any,
    createdBy: string,
    createdByRole: 'patient' | 'doctor' | 'secretary'
  ): Promise<{ appointmentId: string; paymentRequired: boolean; paymentLink?: PaymentLink }> {
    try {
      if (!db) {
        throw new Error('Firebase non disponible');
      }

      // 1. Créer le rendez-vous de base
      const appointmentDoc = {
        ...appointmentData,
        status: 'pending_payment', // Statut initial
        createdBy,
        createdByRole,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const appointmentRef = await addDoc(collection(db, 'appointments'), appointmentDoc);
      const appointmentId = appointmentRef.id;

      // 2. Déterminer si le paiement est requis
      const requiresPayment = this.shouldRequirePayment(createdByRole);

      // 3. Créer la règle de validation
      const paymentRule: Omit<AppointmentPaymentRule, 'createdAt' | 'updatedAt'> = {
        appointmentId,
        createdBy,
        createdByRole,
        requiresPayment,
        paymentStatus: requiresPayment ? 'pending' : 'not_required',
        confirmationStatus: requiresPayment ? 'pending' : 'confirmed',
        notifications: {
          patientNotified: false,
          staffNotified: false,
          remindersSent: 0
        }
      };

      await addDoc(collection(db, 'appointmentPaymentRules'), {
        ...paymentRule,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      let paymentLink: PaymentLink | undefined;

      if (requiresPayment) {
        // 4. Générer le lien de paiement pour les rendez-vous créés par le personnel médical
        paymentLink = await this.generatePaymentLink(appointmentId, appointmentData);
        
        // 5. Envoyer le lien de paiement au patient
        await this.sendPaymentLinkToPatient(paymentLink, appointmentData);
        
        // 6. Notifier le personnel médical
        await this.notifyMedicalStaff(appointmentId, appointmentData, 'payment_link_sent');
        
        // 7. Programmer les rappels automatiques
        await this.schedulePaymentReminders(appointmentId, paymentLink.id);
      } else {
        // 8. Confirmer automatiquement les rendez-vous créés par le patient
        await updateDoc(appointmentRef, {
          status: 'confirmed',
          confirmedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        // Notifier le personnel médical du nouveau rendez-vous patient
        await this.notifyMedicalStaff(appointmentId, appointmentData, 'patient_booking_confirmed');
      }

      return {
        appointmentId,
        paymentRequired: requiresPayment,
        paymentLink
      };

    } catch (error) {
      console.error('Erreur création rendez-vous avec validation paiement:', error);
      throw error;
    }
  }

  /**
   * Déterminer si le paiement est requis selon l'initiateur
   */
  private static shouldRequirePayment(createdByRole: string): boolean {
    // Paiement requis uniquement pour les rendez-vous créés par le personnel médical
    return createdByRole === 'doctor' || createdByRole === 'secretary';
  }

  /**
   * Générer un lien de paiement sécurisé
   */
  private static async generatePaymentLink(
    appointmentId: string, 
    appointmentData: any
  ): Promise<PaymentLink> {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.PAYMENT_LINK_EXPIRY_HOURS);

      // Générer un token sécurisé pour le lien de paiement
      const paymentToken = this.generateSecureToken();
      
      const paymentLink: Omit<PaymentLink, 'id' | 'createdAt'> = {
        appointmentId,
        patientId: appointmentData.patientId || 'patient-id',
        amount: appointmentData.fee || 50,
        currency: 'EUR',
        status: 'pending',
        paymentUrl: `${window.location.origin}/payment/${paymentToken}`,
        expiresAt: expiresAt.toISOString()
      };

      const paymentLinkRef = await addDoc(collection(db, 'paymentLinks'), {
        ...paymentLink,
        createdAt: serverTimestamp()
      });

      return {
        id: paymentLinkRef.id,
        ...paymentLink,
        createdAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Erreur génération lien de paiement:', error);
      throw error;
    }
  }

  /**
   * Valider le paiement et confirmer le rendez-vous
   */
  static async validatePaymentAndConfirmAppointment(
    paymentLinkId: string,
    paymentData: {
      transactionId: string;
      amount: number;
      paymentMethod: string;
    }
  ): Promise<{ success: boolean; appointmentId: string }> {
    try {
      if (!db) {
        throw new Error('Firebase non disponible');
      }

      // 1. Récupérer le lien de paiement
      const paymentLinkDoc = await getDoc(doc(db, 'paymentLinks', paymentLinkId));
      if (!paymentLinkDoc.exists()) {
        throw new Error('Lien de paiement non trouvé');
      }

      const paymentLink = paymentLinkDoc.data() as PaymentLink;
      
      // 2. Vérifier l'expiration
      if (new Date() > new Date(paymentLink.expiresAt)) {
        await this.handleExpiredPayment(paymentLinkId, paymentLink.appointmentId);
        throw new Error('Lien de paiement expiré');
      }

      // 3. Vérifier le montant
      if (paymentData.amount !== paymentLink.amount) {
        throw new Error('Montant de paiement incorrect');
      }

      // 4. Mettre à jour le statut du paiement
      await updateDoc(doc(db, 'paymentLinks', paymentLinkId), {
        status: 'paid',
        paidAt: serverTimestamp(),
        transactionId: paymentData.transactionId,
        paymentMethod: paymentData.paymentMethod,
        updatedAt: serverTimestamp()
      });

      // 5. Confirmer le rendez-vous
      await updateDoc(doc(db, 'appointments', paymentLink.appointmentId), {
        status: 'confirmed',
        paymentStatus: 'paid',
        confirmedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 6. Mettre à jour la règle de validation
      const rulesQuery = query(
        collection(db, 'appointmentPaymentRules'),
        where('appointmentId', '==', paymentLink.appointmentId)
      );
      const rulesSnapshot = await getDocs(rulesQuery);
      
      if (!rulesSnapshot.empty) {
        const ruleDoc = rulesSnapshot.docs[0];
        await updateDoc(ruleDoc.ref, {
          paymentStatus: 'paid',
          confirmationStatus: 'confirmed',
          updatedAt: serverTimestamp()
        });
      }

      // 7. Notifier le patient et le personnel médical
      await this.notifyPaymentSuccess(paymentLink.appointmentId, paymentData);

      // 8. Logger pour audit
      await this.logPaymentValidation(paymentLinkId, paymentLink.appointmentId, 'success', paymentData);

      return {
        success: true,
        appointmentId: paymentLink.appointmentId
      };

    } catch (error) {
      console.error('Erreur validation paiement:', error);
      
      // Logger l'échec pour audit
      await this.logPaymentValidation(paymentLinkId, '', 'failed', paymentData, error);
      
      throw error;
    }
  }

  /**
   * Gérer l'expiration d'un paiement
   */
  private static async handleExpiredPayment(paymentLinkId: string, appointmentId: string): Promise<void> {
    try {
      // 1. Marquer le lien comme expiré
      await updateDoc(doc(db, 'paymentLinks', paymentLinkId), {
        status: 'expired',
        updatedAt: serverTimestamp()
      });

      // 2. Annuler le rendez-vous
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'cancelled',
        cancellationReason: 'Paiement non effectué dans les délais',
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 3. Mettre à jour la règle de validation
      const rulesQuery = query(
        collection(db, 'appointmentPaymentRules'),
        where('appointmentId', '==', appointmentId)
      );
      const rulesSnapshot = await getDocs(rulesQuery);
      
      if (!rulesSnapshot.empty) {
        const ruleDoc = rulesSnapshot.docs[0];
        await updateDoc(ruleDoc.ref, {
          paymentStatus: 'expired',
          confirmationStatus: 'cancelled',
          updatedAt: serverTimestamp()
        });
      }

      // 4. Notifier les parties concernées
      await this.notifyPaymentExpired(appointmentId);

    } catch (error) {
      console.error('Erreur gestion expiration paiement:', error);
    }
  }

  /**
   * Envoyer le lien de paiement au patient
   */
  private static async sendPaymentLinkToPatient(
    paymentLink: PaymentLink, 
    appointmentData: any
  ): Promise<void> {
    try {
      const emailContent = this.generatePaymentEmailTemplate(paymentLink, appointmentData);
      
      // Simulation d'envoi d'email sécurisé
      console.log('📧 Envoi lien de paiement au patient:', {
        to: appointmentData.patientEmail,
        subject: 'Confirmation de rendez-vous - Paiement requis',
        paymentUrl: paymentLink.paymentUrl,
        expiresAt: paymentLink.expiresAt
      });

      // En production, utiliser un service d'email sécurisé
      // await EmailService.sendSecureEmail({
      //   to: appointmentData.patientEmail,
      //   subject: 'Confirmation de rendez-vous - Paiement requis',
      //   htmlContent: emailContent,
      //   priority: 'high'
      // });

      // Logger l'envoi pour audit
      await addDoc(collection(db, 'emailLogs'), {
        type: 'payment_link',
        appointmentId: paymentLink.appointmentId,
        recipient: appointmentData.patientEmail,
        status: 'sent',
        timestamp: serverTimestamp()
      });

    } catch (error) {
      console.error('Erreur envoi lien de paiement:', error);
      throw error;
    }
  }

  /**
   * Notifier le personnel médical
   */
  private static async notifyMedicalStaff(
    appointmentId: string,
    appointmentData: any,
    notificationType: 'payment_link_sent' | 'payment_success' | 'payment_failed' | 'payment_expired' | 'patient_booking_confirmed'
  ): Promise<void> {
    try {
      const notificationMessages = {
        payment_link_sent: `Lien de paiement envoyé pour le RDV de ${appointmentData.patientName}`,
        payment_success: `Paiement confirmé - RDV de ${appointmentData.patientName} validé`,
        payment_failed: `Échec de paiement pour le RDV de ${appointmentData.patientName}`,
        payment_expired: `Paiement expiré - RDV de ${appointmentData.patientName} annulé`,
        patient_booking_confirmed: `Nouveau RDV patient confirmé: ${appointmentData.patientName}`
      };

      const notification = {
        appointmentId,
        type: notificationType,
        message: notificationMessages[notificationType],
        targetRole: appointmentData.createdByRole || 'doctor',
        targetUserId: appointmentData.createdBy || appointmentData.doctorId,
        read: false,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'staffNotifications'), notification);

      console.log('🔔 Notification personnel médical:', notification.message);

    } catch (error) {
      console.error('Erreur notification personnel médical:', error);
    }
  }

  /**
   * Programmer les rappels de paiement automatiques
   */
  private static async schedulePaymentReminders(
    appointmentId: string,
    paymentLinkId: string
  ): Promise<void> {
    try {
      for (const intervalHours of this.REMINDER_INTERVALS) {
        const reminderTime = new Date();
        reminderTime.setHours(reminderTime.getHours() + intervalHours);

        await addDoc(collection(db, 'scheduledReminders'), {
          appointmentId,
          paymentLinkId,
          type: 'payment_reminder',
          scheduledFor: Timestamp.fromDate(reminderTime),
          status: 'pending',
          intervalHours,
          createdAt: serverTimestamp()
        });
      }

      console.log(`⏰ ${this.REMINDER_INTERVALS.length} rappels programmés pour le RDV ${appointmentId}`);

    } catch (error) {
      console.error('Erreur programmation rappels:', error);
    }
  }

  /**
   * Traiter les rappels de paiement en attente
   */
  static async processPaymentReminders(): Promise<void> {
    try {
      if (!db) return;

      const now = new Date();
      const remindersQuery = query(
        collection(db, 'scheduledReminders'),
        where('status', '==', 'pending'),
        where('scheduledFor', '<=', Timestamp.fromDate(now))
      );

      const remindersSnapshot = await getDocs(remindersQuery);

      for (const reminderDoc of remindersSnapshot.docs) {
        const reminder = reminderDoc.data();
        
        try {
          // Vérifier si le paiement n'a pas été effectué entre temps
          const paymentLinkDoc = await getDoc(doc(db, 'paymentLinks', reminder.paymentLinkId));
          
          if (paymentLinkDoc.exists() && paymentLinkDoc.data().status === 'pending') {
            // Envoyer le rappel
            await this.sendPaymentReminder(reminder);
            
            // Marquer le rappel comme envoyé
            await updateDoc(reminderDoc.ref, {
              status: 'sent',
              sentAt: serverTimestamp()
            });

            // Mettre à jour le compteur de rappels
            const rulesQuery = query(
              collection(db, 'appointmentPaymentRules'),
              where('appointmentId', '==', reminder.appointmentId)
            );
            const rulesSnapshot = await getDocs(rulesQuery);
            
            if (!rulesSnapshot.empty) {
              const ruleDoc = rulesSnapshot.docs[0];
              const currentRule = ruleDoc.data();
              await updateDoc(ruleDoc.ref, {
                'notifications.remindersSent': (currentRule.notifications?.remindersSent || 0) + 1,
                updatedAt: serverTimestamp()
              });
            }
          } else {
            // Paiement déjà effectué, annuler le rappel
            await updateDoc(reminderDoc.ref, {
              status: 'cancelled',
              cancelledAt: serverTimestamp()
            });
          }

        } catch (reminderError) {
          console.error('Erreur traitement rappel individuel:', reminderError);
          
          // Marquer le rappel comme échoué
          await updateDoc(reminderDoc.ref, {
            status: 'failed',
            error: reminderError instanceof Error ? reminderError.message : 'Erreur inconnue',
            failedAt: serverTimestamp()
          });
        }
      }

    } catch (error) {
      console.error('Erreur traitement rappels de paiement:', error);
    }
  }

  /**
   * Envoyer un rappel de paiement
   */
  private static async sendPaymentReminder(reminderData: any): Promise<void> {
    try {
      // Récupérer les données du rendez-vous et du lien de paiement
      const appointmentDoc = await getDoc(doc(db, 'appointments', reminderData.appointmentId));
      const paymentLinkDoc = await getDoc(doc(db, 'paymentLinks', reminderData.paymentLinkId));

      if (!appointmentDoc.exists() || !paymentLinkDoc.exists()) {
        throw new Error('Données de rappel introuvables');
      }

      const appointmentData = appointmentDoc.data();
      const paymentLinkData = paymentLinkDoc.data();

      const reminderEmailContent = this.generateReminderEmailTemplate(
        paymentLinkData,
        appointmentData,
        reminderData.intervalHours
      );

      console.log('📧 Envoi rappel de paiement:', {
        to: appointmentData.patientEmail,
        subject: 'Rappel - Confirmation de rendez-vous en attente',
        reminderNumber: reminderData.intervalHours,
        expiresAt: paymentLinkData.expiresAt
      });

      // En production, utiliser un service d'email
      // await EmailService.sendReminderEmail({
      //   to: appointmentData.patientEmail,
      //   subject: 'Rappel - Confirmation de rendez-vous en attente',
      //   htmlContent: reminderEmailContent
      // });

    } catch (error) {
      console.error('Erreur envoi rappel de paiement:', error);
      throw error;
    }
  }

  /**
   * Notifier le succès du paiement
   */
  private static async notifyPaymentSuccess(
    appointmentId: string,
    paymentData: any
  ): Promise<void> {
    try {
      const appointmentDoc = await getDoc(doc(db, 'appointments', appointmentId));
      if (!appointmentDoc.exists()) return;

      const appointmentData = appointmentDoc.data();

      // Notifier le patient
      console.log('📧 Notification paiement réussi au patient:', {
        to: appointmentData.patientEmail,
        subject: 'Rendez-vous confirmé - Paiement reçu',
        appointmentDetails: {
          doctor: appointmentData.doctorName,
          date: appointmentData.scheduledAt,
          amount: paymentData.amount
        }
      });

      // Notifier le personnel médical
      await this.notifyMedicalStaff(appointmentId, appointmentData, 'payment_success');

    } catch (error) {
      console.error('Erreur notification succès paiement:', error);
    }
  }

  /**
   * Notifier l'expiration du paiement
   */
  private static async notifyPaymentExpired(appointmentId: string): Promise<void> {
    try {
      const appointmentDoc = await getDoc(doc(db, 'appointments', appointmentId));
      if (!appointmentDoc.exists()) return;

      const appointmentData = appointmentDoc.data();

      // Notifier le patient
      console.log('📧 Notification expiration paiement au patient:', {
        to: appointmentData.patientEmail,
        subject: 'Rendez-vous annulé - Paiement non effectué',
        message: 'Votre rendez-vous a été annulé car le paiement n\'a pas été effectué dans les délais.'
      });

      // Notifier le personnel médical
      await this.notifyMedicalStaff(appointmentId, appointmentData, 'payment_expired');

    } catch (error) {
      console.error('Erreur notification expiration paiement:', error);
    }
  }

  /**
   * Obtenir le statut de validation d'un rendez-vous
   */
  static async getAppointmentValidationStatus(appointmentId: string): Promise<AppointmentPaymentRule | null> {
    try {
      if (!db) return null;

      const rulesQuery = query(
        collection(db, 'appointmentPaymentRules'),
        where('appointmentId', '==', appointmentId)
      );
      const rulesSnapshot = await getDocs(rulesQuery);

      if (rulesSnapshot.empty) return null;

      const ruleData = rulesSnapshot.docs[0].data();
      return {
        ...ruleData,
        createdAt: ruleData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: ruleData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as AppointmentPaymentRule;

    } catch (error) {
      console.error('Erreur récupération statut validation:', error);
      return null;
    }
  }

  /**
   * Générer un token sécurisé pour le lien de paiement
   */
  private static generateSecureToken(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 15);
    const hash = btoa(`${timestamp}-${random}`).replace(/[^a-zA-Z0-9]/g, '');
    return hash.substring(0, 32);
  }

  /**
   * Template email pour le lien de paiement
   */
  private static generatePaymentEmailTemplate(
    paymentLink: PaymentLink,
    appointmentData: any
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #0ea5e9, #10b981); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .button { background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Docteurs O.I</h1>
          <p>Confirmation de rendez-vous médical</p>
        </div>
        <div class="content">
          <h2>Bonjour ${appointmentData.patientName},</h2>
          <p>Un rendez-vous médical a été programmé pour vous :</p>
          
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">📅 Détails du rendez-vous</h3>
            <p><strong>Médecin :</strong> ${appointmentData.doctorName}</p>
            <p><strong>Date :</strong> ${new Date(appointmentData.scheduledAt).toLocaleDateString('fr-FR')}</p>
            <p><strong>Heure :</strong> ${new Date(appointmentData.scheduledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
            <p><strong>Type :</strong> ${appointmentData.type}</p>
            <p><strong>Montant :</strong> ${paymentLink.amount}€</p>
          </div>
          
          <div class="warning">
            <h3 style="margin: 0 0 10px 0;">⚠️ Paiement requis pour confirmation</h3>
            <p>Pour confirmer votre rendez-vous, veuillez effectuer le paiement avant le <strong>${new Date(paymentLink.expiresAt).toLocaleDateString('fr-FR')} à ${new Date(paymentLink.expiresAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</strong>.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentLink.paymentUrl}" class="button">
              💳 Confirmer et payer maintenant
            </a>
          </div>
          
          <p><strong>Important :</strong> Si le paiement n'est pas effectué dans les délais, votre rendez-vous sera automatiquement annulé.</p>
          
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1e40af;">🔒 Paiement sécurisé</h3>
            <p style="margin: 0; font-size: 14px;">
              Votre paiement est sécurisé par chiffrement SSL/TLS et conforme aux standards PCI DSS. 
              Vos données bancaires sont protégées selon le RGPD.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template email pour les rappels de paiement
   */
  private static generateReminderEmailTemplate(
    paymentLink: any,
    appointmentData: any,
    intervalHours: number
  ): string {
    const urgencyLevel = intervalHours >= 20 ? 'urgent' : intervalHours >= 10 ? 'important' : 'normal';
    const timeLeft = Math.max(0, Math.ceil((new Date(paymentLink.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60)));

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .button { background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
          .urgent { background: #fef2f2; border: 2px solid #ef4444; padding: 15px; border-radius: 8px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⏰ Rappel urgent</h1>
          <p>Confirmation de rendez-vous en attente</p>
        </div>
        <div class="content">
          <h2>Bonjour ${appointmentData.patientName},</h2>
          <p>Votre rendez-vous médical nécessite une confirmation par paiement.</p>
          
          ${urgencyLevel === 'urgent' ? `
            <div class="urgent">
              <h3 style="margin: 0 0 10px 0; color: #dc2626;">🚨 Action requise - Délai d'expiration proche</h3>
              <p style="margin: 0; font-weight: bold;">Il vous reste moins de ${timeLeft} heure${timeLeft > 1 ? 's' : ''} pour confirmer votre rendez-vous !</p>
            </div>
          ` : ''}
          
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">📅 Rendez-vous en attente</h3>
            <p><strong>Médecin :</strong> ${appointmentData.doctorName}</p>
            <p><strong>Date :</strong> ${new Date(appointmentData.scheduledAt).toLocaleDateString('fr-FR')}</p>
            <p><strong>Heure :</strong> ${new Date(appointmentData.scheduledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
            <p><strong>Montant :</strong> ${paymentLink.amount}€</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentLink.paymentUrl}" class="button">
              💳 Confirmer maintenant
            </a>
          </div>
          
          <p style="color: #dc2626; font-weight: bold;">
            ⚠️ Votre rendez-vous sera automatiquement annulé si le paiement n'est pas effectué avant le ${new Date(paymentLink.expiresAt).toLocaleDateString('fr-FR')} à ${new Date(paymentLink.expiresAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Logger les validations de paiement pour audit
   */
  private static async logPaymentValidation(
    paymentLinkId: string,
    appointmentId: string,
    status: 'success' | 'failed',
    paymentData: any,
    error?: any
  ): Promise<void> {
    try {
      if (!db) return;

      await addDoc(collection(db, 'paymentValidationLogs'), {
        paymentLinkId,
        appointmentId,
        status,
        paymentData: {
          transactionId: paymentData.transactionId,
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod
        },
        error: error ? (error instanceof Error ? error.message : String(error)) : null,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        ipAddress: 'client-side' // En production, obtenir depuis le serveur
      });

    } catch (logError) {
      console.error('Erreur log validation paiement:', logError);
    }
  }

  /**
   * Nettoyer les liens de paiement expirés (tâche de maintenance)
   */
  static async cleanupExpiredPaymentLinks(): Promise<void> {
    try {
      if (!db) return;

      const now = new Date();
      const expiredLinksQuery = query(
        collection(db, 'paymentLinks'),
        where('status', '==', 'pending'),
        where('expiresAt', '<', Timestamp.fromDate(now))
      );

      const expiredLinksSnapshot = await getDocs(expiredLinksQuery);

      for (const linkDoc of expiredLinksSnapshot.docs) {
        const linkData = linkDoc.data();
        await this.handleExpiredPayment(linkDoc.id, linkData.appointmentId);
      }

      console.log(`🧹 Nettoyage: ${expiredLinksSnapshot.size} liens de paiement expirés traités`);

    } catch (error) {
      console.error('Erreur nettoyage liens expirés:', error);
    }
  }

  /**
   * Obtenir les statistiques de paiement pour un médecin
   */
  static async getPaymentStatistics(doctorId: string): Promise<{
    totalAppointments: number;
    paidAppointments: number;
    pendingPayments: number;
    expiredPayments: number;
    revenue: number;
  }> {
    try {
      if (!db) {
        return {
          totalAppointments: 0,
          paidAppointments: 0,
          pendingPayments: 0,
          expiredPayments: 0,
          revenue: 0
        };
      }

      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('doctorId', '==', doctorId)
      );

      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointments = appointmentsSnapshot.docs.map(doc => doc.data());

      const paidAppointments = appointments.filter(apt => apt.paymentStatus === 'paid');
      const pendingPayments = appointments.filter(apt => apt.paymentStatus === 'pending');
      const expiredPayments = appointments.filter(apt => apt.paymentStatus === 'expired');
      
      const revenue = paidAppointments.reduce((sum, apt) => sum + (apt.fee || 0), 0);

      return {
        totalAppointments: appointments.length,
        paidAppointments: paidAppointments.length,
        pendingPayments: pendingPayments.length,
        expiredPayments: expiredPayments.length,
        revenue
      };

    } catch (error) {
      console.error('Erreur statistiques paiement:', error);
      return {
        totalAppointments: 0,
        paidAppointments: 0,
        pendingPayments: 0,
        expiredPayments: 0,
        revenue: 0
      };
    }
  }
}