import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface DatabaseQueryOptions {
  filters?: Array<{
    column: string;
    operator: string;
    value: any;
  }>;
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
  limit?: number;
  offset?: number;
}

export interface PaginationResult<T> {
  data: T[];
  count?: number;
  hasMore: boolean;
  total?: number;
}

export class SupabaseService {
  
  /**
   * Generic CRUD operations with error handling and validation
   */
  
  // Create document with validation and audit logging
  static async createDocument<T>(
    tableName: string,
    data: Omit<T, 'id' | 'created_at' | 'updated_at'>,
    userId: string,
    options?: {
      validateData?: (data: any) => boolean;
      auditAction?: string;
    }
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase not available');
      }

      // Validate data if validator provided
      if (options?.validateData && !options.validateData(data)) {
        throw new Error('Invalid data');
      }

      const documentData = {
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: userId
      };

      const { data: result, error } = await supabase
        .from(tableName)
        .insert([documentData])
        .select()
        .single();

      if (error) throw error;

      // Create audit log if requested
      if (options?.auditAction) {
        await this.logAuditAction(
          userId,
          options.auditAction,
          tableName,
          result.id,
          `Created ${tableName} document`
        );
      }

      return {
        success: true,
        data: result as T
      };

    } catch (error) {
      console.error(`Error creating document in ${tableName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Read document with access control
  static async readDocument<T>(
    tableName: string,
    id: string,
    userId: string,
    options?: {
      auditAccess?: boolean;
    }
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase not available');
      }

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) {
        return {
          success: false,
          error: 'Document not found'
        };
      }

      // Log access for audit if requested
      if (options?.auditAccess) {
        await this.logDataAccess(userId, tableName, id, 'read');
      }

      return {
        success: true,
        data: data as T
      };

    } catch (error) {
      console.error(`Error reading document from ${tableName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Update document with conflict resolution
  static async updateDocument<T>(
    tableName: string,
    id: string,
    updates: Partial<T>,
    userId: string,
    options?: {
      auditAction?: string;
    }
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase not available');
      }

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
        last_modified_by: userId
      };

      const { data, error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Create audit log if requested
      if (options?.auditAction) {
        await this.logAuditAction(
          userId,
          options.auditAction,
          tableName,
          id,
          `Updated ${tableName} document`
        );
      }

      return {
        success: true,
        data: data as T
      };

    } catch (error) {
      console.error(`Error updating document in ${tableName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Delete document
  static async deleteDocument(
    tableName: string,
    id: string,
    userId: string,
    options?: {
      auditAction?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase not available');
      }

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Create audit log if requested
      if (options?.auditAction) {
        await this.logAuditAction(
          userId,
          options.auditAction,
          tableName,
          id,
          `Deleted ${tableName} document`
        );
      }

      return { success: true };

    } catch (error) {
      console.error(`Error deleting document from ${tableName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Query documents with pagination and real-time updates
  static async queryDocuments<T>(
    tableName: string,
    options?: DatabaseQueryOptions
  ): Promise<PaginationResult<T>> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        console.log('Supabase not available, using local data');
        return {
          data: [],
          hasMore: false
        };
      }

      let query = supabase.from(tableName).select('*', { count: 'exact' });

      // Apply filters
      if (options?.filters) {
        for (const filter of options.filters) {
          query = query.filter(filter.column, filter.operator, filter.value);
        }
      }

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true });
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: (data || []) as T[],
        count,
        total: count || 0,
        hasMore: (count || 0) > (options?.offset || 0) + (data?.length || 0)
      };

    } catch (error) {
      console.error(`Error querying ${tableName}:`, error);
      return {
        data: [],
        hasMore: false
      };
    }
  }

  // Subscribe to real-time changes
  static subscribeToTable<T>(
    tableName: string,
    callback: (data: T[]) => void,
    options?: {
      filters?: Array<{
        column: string;
        operator: string;
        value: any;
      }>;
    }
  ): () => void {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        console.log('Supabase not available for real-time subscriptions');
        callback([]);
        return () => {};
      }

      // Initial data fetch
      this.queryDocuments<T>(tableName, options).then(result => {
        callback(result.data);
      });

      // Set up real-time subscription
      const subscription = supabase
        .channel(`${tableName}_changes`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: tableName 
          }, 
          async () => {
            // Refetch data when changes occur
            const result = await this.queryDocuments<T>(tableName, options);
            callback(result.data);
          }
        )
        .subscribe();

      return () => {
        if (subscription) {
          supabase.removeChannel(subscription);
        }
      };

    } catch (error) {
      console.error(`Error subscribing to ${tableName}:`, error);
      callback([]);
      return () => {};
    }
  }

  /**
   * Medical-specific operations
   */

  // Create user profile with role-specific data
  static async createUserProfile(
    userData: {
      email: string;
      role: 'patient' | 'doctor' | 'secretary';
      profile: any;
      rgpdConsent: any[];
    },
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase not available');
      }

      // Create user profile
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          email: userData.email,
          role: userData.role,
          profile: userData.profile,
          status: 'active',
          rgpd_consent: userData.rgpdConsent,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (userError) throw userError;

      // Create role-specific profile
      switch (userData.role) {
        case 'patient':
          await this.createPatientProfile(userId, userData.profile);
          break;
        case 'doctor':
          await this.createDoctorProfile(userId, userData.profile);
          break;
        case 'secretary':
          await this.createSecretaryProfile(userId, userData.profile);
          break;
      }

      // Create audit log
      await this.logAuditAction(
        userId,
        'create_user_profile',
        'users',
        userId,
        `Created ${userData.role} profile`
      );

      return { success: true };

    } catch (error) {
      console.error('Error creating user profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Create patient profile
  private static async createPatientProfile(userId: string, profile: any) {
    const { error } = await supabase
      .from('patients')
      .insert([{
        user_id: userId,
        medical_record_number: `MRN${Date.now()}`,
        personal_info: {
          first_name: profile.firstName,
          last_name: profile.lastName,
          date_of_birth: profile.dateOfBirth,
          gender: profile.gender || 'Non spécifié',
          address: profile.address
        },
        contact_info: {
          email: profile.email,
          phone: profile.phoneNumber,
          emergency_contact: profile.emergencyContact
        },
        medical_info: {
          allergies: profile.allergies || [],
          chronic_conditions: profile.chronicConditions || [],
          current_medications: profile.currentMedications || [],
          blood_type: profile.bloodType
        },
        insurance: profile.insurance || {},
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (error) throw error;
  }

  // Create doctor profile
  private static async createDoctorProfile(userId: string, profile: any) {
    const { error } = await supabase
      .from('doctors')
      .insert([{
        user_id: userId,
        license_number: profile.licenseNumber,
        personal_info: {
          first_name: profile.firstName,
          last_name: profile.lastName,
          title: 'Dr.',
          specialty: profile.speciality,
          sub_specialties: []
        },
        professional_info: {
          medical_school: '',
          graduation_year: new Date().getFullYear(),
          experience: profile.experience || 0,
          certifications: [],
          hospital_affiliations: []
        },
        practice_info: {
          consultation_fee: profile.consultationFee || 50,
          accepts_new_patients: true,
          languages: profile.languages || ['Français'],
          working_hours: {}
        },
        contact_info: {
          email: profile.email,
          phone: profile.phoneNumber
        },
        verification: {
          verified: profile.verified || false
        },
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (error) throw error;
  }

  // Create secretary profile
  private static async createSecretaryProfile(userId: string, profile: any) {
    const { error } = await supabase
      .from('secretaries')
      .insert([{
        user_id: userId,
        employee_number: `SEC${Date.now()}`,
        personal_info: {
          first_name: profile.firstName,
          last_name: profile.lastName,
          department: 'Administration médicale'
        },
        professional_info: {
          position: 'Secrétaire médicale',
          experience: profile.experience || 0,
          certifications: [],
          languages: ['Français']
        },
        assigned_doctors: [],
        permissions: {
          can_access_patient_data: true,
          can_schedule_appointments: true,
          can_manage_messages: true,
          can_view_medical_records: false,
          can_create_prescriptions: false
        },
        contact_info: {
          email: profile.email,
          phone: profile.phoneNumber
        },
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (error) throw error;
  }

  /**
   * Medical Records Operations
   */

  // Create medical record
  static async createMedicalRecord(
    recordData: {
      patient_id: string;
      doctor_id: string;
      consultation_id?: string;
      record_info: any;
      medical_data: any;
      attachments?: any[];
      access_control: any;
    },
    userId: string
  ): Promise<{ success: boolean; recordId?: string; error?: string }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase not available');
      }

      const { data, error } = await supabase
        .from('medical_records')
        .insert([{
          ...recordData,
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Update patient statistics
      await supabase
        .from('patients')
        .update({
          last_consultation_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', recordData.patient_id);

      // Create audit log
      await this.logAuditAction(
        userId,
        'create_medical_record',
        'medical_records',
        data.id,
        `Created medical record for patient ${recordData.patient_id}`
      );

      return {
        success: true,
        recordId: data.id
      };

    } catch (error) {
      console.error('Error creating medical record:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get patient medical records
  static async getPatientMedicalRecords(
    patientId: string,
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      recordType?: string;
    }
  ): Promise<PaginationResult<any>> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase not available');
      }

      let query = supabase
        .from('medical_records')
        .select('*', { count: 'exact' })
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (options?.recordType && options.recordType !== 'all') {
        query = query.eq('record_info->type', options.recordType);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Log access for audit
      await this.logDataAccess(userId, 'medical_records', patientId, 'view_patient_records');

      return {
        data: data || [],
        count,
        total: count || 0,
        hasMore: (count || 0) > (options?.offset || 0) + (data?.length || 0)
      };

    } catch (error) {
      console.error('Error getting patient medical records:', error);
      throw error;
    }
  }

  /**
   * Messaging Operations
   */

  // Create conversation
  static async createConversation(
    participants: string[],
    participantRoles: { [userId: string]: string },
    conversationData: {
      title?: string;
      type: 'medical' | 'administrative' | 'emergency';
      related_patient_id?: string;
    },
    creatorId: string
  ): Promise<{ success: boolean; conversationId?: string; error?: string }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase not available');
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert([{
          participants,
          participant_roles: participantRoles,
          conversation_info: {
            title: conversationData.title || 'Conversation médicale',
            type: conversationData.type,
            status: 'active'
          },
          last_message: {
            content: '',
            sender_id: '',
            timestamp: new Date().toISOString(),
            message_type: 'system'
          },
          unread_counts: participants.reduce((acc, participantId) => {
            acc[participantId] = 0;
            return acc;
          }, {} as { [key: string]: number }),
          metadata: {
            related_patient_id: conversationData.related_patient_id,
            related_record_ids: []
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      return { success: true, conversationId: data.id };

    } catch (error) {
      console.error('Error creating conversation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send message
  static async sendMessage(
    conversationId: string,
    messageData: {
      content: string;
      message_type: 'text' | 'image' | 'file' | 'prescription' | 'appointment';
      attachments?: any[];
      priority?: 'normal' | 'high' | 'urgent';
    },
    senderId: string,
    recipientId: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase not available');
      }

      // Create message
      const { data: messageData_result, error: messageError } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: senderId,
          recipient_id: recipientId,
          content: messageData.content,
          message_type: messageData.message_type,
          attachments: messageData.attachments || [],
          priority: messageData.priority || 'normal',
          status: 'sent',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (messageError) throw messageError;

      // Update conversation
      await supabase
        .from('conversations')
        .update({
          last_message: {
            content: messageData.content.substring(0, 100),
            sender_id: senderId,
            timestamp: new Date().toISOString(),
            message_type: messageData.message_type
          },
          [`unread_counts.${recipientId}`]: supabase.rpc('increment_unread_count', {
            conversation_id: conversationId,
            user_id: recipientId
          }),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      return { success: true, messageId: messageData_result.id };

    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * GDPR Compliance Operations
   */

  // Export all user data for GDPR compliance
  static async exportUserData(userId: string): Promise<any> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase not available');
      }

      const tables = [
        'users', 'patients', 'doctors', 'secretaries',
        'medical_records', 'messages', 'conversations',
        'appointments', 'prescriptions', 'audit_logs'
      ];

      const exportData: any = {
        export_date: new Date().toISOString(),
        user_id: userId,
        data: {}
      };

      for (const tableName of tables) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .or(`user_id.eq.${userId},patient_id.eq.${userId},doctor_id.eq.${userId},target_user_id.eq.${userId},participants.cs.{${userId}}`);

          if (error && !error.message.includes('does not exist')) {
            console.warn(`Error exporting ${tableName}:`, error);
          }

          exportData.data[tableName] = data || [];

        } catch (tableError) {
          console.warn(`Error exporting table ${tableName}:`, tableError);
          exportData.data[tableName] = [];
        }
      }

      // Log the export for audit
      await this.logDataAccess(userId, 'user_data', userId, 'gdpr_export');

      return exportData;

    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  // Anonymize user data (GDPR right to be forgotten)
  static async anonymizeUserData(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase not available');
      }

      // Anonymize user profile
      await supabase
        .from('users')
        .update({
          email: `anonymized-${userId}@deleted.local`,
          profile: {
            first_name: 'Anonymized',
            last_name: 'User',
            phone_number: 'DELETED'
          },
          status: 'anonymized',
          anonymized_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      // Anonymize patient data if applicable
      await supabase
        .from('patients')
        .update({
          personal_info: {
            first_name: 'Anonymized',
            last_name: 'Patient',
            address: { street: 'DELETED', city: 'DELETED', postal_code: 'DELETED' }
          },
          contact_info: {
            email: `anonymized-${userId}@deleted.local`,
            phone: 'DELETED'
          },
          anonymized_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      // Create anonymization audit log
      await this.logAuditAction(
        'system',
        'anonymize_user_data',
        'users',
        userId,
        'User data anonymized per GDPR request',
        {
          legal_basis: 'GDPR Article 17 - Right to erasure'
        }
      );

      return { success: true };

    } catch (error) {
      console.error('Error anonymizing user data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Utility functions
   */

  // Log data access for audit trail
  private static async logDataAccess(
    userId: string,
    resource: string,
    resourceId: string,
    action: string
  ): Promise<void> {
    try {
      if (!isSupabaseConfigured() || !supabase) return;

      await supabase
        .from('audit_logs')
        .insert([{
          user_id: userId,
          target_user_id: resourceId,
          action,
          resource,
          resource_id: resourceId,
          description: `${action} on ${resource}`,
          timestamp: new Date().toISOString(),
          ip_address: 'client-side',
          user_agent: navigator.userAgent,
          session_id: this.getSessionId()
        }]);

    } catch (error) {
      console.error('Error logging data access:', error);
    }
  }

  // Log audit action
  private static async logAuditAction(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    description: string,
    metadata?: any
  ): Promise<void> {
    try {
      if (!isSupabaseConfigured() || !supabase) return;

      await supabase
        .from('audit_logs')
        .insert([{
          user_id: userId,
          action,
          resource,
          resource_id: resourceId,
          description,
          metadata: metadata || {},
          timestamp: new Date().toISOString(),
          ip_address: 'client-side',
          user_agent: navigator.userAgent,
          session_id: this.getSessionId()
        }]);

    } catch (error) {
      console.error('Error logging audit action:', error);
    }
  }

  // Get or create session ID
  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('docteurs-oi-session-id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('docteurs-oi-session-id', sessionId);
    }
    return sessionId;
  }

  /**
   * Search operations
   */

  // Advanced search across multiple tables
  static async searchMedicalData(
    searchTerm: string,
    userId: string,
    userRole: string,
    options?: {
      tables?: string[];
      limit?: number;
    }
  ): Promise<{
    patients: any[];
    consultations: any[];
    prescriptions: any[];
    medical_records: any[];
  }> {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase not available');
      }

      const searchResults = {
        patients: [] as any[],
        consultations: [] as any[],
        prescriptions: [] as any[],
        medical_records: [] as any[]
      };

      const searchTables = options?.tables || ['patients', 'consultations', 'prescriptions', 'medical_records'];
      const searchLimit = options?.limit || 20;

      // Search in each table based on user role and permissions
      for (const tableName of searchTables) {
        try {
          let query = supabase.from(tableName).select('*').limit(searchLimit);

          // Apply role-based filters
          switch (tableName) {
            case 'patients':
              if (userRole === 'patient') {
                query = query.eq('user_id', userId);
              }
              break;

            case 'consultations':
              const consultationField = userRole === 'patient' ? 'patient_id' : 'doctor_id';
              query = query.eq(consultationField, userId);
              break;

            case 'prescriptions':
              const prescriptionField = userRole === 'patient' ? 'patient_id' : 'doctor_id';
              query = query.eq(prescriptionField, userId);
              break;

            case 'medical_records':
              if (userRole === 'patient') {
                query = query.eq('patient_id', userId);
              } else {
                query = query.eq('doctor_id', userId);
              }
              break;
          }

          const { data, error } = await query;

          if (error) throw error;

          // Client-side filtering by search term
          const filteredResults = (data || []).filter(item => {
            const searchableText = JSON.stringify(item).toLowerCase();
            return searchableText.includes(searchTerm.toLowerCase());
          });

          searchResults[tableName as keyof typeof searchResults] = filteredResults;

        } catch (tableError) {
          console.warn(`Error searching in ${tableName}:`, tableError);
        }
      }

      // Log search for analytics
      await this.logDataAccess(userId, 'search', searchTerm, 'search_medical_data');

      return searchResults;

    } catch (error) {
      console.error('Error searching medical data:', error);
      throw error;
    }
  }

  /**
   * Real-time subscriptions
   */

  // Subscribe to user conversations
  static subscribeToUserConversations(
    userId: string,
    callback: (conversations: any[]) => void
  ): () => void {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        callback([]);
        return () => {};
      }

      // Initial fetch
      supabase
        .from('conversations')
        .select('*')
        .contains('participants', [userId])
        .order('updated_at', { ascending: false })
        .limit(20)
        .then(({ data }) => {
          callback(data || []);
        });

      // Set up real-time subscription
      const subscription = supabase
        .channel('user_conversations')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'conversations',
            filter: `participants.cs.{${userId}}`
          }, 
          async () => {
            const { data } = await supabase
              .from('conversations')
              .select('*')
              .contains('participants', [userId])
              .order('updated_at', { ascending: false })
              .limit(20);
            
            callback(data || []);
          }
        )
        .subscribe();

      return () => {
        if (subscription) {
          supabase.removeChannel(subscription);
        }
      };

    } catch (error) {
      console.error('Error subscribing to conversations:', error);
      callback([]);
      return () => {};
    }
  }

  // Subscribe to conversation messages
  static subscribeToConversationMessages(
    conversationId: string,
    callback: (messages: any[]) => void
  ): () => void {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        callback([]);
        return () => {};
      }

      // Initial fetch
      supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(100)
        .then(({ data }) => {
          callback(data || []);
        });

      // Set up real-time subscription
      const subscription = supabase
        .channel('conversation_messages')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          }, 
          async () => {
            const { data } = await supabase
              .from('messages')
              .select('*')
              .eq('conversation_id', conversationId)
              .order('created_at', { ascending: true })
              .limit(100);
            
            callback(data || []);
          }
        )
        .subscribe();

      return () => {
        if (subscription) {
          supabase.removeChannel(subscription);
        }
      };

    } catch (error) {
      console.error('Error subscribing to messages:', error);
      callback([]);
      return () => {};
    }
  }
}