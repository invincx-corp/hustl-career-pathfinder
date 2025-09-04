import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  BookOpen,
  Users,
  MessageCircle,
  Award,
  Target,
  Zap,
  Settings,
  Trash2,
  Eye,
  ExternalLink
} from 'lucide-react';
import { notificationService, Notification } from '@/lib/notification-service';
import { useNavigate } from 'react-router-dom';

interface NotificationDropdownProps {
  className?: string;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ className }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch initial notifications
    notificationService.fetchNotifications();
    notificationService.getUnreadCount();

    // Set up real-time listeners
    const unsubscribeNotifications = notificationService.onNotificationsChange((newNotifications) => {
      setNotifications(newNotifications);
    });

    const unsubscribeUnreadCount = notificationService.onUnreadCountChange((count) => {
      setUnreadCount(count);
    });

    return () => {
      unsubscribeNotifications();
      unsubscribeUnreadCount();
    };
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Award className="h-4 w-4 text-yellow-600" />;
      case 'mentor':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'learning':
        return <BookOpen className="h-4 w-4 text-green-600" />;
      case 'social':
        return <MessageCircle className="h-4 w-4 text-purple-600" />;
      case 'system':
        return <Settings className="h-4 w-4 text-gray-600" />;
      case 'reminder':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      await notificationService.markAsRead(notification.id);
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }

    // Close dropdown
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
  };

  const handleArchiveNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await notificationService.archiveNotification(notificationId);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`relative p-2 hover:bg-muted transition-smooth ${className}`}
        >
          <Bell className="h-5 w-5 text-foreground" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs h-6 px-2"
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">No notifications yet</p>
              <p className="text-xs text-gray-400">We'll notify you when something important happens</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 cursor-pointer hover:bg-muted transition-colors border-l-4 ${getPriorityColor(notification.priority)} ${
                    !notification.isRead ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {notification.actionText && (
                              <span className="text-xs text-blue-600 flex items-center">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                {notification.actionText}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleArchiveNotification(notification.id, e)}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  navigate('/notifications');
                  setIsOpen(false);
                }}
              >
                <Eye className="h-3 w-3 mr-2" />
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
