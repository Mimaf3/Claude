"use client";

import { useState, useEffect } from "react";
import { Search, UserCheck, UserX, Phone, Mail, IdCard } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ROLE_LABELS, ROLE_COLORS } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type User = {
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
  _count: { acceptedVacations: number };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    if (res.ok) setUsers((await res.json()).users);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleActive = async (userId: string, isActive: boolean) => {
    await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isActive }),
    });
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isActive } : u))
    );
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Intervenants</h1>
        <p className="text-gray-500 mt-1">{filtered.length} utilisateur(s)</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            placeholder="Rechercher par nom ou email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none text-sm flex-1"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="">Tous les profils</option>
          <option value="secretaire">Secrétaires</option>
          <option value="manip_radio">Manips radio</option>
          <option value="medecin">Médecins</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Intervenant</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Contact</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Profil</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Vacations</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Inscrit le</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((u) => (
              <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${!u.isActive ? "opacity-50" : ""}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-xs font-medium text-gray-600">
                        {u.firstName[0]}{u.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        {u.firstName} {u.lastName}
                      </p>
                      {u.rppsNumber && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <IdCard className="w-3 h-3" /> {u.rppsNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="text-sm text-gray-500 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {u.email}
                    </div>
                    {u.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {u.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge className={ROLE_COLORS[u.role]}>
                    {u.speciality || ROLE_LABELS[u.role]}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm text-gray-900 font-medium">
                    {u._count.acceptedVacations}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm text-gray-500">
                    {format(new Date(u.createdAt), "d MMM yyyy", { locale: fr })}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleActive(u.id, !u.isActive)}
                    title={u.isActive ? "Désactiver" : "Activer"}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      u.isActive
                        ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700"
                        : "bg-red-100 text-red-700 hover:bg-green-100 hover:text-green-700"
                    }`}
                  >
                    {u.isActive ? (
                      <><UserCheck className="w-3.5 h-3.5" /> Actif</>
                    ) : (
                      <><UserX className="w-3.5 h-3.5" /> Inactif</>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
