"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Shield,
  Bug,
  BookOpen,
  BarChart3,
  ClipboardCheck,
  Radio,
  Radar,
  Server,
  AlertOctagon,
  Zap,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { locale } = useParams();

  const navigation = [
    { name: t("dashboard"), href: `/${locale}/dashboard`, icon: LayoutDashboard },
    { name: t("events"), href: `/${locale}/events`, icon: Shield },
    { name: t("vulnerabilities"), href: `/${locale}/vulnerabilities`, icon: Bug },
    { name: t("playbooks"), href: `/${locale}/playbooks`, icon: BookOpen },
    { name: t("metrics"), href: `/${locale}/metrics`, icon: BarChart3 },
    { name: t("compliance"), href: `/${locale}/compliance`, icon: ClipboardCheck },
    { name: t("siem"), href: `/${locale}/siem`, icon: Radio },
    { name: t("threatIntel"), href: `/${locale}/threat-intel`, icon: Radar },
    { name: t("assets"), href: `/${locale}/assets`, icon: Server },
    { name: t("incidents"), href: `/${locale}/incidents`, icon: AlertOctagon },
    { name: t("soar"), href: `/${locale}/soar`, icon: Zap },
  ];

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6 dark:border-gray-700">
        <Shield className="h-8 w-8 text-primary-600" />
        <span className="text-xl font-bold text-gray-900 dark:text-white">SecOps</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-3 dark:border-gray-700">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <LogOut className="h-5 w-5" />
          {t("logout")}
        </button>
      </div>
    </div>
  );
}
