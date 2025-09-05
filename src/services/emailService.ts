export interface EmailData {
  to: string;
  subject: string;
  htmlContent: string;
  attachments?: Array<{
    filename: string;
    content: string; // Base64 encoded
    contentType: string;
  }>;
}

export class EmailService {
  /**
   * Envoie un email avec pièce jointe (simulation pour la démo)
   */
  static async sendEmailWithAttachment(emailData: EmailData): Promise<{ success: boolean; messageId?: string }> {
    try {
      // Simulation d'envoi email pour la démo
      console.log('📧 Envoi email simulé:', {
        to: emailData.to,
        subject: emailData.subject,
        attachments: emailData.attachments?.length || 0
      });
      
      // Simuler un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simuler un succès dans 95% des cas
      const success = Math.random() > 0.05;
      
      if (success) {
        return {
          success: true,
          messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      } else {
        throw new Error('Échec de l\'envoi email (simulation)');
      }
      
    } catch (error) {
      console.error('Erreur envoi email:', error);
      throw error;
    }
  }

  /**
   * Envoie une ordonnance au patient par email
   */
  static async sendPrescriptionToPatient(
    patientEmail: string,
    patientName: string,
    doctorName: string,
    pdfBlob: Blob,
    prescriptionId: string
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      // Convertir le PDF en base64 pour simulation
      const pdfBase64 = await this.blobToBase64(pdfBlob);
      
      const emailData: EmailData = {
        to: patientEmail,
        subject: `Ordonnance médicale - ${doctorName}`,
        htmlContent: this.generatePatientEmailTemplate(patientName, doctorName, prescriptionId),
        attachments: [{
          filename: `ordonnance-${prescriptionId}.pdf`,
          content: pdfBase64.split(',')[1], // Retirer le préfixe data:
          contentType: 'application/pdf'
        }]
      };

      return await this.sendEmailWithAttachment(emailData);
      
    } catch (error) {
      console.error('Erreur envoi ordonnance patient:', error);
      throw new Error('Impossible d\'envoyer l\'ordonnance au patient');
    }
  }

  /**
   * Envoie une ordonnance à la pharmacie par email
   */
  static async sendPrescriptionToPharmacy(
    pharmacyEmail: string,
    pharmacyName: string,
    patientName: string,
    doctorName: string,
    pdfBlob: Blob,
    prescriptionId: string
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      // Convertir le PDF en base64 pour simulation
      const pdfBase64 = await this.blobToBase64(pdfBlob);
      
      const emailData: EmailData = {
        to: pharmacyEmail,
        subject: `Nouvelle ordonnance - Patient: ${patientName}`,
        htmlContent: this.generatePharmacyEmailTemplate(pharmacyName, patientName, doctorName, prescriptionId),
        attachments: [{
          filename: `ordonnance-${prescriptionId}.pdf`,
          content: pdfBase64.split(',')[1],
          contentType: 'application/pdf'
        }]
      };

      return await this.sendEmailWithAttachment(emailData);
      
    } catch (error) {
      console.error('Erreur envoi ordonnance pharmacie:', error);
      throw new Error('Impossible d\'envoyer l\'ordonnance à la pharmacie');
    }
  }

  /**
   * Convertit un Blob en base64
   */
  private static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Template email pour le patient
   */
  private static generatePatientEmailTemplate(patientName: string, doctorName: string, prescriptionId: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #0ea5e9, #10b981); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
          .button { background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Docteurs O.I</h1>
          <p>Votre ordonnance médicale</p>
        </div>
        <div class="content">
          <h2>Bonjour ${patientName},</h2>
          <p>Vous trouverez en pièce jointe votre ordonnance médicale prescrite par <strong>${doctorName}</strong>.</p>
          
          <p><strong>Numéro d'ordonnance :</strong> ${prescriptionId}</p>
          <p><strong>Date de prescription :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
          
          <p>Cette ordonnance est valable et peut être présentée dans toute pharmacie française.</p>
          
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1e40af;">🔒 Sécurité et confidentialité</h3>
            <p style="margin: 0; font-size: 14px;">
              Cette ordonnance est transmise de manière sécurisée et conforme au RGPD. 
              Vos données médicales sont protégées selon les standards HDS français.
            </p>
          </div>
          
          <p>Si vous avez des questions, n'hésitez pas à contacter votre médecin via la plateforme Docteurs O.I.</p>
        </div>
        <div class="footer">
          <p>Docteurs O.I - Plateforme de télémédecine sécurisée</p>
          <p>Conforme RGPD • Certifié HDS • Données hébergées en France</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template email pour la pharmacie
   */
  private static generatePharmacyEmailTemplate(pharmacyName: string, patientName: string, doctorName: string, prescriptionId: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #10b981, #0ea5e9); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
          .info-box { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Docteurs O.I</h1>
          <p>Nouvelle ordonnance électronique</p>
        </div>
        <div class="content">
          <h2>Bonjour ${pharmacyName},</h2>
          <p>Vous avez reçu une nouvelle ordonnance électronique via la plateforme Docteurs O.I.</p>
          
          <div class="info-box">
            <h3 style="margin: 0 0 10px 0;">📋 Détails de l'ordonnance</h3>
            <p><strong>Patient :</strong> ${patientName}</p>
            <p><strong>Médecin prescripteur :</strong> ${doctorName}</p>
            <p><strong>Numéro d'ordonnance :</strong> ${prescriptionId}</p>
            <p><strong>Date de prescription :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          
          <p>L'ordonnance complète est disponible en pièce jointe au format PDF.</p>
          
          <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #166534;">✅ Ordonnance électronique certifiée</h3>
            <p style="margin: 0; font-size: 14px;">
              Cette ordonnance électronique a la même valeur légale qu'une ordonnance papier selon 
              l'article L161-36-4-1 du Code de la sécurité sociale.
            </p>
          </div>
          
          <p>Merci de préparer les médicaments prescrits. Le patient peut venir les récupérer à votre convenance.</p>
        </div>
        <div class="footer">
          <p>Docteurs O.I - Plateforme de télémédecine certifiée</p>
          <p>Conforme RGPD • Certifié HDS • Transmission sécurisée</p>
        </div>
      </body>
      </html>
    `;
  }
}