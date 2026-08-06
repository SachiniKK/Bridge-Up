import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/Dashboard';
import CommunitiesPage from './pages/CommunitiesPage';
import CommunityFeedPage from './pages/CommunityFeedPage';
import ChallengesPage from './pages/ChallengesPage';
import EventsPage from './pages/EventsPage';
import MyEventsPage from './pages/MyEventsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/communities" element={<CommunitiesPage />} />
        <Route path="/communities/:communityId" element={<CommunityFeedPage />} />
        <Route path="/challenges" element={<ChallengesPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/registered" element={<MyEventsPage />} />
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
