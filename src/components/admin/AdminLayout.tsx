"use client";

import React, { useState } from 'react';
import { useProfile } from '@/context/ProfileContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ListTodo,
  Settings,
  Menu,
  X,
  Layers2,
  Flag,
  BarChart,
  FileText,
} from 'lucide-react';
import { AdminLayoutProps, NavigationItem } from '@/types/admin';

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Verifications', href: '/admin/verifications', icon: ShieldCheck },
  { name: 'Listings', href: '/admin/listings', icon: ListTodo },
  { name: 'Categories', href: '/admin/categories', icon: Layers2 },
  { name: 'Reports', href: '/admin/reports', icon: Flag },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
  { name: 'Help Center', href: '/admin/help', icon: FileText },
  { name: 'Pages', href: '/admin/pages', icon: FileText },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { profile, role, isLoading } = useProfile();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Verify admin role
  if (role?.role?.name !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2">You don&apos;t have permission to access this area.</p>
          <Link href="/" className="mt-4 text-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-semibold text-primary">Admin Panel</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-lg px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Icon
                    className={cn(
                      "mr-3 h-5 w-5",
                      isActive ? "text-primary-foreground" : "text-gray-500"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="border-t p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <span className="text-sm font-medium leading-none text-primary-foreground">
                    {profile?.full_name?.[0]?.toUpperCase()}
                  </span>
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {profile?.full_name}
                </p>
                <p className="text-xs text-gray-500">{profile?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar toggle */}
      <button
        className={cn(
          "fixed bottom-4 left-4 z-50 rounded-full bg-primary p-3 text-white shadow-lg lg:hidden",
          sidebarOpen && "hidden"
        )}
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Main Content */}
      <div className={cn(
        "flex-1 transition-margin duration-300 ease-in-out",
        sidebarOpen ? "lg:ml-64" : "ml-0"
      )}>
        <main className="min-h-screen p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;