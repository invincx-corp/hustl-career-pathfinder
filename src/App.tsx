import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import LearningPaths from "./pages/LearningPaths";
import Projects from "./pages/Projects";
import Settings from "./pages/Settings";
import SkillAssessment from "./pages/SkillAssessment";
import MentorMatchmaking from "./pages/MentorMatchmaking";
import CuriosityCompass from "./pages/CuriosityCompass";
import SkillStacker from "./pages/SkillStacker";
import AIRoadmap from "./pages/AIRoadmap";
import AdaptiveCapsules from "./pages/AdaptiveCapsules";
import ProjectPlaygroundPage from "./pages/ProjectPlayground";
import LivingResumePage from "./pages/LivingResume";
import Community from "./pages/Community";
import VirtualCareerCoach from "./pages/VirtualCareerCoach";
import AICareerTherapist from "./pages/AICareerTherapist";
import JobMatching from "./pages/JobMatching";
import DomainSupplyDemand from "./pages/DomainSupplyDemand";
import SelfGraph from "./pages/SelfGraph";
import Achievements from "./pages/Achievements";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
// Import AI test for automatic testing in development
import "./lib/test-ai";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ 
          v7_startTransition: true,
          v7_relativeSplatPath: true 
        }}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected routes */}
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } 
            />
            
            {/* App Layout Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/learning-paths" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <LearningPaths />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Projects />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/skill-assessment" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SkillAssessment />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mentor-matchmaking" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <MentorMatchmaking />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/curiosity-compass" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CuriosityCompass />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/skill-stacker" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SkillStacker />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ai-roadmap" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AIRoadmap />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/adaptive-capsules" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AdaptiveCapsules />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/project-playground" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProjectPlaygroundPage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/living-resume" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <LivingResumePage />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/community" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Community />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/virtual-career-coach" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <VirtualCareerCoach />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ai-career-therapist" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AICareerTherapist />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/job-matching" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <JobMatching />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/domain-supply-demand" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <DomainSupplyDemand />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/self-graph" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SelfGraph />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/achievements" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Achievements />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Notifications />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
