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
  ChevronLeft,
  ChevronRight,
  Code,
  Palette,
  Calculator,
  Heart,
  Globe,
  Award,
  Zap,
  Shield,
  Search,
  BarChart3,
  Calendar,
  Star,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationSections = [
  {
    title: 'Main',
    icon: Home,
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Learning Paths', href: '/learning-paths', icon: BookOpen },
      { name: 'Skill Assessment', href: '/skill-assessment', icon: Target },
      { name: 'Projects', href: '/projects', icon: Code },
    ]
  },
  {
    title: 'Discovery',
    icon: Search,
    items: [
      { name: 'Curiosity Compass', href: '/curiosity-compass', icon: Search },
      { name: 'Skill Stacker', href: '/skill-stacker', icon: TrendingUp },
      { name: 'Adaptive Capsules', href: '/adaptive-capsules', icon: Zap },
      { name: 'AI Roadmap', href: '/ai-roadmap', icon: Brain },
    ]
  },
  {
    title: 'Identity',
    icon: FileText,
    items: [
      { name: 'Living Resume', href: '/living-resume', icon: FileText },
      { name: 'Self Graph', href: '/self-graph', icon: BarChart3 },
      { name: 'Project Showcase', href: '/project-showcase', icon: Star },
    ]
  },
  {
    title: 'Community',
    icon: Users,
    items: [
      { name: 'Mentor Matchmaking', href: '/mentor-matchmaking', icon: Users },
      { name: 'Virtual Career Coach', href: '/career-coach', icon: MessageCircle },
      { name: 'AI Career Therapist', href: '/career-therapist', icon: Heart },
    ]
  },
  {
    title: 'Career',
    icon: Briefcase,
    items: [
      { name: 'Job Matching', href: '/job-matching', icon: Briefcase },
      { name: 'Domain Supply & Demand', href: '/domain-supply-demand', icon: Globe },
      { name: 'Career Explorer', href: '/career-explorer', icon: Search },
    ]
  },
  {
    title: 'More',
    icon: Settings,
    items: [
      { name: 'Calendar', href: '/calendar', icon: Calendar },
      { name: 'Achievements', href: '/achievements', icon: Award },
      { name: 'Settings', href: '/settings', icon: Settings },
      { name: 'Help & Support', href: '/help', icon: HelpCircle },
    ]
  }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (sectionTitle: string) => {
    setExpandedSection(expandedSection === sectionTitle ? null : sectionTitle);
  };

  return (
    <>
      {/* Beautiful Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Gorgeous Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-50 h-full bg-background/95 backdrop-blur-lg border-r border-border shadow-2xl transition-all duration-300 flex flex-col",
        isOpen ? "w-80" : "w-0",
        "lg:hidden",
        !isOpen && "translate-x-[-100%] overflow-hidden"
      )}>
        {/* Beautiful Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                <defs>
                  <linearGradient id="nexaGradientSidebar" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#7c3aed', stopOpacity:1}} />
                    <stop offset="50%" style={{stopColor:'#a855f7', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:'#c084fc', stopOpacity:1}} />
                  </linearGradient>
                </defs>
                <circle cx="16" cy="16" r="15" fill="url(#nexaGradientSidebar)"/>
                <path d="M8 8 L8 24 L12 24 L12 14 L20 24 L24 24 L24 8 L20 8 L20 18 L12 8 Z" fill="white" fillOpacity="0.95"/>
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">Nexa</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-muted rounded-lg transition-all duration-300"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        {/* Beautiful Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {navigationSections.map((section) => (
            <div key={section.title} className="mb-2">
              {/* Gorgeous Section Header */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSection(section.title)}
                className={cn(
                  "w-full justify-start px-4 py-3 text-sm font-medium transition-all duration-300 rounded-lg group",
                  expandedSection === section.title
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="flex items-center space-x-3">
                  {(() => {
                    const IconComponent = section.icon;
                    return (
                      <IconComponent className={cn(
                        "h-4 w-4 transition-all duration-300",
                        expandedSection === section.title
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground"
                      )} />
                    );
                  })()}
                  <span className="flex-1 text-left">{section.title}</span>
                  {expandedSection === section.title ? (
                    <ChevronDown className="h-4 w-4 text-primary" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </div>
              </Button>

              {/* Beautiful Section Items */}
              {expandedSection === section.title && (
                <div className="ml-6 space-y-1 mt-2 animate-in slide-in-from-top-2 duration-300">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg group/item",
                          isActive
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {(() => {
                          const IconComponent = item.icon;
                          return (
                            <IconComponent className={cn(
                              "h-4 w-4 mr-3 flex-shrink-0 transition-all duration-300",
                              isActive
                                ? "text-primary"
                                : "text-muted-foreground group-hover/item:text-foreground"
                            )} />
                          );
                        })()}
                        <span className="truncate">{item.name}</span>
                        {isActive && (
                          <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Beautiful Footer */}
        <div className="border-t border-border p-4 flex-shrink-0 bg-background/80 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">© 2025 Nexa. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
