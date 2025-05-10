import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Start from "./pages/start.jsx";
import Auth from "./pages/auth.jsx";
import DoctorList from "./pages/DoctorList.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import CasePage from "./pages/casePage.jsx";
import PendingCases from "./pages/pending-cases.jsx";
import Dashboard from "./pages/dashboard.jsx";
import AcceptedCases from './pages/AcceptedCases';
import ChatRoom from './pages/ChatRoom';
import AdminOrDoctor from "./pages/AdminOrDoctor.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import CompleteProfile from "./pages/CompleteProfile.jsx";
import PrivateRoute from "./components/PrivateRoute";
import DoctorsChat from './pages/DoctorsChat';
import DoctorForum from './pages/DoctorForum';
import PublicDoctorList from './pages/PublicDoctorList';
import PostDetails from './pages/PostDetails';

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", 
      light: "#4791db",
      dark: "#115293",
    },
    secondary: {
      main: "#f50057", 
      light: "#ff4081",
      dark: "#c51162",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 12px 0 rgba(0,0,0,0.05)",
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <ToastContainer position="top-right" autoClose={5000} />
        {/* <Navbar> */}
          <Routes>
            <Route path="/" element={<Start />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/doctors" element={
              <PrivateRoute>
                <DoctorList />
              </PrivateRoute>
            } />
            <Route path="/case/:caseId" element={
              <PrivateRoute>
                <CasePage />
              </PrivateRoute>
            } />
            <Route path="/pending-cases" element={
              <PrivateRoute>
                <PendingCases />
              </PrivateRoute>
            } />
            <Route path="/accepted-cases" element={
              <PrivateRoute>
                <AcceptedCases />
              </PrivateRoute>
            } />
            <Route path="/case/:caseId/chat" element={
              <PrivateRoute>
                <ChatRoom />
              </PrivateRoute>
            } />
            <Route path="/case/:caseId/doctors-chat" element={
              <PrivateRoute>
                <DoctorsChat />
              </PrivateRoute>
            } />
            <Route path="/admin-or-doctor" element={<AdminOrDoctor />} />
            <Route path="/admin-dashboard" element={
                <AdminDashboard />
            } />
            <Route path="/complete-profile" element={
              <PrivateRoute>
                <CompleteProfile />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } />
            
            <Route path="/doctor-forum" element={<DoctorForum />} />
            <Route path="/public-doctors" element={<PublicDoctorList />} />
            <Route path="/forum/:postId" element={<PostDetails />} />
          </Routes>
        
      </Router>
    </ThemeProvider>
  );
}

export default App;