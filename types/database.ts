export interface Database {
  public: {
    Tables: {
      // USERS: basic profile info
      users: {
        Row: {
          id: number;
          email: string;
          password: string;
          profile_name: string;
          real_name: string | null;
          profile_pic_url: string | null;
          created_at: string; // ISO timestamp
        };
        Insert: {
          id?: number;
          email: string;
          password: string;
          profile_name: string;
          real_name?: string | null;
          profile_pic_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          email?: string;
          password?: string;
          profile_name?: string;
          real_name?: string | null;
          profile_pic_url?: string | null;
          created_at?: string;
        };
      };

      // GROUPS: friend groups that compete together
      groups: {
        Row: {
          id: number;
          name: string;
          invite_code: string;
          created_by: number | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          invite_code?: string;
          created_by?: number | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          invite_code?: string;
          created_by?: number | null;
          created_at?: string;
        };
      };

      // GROUP MEMBERS: who’s in which group
      group_members: {
        Row: {
          user_id: number;
          group_id: number;
          joined_at: string;
        };
        Insert: {
          user_id: number;
          group_id: number;
          joined_at?: string;
        };
        Update: {
          user_id?: number;
          group_id?: number;
          joined_at?: string;
        };
      };

      // TRACKED APPS: apps that trigger the accountability challenge
      tracked_apps: {
        Row: {
          id: number;
          group_id: number;
          app_identifier: string;
          app_name: string;
          platform: string; // "ios" or "android"
          created_at: string;
        };
        Insert: {
          id?: number;
          group_id: number;
          app_identifier: string;
          app_name: string;
          platform: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          group_id?: number;
          app_identifier?: string;
          app_name?: string;
          platform?: string;
          created_at?: string;
        };
      };

      // EVENTS: logs every time a user opens a tracked app
      events: {
        Row: {
          id: number;
          user_id: number;
          group_id: number;
          app_identifier: string;
          app_name: string;
          timestamp: string;
        };
        Insert: {
          id?: number;
          user_id: number;
          group_id: number;
          app_identifier: string;
          app_name: string;
          timestamp?: string;
        };
        Update: {
          id?: number;
          user_id?: number;
          group_id?: number;
          app_identifier?: string;
          app_name?: string;
          timestamp?: string;
        };
      };

      // DAILY STATS: one loser per group per day
      daily_stats: {
        Row: {
          id: number;
          group_id: number;
          loser_user_id: number;
          stat_date: string; // 'YYYY-MM-DD'
          created_at: string;
        };
        Insert: {
          id?: number;
          group_id: number;
          loser_user_id: number;
          stat_date?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          group_id?: number;
          loser_user_id?: number;
          stat_date?: string;
          created_at?: string;
        };
      };

      // MONTHLY STATS: leaderboard aggregation
      monthly_stats: {
        Row: {
          id: number;
          user_id: number;
          group_id: number;
          month_start: string; // 'YYYY-MM-DD'
          losses_count: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: number;
          group_id: number;
          month_start: string;
          losses_count?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: number;
          group_id?: number;
          month_start?: string;
          losses_count?: number;
          created_at?: string;
        };
      };
    };
  };
}
