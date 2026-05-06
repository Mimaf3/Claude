export type Role = "secretaire" | "manip_radio" | "medecin" | "admin";

export const ROLE_LABELS: Record<string, string> = {
  secretaire: "Secrétaire",
  manip_radio: "Manipulateur radio",
  medecin: "Médecin remplaçant",
  admin: "Administrateur",
};

export const ROLE_COLORS: Record<string, string> = {
  secretaire: "bg-blue-100 text-blue-800",
  manip_radio: "bg-purple-100 text-purple-800",
  medecin: "bg-green-100 text-green-800",
  admin: "bg-red-100 text-red-800",
};

export const STATUS_LABELS: Record<string, string> = {
  available: "Disponible",
  taken: "Prise",
  cancelled: "Annulée",
};

export const STATUS_COLORS: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-800",
  taken: "bg-amber-100 text-amber-800",
  cancelled: "bg-red-100 text-red-800",
};

export interface VacationWithRelations {
  id: string;
  title: string;
  description: string | null;
  siteId: string;
  site: { id: string; name: string; city: string; address: string };
  requiredRole: string;
  speciality: string | null;
  startDate: string;
  endDate: string;
  status: string;
  takenById: string | null;
  takenBy: { id: string; firstName: string; lastName: string; email: string } | null;
  takenAt: string | null;
  hourlyRate: number | null;
  notes: string | null;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  speciality: string | null;
  rppsNumber: string | null;
  isActive: boolean;
  createdAt: string;
}
