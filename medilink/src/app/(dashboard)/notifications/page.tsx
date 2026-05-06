"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, CheckCheck, Building2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/Button";
import { PushNotifManager } from "@/components/PushNotifManager";

type Notif = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  vacation: { id: string; site: { name: string; city: string } } | null;
};

type Pref = {
  id: string;
  siteId: string;
  enabled: boolean;
  site: { id: string; name: string; city: string };
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [preferences, setPreferences] = useState<Pref[]>([]);
  const [tab, setTab] = useState<"notifs" | "preferences">("notifs");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [nRes, pRes] = await Promise.all([
      fetch("/api/notifications"),
      fetch("/api/users/preferences"),
    ]);
    if (nRes.ok) {
      const d = await nRes.json();
      setNotifications(d.notifications);
    }
    if (pRes.ok) {
      const d = await pRes.json();
      setPreferences(d.preferences);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const toggleSite = async (siteId: string, enabled: boolean) => {
    await fetch("/api/users/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, enabled }),
    });
    setPreferences((prev) =>
      prev.map((p) => (p.siteId === siteId ? { ...p, enabled } : p))
    );
  };

  const TYPE_ICONS: Record<string, string> = {
    new_vacation: "🏥",
    vacation_taken: "✅",
    vacation_cancelled: "❌",
    vacation_available_again: "🔄",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">
            {notifications.filter((n) => !n.isRead).length} non lue(s)
          </p>
        </div>
        <PushNotifManager />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setTab("notifs")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === "notifs"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Bell className="w-4 h-4" />
          Mes notifications
        </button>
        <button
          onClick={() => setTab("preferences")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === "preferences"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Préférences par site
        </button>
      </div>

      {tab === "notifs" && (
        <>
          {notifications.some((n) => !n.isRead) && (
            <div className="flex justify-end mb-4">
              <Button variant="ghost" size="sm" onClick={markAllRead}>
                <CheckCheck className="w-4 h-4" />
                Tout marquer comme lu
              </Button>
            </div>
          )}

          {notifications.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <BellOff className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">Aucune notification</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-4 p-4 rounded-xl border transition-colors ${
                    n.isRead
                      ? "bg-white border-gray-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <span className="text-2xl shrink-0">{TYPE_ICONS[n.type] || "📬"}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${n.isRead ? "text-gray-700" : "text-gray-900"}`}>
                      {n.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(n.createdAt), "d MMMM yyyy à HH:mm", { locale: fr })}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "preferences" && (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Choisissez les sites pour lesquels vous souhaitez recevoir des notifications de nouvelles vacations.
          </p>

          {preferences.length === 0 ? (
            <p className="text-center py-8 text-gray-400">Aucun site disponible</p>
          ) : (
            <div className="space-y-3">
              {preferences.map((pref) => (
                <div
                  key={pref.id}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">{pref.site.name}</p>
                    <p className="text-sm text-gray-500">{pref.site.city}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pref.enabled}
                      onChange={(e) => toggleSite(pref.siteId, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                    <span className="ml-2 text-sm text-gray-600">
                      {pref.enabled ? "Activé" : "Désactivé"}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
