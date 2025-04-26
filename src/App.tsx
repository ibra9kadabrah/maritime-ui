import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CaptainDashboard from './pages/CaptainDashboard';
import LoginPage from './pages/LoginPage';
import OfficePage from './pages/OfficePage';
import './App.css'; // Assuming you might have global styles here

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<CaptainDashboard />} />
        <Route path="/office" element={<OfficePage />} />
        {/* Optional: Add a 404 Not Found route */}
        {/* <Route path="*" element={<div>404 Not Found</div>} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
