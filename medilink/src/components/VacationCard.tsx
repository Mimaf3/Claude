"use client";

import { useState } from "react";
import { MapPin, Clock, Euro, Calendar, User, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ROLE_LABELS, ROLE_COLORS, STATUS_LABELS, STATUS_COLORS } from "@/types";

interface VacationCardProps {
  vacation: {
    id: string;
    title: string;
    description: string | null;
    site: { id: string; name: string; city: string; address: string };
    requiredRole: string;
    speciality: string | null;
    startDate: string;
    endDate: string;
    status: string;
    takenBy: { id: string; firstName: string; lastName: string } | null;
    takenAt: string | null;
    hourlyRate: number | null;
    notes: string | null;
  };
  currentUserId?: string;
  isAdmin?: boolean;
  onAccept?: (id: string) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
}

export function VacationCard({ vacation, currentUserId, isAdmin, onAccept, onCancel }: VacationCardProps) {
  const [loading, setLoading] = useState<"accept" | "cancel" | null>(null);

  const start = new Date(vacation.startDate);
  const end = new Date(vacation.endDate);
  const isMine = vacation.takenBy?.id === currentUserId;

  const durationHours = Math.round((end.getTime() - start.getTime()) / 1000 / 3600);

  const handle = async (action: "accept" | "cancel") => {
    setLoading(action);
    try {
      if (action === "accept") await onAccept?.(vacation.id);
      else await onCancel?.(vacation.id);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base truncate">{vacation.title}</h3>
            {vacation.description && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{vacation.description}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge className={STATUS_COLORS[vacation.status]}>
              {STATUS_LABELS[vacation.status]}
            </Badge>
            <Badge className={ROLE_COLORS[vacation.requiredRole]}>
              {vacation.speciality || ROLE_LABELS[vacation.requiredRole]}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="truncate">{vacation.site.name} – {vacation.site.city}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
            <span>{durationHours}h</span>
          </div>

          <div className="flex items-center gap-1.5 col-span-2">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <span>
              {format(start, "EEEE d MMMM yyyy", { locale: fr })}
              {" – "}
              {format(start, "HH:mm")} → {format(end, "HH:mm")}
            </span>
          </div>

          {vacation.hourlyRate && (
            <div className="flex items-center gap-1.5">
              <Euro className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{vacation.hourlyRate} €/h</span>
            </div>
          )}

          {vacation.takenBy && (
            <div className="flex items-center gap-1.5 col-span-2">
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="font-medium text-gray-700">
                {vacation.takenBy.firstName} {vacation.takenBy.lastName}
                {isMine && " (vous)"}
              </span>
            </div>
          )}
        </div>

        {vacation.notes && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mb-3">
            📌 {vacation.notes}
          </p>
        )}

        <div className="flex gap-2 pt-3 border-t border-gray-100">
          {vacation.status === "available" && onAccept && (
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={() => handle("accept")}
              loading={loading === "accept"}
            >
              <CheckCircle className="w-4 h-4" />
              Accepter
            </Button>
          )}

          {vacation.status === "taken" && (isMine || isAdmin) && onCancel && (
            <Button
              variant="danger"
              size="sm"
              className="flex-1"
              onClick={() => handle("cancel")}
              loading={loading === "cancel"}
            >
              <XCircle className="w-4 h-4" />
              Annuler
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
