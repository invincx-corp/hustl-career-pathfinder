import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Bell, 
  BellOff, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  BookOpen,
  Users,
  MessageCircle,
  Award,
  Target,
  Zap,
  Settings,
  Trash2,
  MarkAsRead,
  Filter,
  Search,
  Plus,
  Edit,
  Save,
  X
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'achievement' | 'social' | 'system' | 'learning' | 'mentor';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
  scheduledFor?: string;
  actionUrl?: string;
  actionText?: string;
  icon: React.ReactNode;
  category: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  reminderNotifications: boolean;
  achievementNotifications: boolean;
  socialNotifications: boolean;
  mentorNotifications: boolean;
  systemNotifications: boolean;
  reminderTime: string;
  reminderDays: string[];
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Daily Learning Reminder',
    message: 'Time for your daily learning session! You have 2 lessons waiting for you.',
    type: 'reminder',
    priority: 'medium',
    isRead: false,
    isArchived: false,
    createdAt: '2024-02-15T09:00:00Z',
    scheduledFor: '2024-02-15T09:00:00Z',
    actionUrl: '/dashboard',
    actionText: 'Start Learning',
    icon: <BookOpen className="h-5 w-5" />,
    category: 'Learning'
  },
  {
    id: '2',
    title: 'Achievement Unlocked!',
    message: 'Congratulations! You\'ve earned the "Week Warrior" achievement for maintaining a 7-day learning streak.',
    type: 'achievement',
    priority: 'high',
    isRead: false,
    isArchived: false,
    createdAt: '2024-02-15T08:30:00Z',
    actionUrl: '/achievements',
    actionText: 'View Achievement',
    icon: <Award className="h-5 w-5" />,
    category: 'Achievement'
  },
  {
    id: '3',
    title: 'New Message from Mentor',
    message: 'Sarah Chen sent you a message about your React project progress.',
    type: 'mentor',
    priority: 'medium',
    isRead: true,
    isArchived: false,
    createdAt: '2024-02-15T07:45:00Z',
    actionUrl: '/mentorship/chat',
    actionText: 'View Message',
    icon: <MessageCircle className="h-5 w-5" />,
    category: 'Mentorship'
  },
  {
    id: '4',
    title: 'Project Review Complete',
    message: 'Your "Personal Portfolio" project has been reviewed and approved by your mentor.',
    type: 'learning',
    priority: 'low',
    isRead: true,
    isArchived: false,
    createdAt: '2024-02-14T16:20:00Z',
    actionUrl: '/projects/portfolio',
    actionText: 'View Project',
    icon: <Target className="h-5 w-5" />,
    category: 'Project'
  },
  {
    id: '5',
    title: 'Community Challenge',
    message: 'Join this week\'s coding challenge: "Build a Todo App with React". 150 participants so far!',
    type: 'social',
    priority: 'low',
    isRead: false,
    isArchived: false,
    createdAt: '2024-02-14T14:00:00Z',
    actionUrl: '/challenges/todo-app',
    actionText: 'Join Challenge',
    icon: <Users className="h-5 w-5" />,
    category: 'Community'
  },
  {
    id: '6',
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM EST. Some features may be temporarily unavailable.',
    type: 'system',
    priority: 'medium',
    isRead: true,
    isArchived: false,
    createdAt: '2024-02-14T10:00:00Z',
    icon: <Settings className="h-5 w-5" />,
    category: 'System'
  }
];

interface NotificationSystemProps {
  userId: string;
}

