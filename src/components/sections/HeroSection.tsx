import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles, Users, Map, Target } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  const [age, setAge] = useState("");
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    console.log('Start Your Journey button clicked!');
    navigate('/signup');
  };

  const handleAgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userAge = parseInt(age);
    if (userAge < 13) {
      alert("Sorry, Nexa is designed for users 13 and older. Please check back when you're older!");
      return;
    }
    if (userAge < 16) {
      alert("As you're under 16, we'll need parental consent before you can fully access Nexa. We'll guide you through this process!");
    }
    // Proceed with onboarding
    alert("Welcome to Nexa! Let's start your journey of discovery!");
  };

  const stats = [
    { icon: Users, value: "10K+", label: "Active Learners" },
    { icon: Map, value: "500+", label: "Career Paths" },
    { icon: Target, value: "85%", label: "Success Rate" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-hero opacity-5 pointer-events-none"></div>
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-float pointer-events-none" style={{animationDelay: "2s"}}></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                <Sparkles className="h-4 w-4 mr-2" />
                AI-Powered Career Discovery
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Your{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Dream
                </span>
                ,{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Reimagined
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
                From curiosity to career placement - Nexa guides young learners through 
                personalized roadmaps, AI mentorship, and hands-on projects to unlock their potential.
              </p>
            </div>

            {/* Age Verification Form */}
            {!showAgeVerification ? (
              <div className="space-y-4">
                <Button 
                  onClick={handleGetStarted}
                  variant="hero" 
                  size="lg" 
                  className="group"
                >
                  Start Your Journey
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <p className="text-sm text-muted-foreground">
                  Free to start • For ages 13+ • Privacy-first design
                </p>
              </div>
            ) : (
              <form onSubmit={handleAgeSubmit} className="space-y-4 max-w-sm">
                <div className="text-left">
                  <label htmlFor="age" className="block text-sm font-medium mb-2">
                    How old are you? (Required for safety)
                  </label>
                  <Input
                    id="age"
                    type="number"
                    min="10"
                    max="25"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Enter your age"
                    className="w-full"
                    required
                  />
                </div>
                <Button type="submit" variant="hero" className="w-full">
                  Continue
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setShowAgeVerification(false)}
                  className="w-full"
                >
                  Back
                </Button>
              </form>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative lg:order-last animate-slide-up" style={{animationDelay: "0.3s"}}>
            <div className="relative">
              <img
                src={heroImage}
                alt="Diverse young people collaborating on career projects using Nexa platform"
                className="w-full h-auto rounded-2xl shadow-elevation"
              />
              <div className="absolute inset-0 bg-gradient-primary opacity-10 rounded-2xl"></div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-secondary/20 rounded-full blur-xl animate-pulse-glow pointer-events-none"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent/20 rounded-full blur-xl animate-pulse-glow pointer-events-none" style={{animationDelay: "1s"}}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;