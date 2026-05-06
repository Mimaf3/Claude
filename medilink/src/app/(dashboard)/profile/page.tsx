"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ROLE_LABELS, ROLE_COLORS } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { User, Mail, Phone, IdCard, CheckCircle } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: string;
    speciality: string | null;
    rppsNumber: string | null;
  } | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", speciality: "", rppsNumber: "" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      setUser(d.user);
      setForm({
        firstName: d.user.firstName,
        lastName: d.user.lastName,
        phone: d.user.phone || "",
        speciality: d.user.speciality || "",
        rppsNumber: d.user.rppsNumber || "",
      });
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/users/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const d = await res.json();
      setUser(d.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
        <p className="text-gray-500 mt-1">Gérez vos informations personnelles</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-700 font-bold text-xl">
              {user.firstName[0]}{user.lastName[0]}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={ROLE_COLORS[user.role]}>{ROLE_LABELS[user.role]}</Badge>
              {user.speciality && (
                <span className="text-sm text-gray-500">{user.speciality}</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            {user.email}
          </div>
          {user.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              {user.phone}
            </div>
          )}
          {user.rppsNumber && (
            <div className="flex items-center gap-2">
              <IdCard className="w-4 h-4 text-gray-400" />
              RPPS : {user.rppsNumber}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <User className="w-4 h-4" />
          Modifier mes informations
        </h3>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
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
              placeholder="06 12 34 56 78"
            />
          </div>

          {(user.role === "medecin" || user.role === "manip_radio") && (
            <>
              {user.role === "medecin" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Spécialité</label>
                  <input
                    value={form.speciality}
                    onChange={(e) => setForm({ ...form, speciality: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">N° RPPS</label>
                <input
                  value={form.rppsNumber}
                  onChange={(e) => setForm({ ...form, rppsNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={loading}>
              Enregistrer
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                Enregistré !
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
