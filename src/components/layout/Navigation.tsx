import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Compass, Map, Users, Briefcase, User, Brain, Target, Heart, Zap, BookOpen, UserCheck } from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { icon: Zap, label: "Features", href: "#features" },
    { icon: Brain, label: "Learning", href: "#learning" },
    { icon: User, label: "Identity", href: "#identity" },
    { icon: Heart, label: "Community", href: "#community" },
    { icon: Target, label: "Careers", href: "#careers" },
    { icon: BookOpen, label: "Projects", href: "#projects" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                <defs>
                  <linearGradient id="nexaGradientNav" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#7c3aed', stopOpacity:1}} />
                    <stop offset="50%" style={{stopColor:'#a855f7', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:'#c084fc', stopOpacity:1}} />
                  </linearGradient>
                </defs>
                <circle cx="16" cy="16" r="15" fill="url(#nexaGradientNav)"/>
                <path d="M8 8 L8 24 L12 24 L12 14 L20 24 L24 24 L24 8 L20 8 L20 18 L12 8 Z" fill="white" fillOpacity="0.95"/>
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Nexa
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <AuthModal />
            <Button variant="hero" size="sm">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.href)}
                  className="flex items-center space-x-3 px-4 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              ))}
              <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-border">
                <AuthModal />
                <Button variant="hero" className="justify-start">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;