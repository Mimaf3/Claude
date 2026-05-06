"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Bell, LogOut, User, Menu, X, Building2, Calendar, Settings, LayoutDashboard } from "lucide-react";
import { ROLE_LABELS } from "@/types";

interface NavbarProps {
  user: { id: string; email: string; firstName: string; lastName: string; role: string } | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchUnread = useCallback(async () => {
    if (!user) return;
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const data = await res.json();
      setUnread(data.unreadCount);
    }
  }, [user]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const isAdmin = user?.role === "admin";

  const navLinks = isAdmin
    ? [
        { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
        { href: "/admin/vacations", label: "Vacations", icon: Calendar },
        { href: "/admin/sites", label: "Sites", icon: Building2 },
        { href: "/admin/users", label: "Intervenants", icon: User },
      ]
    : [
        { href: "/dashboard", label: "Mes vacations", icon: Calendar },
        { href: "/notifications", label: "Notifications", icon: Bell },
        { href: "/profile", label: "Mon profil", icon: Settings },
      ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ML</span>
              </div>
              <span className="font-bold text-gray-900 text-lg">Medilink</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                    {link.href === "/notifications" && unread > 0 && (
                      <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{ROLE_LABELS[user.role]}</p>
                </div>

                {!isAdmin && (
                  <Link href="/notifications" className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    <Bell className="w-5 h-5" />
                    {unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Se déconnecter"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}

            <button
              className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2 pb-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                  {link.href === "/notifications" && unread > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                      {unread}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
