import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { UserContextProvider } from "@/hooks/useUserContext";
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
// import ViewRoadmap from "./pages/ViewRoadmap"; // No longer needed - integrated into AIRoadmap
import TestAIGeneration from "./pages/TestAIGeneration";
import TestDatabaseIntegration from "./pages/TestDatabaseIntegration";
import VerifyUserJourney from "./pages/VerifyUserJourney";
import AdaptiveCapsules from "./pages/AdaptiveCapsules";
import ProjectPlayground from "./pages/ProjectPlayground";
import LivingResume from "./pages/LivingResume";
import SelfGraph from "./pages/SelfGraph";
import ProjectShowcase from "./pages/ProjectShowcase";
import CareerCoach from "./pages/CareerCoach";
import CareerTherapist from "./pages/CareerTherapist";
import JobMatching from "./pages/JobMatching";
import DomainSupplyDemand from "./pages/DomainSupplyDemand";
import CareerExplorer from "./pages/CareerExplorer";
import SystemStatus from "./pages/SystemStatus";
import SystemIntegrationTest from "./pages/SystemIntegrationTest";
import TestDeletionPersistence from "./pages/TestDeletionPersistence";
import NotFound from "./pages/NotFound";
// Import AI test for automatic testing in development
import "./lib/test-ai";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <UserContextProvider>
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
            {/* ViewRoadmap route removed - functionality integrated into AIRoadmap page */}
            <Route 
              path="/test-ai-generation" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <TestAIGeneration />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/test-database" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <TestDatabaseIntegration />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/verify-journey" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <VerifyUserJourney />
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
                    <ProjectPlayground />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/living-resume" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <LivingResume />
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
              path="/project-showcase" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProjectShowcase />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/career-coach" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CareerCoach />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/career-therapist" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CareerTherapist />
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
              path="/career-explorer" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CareerExplorer />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* System Status Routes */}
            <Route 
              path="/system-status" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SystemStatus />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/system-integration-test" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SystemIntegrationTest />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/test-deletion-persistence" 
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <TestDeletionPersistence />
                  </AppLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </UserContextProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
