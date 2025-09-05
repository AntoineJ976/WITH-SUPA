export interface PrescriptionData {
  patientName: string;
  patientEmail: string;
  doctorName: string;
  doctorLicense: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  consultationDate: string;
  prescriptionId: string;
}

export class PDFService {
  /**
   * Génère un PDF d'ordonnance médicale simple (sans dépendances externes)
   */
  static async generatePrescriptionPDF(prescriptionData: PrescriptionData): Promise<Blob> {
    try {
      // Créer le contenu HTML de l'ordonnance
      const htmlContent = this.generatePrescriptionHTML(prescriptionData);
      
      // Convertir en blob pour simulation
      const blob = new Blob([htmlContent], { type: 'text/html' });
      return blob;
      
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      throw new Error('Impossible de générer le PDF de l\'ordonnance');
    }
  }

  /**
   * Génère le contenu HTML de l'ordonnance
   */
  private static generatePrescriptionHTML(data: PrescriptionData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Ordonnance Médicale - ${data.prescriptionId}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 30px; }
          .doctor-info { margin-bottom: 20px; }
          .patient-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .medications { margin-bottom: 30px; }
          .medication { border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 6px; }
          .signature { margin-top: 50px; border-top: 1px solid #ddd; padding-top: 20px; }
          .legal { font-size: 10px; color: #666; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="color: #0ea5e9; margin: 0;">ORDONNANCE MÉDICALE</h1>
          <p style="margin: 5px 0;">Docteurs O.I - Plateforme de Télémédecine</p>
        </div>
        
        <div class="doctor-info">
          <h3>Médecin prescripteur :</h3>
          <p><strong>${data.doctorName}</strong></p>
          <p>N° de licence : ${data.doctorLicense}</p>
          <p>Date : ${new Date(data.consultationDate).toLocaleDateString('fr-FR')}</p>
          <p>N° Ordonnance : ${data.prescriptionId}</p>
        </div>
        
        <div class="patient-info">
          <h3>Patient :</h3>
          <p><strong>${data.patientName}</strong></p>
          <p>Email : ${data.patientEmail}</p>
        </div>
        
        <div class="medications">
          <h3>Prescription :</h3>
          ${data.medications.map((med, index) => `
            <div class="medication">
              <h4>${index + 1}. ${med.name}</h4>
              <p><strong>Dosage :</strong> ${med.dosage}</p>
              <p><strong>Fréquence :</strong> ${med.frequency}</p>
              <p><strong>Durée :</strong> ${med.duration}</p>
              ${med.instructions ? `<p><strong>Instructions :</strong> ${med.instructions}</p>` : ''}
            </div>
          `).join('')}
        </div>
        
        <div class="signature">
          <p>Signature du médecin :</p>
          <div style="border: 1px solid #ccc; height: 60px; width: 200px; margin: 10px 0;"></div>
          <p>Fait le ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        
        <div class="legal">
          <p>Cette ordonnance est générée électroniquement et conforme aux standards de télémédecine français.</p>
          <p>Données protégées selon le RGPD. Docteurs O.I - Plateforme certifiée HDS.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Génère un PDF à partir d'un élément HTML (méthode alternative)
   */
  static async generatePDFFromHTML(elementId: string, filename: string): Promise<Blob> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Élément HTML non trouvé');
      }

      // Créer un blob simple pour la démo
      const htmlContent = element.outerHTML;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      
      return blob;
    } catch (error) {
      console.error('Erreur génération PDF depuis HTML:', error);
      throw new Error('Impossible de générer le PDF');
    }
  }
}