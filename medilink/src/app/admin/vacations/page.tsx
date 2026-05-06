"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Trash2, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { VacationCard } from "@/components/VacationCard";

type Site = { id: string; name: string; city: string; address: string };
type Vacation = {
  id: string;
  title: string;
  description: string | null;
  site: Site;
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

const EMPTY_FORM = {
  title: "",
  description: "",
  siteId: "",
  requiredRole: "",
  speciality: "",
  startDate: "",
  endDate: "",
  hourlyRate: "",
  notes: "",
};

export default function AdminVacationsPage() {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSite, setFilterSite] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    if (filterSite) params.set("siteId", filterSite);
    const [vRes, sRes] = await Promise.all([
      fetch(`/api/vacations?${params}`),
      fetch("/api/sites"),
    ]);
    if (vRes.ok) setVacations((await vRes.json()).vacations);
    if (sRes.ok) setSites((await sRes.json()).sites);
  }, [filterStatus, filterSite]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (v: Vacation) => {
    setForm({
      title: v.title,
      description: v.description || "",
      siteId: v.site.id,
      requiredRole: v.requiredRole,
      speciality: v.speciality || "",
      startDate: new Date(v.startDate).toISOString().slice(0, 16),
      endDate: new Date(v.endDate).toISOString().slice(0, 16),
      hourlyRate: v.hourlyRate?.toString() || "",
      notes: v.notes || "",
    });
    setEditId(v.id);
    setShowModal(true);
  };

  const saveVacation = async () => {
    setSaving(true);
    try {
      const method = editId ? "PATCH" : "POST";
      const url = editId ? `/api/vacations/${editId}` : "/api/vacations";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        fetchData();
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteVacation = async (id: string) => {
    if (!confirm("Supprimer cette vacation ?")) return;
    await fetch(`/api/vacations/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Remettre cette vacation dans le pool ?")) return;
    await fetch(`/api/vacations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    fetchData();
  };

  const filtered = vacations.filter((v) =>
    !search ||
    v.title.toLowerCase().includes(search.toLowerCase()) ||
    v.site.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des vacations</h1>
          <p className="text-gray-500 mt-1">{filtered.length} vacation(s)</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Nouvelle vacation
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none text-sm flex-1"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="">Tous les statuts</option>
          <option value="available">Disponibles</option>
          <option value="taken">Prises</option>
          <option value="cancelled">Annulées</option>
        </select>
        <select
          value={filterSite}
          onChange={(e) => setFilterSite(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="">Tous les sites</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>Aucune vacation trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((v) => (
            <div key={v.id} className="relative">
              <VacationCard
                vacation={v}
                isAdmin
                onCancel={v.status === "taken" ? handleCancel : undefined}
              />
              <div className="absolute top-3 right-3 flex gap-1">
                <button
                  onClick={() => openEdit(v)}
                  className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-sm"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteVacation(v.id)}
                  className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-red-600 hover:border-red-300 transition-colors shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">
                {editId ? "Modifier la vacation" : "Nouvelle vacation"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Ex: Vacation secrétariat – Accueil"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Site *</label>
                  <select
                    required
                    value={form.siteId}
                    onChange={(e) => setForm({ ...form, siteId: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option value="">Choisir…</option>
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Profil requis *</label>
                  <select
                    required
                    value={form.requiredRole}
                    onChange={(e) => setForm({ ...form, requiredRole: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option value="">Choisir…</option>
                    <option value="secretaire">Secrétaire</option>
                    <option value="manip_radio">Manip radio</option>
                    <option value="medecin">Médecin</option>
                  </select>
                </div>
              </div>

              {form.requiredRole === "medecin" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Spécialité requise</label>
                  <input
                    value={form.speciality}
                    onChange={(e) => setForm({ ...form, speciality: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Radiologue, Généraliste…"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Début *</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Fin *</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Taux horaire (€)</label>
                <input
                  type="number"
                  value={form.hourlyRate}
                  onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Ex: 45"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes internes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  placeholder="Instructions particulières…"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button
                className="flex-1"
                onClick={saveVacation}
                loading={saving}
                disabled={!form.title || !form.siteId || !form.requiredRole || !form.startDate || !form.endDate}
              >
                {editId ? "Enregistrer" : "Créer la vacation"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
