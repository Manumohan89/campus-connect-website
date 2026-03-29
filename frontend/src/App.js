import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { AppThemeProvider } from './ThemeContext';

// ── Public pages ──────────────────────────────────────────────────────────────
import Homepage from './components/Homepage';
import Login from './components/Login';
import Register from './components/Register';
import VerifyOTP from './components/VerifyOTP';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import About from './components/About';
import SGPACalculator from './components/SGPACalculator';
import Contact from './components/Contact';
import FAQ from './components/FAQ';
import NotFound from './components/NotFound';
import CertificatePage from './components/CertificatePage';
import VTUResultChecker from './components/VTUResultChecker';
import AptitudeTest from './components/AptitudeTest';
import InternshipTracker from './components/InternshipTracker';
import BulkMarksUpload from './components/BulkMarksUpload';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';

// ── Protected pages — academic ────────────────────────────────────────────────
import Dashboard from './components/Dashboard';
import UploadMarks from './components/UploadMarks';
import Analytics from './components/Analytics';
import CGPATracker from './components/CGPATracker';
import BacklogDashboard from './components/BacklogDashboard';
import RankPredictor from './components/RankPredictor';

// ── Protected pages — learning ────────────────────────────────────────────────
import Training from './components/Training';
import VTUResources from './components/VTUResources';
import CommunityNotes from './components/CommunityNotes';
import MockTest from './components/MockTest';

// ── Protected pages — career ──────────────────────────────────────────────────
import PlacementDrives from './components/PlacementDrives';
import JobOpportunities from './components/JobOpportunities';
import ResumeBuilder from './components/ResumeBuilder';
import AlumniMentorship from './components/AlumniMentorship';

// ── Protected pages — productivity ───────────────────────────────────────────
import AttendanceTracker from './components/AttendanceTracker';
import ExamTimetable from './components/ExamTimetable';
import Reminders from './components/Reminders';
import StudyPlanner from './components/StudyPlanner';
import Notifications from './components/Notifications';
import CodingPlatform from './components/CodingPlatform';

// ── Protected pages — profile & account ──────────────────────────────────────
import Profile from './components/Profile';
import UpdateProfile from './components/UpdateProfile';
import ViewProfile from './components/ViewProfile';
import ProfileCustomization from './components/ProfileCustomization';
import Settings from './components/Settings';
import ShareDocuments from './components/ShareDocuments';
import SharedDocuments from './components/SharedDocuments';
import LiveChat from './components/LiveChat';

// ── Admin Panel (hidden route) ────────────────────────────────────────────────
import AdminRoute from './admin/AdminRoute';
import AdminDashboard from './admin/AdminDashboard';
import AdminUsers from './admin/AdminUsers';
import AdminResources from './admin/AdminResources';
import AdminTraining from './admin/AdminTraining';
import AdminPlacements from './admin/AdminPlacements';
import AdminCommunity from './admin/AdminCommunity';
import AdminAlumni from './admin/AdminAlumni';
import AdminMessages from './admin/AdminMessages';
import AdminAnalytics from './admin/AdminAnalytics';
import AdminNotifications from './admin/AdminNotifications';
import AdminCertificates from './admin/AdminCertificates';
import AdminSettings from './admin/AdminSettings';
import AdminCodingProblems from './admin/AdminCodingProblems';
import AdminForum from './admin/AdminForum';
import AdminJobListings from './admin/AdminJobListings';
import AdminLeaderboard from './admin/AdminLeaderboard';
import AdminPayments from './admin/AdminPayments';
import PeerForum from './components/PeerForum';
import Leaderboard from './components/Leaderboard';
import PremiumUpgrade from './components/PremiumUpgrade';
import Flashcards from './components/Flashcards';
import VTUNews from './components/VTUNews';
import AITutor from './components/AITutor';
import InterviewPrep from './components/InterviewPrep';
import ScholarshipFinder from './components/ScholarshipFinder';


import PWAInstallBanner from './components/PWAInstallBanner';

const P = ({ children }) => <PrivateRoute>{children}</PrivateRoute>;
const A = ({ children }) => <AdminRoute>{children}</AdminRoute>;

