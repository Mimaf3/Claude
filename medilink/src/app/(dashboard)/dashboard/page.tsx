"use client";

import { useState, useEffect, useCallback } from "react";
import { VacationCard } from "@/components/VacationCard";
import { PushNotifManager } from "@/components/PushNotifManager";
import { Badge } from "@/components/ui/Badge";
import { ROLE_LABELS } from "@/types";
import { Filter, CalendarCheck, Calendar } from "lucide-react";

type Vacation = {
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

type User = { id: string; email: string; firstName: string; lastName: string; role: string };

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [available, setAvailable] = useState<Vacation[]>([]);
  const [mine, setMine] = useState<Vacation[]>([]);
  const [sites, setSites] = useState<{ id: string; name: string; city: string }[]>([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [tab, setTab] = useState<"available" | "mine">("available");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [meRes, vacRes, mineRes, sitesRes] = await Promise.all([
      fetch("/api/auth/me"),
      fetch(`/api/vacations${selectedSite ? `?siteId=${selectedSite}` : ""}`),
      fetch("/api/vacations?mine=true"),
      fetch("/api/sites"),
    ]);

    if (meRes.ok) setUser((await meRes.json()).user);
    if (vacRes.ok) setAvailable((await vacRes.json()).vacations);
    if (mineRes.ok) setMine((await mineRes.json()).vacations);
    if (sitesRes.ok) setSites((await sitesRes.json()).sites);
    setLoading(false);
  }, [selectedSite]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAccept = async (id: string) => {
    const res = await fetch(`/api/vacations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    });
    if (res.ok) fetchData();
    else {
      const d = await res.json();
      alert(d.error);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Confirmer l'annulation de cette vacation ?")) return;
    const res = await fetch(`/api/vacations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    if (res.ok) fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  const displayList = tab === "available" ? available : mine;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {user?.firstName} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            <Badge className={`mr-2 ${user?.role === "medecin" ? "bg-green-100 text-green-800" : user?.role === "manip_radio" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
              {user ? ROLE_LABELS[user.role] : ""}
            </Badge>
            {available.length} vacation{available.length > 1 ? "s" : ""} disponible{available.length > 1 ? "s" : ""}
          </p>
        </div>
        <PushNotifManager />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{available.length}</p>
              <p className="text-sm text-gray-500">Vacations disponibles</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{mine.length}</p>
              <p className="text-sm text-gray-500">Mes vacations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="outline-none text-gray-700 bg-transparent text-sm"
          >
            <option value="">Tous les sites</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} – {s.city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setTab("available")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === "available"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Vacations disponibles
          {available.length > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs rounded-full px-2 py-0.5">
              {available.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("mine")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === "mine"
              ? "border-green-600 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          Mes vacations acceptées
          {mine.length > 0 && (
            <span className="bg-green-100 text-green-700 text-xs rounded-full px-2 py-0.5">
              {mine.length}
            </span>
          )}
        </button>
      </div>

      {/* List */}
      {displayList.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">
            {tab === "available" ? "Aucune vacation disponible" : "Vous n'avez pas encore accepté de vacation"}
          </p>
          <p className="text-sm mt-1">
            {tab === "available"
              ? "Revenez plus tard ou modifiez vos filtres."
              : "Consultez les vacations disponibles pour en accepter une."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayList.map((v) => (
            <VacationCard
              key={v.id}
              vacation={v}
              currentUserId={user?.id}
              onAccept={tab === "available" ? handleAccept : undefined}
              onCancel={tab === "mine" ? handleCancel : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
