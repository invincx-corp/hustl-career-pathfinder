import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const CTASection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError("");

    try {
      // Insert into waitlist_subscribers table
      const { data, error: insertError } = await supabase
        .from('waitlist_subscribers')
        .insert([
          {
            email: email,
            source: 'landing_page_cta',
            is_active: true,
            metadata: {
              timestamp: new Date().toISOString(),
              user_agent: navigator.userAgent,
              referrer: document.referrer
            }
          }
        ])
        .select();

      if (insertError) {
        // Check if it's a duplicate email error
        if (insertError.code === '23505') {
          setError("This email is already on our waitlist!");
        } else {
          setError("Failed to join waitlist. Please try again.");
          console.error('Waitlist signup error:', insertError);
        }
        setIsLoading(false);
        return;
      }

      // Success
      setIsSubmitted(true);
      console.log('Successfully joined waitlist:', data);
      
      // Reset after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail("");
        setError("");
      }, 5000);

    } catch (error) {
      console.error('Waitlist signup error:', error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-float pointer-events-none" style={{animationDelay: "2s"}}></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            Ready to Start Your Journey?
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Your Dream Career is Just{" "}
            <span className="text-accent">One Click Away</span>
          </h2>
          
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of young learners who are already discovering their passion, 
            building skills, and connecting with mentors through Nexa.
          </p>

          {/* Email Signup */}
          <Card className="max-w-lg mx-auto mb-8 animate-slide-up" style={{animationDelay: "0.2s"}}>
            <CardContent className="p-6">
              {!isSubmitted ? (
                <>
                  <h3 className="text-xl font-semibold mb-4">Get Early Access</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full"
                      required
                      disabled={isLoading}
                    />
                    {error && (
                      <p className="text-sm text-red-500 text-center">{error}</p>
                    )}
                    <Button 
                      type="submit" 
                      variant="hero" 
                      size="lg" 
                      className="w-full group"
                      disabled={isLoading}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {isLoading ? "Joining..." : "Join the Waitlist"}
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>
                  <p className="text-xs text-muted-foreground mt-3">
                    We'll notify you when Nexa launches. No spam, ever.
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowRight className="h-8 w-8 text-success rotate-45" />
                  </div>
                  <h3 className="text-xl font-semibold text-success mb-2">You're In!</h3>
                  <p className="text-muted-foreground">
                    Thanks for joining our waitlist. We'll be in touch soon!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Key Benefits */}
          <div className="grid sm:grid-cols-3 gap-6 text-white/90 animate-slide-up" style={{animationDelay: "0.4s"}}>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">100% Free</div>
              <div className="text-sm">Start your journey at no cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">Age 13+</div>
              <div className="text-sm">Safe and designed for young learners</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">AI-Powered</div>
              <div className="text-sm">Personalized guidance for your unique path</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;