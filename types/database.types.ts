/**
 * Hand-authored Database types matching database/schema.sql.
 *
 * Once the project is connected to a real Supabase project, replace this
 * file by running:
 *   npx supabase gen types typescript --project-id <id> > types/database.types.ts
 * Keeping the same file path means no other imports need to change.
 */
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['users']['Row']> & {
          id: string;
          email: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Row']>;
        Relationships: [];
      };
      families: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          cover_image_url: string | null;
          created_by: string;
          family_code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['families']['Row']> & {
          name: string;
          created_by: string;
        };
        Update: Partial<Database['public']['Tables']['families']['Row']>;
        Relationships: [];
      };
      family_members: {
        Row: {
          id: string;
          family_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member' | 'child';
          joined_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['family_members']['Row']> & {
          family_id: string;
          user_id: string;
        };
        Update: Partial<Database['public']['Tables']['family_members']['Row']>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          family_member_id: string;
          display_name: string | null;
          birthday: string | null;
          bio: string | null;
          color_tag: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & {
          family_member_id: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
        Relationships: [];
      };
      planner_events: {
        Row: {
          id: string;
          family_id: string;
          created_by: string;
          title: string;
          description: string | null;
          starts_at: string;
          ends_at: string | null;
          is_recurring: boolean;
          recurrence_rule: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['planner_events']['Row']> & {
          family_id: string;
          created_by: string;
          title: string;
          starts_at: string;
        };
        Update: Partial<Database['public']['Tables']['planner_events']['Row']>;
        Relationships: [];
      };
      reminders: {
        Row: {
          id: string;
          family_id: string | null;
          user_id: string;
          title: string;
          notes: string | null;
          remind_at: string;
          is_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['reminders']['Row']> & {
          user_id: string;
          title: string;
          remind_at: string;
        };
        Update: Partial<Database['public']['Tables']['reminders']['Row']>;
        Relationships: [];
      };
      prayer_reminders: {
        Row: {
          id: string;
          family_id: string | null;
          user_id: string;
          label: string;
          time_of_day: string;
          days_of_week: number[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['prayer_reminders']['Row']> & {
          user_id: string;
          label: string;
          time_of_day: string;
        };
        Update: Partial<Database['public']['Tables']['prayer_reminders']['Row']>;
        Relationships: [];
      };
      check_ins: {
        Row: {
          id: string;
          family_id: string;
          user_id: string;
          status: string;
          note: string | null;
          location_label: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['check_ins']['Row']> & {
          family_id: string;
          user_id: string;
          status: string;
        };
        Update: Partial<Database['public']['Tables']['check_ins']['Row']>;
        Relationships: [];
      };
      chats: {
        Row: {
          id: string;
          family_id: string | null;
          type: 'direct' | 'family' | 'group';
          name: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['chats']['Row']> & {
          created_by: string;
        };
        Update: Partial<Database['public']['Tables']['chats']['Row']>;
        Relationships: [];
      };
      chat_participants: {
        Row: {
          id: string;
          chat_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: Partial<Database['public']['Tables']['chat_participants']['Row']> & {
          chat_id: string;
          user_id: string;
        };
        Update: Partial<Database['public']['Tables']['chat_participants']['Row']>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          sender_id: string;
          content: string | null;
          media_id: string | null;
          is_edited: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['messages']['Row']> & {
          chat_id: string;
          sender_id: string;
        };
        Update: Partial<Database['public']['Tables']['messages']['Row']>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          family_id: string | null;
          type: string;
          title: string;
          body: string | null;
          is_read: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['notifications']['Row']> & {
          user_id: string;
          type: string;
          title: string;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Row']>;
        Relationships: [];
      };
      settings: {
        Row: {
          id: string;
          user_id: string;
          theme: string;
          notification_preferences: Json;
          language: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['settings']['Row']> & {
          user_id: string;
        };
        Update: Partial<Database['public']['Tables']['settings']['Row']>;
        Relationships: [];
      };
      media: {
        Row: {
          id: string;
          family_id: string | null;
          uploaded_by: string;
          storage_path: string;
          file_name: string;
          mime_type: string | null;
          size_bytes: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['media']['Row']> & {
          uploaded_by: string;
          storage_path: string;
          file_name: string;
        };
        Update: Partial<Database['public']['Tables']['media']['Row']>;
        Relationships: [];
      };
      family_join_requests: {
        Row: {
          id: string;
          family_id: string;
          user_id: string;
          status: 'pending' | 'approved' | 'denied';
          requested_at: string;
          resolved_at: string | null;
          resolved_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['family_join_requests']['Row']> & {
          family_id: string;
          user_id: string;
        };
        Update: Partial<Database['public']['Tables']['family_join_requests']['Row']>;
        Relationships: [];
      };
      family_invite_links: {
        Row: {
          id: string;
          family_id: string;
          token: string;
          role: 'owner' | 'admin' | 'member' | 'child';
          created_by: string;
          max_uses: number | null;
          use_count: number;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['family_invite_links']['Row']> & {
          family_id: string;
          token: string;
          created_by: string;
        };
        Update: Partial<Database['public']['Tables']['family_invite_links']['Row']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_family: {
        Args: { p_name: string; p_description?: string | null };
        Returns: Database['public']['Tables']['families']['Row'];
      };
      add_family_member_by_email: {
        Args: { p_family_id: string; p_email: string; p_role?: 'owner' | 'admin' | 'member' | 'child' };
        Returns: Database['public']['Tables']['family_members']['Row'];
      };
      update_family_member_role: {
        Args: { p_member_id: string; p_role: 'owner' | 'admin' | 'member' | 'child' };
        Returns: Database['public']['Tables']['family_members']['Row'];
      };
      remove_family_member: {
        Args: { p_member_id: string };
        Returns: undefined;
      };
      is_family_member: { Args: { fid: string }; Returns: boolean };
      is_family_admin: { Args: { fid: string }; Returns: boolean };
      is_chat_participant: { Args: { cid: string }; Returns: boolean };
      get_or_create_family_chat: {
        Args: { p_family_id: string };
        Returns: Database['public']['Tables']['chats']['Row'];
      };
      get_or_create_direct_chat: {
        Args: { p_other_user_id: string };
        Returns: Database['public']['Tables']['chats']['Row'];
      };
      get_my_chat_threads: {
        Args: Record<string, never>;
        Returns: {
          chat_id: string;
          type: 'direct' | 'family' | 'group';
          family_id: string | null;
          chat_name: string | null;
          other_user_id: string | null;
          other_user_name: string | null;
          other_user_avatar: string | null;
          last_message: string | null;
          last_message_at: string | null;
        }[];
      };
    };
    Enums: {
      family_role: 'owner' | 'admin' | 'member' | 'child';
      chat_type: 'direct' | 'family' | 'group';
    };
  };
}
