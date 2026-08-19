export type UserRole = "admin" | "empleado";
export type EventStatus = "programado" | "confirmado" | "finalizado" | "cancelado";

// NOTA: se usan `type` (no `interface`) porque TypeScript solo reconoce los
// alias de objeto literal como compatibles con `Record<string, unknown>`,
// que es lo que exige la forma `GenericTable` del SDK de Supabase para que
// el tipado de `.from(...).select()/.insert()/.update()` funcione (si no,
// todo colapsa silenciosamente a `never`).
export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  active: boolean;
  created_at: string;
};

export type Event = {
  id: string;
  name: string;
  start_time: string; // ISO timestamp
  end_time: string | null;
  location: string;
  max_staff: number;
  internal_notes: string | null;
  client_name: string | null;
  client_phone: string | null;
  status: EventStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type EventSignup = {
  id: string;
  event_id: string;
  employee_id: string;
  signed_up_at: string;
};

export type Alert = {
  id: string;
  event_id: string;
  type: string;
  message: string;
  acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  created_at: string;
};

// Formas "join" usadas en los paneles
export type EventWithSignups = Event & {
  event_signups: (EventSignup & { profiles: Pick<Profile, "id" | "full_name" | "phone"> })[];
};

export type AlertWithEvent = Alert & {
  events: Pick<Event, "id" | "name" | "start_time" | "location" | "client_name" | "client_phone">;
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; full_name: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      events: {
        Row: Event;
        Insert: Partial<Event> & { name: string; start_time: string; location: string; max_staff: number };
        Update: Partial<Event>;
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      event_signups: {
        Row: EventSignup;
        Insert: Partial<EventSignup> & { event_id: string; employee_id: string };
        Update: Partial<EventSignup>;
        Relationships: [
          {
            foreignKeyName: "event_signups_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_signups_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      alerts: {
        Row: Alert;
        Insert: Partial<Alert> & { event_id: string; message: string };
        Update: Partial<Alert>;
        Relationships: [
          {
            foreignKeyName: "alerts_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      signup_for_event: {
        Args: { p_event_id: string };
        Returns: EventSignup;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      event_status: EventStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
