import React from "react";
import { Route, Routes } from "react-router-dom";
import {
  PrivateRoute,
  PublicRoute,
  ProtectedRoute,
  KycProtectedRoute,
} from "./routes/AuthRoute"; // Import all routes
import Contact from "./pages/contact/Contact";
import Home from "./pages/home/Home";
import Career from "./pages/career/Career";
import Disclaimer from "./pages/terms/Disclaimer";
import Terms from "./pages/terms/Terms";
import Privacy from "./pages/terms/Privacy";
import Start from "./pages/terms/Start";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Verification from "./pages/auth/Verification";
import VerifyCode from "./pages/auth/VerifyCode";
import EmailVerified from "./pages/auth/EmailVerified";
import ForgotPassword from "./pages/auth/ForgotPassword";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/auth/ResetPassword";
import LoginVerify from "./pages/auth/LoginVerify";
import Complaint from "./pages/contact/Complaint";
import AutoLogout from "./routes/AutoLogout";
import UserDashboard from "./pages/user/UserDashboard";
import Kyc from "./pages/user/Kyc";
import UserDeposit from "./pages/user/UserDeposit";
import UserWithdrawals from "./pages/user/UserWithdrawals";
import Fees from "./pages/user/Fees";
import Reports from "./pages/user/Reports";
import UserProfile from "./pages/user/UserProfile";
import UserSettings from "./pages/user/UserSettings";

import UserWallet from "./pages/user/UserWallet";

import Aml from "./pages/terms/Aml";

const App = () => {
  return (
    <>
      <AutoLogout />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Start />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/careers" element={<Career />} />
        <Route path="/home" element={<Home />} />
        <Route path="/terms&conditions" element={<Terms />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/aml-statement" element={<Aml />} />
        <Route path="/privacy-policy" element={<Privacy />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-e" element={<VerifyCode />} />
        {/* Email verification process using ProtectedRoute */}
        <Route
          path="/verify-email"
          element={<ProtectedRoute element={<VerifyCode />} />}
        />
        <Route
          path="/verify"
          element={<ProtectedRoute element={<Verification />} />}
        />
        <Route
          path="/verified"
          element={<ProtectedRoute element={<EmailVerified />} />}
        />
        <Route path="/verify-login" element={<LoginVerify />} />
        <Route path="/complaint-form" element={<Complaint />} />

        {/* Auth routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Private Routes (Requires Login) */}
        <Route
          path="/dashboard/user"
          element={
            <PrivateRoute>
              <KycProtectedRoute element={<UserDashboard />} />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/user/deposit"
          element={
            <PrivateRoute>
              <KycProtectedRoute element={<UserDeposit />} />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/user/withdrawals"
          element={
            <PrivateRoute>
              <KycProtectedRoute element={<UserWithdrawals />} />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/user/fees"
          element={
            <PrivateRoute>
              <KycProtectedRoute element={<Fees />} />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/user/reports"
          element={
            <PrivateRoute>
              <KycProtectedRoute element={<Reports />} />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/user/profile"
          element={
            <PrivateRoute>
              <KycProtectedRoute element={<UserProfile />} />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/user/wallet"
          element={
            <PrivateRoute>
              <KycProtectedRoute element={<UserWallet />} />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/user/settings"
          element={
            <PrivateRoute>
              <KycProtectedRoute element={<UserSettings />} />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/kyc"
          element={
            <PrivateRoute>
              <Kyc />
            </PrivateRoute>
          }
        />

        {/* Catch-all route for 404 pages */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
