import { BrowserRouter as Router, Routes, Route, Navigate  } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import RegisterSuccess from "./components/auth/RegisterSuccess";
import Attendance from "./pages/Attendance";
import { AttendanceProvider } from "./context/AttendanceContext";
import HistoryAttendance from "./components/history/HistoryAttendance";
import { UserProvider } from "./context/UserContext";
import { SidebarProvider } from "./context/SidebarContext";
import UserAccessPage from "./pages/UserAccess";
import Rekap from "./pages/Rekap";

export default function App() {
  return (
    
    <UserProvider>
    <AttendanceProvider>
      <SidebarProvider> 
      <Router>
        <ScrollToTop />
        <Routes>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/register-success" element={<RegisterSuccess />} />

          
          {/* Dashboard Layout */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            {/* Dashboard accessible to both user and admin */}
            <Route index path="/" element={<Home />} />

            {/* User only routes */}
            <Route path="/attendance" element={
              <RoleBasedRoute allowedRoles={['USER']}>
                <Attendance />
              </RoleBasedRoute>
            } />
            <Route path="/history" element={
              <RoleBasedRoute allowedRoles={['USER']}>
                <HistoryAttendance />
              </RoleBasedRoute>
            } />

            {/* Admin only routes */}
            <Route path="/user-access" element={
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <UserAccessPage />
              </RoleBasedRoute>
            } />
            <Route path="/rekap-data" element={
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <Rekap />
              </RoleBasedRoute>
            } />
            <Route path="/profile" element={
              <RoleBasedRoute allowedRoles={['ADMIN','USER']}>
                <UserProfiles />
              </RoleBasedRoute>
            } />
            <Route path="/calendar" element={
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <Calendar />
              </RoleBasedRoute>
            } />
            <Route path="/blank" element={
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <Blank />
              </RoleBasedRoute>
            } />
            <Route path="/form-elements" element={
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <FormElements />
              </RoleBasedRoute>
            } />
            <Route path="/basic-tables" element={
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <BasicTables />
              </RoleBasedRoute>
            } />
            <Route path="/alerts" element={
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <Alerts />
              </RoleBasedRoute>
            } />
            <Route path="/avatars" element={
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <Avatars />
              </RoleBasedRoute>
            } />
            <Route path="/badge" element={
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <Badges />
              </RoleBasedRoute>
            } />
            <Route path="/buttons" element={
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <Buttons />
              </RoleBasedRoute>
            } />
            <Route path="/images" element={
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <Images />
              </RoleBasedRoute>
            } />
            <Route path="/videos" element={
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <Videos />
              </RoleBasedRoute>
            } />
            <Route path="/line-chart" element={
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <LineChart />
              </RoleBasedRoute>
            } />
            <Route path="/bar-chart" element={
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <BarChart />
              </RoleBasedRoute>
            } />
          </Route>

          
          <Route path="/" element={<Navigate to="/signin" />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} /> 
        </Routes>
        </Router>
        </SidebarProvider>
      </AttendanceProvider>
    </UserProvider>
  );
}
