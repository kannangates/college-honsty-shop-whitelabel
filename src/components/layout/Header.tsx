import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, User, Bell, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { BadgeDisplay } from '@/features/gamification/components/BadgeDisplay';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { profile, signOut, isAdmin, loading, refreshProfile } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      setIsSigningOut(false);
    }
  };

  const handleRefreshProfile = async () => {
    try {
      await refreshProfile();
      console.log('✅ Profile refreshed');
    } catch (error) {
      console.error('❌ Profile refresh error:', error);
    }
  };

  return (
    <>
      {isSigningOut && <LoadingSpinner fullScreen text="Signing out..." />}
      <header className="bg-white border-b border-gray-200 px-4 py-3 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between">
          {/* Left side - Menu and Logo */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onMenuToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-[#202072] to-[#e66166] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">HS</span>
              </div>
              <span className="font-semibold text-gray-900 hidden sm:block">Honesty Store</span>
            </Link>
          </div>

          {/* Center - Badge Display */}
          <div className="hidden md:flex">
            <BadgeDisplay />
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-3">
            <Link to="/notifications">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white text-xs">
                      {loading ? "…" : profile?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">
                    {loading
                      ? <span className="text-gray-400">Loading...</span>
                      : (profile?.name || <span className="text-gray-400">Unknown User</span>)
                    }
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {loading ? "…" : profile?.student_id || <span className="text-gray-400">—</span>}
                  </p>
                  {profile?.role && (
                    <p className="text-xs leading-none text-muted-foreground capitalize">
                      {profile.role}
                    </p>
                  )}
                </div>

                <div className="md:hidden px-2 py-1">
                  <BadgeDisplay />
                </div>
                
                <DropdownMenuItem onClick={handleRefreshProfile} className="cursor-pointer">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  <span>Refresh Profile</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/my-badges" className="cursor-pointer">
                    <span className="mr-2">🏆</span>
                    <span>Badge Gallery</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
};
