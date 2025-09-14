import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import RecycleBin from '@/components/ui/RecycleBin';
import NotificationCenter from '@/components/ui/NotificationCenter';
import { NotificationService } from '@/lib/notification-service';
import { RecycleBinService } from '@/lib/recycle-bin-service';
import { 
  Menu, 
  Search, 
  Bell, 
  Settings, 
  LogOut, 
  User,
  HelpCircle,
  Moon,
  Sun,
  X,
  Trash2
} from 'lucide-react';

interface TopNavProps {
  onMenuClick: () => void;
  sidebarOpen?: boolean;
}

const TopNav: React.FC<TopNavProps> = ({ onMenuClick, sidebarOpen = false }) => {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState(0);
  const [recycleBinItems, setRecycleBinItems] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRecycleBin, setShowRecycleBin] = useState(false);

  useEffect(() => {
    // Subscribe to notification updates
    const unsubscribeNotifications = NotificationService.subscribe((newNotifications) => {
      const unreadCount = newNotifications.filter(n => !n.read).length;
      setNotifications(unreadCount);
    });

    // Subscribe to recycle bin updates
    const updateRecycleBinCount = () => {
      const items = RecycleBinService.getAllItems();
      setRecycleBinItems(items.length);
    };

    updateRecycleBinCount();

    // Listen for storage changes to update recycle bin count
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'recycle_bin_items') {
        updateRecycleBinCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubscribeNotifications();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button - BEAUTIFUL & ALWAYS VISIBLE */}
          <Button
            variant="outline"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden hover:bg-muted p-2 rounded-lg border border-border bg-background shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2"
            title={sidebarOpen ? "Close menu" : "Open menu"}
          >
            <div className="relative">
              {sidebarOpen ? (
                <X className="h-5 w-5 text-foreground" />
              ) : (
                <Menu className="h-5 w-5 text-foreground" />
              )}
            </div>
            <span className="text-foreground font-medium text-sm">
              {sidebarOpen ? "Close" : "Menu"}
            </span>
          </Button>
          
          {/* Search Bar */}
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search features, projects, mentors..."
              className="pl-10 w-80"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Recycle Bin */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative"
            onClick={() => setShowRecycleBin(true)}
          >
            <Trash2 className="h-5 w-5" />
            {recycleBinItems > 0 && (
              <Badge 
                variant="secondary" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {recycleBinItems}
              </Badge>
            )}
          </Button>

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative"
            onClick={() => setShowNotifications(true)}
          >
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {notifications}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar_url} alt={user?.full_name} />
                  <AvatarFallback>
                    {user?.full_name ? getInitials(user.full_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.full_name || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help & Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Modals */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      <RecycleBin 
        isOpen={showRecycleBin} 
        onClose={() => setShowRecycleBin(false)} 
      />
    </header>
  );
};

export default TopNav;
