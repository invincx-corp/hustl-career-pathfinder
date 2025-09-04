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
  ChevronDown,
  ChevronUp,
  Code,
  Heart,
  Globe,
  Zap,
  Search,
  BarChart3,
  Gamepad2,
  Compass,
  TrendingUp,
  Trophy,
  Bell
} from 'lucide-react';

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

const BottomNav: React.FC = () => {
  const location = useLocation();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const isActive = (href: string) => location.pathname === href;

  const handleGroupClick = (groupTitle: string) => {
    setExpandedGroup(expandedGroup === groupTitle ? null : groupTitle);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border shadow-elevation">
      <div className="flex items-center justify-center px-4 py-3">
        <div className="flex items-center justify-between w-full max-w-5xl">
          {navigationGroups.map((group) => {
            const hasActiveItem = group.items.some(item => isActive(item.href));
            const isExpanded = expandedGroup === group.title;
            const hasMultipleItems = group.items.length > 1;
            
            return (
              <div key={group.title} className="relative flex-1">
                {/* Group Button */}
                {hasMultipleItems ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleGroupClick(group.title)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 h-auto text-sm font-medium w-full justify-between rounded-lg transition-smooth hover:scale-105",
                      hasActiveItem 
                        ? "bg-gradient-primary text-primary-foreground shadow-glow" 
                        : "text-foreground hover:bg-muted/50 hover:text-foreground hover:shadow-card"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "p-1.5 rounded-md transition-smooth",
                        hasActiveItem ? "bg-primary-foreground/20" : "bg-muted group-hover:bg-muted-foreground/10"
                      )}>
                        <group.icon className="h-4 w-4" />
                      </div>
                      <span>{group.title}</span>
                    </div>
                    <div className={cn(
                      "p-1 rounded-md transition-smooth",
                      hasActiveItem ? "bg-primary-foreground/20" : "bg-muted"
                    )}>
                      {isExpanded ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  </Button>
                ) : (
                  <Link
                    to={group.items[0].href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 h-auto text-sm font-medium w-full justify-center rounded-lg transition-smooth hover:scale-105",
                      hasActiveItem 
                        ? "bg-gradient-primary text-primary-foreground shadow-glow" 
                        : "text-foreground hover:bg-muted/50 hover:text-foreground hover:shadow-card"
                    )}
                  >
                    <div className={cn(
                      "p-1.5 rounded-md transition-smooth",
                      hasActiveItem ? "bg-primary-foreground/20" : "bg-muted"
                    )}>
                      <group.icon className="h-4 w-4" />
                    </div>
                    <span>{group.title}</span>
                  </Link>
                )}

                {/* Dropdown */}
                {hasMultipleItems && isExpanded && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 w-72 min-w-72 max-w-72 bg-card/95 backdrop-blur-xl border border-border rounded-lg shadow-elevation p-4 z-50">
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setExpandedGroup(null)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-smooth hover:scale-105 group",
                            isActive(item.href)
                              ? "bg-gradient-primary text-primary-foreground shadow-glow"
                              : "text-foreground hover:bg-muted/50 hover:text-foreground hover:shadow-card"
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
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;