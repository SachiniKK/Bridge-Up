import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './layouts/AppShell';
import Dashboard from './pages/Dashboard';
import ComingSoon from './pages/ComingSoon';
import Signup from './pages/Signup';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />

        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/learning-path" element={<ComingSoon />} />
          <Route path="/communities" element={<ComingSoon />} />
          <Route path="/events" element={<ComingSoon />} />
          <Route path="/employer-demand" element={<ComingSoon />} />
          <Route path="/skill-passport" element={<ComingSoon />} />
          <Route path="/settings" element={<ComingSoon />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;