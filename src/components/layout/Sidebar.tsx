import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  BookOpen, 
  Target, 
  Users, 
  MessageCircle, 
  FileText, 
  Brain, 
  Briefcase, 
  Settings, 
  HelpCircle,
  X,
  Code,
  Heart,
  Globe,
  Zap,
  Search,
  BarChart3,
  Gamepad2,
  Compass,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Trophy,
  Bell
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

interface NavigationGroup {
  title: string;
  icon: React.ComponentType<any>;
  items: NavigationItem[];
}

const navigationGroups: NavigationGroup[] = [
  {
    title: 'Dashboard',
    icon: Home,
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
    ]
  },
  {
    title: 'Learning',
    icon: BookOpen,
    items: [
      { name: 'Learning Paths', href: '/learning-paths', icon: BookOpen },
      { name: 'Skill Assessment', href: '/skill-assessment', icon: Target },
      { name: 'Curiosity Compass', href: '/curiosity-compass', icon: Compass },
      { name: 'Skill Stacker', href: '/skill-stacker', icon: TrendingUp },
      { name: 'AI Roadmap', href: '/ai-roadmap', icon: Brain },
      { name: 'Adaptive Capsules', href: '/adaptive-capsules', icon: Zap },
    ]
  },
  {
    title: 'Projects',
    icon: Code,
    items: [
      { name: 'Projects', href: '/projects', icon: Code },
      { name: 'Project Playground', href: '/project-playground', icon: Gamepad2 },
      { name: 'Living Resume', href: '/living-resume', icon: FileText },
      { name: 'Self Graph', href: '/self-graph', icon: BarChart3 },
    ]
  },
  {
    title: 'Achievements',
    icon: Trophy,
    items: [
      { name: 'Achievements', href: '/achievements', icon: Trophy },
    ]
  },
  {
    title: 'Career',
    icon: Briefcase,
    items: [
      { name: 'Job Matching', href: '/job-matching', icon: Briefcase },
      { name: 'Domain Supply & Demand', href: '/domain-supply-demand', icon: Globe },
    ]
  },
  {
    title: 'Community',
    icon: Users,
    items: [
      { name: 'Community', href: '/community', icon: Users },
      { name: 'Mentor Matchmaking', href: '/mentor-matchmaking', icon: Users },
      { name: 'Virtual Career Coach', href: '/virtual-career-coach', icon: MessageCircle },
      { name: 'AI Career Therapist', href: '/ai-career-therapist', icon: Heart },
    ]
  },
  {
    title: 'Settings',
    icon: Settings,
    items: [
      { name: 'Notifications', href: '/notifications', icon: Bell },
      { name: 'Settings', href: '/settings', icon: Settings },
    ]
  }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Dashboard']));

  const isActive = (href: string) => location.pathname === href;

  const toggleGroup = (groupTitle: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupTitle)) {
      newExpanded.delete(groupTitle);
    } else {
      newExpanded.add(groupTitle);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-50 h-full w-72 bg-gradient-card backdrop-blur-xl border-r border-border shadow-elevation transition-transform duration-300 lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-primary rounded-lg shadow-glow">
              <span className="text-primary-foreground font-bold text-lg">N</span>
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Nexa Pathfinder
              </h2>
              <p className="text-xs text-muted-foreground font-medium">Your Dream, Reimagined</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-9 w-9 p-0 hover:bg-muted rounded-lg transition-smooth"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-6 space-y-3">
          {navigationGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.title);
            const hasActiveItem = group.items.some(item => isActive(item.href));
            
            return (
              <div key={group.title}>
                {/* Group Header */}
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between p-3 h-auto hover:bg-muted/50 hover:text-foreground rounded-lg transition-smooth group",
                    hasActiveItem && "bg-muted border border-border shadow-card"
                  )}
                  onClick={() => toggleGroup(group.title)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-md transition-smooth",
                      hasActiveItem ? "bg-gradient-primary" : "bg-muted group-hover:bg-muted-foreground/10"
                    )}>
                      <group.icon className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="font-medium text-foreground">{group.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  )}
                </Button>

                {/* Group Items */}
                {isExpanded && (
                  <div className="ml-6 space-y-1 border-l-2 border-border pl-4">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-smooth hover:scale-105 group",
                          isActive(item.href)
                            ? "bg-gradient-primary text-primary-foreground shadow-glow"
                            : "text-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        <div className={cn(
                          "p-1.5 rounded-md transition-smooth",
                          isActive(item.href) 
                            ? "bg-primary-foreground/20" 
                            : "bg-muted group-hover:bg-muted-foreground/10"
                        )}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;