"use client";

import { useState, useEffect } from "react";
import { Calendar, CalendarCheck, Users, Building2, TrendingUp } from "lucide-react";
import Link from "next/link";

interface Stats {
  totalVacations: number;
  availableVacations: number;
  takenVacations: number;
  totalUsers: number;
  totalSites: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then((d) => setStats(d.stats));
  }, []);

  const cards = stats
    ? [
        {
          label: "Vacations disponibles",
          value: stats.availableVacations,
          icon: Calendar,
          color: "bg-blue-500",
          lightColor: "bg-blue-50 text-blue-700",
          href: "/admin/vacations?status=available",
        },
        {
          label: "Vacations prises",
          value: stats.takenVacations,
          icon: CalendarCheck,
          color: "bg-green-500",
          lightColor: "bg-green-50 text-green-700",
          href: "/admin/vacations?status=taken",
        },
        {
          label: "Intervenants actifs",
          value: stats.totalUsers,
          icon: Users,
          color: "bg-purple-500",
          lightColor: "bg-purple-50 text-purple-700",
          href: "/admin/users",
        },
        {
          label: "Sites",
          value: stats.totalSites,
          icon: Building2,
          color: "bg-amber-500",
          lightColor: "bg-amber-50 text-amber-700",
          href: "/admin/sites",
        },
      ]
    : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord administrateur</h1>
        <p className="text-gray-500 mt-1">Vue d&apos;ensemble de la plateforme Medilink</p>
      </div>

      {!stats ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.label}
                  href={card.href}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-gray-300" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{card.label}</p>
                </Link>
              );
            })}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Taux de remplissage</h2>
            {stats.totalVacations === 0 ? (
              <p className="text-gray-400 text-sm">Aucune vacation créée.</p>
            ) : (
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Vacations pourvues</span>
                  <span>
                    {stats.takenVacations} / {stats.totalVacations} (
                    {Math.round((stats.takenVacations / stats.totalVacations) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full transition-all"
                    style={{ width: `${Math.round((stats.takenVacations / stats.totalVacations) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
