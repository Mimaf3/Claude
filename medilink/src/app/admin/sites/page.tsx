"use client";

import { useState, useEffect } from "react";
import { Plus, MapPin, Phone, X, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Site = {
  id: string;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  phone: string | null;
  description: string | null;
  isActive: boolean;
};

const EMPTY = { name: "", address: "", city: "", zipCode: "", phone: "", description: "" };

export default function AdminSitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchSites = async () => {
    const res = await fetch("/api/sites");
    if (res.ok) setSites((await res.json()).sites);
  };

  useEffect(() => { fetchSites(); }, []);

  const openCreate = () => {
    setForm(EMPTY);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (s: Site) => {
    setForm({
      name: s.name,
      address: s.address,
      city: s.city,
      zipCode: s.zipCode,
      phone: s.phone || "",
      description: s.description || "",
    });
    setEditId(s.id);
    setShowModal(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const method = editId ? "PATCH" : "POST";
      const url = editId ? `/api/sites/${editId}` : "/api/sites";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        fetchSites();
      }
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (id: string) => {
    if (!confirm("Désactiver ce site ?")) return;
    await fetch(`/api/sites/${id}`, { method: "DELETE" });
    fetchSites();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sites de vacation</h1>
          <p className="text-gray-500 mt-1">{sites.length} site(s)</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Nouveau site
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sites.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(s)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deactivate(s.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-1">{s.name}</h3>
            <p className="text-sm text-gray-500">{s.address}</p>
            <p className="text-sm text-gray-500">{s.zipCode} {s.city}</p>
            {s.phone && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
                <Phone className="w-3.5 h-3.5" />
                {s.phone}
              </div>
            )}
            {s.description && (
              <p className="text-xs text-gray-400 mt-2 line-clamp-2">{s.description}</p>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">
                {editId ? "Modifier le site" : "Nouveau site"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Clinique Saint-Jean"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse *</label>
                <input
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="12 rue de la Santé"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Code postal *</label>
                  <input
                    required
                    value={form.zipCode}
                    onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ville *</label>
                  <input
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button
                className="flex-1"
                onClick={save}
                loading={saving}
                disabled={!form.name || !form.address || !form.city || !form.zipCode}
              >
                {editId ? "Enregistrer" : "Créer le site"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
