export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      // Hand written until 20260915_001_roles_and_rls.sql is applied, after
      // which this file should be regenerated and this block will come back
      // from the database like everything else.
      admin_users: {
        Row: {
          user_id: string
          email: string
          full_name: string | null
          role: string
          permissions: string[]
          disabled: boolean
          created_at: string
          created_by: string | null
        }
        Insert: {
          user_id: string
          email: string
          full_name?: string | null
          role?: string
          permissions?: string[]
          disabled?: boolean
          created_at?: string
          created_by?: string | null
        }
        Update: {
          user_id?: string
          email?: string
          full_name?: string | null
          role?: string
          permissions?: string[]
          disabled?: boolean
          created_at?: string
          created_by?: string | null
        }
        Relationships: []
      }
      astra_polare_media_content: {
        Row: {
          content_type: string
          created_at: string
          description: string | null
          duration: string | null
          id: string
          likes: number | null
          media_link: string
          platform: string
          slides: number | null
          thumbnail_url: string
          title: string
          updated_at: string
          views: string
        }
        Insert: {
          content_type: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          likes?: number | null
          media_link: string
          platform: string
          slides?: number | null
          thumbnail_url: string
          title: string
          updated_at?: string
          views: string
        }
        Update: {
          content_type?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          likes?: number | null
          media_link?: string
          platform?: string
          slides?: number | null
          thumbnail_url?: string
          title?: string
          updated_at?: string
          views?: string
        }
        Relationships: []
      }
      CLMG_destinations_exchange: {
        Row: {
          codice: number
          country: string | null
          highest: number | null
          id: number
          lowest: number | null
          state: string | null
          uni: string | null
        }
        Insert: {
          codice: number
          country?: string | null
          highest?: number | null
          id?: number
          lowest?: number | null
          state?: string | null
          uni?: string | null
        }
        Update: {
          codice?: number
          country?: string | null
          highest?: number | null
          id?: number
          lowest?: number | null
          state?: string | null
          uni?: string | null
        }
        Relationships: []
      }
      clmg_handouts: {
        Row: {
          course_year: number
          created_at: string
          exam_type: string | null
          id: string
          name: string
          semester: number | null
          updated_at: string
          url: string
        }
        Insert: {
          course_year: number
          created_at?: string
          exam_type?: string | null
          id?: string
          name: string
          semester?: number | null
          updated_at?: string
          url: string
        }
        Update: {
          course_year?: number
          created_at?: string
          exam_type?: string | null
          id?: string
          name?: string
          semester?: number | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      CLMG_studyplan: {
        Row: {
          cfu: number | null
          course: string
          id: number
        }
        Insert: {
          cfu?: number | null
          course: string
          id?: number
        }
        Update: {
          cfu?: number | null
          course?: string
          id?: number
        }
        Relationships: []
      }
      "cours-subject_MS_exchange": {
        Row: {
          cfu: number | null
          course: string
          id: number
          subject: string | null
        }
        Insert: {
          cfu?: number | null
          course: string
          id?: number
          subject?: string | null
        }
        Update: {
          cfu?: number | null
          course?: string
          id?: number
          subject?: string | null
        }
        Relationships: []
      }
      "course multipliers estimation": {
        Row: {
          course: string
          "GPA mult.": number | null
          id: number
          "NC mult": number | null
        }
        Insert: {
          course: string
          "GPA mult."?: number | null
          id?: number
          "NC mult"?: number | null
        }
        Update: {
          course?: string
          "GPA mult."?: number | null
          id?: number
          "NC mult"?: number | null
        }
        Relationships: []
      }
      course_subjects: {
        Row: {
          cfu: number | null
          course: string
          id: number
          subject: string | null
        }
        Insert: {
          cfu?: number | null
          course: string
          id?: number
          subject?: string | null
        }
        Update: {
          cfu?: number | null
          course?: string
          id?: number
          subject?: string | null
        }
        Relationships: []
      }
      course_subjects_UG: {
        Row: {
          cfu: number | null
          course: string
          id: number
          subject: string | null
        }
        Insert: {
          cfu?: number | null
          course: string
          id?: number
          subject?: string | null
        }
        Update: {
          cfu?: number | null
          course?: string
          id?: number
          subject?: string | null
        }
        Relationships: []
      }
      "course-multiplier_UG": {
        Row: {
          cfu_min: number | null
          course: string
          id: number
          multiplier: number | null
        }
        Insert: {
          cfu_min?: number | null
          course: string
          id?: number
          multiplier?: number | null
        }
        Update: {
          cfu_min?: number | null
          course?: string
          id?: number
          multiplier?: number | null
        }
        Relationships: []
      }
      dest_exc_msc: {
        Row: {
          "ADDITIONAL ACADEMIC REQUIREMENTS": string | null
          "ADDITIONAL LANGUAGE REQUIREMENT": string | null
          Continent: string | null
          "Highest Score": string | null
          ID: number
          "Lowest Score": string | null
          NOTES: string | null
          "OF WHICH": string | null
          Rankings: string | null
          "RESERVED/NOT AVAILABLE": string | null
          "SLOTS 2024/25": number | null
          University: string | null
        }
        Insert: {
          "ADDITIONAL ACADEMIC REQUIREMENTS"?: string | null
          "ADDITIONAL LANGUAGE REQUIREMENT"?: string | null
          Continent?: string | null
          "Highest Score"?: string | null
          ID?: number
          "Lowest Score"?: string | null
          NOTES?: string | null
          "OF WHICH"?: string | null
          Rankings?: string | null
          "RESERVED/NOT AVAILABLE"?: string | null
          "SLOTS 2024/25"?: number | null
          University?: string | null
        }
        Update: {
          "ADDITIONAL ACADEMIC REQUIREMENTS"?: string | null
          "ADDITIONAL LANGUAGE REQUIREMENT"?: string | null
          Continent?: string | null
          "Highest Score"?: string | null
          ID?: number
          "Lowest Score"?: string | null
          NOTES?: string | null
          "OF WHICH"?: string | null
          Rankings?: string | null
          "RESERVED/NOT AVAILABLE"?: string | null
          "SLOTS 2024/25"?: number | null
          University?: string | null
        }
        Relationships: []
      }
      dispense_uploads: {
        Row: {
          created_at: string
          extraction_path: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          processed_files: number | null
          processing_status: string
          total_files: number | null
          updated_at: string
          upload_date: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          extraction_path?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          processed_files?: number | null
          processing_status?: string
          total_files?: number | null
          updated_at?: string
          upload_date?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          extraction_path?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          processed_files?: number | null
          processing_status?: string
          total_files?: number | null
          updated_at?: string
          upload_date?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      Document: {
        Row: {
          chunkIndex: number | null
          content: string
          createdAt: string
          embedding: string | null
          id: string
          page: number | null
          sourceType: string | null
          sourceUrl: string
          subject: string | null
          title: string | null
          year: string | null
        }
        Insert: {
          chunkIndex?: number | null
          content: string
          createdAt?: string
          embedding?: string | null
          id: string
          page?: number | null
          sourceType?: string | null
          sourceUrl: string
          subject?: string | null
          title?: string | null
          year?: string | null
        }
        Update: {
          chunkIndex?: number | null
          content?: string
          createdAt?: string
          embedding?: string | null
          id?: string
          page?: number | null
          sourceType?: string | null
          sourceUrl?: string
          subject?: string | null
          title?: string | null
          year?: string | null
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          attendance_status: string | null
          event_id: string
          id: string
          registration_date: string
          user_email: string
          user_id: string | null
          user_name: string
        }
        Insert: {
          attendance_status?: string | null
          event_id: string
          id?: string
          registration_date?: string
          user_email: string
          user_id?: string | null
          user_name: string
        }
        Update: {
          attendance_status?: string | null
          event_id?: string
          id?: string
          registration_date?: string
          user_email?: string
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          current_participants: number | null
          description: string | null
          end_date: string | null
          event_type: string
          id: string
          image_url: string | null
          is_online: boolean | null
          location: string | null
          max_participants: number | null
          meeting_link: string | null
          organizer_contact: string | null
          organizer_name: string | null
          registration_deadline: string | null
          registration_link: string | null
          registration_required: boolean | null
          start_date: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          event_type: string
          id?: string
          image_url?: string | null
          is_online?: boolean | null
          location?: string | null
          max_participants?: number | null
          meeting_link?: string | null
          organizer_contact?: string | null
          organizer_name?: string | null
          registration_deadline?: string | null
          registration_link?: string | null
          registration_required?: boolean | null
          start_date: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          image_url?: string | null
          is_online?: boolean | null
          location?: string | null
          max_participants?: number | null
          meeting_link?: string | null
          organizer_contact?: string | null
          organizer_name?: string | null
          registration_deadline?: string | null
          registration_link?: string | null
          registration_required?: boolean | null
          start_date?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      extracted_dispense: {
        Row: {
          academic_year: string | null
          course_code: string | null
          course_folder: string | null
          course_name: string | null
          created_at: string
          extracted_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          folder_path: string
          id: string
          relative_path: string
          updated_at: string
          upload_id: string
          year_folder: string | null
        }
        Insert: {
          academic_year?: string | null
          course_code?: string | null
          course_folder?: string | null
          course_name?: string | null
          created_at?: string
          extracted_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          folder_path?: string
          id?: string
          relative_path: string
          updated_at?: string
          upload_id: string
          year_folder?: string | null
        }
        Update: {
          academic_year?: string | null
          course_code?: string | null
          course_folder?: string | null
          course_name?: string | null
          created_at?: string
          extracted_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          folder_path?: string
          id?: string
          relative_path?: string
          updated_at?: string
          upload_id?: string
          year_folder?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "extracted_dispense_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "dispense_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      guides: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_url: string
          id: string
          is_active: boolean | null
          order_index: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          file_url: string
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          file_url?: string
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      handouts: {
        Row: {
          exam_type: string | null
          file_url: string
          filename: string
          id: number
          semester: number | null
          subject: string
          track: string | null
          uploaded_at: string | null
          year: string
        }
        Insert: {
          exam_type?: string | null
          file_url: string
          filename: string
          id?: number
          semester?: number | null
          subject: string
          track?: string | null
          uploaded_at?: string | null
          year: string
        }
        Update: {
          exam_type?: string | null
          file_url?: string
          filename?: string
          id?: number
          semester?: number | null
          subject?: string
          track?: string | null
          uploaded_at?: string | null
          year?: string
        }
        Relationships: []
      }
      images: {
        Row: {
          id: number
          "image-name": string | null
          url: string | null
        }
        Insert: {
          id?: number
          "image-name"?: string | null
          url?: string | null
        }
        Update: {
          id?: number
          "image-name"?: string | null
          url?: string | null
        }
        Relationships: []
      }
      magistrali_handouts: {
        Row: {
          created_at: string
          exam_type: string | null
          id: string
          name: string
          program: string
          semester: number | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          exam_type?: string | null
          id?: string
          name: string
          program: string
          semester?: number | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          exam_type?: string | null
          id?: string
          name?: string
          program?: string
          semester?: number | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      "minimum CFU required": {
        Row: {
          cfu_min: number | null
          course: string
          id: number
        }
        Insert: {
          cfu_min?: number | null
          course: string
          id?: number
        }
        Update: {
          cfu_min?: number | null
          course?: string
          id?: number
        }
        Relationships: []
      }
      NC_max: {
        Row: {
          course: string
          id: number
          NC_MAX: number | null
        }
        Insert: {
          course: string
          id?: number
          NC_MAX?: number | null
        }
        Update: {
          course?: string
          id?: number
          NC_MAX?: number | null
        }
        Relationships: []
      }
      pdf_files: {
        Row: {
          content: string | null
          name: string
          url: string
        }
        Insert: {
          content?: string | null
          name: string
          url: string
        }
        Update: {
          content?: string | null
          name?: string
          url?: string
        }
        Relationships: []
      }
      representatives: {
        Row: {
          id: string
          name: string
          section: string
          url: string | null
        }
        Insert: {
          id?: string
          name: string
          section: string
          url?: string | null
        }
        Update: {
          id?: string
          name?: string
          section?: string
          url?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          academic_year: string
          course_code: string | null
          course_name: string
          created_at: string
          description: string | null
          downloads_count: number | null
          file_size: number | null
          file_url: string | null
          id: string
          is_public: boolean | null
          resource_type: string
          semester: number | null
          tags: string[] | null
          title: string
          updated_at: string
          upload_date: string
          uploaded_by: string | null
        }
        Insert: {
          academic_year: string
          course_code?: string | null
          course_name: string
          created_at?: string
          description?: string | null
          downloads_count?: number | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_public?: boolean | null
          resource_type: string
          semester?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
          upload_date?: string
          uploaded_by?: string | null
        }
        Update: {
          academic_year?: string
          course_code?: string | null
          course_name?: string
          created_at?: string
          description?: string | null
          downloads_count?: number | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_public?: boolean | null
          resource_type?: string
          semester?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          upload_date?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      Stella_Polare: {
        Row: {
          category: string
          created_at: string
          id: number
          theme: string | null
          Title: string | null
          URL: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          id?: number
          theme?: string | null
          Title?: string | null
          URL?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: number
          theme?: string | null
          Title?: string | null
          URL?: string | null
        }
        Relationships: []
      }
      UG_exchange_destinations: {
        Row: {
          continent: string
          id: number
          max_score: number | null
          min_score: number | null
          sel_details: string | null
          uni_name: string | null
        }
        Insert: {
          continent: string
          id?: number
          max_score?: number | null
          min_score?: number | null
          sel_details?: string | null
          uni_name?: string | null
        }
        Update: {
          continent?: string
          id?: number
          max_score?: number | null
          min_score?: number | null
          sel_details?: string | null
          uni_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

