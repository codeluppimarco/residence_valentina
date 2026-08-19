// Tipi scritti a mano rispecchiando supabase/migrations/*.sql. Quando il
// progetto Supabase sarà collegato via CLI, si può rigenerare con:
//   npx supabase gen types typescript --project-id hnnlbwcixapxoegfkggu > types/database.ts
// (serve un access token / login CLI che qui non abbiamo ancora).

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      units: {
        Row: {
          id: string;
          label: string;
          owner_name: string;
          floor: string | null;
          millesimi: number;
          resident_count: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          label: string;
          owner_name: string;
          floor?: string | null;
          millesimi?: number;
          resident_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["units"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          full_name: string;
          phone: string | null;
          unit_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: Database["public"]["Enums"]["app_role"];
          full_name: string;
          phone?: string | null;
          unit_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "profiles_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          },
        ];
      };
      config: {
        Row: {
          id: number;
          condo_name: string;
          address: string | null;
          tax_code: string | null;
          iban: string | null;
          default_split_method: Database["public"]["Enums"]["app_split_method"];
          updated_at: string;
        };
        Insert: {
          id?: number;
          condo_name?: string;
          address?: string | null;
          tax_code?: string | null;
          iban?: string | null;
          default_split_method?: Database["public"]["Enums"]["app_split_method"];
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["config"]["Insert"]>;
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          description: string;
          category: string;
          amount: number;
          expense_date: string;
          split_method: Database["public"]["Enums"]["app_split_method"];
          notes: string | null;
          quote_path: string | null;
          invoice_path: string | null;
          settled_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          description: string;
          category: string;
          amount: number;
          expense_date: string;
          split_method: Database["public"]["Enums"]["app_split_method"];
          notes?: string | null;
          quote_path?: string | null;
          invoice_path?: string | null;
          settled_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["expenses"]["Insert"]>;
        Relationships: [];
      };
      expense_shares: {
        Row: {
          id: string;
          expense_id: string;
          unit_id: string;
          amount: number;
          basis: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          expense_id: string;
          unit_id: string;
          amount: number;
          basis: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["expense_shares"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "expense_shares_expense_id_fkey";
            columns: ["expense_id"];
            isOneToOne: false;
            referencedRelation: "expenses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expense_shares_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          expense_share_id: string;
          status: Database["public"]["Enums"]["app_payment_status"];
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          expense_share_id: string;
          status?: Database["public"]["Enums"]["app_payment_status"];
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "payments_expense_share_id_fkey";
            columns: ["expense_share_id"];
            isOneToOne: true;
            referencedRelation: "expense_shares";
            referencedColumns: ["id"];
          },
        ];
      };
      minutes: {
        Row: {
          id: string;
          title: string;
          minute_date: string;
          body: string;
          attachment_path: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          minute_date: string;
          body: string;
          attachment_path?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["minutes"]["Insert"]>;
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          title: string;
          doc_type: string;
          doc_date: string;
          storage_path: string;
          uploaded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          doc_type: string;
          doc_date?: string;
          storage_path: string;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>;
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          title: string;
          unit_label: string;
          description: string | null;
          status: string;
          assignee: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          unit_label?: string;
          description?: string | null;
          status?: string;
          assignee?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reports"]["Insert"]>;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          event_date: string;
          event_type: string;
          description: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          event_date: string;
          event_type?: string;
          description?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
        Relationships: [];
      };
      cash_ledger: {
        Row: {
          id: string;
          entry_date: string;
          description: string;
          amount: number;
          expense_id: string | null;
          payment_id: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          entry_date?: string;
          description: string;
          amount: number;
          expense_id?: string | null;
          payment_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["cash_ledger"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_role: {
        Args: Record<string, never>;
        Returns: Database["public"]["Enums"]["app_role"];
      };
      current_unit_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      app_role: "admin" | "revisore" | "condomino";
      app_split_method: "millesimi" | "persone" | "unita";
      app_payment_status: "pagato" | "in_attesa" | "scaduto";
    };
    CompositeTypes: Record<string, never>;
  };
};
