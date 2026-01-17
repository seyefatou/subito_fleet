// @ts-nocheck
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Shield,
  Car,
  Users,
  UserCircle,
  CreditCard,
  MapPin,
  FileText,
  AlertTriangle,
  Settings,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Bell,
  ShieldCheck,
  Landmark,
  Receipt
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";

const menuItems = [
  { name: 'Tableau de bord', icon: LayoutDashboard, href: '/' },
  { name: 'Dashboard Personnalisé', icon: Settings, href: '/custom-dashboard' },
  { name: 'Programmes', icon: FileText, href: '/programs' },
  { name: 'Banques', icon: Landmark, href: '/banks' },
  { name: 'Fonds de garantie', icon: Shield, href: '/guarantee-funds' },
  { name: 'Assureurs', icon: ShieldCheck, href: '/insurers' },
  { name: 'Véhicules', icon: Car, href: '/vehicles' },
  { name: 'GIE', icon: Building2, href: '/gies' },
  { name: 'Chauffeurs', icon: Users, href: '/drivers' },
  { name: 'Performance', icon: LayoutDashboard, href: '/driver-performance' },
  { name: 'Paiements', icon: CreditCard, href: '/payments' },
  { name: 'Validation Paiements', icon: FileText, href: '/payment-approvals' },
  { name: 'Suivi financier', icon: Receipt, href: '/financial-tracking' },
  { name: 'Notifications', icon: Bell, href: '/notifications' },
  { name: 'Garanties', icon: FileText, href: '/guarantees' },
  { name: 'Assurances', icon: Receipt, href: '/insurances' },
  { name: 'Entretien', icon: Settings, href: '/maintenances' },
  { name: 'IA Prédictive', icon: Bell, href: '/predictive-maintenance' },
  { name: 'Tracking GPS', icon: MapPin, href: '/tracking' },
  { name: 'Incidents', icon: AlertTriangle, href: '/incidents' },
  { name: 'Rapports', icon: FileText, href: '/reports' },
];

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Formater le nom complet de l'utilisateur
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Utilisateur';

  // Mapper les rôles pour l'affichage
  const roleLabels: Record<string, string> = {
    ADMIN: 'Administrateur',
    OPERATOR: 'Opérateur',
    BANK: 'Banque',
    GIE: 'GIE',
    DRIVER: 'Chauffeur',
    FUND: 'Fonds de garantie',
    INSURER: 'Assureur',
  };

  const handleLogout = () => {
    logout();
  };

  const getCurrentPageName = () => {
    const currentItem = menuItems.find(item => item.href === pathname);
    return currentItem?.name || 'SUBITO FLEET';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg">SUBITO FLEET</h1>
              <p className="text-xs text-slate-500">Gestion Taxi Finance</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">
              {getCurrentPageName()}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-slate-500" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
            </Link>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 px-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar || undefined} />
                    <AvatarFallback className="bg-amber-100 text-amber-700 font-medium">
                      {user?.firstName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-slate-700">{fullName}</p>
                    <p className="text-xs text-slate-500">{user?.role ? roleLabels[user.role] || user.role : 'Utilisateur'}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/user-profile">
                    <UserCircle className="w-4 h-4 mr-2" />
                    Mon profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
