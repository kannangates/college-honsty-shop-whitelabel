import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Settings,
  Users,
  Shield,
  Info,
  X,
  Bell,
  Trophy,
  Package
} from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { isAdmin, profile } = useAuth();
  const navigate = useNavigate();

  const mainNavItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/my-orders', icon: ShoppingCart, label: 'My Orders' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
    { to: '/my-badges', icon: Trophy, label: 'My Badges' },
    { to: '/settings', icon: Settings, label: 'General Settings' },
  ];


  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed right-0 lg:left-0 top-0 h-full bg-white border-l lg:border-r lg:border-l-0 z-50 transition-transform duration-200 ease-in-out",
        "w-64",
        isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Mobile user info and close button */}
          <div className="lg:hidden p-4 border-b bg-gradient-to-r from-[#202072] to-[#e66166] text-white">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-semibold">{profile?.name}</div>
                <div className="text-xs text-purple-100 capitalize">{profile?.role}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" style={{ paddingTop: 'calc(4rem + 1rem)' }}>
            <div className="mb-3">
              {mainNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1",
                      isActive
                        ? "bg-gradient-to-r from-[#202072] to-[#e66166] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Bottom section with buttons */}
          <div className="p-4 border-t border-slate-800 flex flex-col items-center gap-4">
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center text-white hover:bg-red-700 bg-red-800 border-red-700"
                onClick={() => {
                  onClose();
                  navigate('/admin');
                }}
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin Panel
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center text-white hover:bg-blue-700 bg-blue-800 border-blue-700"
              onClick={() => {
                onClose();
                navigate('/about');
              }}
            >
              <Info className="h-4 w-4 mr-2" />
              About the System
            </Button>
            <div className="text-xs text-gray-400 text-center">
              © 2025 Shasun Jain College. <br />All rights reserved.
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
