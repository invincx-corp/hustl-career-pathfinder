import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import CuriosityCompass from "@/components/sections/CuriosityCompass";
import AIRoadmapSection from "@/components/sections/AIRoadmapSection";
import SkillStacker from "@/components/sections/SkillStacker";
import MentorMatchmaking from "@/components/sections/MentorMatchmaking";
import ProjectPlayground from "@/components/sections/ProjectPlayground";
import LivingResume from "@/components/sections/LivingResume";
import VirtualCareerCoach from "@/components/sections/VirtualCareerCoach";
import FeaturesSection from "@/components/sections/FeaturesSection";
import CTASection from "@/components/sections/CTASection";
import { IntegrationTest } from "@/components/dev/IntegrationTest";

// New Core Features
import SkillStackerNew from "@/components/learning/SkillStacker";
import AdaptiveCapsules from "@/components/learning/AdaptiveCapsules";
import SelfGraph from "@/components/identity/SelfGraph";
import VirtualCareerCoachNew from "@/components/support/VirtualCareerCoach";
import AICareerTherapist from "@/components/support/AICareerTherapist";
import JobMatching from "@/components/opportunities/JobMatching";
import DomainSupplyDemand from "@/components/opportunities/DomainSupplyDemand";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        
        {/* Powerful Features Section */}
        <section id="features">
          <FeaturesSection />
        </section>
        
        {/* Core Discovery & Learning Features */}
        <section id="learning" className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Core Discovery & Learning Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Unlock your potential with intelligent tools that guide your learning journey, 
                assess your skills, and create personalized pathways to success.
              </p>
            </div>
            <div className="space-y-16">
              <CuriosityCompass />
              <AIRoadmapSection />
              <SkillStackerNew />
              <AdaptiveCapsules />
            </div>
          </div>
        </section>

        {/* Identity & Portfolio Features */}
        <section id="identity" className="py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                Identity & Portfolio Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Build your professional identity with dynamic portfolios, skill visualizations, 
                and comprehensive profiles that showcase your unique value proposition.
              </p>
            </div>
            <div className="space-y-16">
              <SelfGraph />
              <LivingResume />
            </div>
          </div>
        </section>

        {/* Community & Support Features */}
        <section id="community" className="py-20 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Community & Support Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Connect with mentors, peers, and AI-powered career coaches who provide 
                personalized guidance, emotional support, and professional development.
              </p>
            </div>
            <div className="space-y-16">
              <MentorMatchmaking />
              <VirtualCareerCoachNew />
              <AICareerTherapist />
            </div>
          </div>
        </section>

        {/* Career & Opportunity Features */}
        <section id="careers" className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
                Career & Opportunity Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Discover thousands of career paths, explore market opportunities, and find 
                your perfect job match with AI-powered recommendations and real-time insights.
              </p>
            </div>
            <div className="space-y-16">
              <JobMatching />
              <DomainSupplyDemand />
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section id="projects" className="py-20 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-4">
                Additional Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Explore innovative tools and experimental features that push the boundaries 
                of career development, including project showcases and creative applications.
              </p>
            </div>
            <div className="space-y-16">
              <ProjectPlayground />
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      
      {/* Integration Test Component - Only in Development */}
      {import.meta.env.DEV && (
        <div className="container mx-auto px-4 py-8">
          <IntegrationTest />
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Index;
