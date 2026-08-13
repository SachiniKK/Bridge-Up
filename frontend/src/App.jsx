import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/Dashboard';
import CommunitiesPage from './pages/CommunitiesPage';
import CommunityFeedPage from './pages/CommunityFeedPage';
import ChallengesPage from './pages/ChallengesPage';
import EventsPage from './pages/EventsPage';
import MyEventsPage from './pages/MyEventsPage';

// New Feature Pages
import RoadmapBuilder from './pages/RoadmapBuilder';
import LearningPathPage from './pages/LearningPathPage';
import EmployerDemandPage from './pages/EmployerDemandPage';
import PassportPage from './pages/PassportPage';
import QuizPage from './pages/QuizPage';
import PeerReviewPage from './pages/PeerReviewPage';
import EditProfilePage from './pages/EditProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboard from './pages/AdminDashboard';
import EmployerDashboard from './pages/EmployerDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Core Auth & Account */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Student Roadmaps & Learning */}
        <Route path="/roadmap-builder" element={<RoadmapBuilder />} />
        <Route path="/learning-path" element={<LearningPathPage />} />
        <Route path="/employer-demand" element={<EmployerDemandPage />} />
        <Route path="/passport" element={<PassportPage />} />
        <Route path="/passport/share/:token" element={<PassportPage />} />
        <Route path="/learning-path/resources/:resourceId/quiz" element={<QuizPage />} />
        
        {/* Peer Reviews & Claims */}
        <Route path="/verifications" element={<PeerReviewPage />} />
        
        {/* Communities, Challenges, Events */}
        <Route path="/communities" element={<CommunitiesPage />} />
        <Route path="/communities/:communityId" element={<CommunityFeedPage />} />
        <Route path="/challenges" element={<ChallengesPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/registered" element={<MyEventsPage />} />
        
        {/* Profile Settings & Alerts */}
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Separate Admin & Employer Consoles */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/employer" element={<EmployerDashboard />} />

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
