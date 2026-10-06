import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import RequireStaff from './components/RequireStaff.jsx';
import HomePage from './pages/HomePage.jsx';
import TrackPage from './pages/TrackPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ParcelListPage from './pages/ParcelListPage.jsx';
import NewParcelPage from './pages/NewParcelPage.jsx';
import ParcelDetailPage from './pages/ParcelDetailPage.jsx';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* หน้าสาธารณะ — ผู้พักใช้ได้โดยไม่ต้องเข้าสู่ระบบ */}
        <Route index element={<HomePage />} />
        <Route path="track" element={<TrackPage />} />
        <Route path="login" element={<LoginPage />} />

        {/* หน้าของเจ้าหน้าที่ — ต้องเข้าสู่ระบบ */}
        <Route path="staff/parcels" element={<RequireStaff><ParcelListPage /></RequireStaff>} />
        <Route path="staff/parcels/new" element={<RequireStaff><NewParcelPage /></RequireStaff>} />
        <Route path="staff/parcels/:parcelId" element={<RequireStaff><ParcelDetailPage /></RequireStaff>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