export default function NotificationSystem({ userId }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    reminderNotifications: true,
    achievementNotifications: true,
    socialNotifications: true,
    mentorNotifications: true,
    systemNotifications: true,
    reminderTime: '09:00',
    reminderDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00'
    },
    frequency: 'immediate'
  });
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    filterNotifications();
  }, [notifications, filterType, filterStatus, searchTerm]);

  const filterNotifications = () => {
    let filtered = notifications;

    if (filterType !== 'all') {
      filtered = filtered.filter(notification => notification.type === filterType);
    }

    if (filterStatus === 'unread') {
      filtered = filtered.filter(notification => !notification.isRead);
    } else if (filterStatus === 'read') {
      filtered = filtered.filter(notification => notification.isRead);
    }

    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const archiveNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isArchived: true }
          : notification
      )
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reminder': return 'text-blue-600 bg-blue-100';
      case 'achievement': return 'text-yellow-600 bg-yellow-100';
      case 'social': return 'text-green-600 bg-green-100';
      case 'system': return 'text-gray-600 bg-gray-100';
      case 'learning': return 'text-purple-600 bg-purple-100';
      case 'mentor': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.isRead).length;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-600">Stay updated with your learning journey</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            <Bell className="h-3 w-3 mr-1" />
            {getUnreadCount()} unread
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'notifications' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('notifications')}
        >
          <Bell className="h-4 w-4 mr-2" />
          Notifications
        </Button>
        <Button
          variant={activeTab === 'settings' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('settings')}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {activeTab === 'notifications' && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="reminder">Reminders</option>
                <option value="achievement">Achievements</option>
                <option value="social">Social</option>
                <option value="system">System</option>
                <option value="learning">Learning</option>
                <option value="mentor">Mentor</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={markAllAsRead}
                disabled={getUnreadCount() === 0}
              >
                <MarkAsRead className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              {filteredNotifications.length} notifications
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.map(notification => (
              <Card
                key={notification.id}
                className={`transition-all hover:shadow-md ${
                  !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                      {notification.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">{notification.title}</h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <Badge className={getTypeColor(notification.type)}>
                              {notification.type}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                              {notification.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTimeAgo(notification.createdAt)}
                            </div>
                            <span>{notification.category}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-4">
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => archiveNotification(notification.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {notification.actionUrl && notification.actionText && (
                        <div className="mt-3">
                          <Button size="sm" variant="outline" asChild>
                            <a href={notification.actionUrl}>
                              {notification.actionText}
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters to see more notifications.'
                  : 'You\'re all caught up! No new notifications.'}
              </p>
            </div>
          )}
        </>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how and when you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* General Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">General Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({ ...prev, pushNotifications: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Notification Types */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Notification Types</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="reminder-notifications">Learning Reminders</Label>
                      <p className="text-sm text-gray-500">Daily reminders to continue learning</p>
                    </div>
                    <Switch
                      id="reminder-notifications"
                      checked={settings.reminderNotifications}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({ ...prev, reminderNotifications: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="achievement-notifications">Achievement Notifications</Label>
                      <p className="text-sm text-gray-500">When you unlock new achievements</p>
                    </div>
                    <Switch
                      id="achievement-notifications"
                      checked={settings.achievementNotifications}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({ ...prev, achievementNotifications: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="social-notifications">Social Notifications</Label>
                      <p className="text-sm text-gray-500">Community updates and challenges</p>
                    </div>
                    <Switch
                      id="social-notifications"
                      checked={settings.socialNotifications}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({ ...prev, socialNotifications: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="mentor-notifications">Mentor Notifications</Label>
                      <p className="text-sm text-gray-500">Messages and updates from mentors</p>
                    </div>
                    <Switch
                      id="mentor-notifications"
                      checked={settings.mentorNotifications}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({ ...prev, mentorNotifications: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="system-notifications">System Notifications</Label>
                      <p className="text-sm text-gray-500">Platform updates and maintenance</p>
                    </div>
                    <Switch
                      id="system-notifications"
                      checked={settings.systemNotifications}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({ ...prev, systemNotifications: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Reminder Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Reminder Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reminder-time">Reminder Time</Label>
                    <Input
                      id="reminder-time"
                      type="time"
                      value={settings.reminderTime}
                      onChange={(e) =>
                        setSettings(prev => ({ ...prev, reminderTime: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={settings.frequency}
                      onValueChange={(value: any) =>
                        setSettings(prev => ({ ...prev, frequency: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Quiet Hours</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="quiet-hours">Enable Quiet Hours</Label>
                      <p className="text-sm text-gray-500">Pause notifications during specified hours</p>
                    </div>
                    <Switch
                      id="quiet-hours"
                      checked={settings.quietHours.enabled}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          quietHours: { ...prev.quietHours, enabled: checked }
                        }))
                      }
                    />
                  </div>
                  {settings.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="quiet-start">Start Time</Label>
                        <Input
                          id="quiet-start"
                          type="time"
                          value={settings.quietHours.start}
                          onChange={(e) =>
                            setSettings(prev => ({
                              ...prev,
                              quietHours: { ...prev.quietHours, start: e.target.value }
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="quiet-end">End Time</Label>
                        <Input
                          id="quiet-end"
                          type="time"
                          value={settings.quietHours.end}
                          onChange={(e) =>
                            setSettings(prev => ({
                              ...prev,
                              quietHours: { ...prev.quietHours, end: e.target.value }
                            }))
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}



