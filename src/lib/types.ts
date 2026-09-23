export type Role = "patient" | "doctor" | "moderator";

export type Profile = {
  id: string;
  display_name: string;
  role: Role;
};

export type SupportRequest = {
  id: string;
  patient_id: string;
  support_type: string;
  message: string;
  status: "open" | "claimed" | "closed";
  is_urgent: boolean;
  created_at: string;
};

export type Conversation = {
  id: string;
  request_id: string;
  patient_id: string;
  doctor_id: string;
  status: "active" | "closed";
  created_at: string;
  support_requests: { support_type: string; is_urgent: boolean } | null;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  is_urgent: boolean;
  created_at: string;
};

export type DoctorProfile = {
  user_id: string;
  credentials: string;
  specialties: string[];
  bio: string;
  availability: string;
  support_mode: string;
  verification_status: "pending" | "verified" | "rejected";
  created_at: string;
};

export type Report = {
  id: string;
  reporter_id: string;
  conversation_id: string | null;
  message_id: string | null;
  message_excerpt: string | null;
  reason: string;
  status: "open" | "reviewing" | "resolved";
  created_at: string;
};