export default function App() {
  return (
    <AppThemeProvider>
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* ── Public ─────────────────────────────────────────────────────── */}
          <Route path="/"                  element={<Homepage />} />
          <Route path="/login"             element={<Login />} />
          <Route path="/register"          element={<Register />} />
          <Route path="/verify-otp"        element={<VerifyOTP />} />
          <Route path="/forgot-password"   element={<ForgotPassword />} />
          <Route path="/reset-password"    element={<ResetPassword />} />
          <Route path="/sgpa-calculator"   element={<SGPACalculator />} />
          <Route path="/about-us"          element={<About />} />
          <Route path="/contact"           element={<Contact />} />
          <Route path="/faq"               element={<FAQ />} />
          <Route path="/terms"             element={<TermsOfService />} />
          <Route path="/certificate/:certId" element={<CertificatePage />} />
          <Route path="/vtu-result"          element={<VTUResultChecker />} />
          <Route path="/aptitude-test"        element={<P><AptitudeTest /></P>} />
          <Route path="/internship-tracker"  element={<P><InternshipTracker /></P>} />
          <Route path="/bulk-upload"          element={<P><BulkMarksUpload /></P>} />
          <Route path="/privacy-policy"    element={<PrivacyPolicy />} />

          {/* ── Academic ───────────────────────────────────────────────────── */}
          <Route path="/dashboard"         element={<P><Dashboard /></P>} />
          <Route path="/upload-marks"      element={<P><UploadMarks /></P>} />
          <Route path="/analytics"         element={<P><Analytics /></P>} />
          <Route path="/cgpa-tracker"      element={<P><CGPATracker /></P>} />
          <Route path="/backlog-dashboard" element={<P><BacklogDashboard /></P>} />
          <Route path="/rank-predictor"    element={<P><RankPredictor /></P>} />

          {/* ── Learning ───────────────────────────────────────────────────── */}
          <Route path="/training"          element={<P><Training /></P>} />
          <Route path="/vtu-resources"     element={<P><VTUResources /></P>} />
          <Route path="/community-notes"   element={<P><CommunityNotes /></P>} />
          <Route path="/mock-test"         element={<P><MockTest /></P>} />
          <Route path="/coding"            element={<P><CodingPlatform /></P>} />

          {/* ── Career ─────────────────────────────────────────────────────── */}
          <Route path="/placement-drives"  element={<P><PlacementDrives /></P>} />
          <Route path="/job-opportunities" element={<P><JobOpportunities /></P>} />
          <Route path="/resume-builder"    element={<P><ResumeBuilder /></P>} />
          <Route path="/alumni-mentorship" element={<P><AlumniMentorship /></P>} />

          {/* ── Productivity ───────────────────────────────────────────────── */}
          <Route path="/attendance"        element={<P><AttendanceTracker /></P>} />
          <Route path="/exam-timetable"    element={<P><ExamTimetable /></P>} />
          <Route path="/reminders"         element={<P><Reminders /></P>} />
          <Route path="/study-planner"     element={<P><StudyPlanner /></P>} />
          <Route path="/notifications"     element={<P><Notifications /></P>} />

          {/* ── Profile & Account ──────────────────────────────────────────── */}
          <Route path="/profile"                element={<P><Profile /></P>} />
          <Route path="/update-profile"         element={<P><UpdateProfile /></P>} />
          <Route path="/view-profile"           element={<P><ViewProfile /></P>} />
          <Route path="/profilecustomization"   element={<P><ProfileCustomization /></P>} />
          <Route path="/settings"               element={<P><Settings /></P>} />
          <Route path="/share-documents"        element={<P><ShareDocuments /></P>} />
          <Route path="/shared-documents"       element={<P><SharedDocuments /></P>} />
          <Route path="/live-chat"              element={<P><LiveChat /></P>} />

          {/* ── Admin Panel ─────────────────────────────────────────────────── */}
          <Route path="/admin-portal-9823"            element={<A><AdminDashboard /></A>} />
          <Route path="/admin-portal-9823/users"      element={<A><AdminUsers /></A>} />
          <Route path="/admin-portal-9823/resources"  element={<A><AdminResources /></A>} />
          <Route path="/admin-portal-9823/training"   element={<A><AdminTraining /></A>} />
          <Route path="/admin-portal-9823/placements" element={<A><AdminPlacements /></A>} />
          <Route path="/admin-portal-9823/community"  element={<A><AdminCommunity /></A>} />
          <Route path="/admin-portal-9823/alumni"     element={<A><AdminAlumni /></A>} />
          <Route path="/admin-portal-9823/messages"      element={<A><AdminMessages /></A>} />
          <Route path="/admin-portal-9823/analytics"     element={<A><AdminAnalytics /></A>} />
          <Route path="/admin-portal-9823/notifications" element={<A><AdminNotifications /></A>} />
          <Route path="/admin-portal-9823/certificates"  element={<A><AdminCertificates /></A>} />
          <Route path="/admin-portal-9823/settings"      element={<A><AdminSettings /></A>} />
          <Route path="/admin-portal-9823/coding"       element={<A><AdminCodingProblems /></A>} />
          <Route path="/admin-portal-9823/jobs"        element={<A><AdminJobListings /></A>} />
          <Route path="/admin-portal-9823/forum"       element={<A><AdminForum /></A>} />
          <Route path="/admin-portal-9823/leaderboard" element={<A><AdminLeaderboard /></A>} />
          <Route path="/admin-portal-9823/payments"    element={<A><AdminPayments /></A>} />


          <Route path="/forum"             element={<P><PeerForum /></P>} />
          <Route path="/leaderboard"       element={<Leaderboard />} />
          <Route path="/premium"           element={<P><PremiumUpgrade /></P>} />
          <Route path="/flashcards"        element={<P><Flashcards /></P>} />
          <Route path="/vtu-news"          element={<VTUNews />} />
          <Route path="/ai-tutor"          element={<P><AITutor /></P>} />
          <Route path="/interview-prep"    element={<P><InterviewPrep /></P>} />
          <Route path="/scholarships"      element={<ScholarshipFinder />} />

          {/* ── 404 catch-all ───────────────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <PWAInstallBanner />
    </ErrorBoundary>
    </AppThemeProvider>
  );
}
