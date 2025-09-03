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
  ChevronUp,
  ChevronDown
} from 'lucide-react';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

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

  const toggleSection = (sectionTitle: string) => {
    setExpandedSection(expandedSection === sectionTitle ? null : sectionTitle);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-t border-border shadow-lg">
      {/* Main Navigation Bar */}
      <div className="flex items-center justify-around h-16 max-w-6xl mx-auto px-4">
        {navigationSections.map((section, index) => (
          <div key={section.title} className="relative group">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection(section.title)}
              className={cn(
                "flex items-center justify-center gap-2 py-2 px-3 transition-all duration-300 rounded-lg",
                expandedSection === section.title
                  ? "text-primary bg-primary/10 border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <div className="flex items-center gap-2">
                {(() => {
                  const IconComponent = section.icon;
                  return (
                    <IconComponent className={cn(
                      "h-4 w-4 transition-all duration-300",
                      expandedSection === section.title
                        ? "text-primary"
                        : "text-current group-hover:text-foreground"
                    )} />
                  );
                })()}
                <span className="font-medium text-xs whitespace-nowrap">
                  {section.title}
                </span>
                {expandedSection === section.title ? (
                  <ChevronDown className="h-3 w-3 text-primary" />
                ) : (
                  <ChevronUp className="h-3 w-3 text-current group-hover:text-foreground transition-colors" />
                )}
              </div>
            </Button>

            {/* Beautiful Expanded Section Dropdown */}
            {expandedSection === section.title && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-lg animate-in slide-in-from-bottom-2 duration-300">
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-3">
                    {(() => {
                      const IconComponent = section.icon;
                      return <IconComponent className="h-4 w-4 text-primary" />;
                    })()}
                    <h3 className="text-sm font-semibold text-foreground">
                      {section.title}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg group/item",
                            isActive
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                          onClick={() => setExpandedSection(null)}
                        >
                          {(() => {
                            const IconComponent = item.icon;
                            return (
                              <IconComponent className={cn(
                                "h-4 w-4 flex-shrink-0 transition-all duration-300",
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
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
