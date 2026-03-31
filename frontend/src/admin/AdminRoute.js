import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * AdminRoute — guards the hidden admin panel.
 * Checks BOTH that a token exists AND that the decoded role is 'admin'.
 * Role is stored in localStorage by the login/verifyOTP handler.
 */
export default function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token) return <Navigate to="/login" replace />;
  if (role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}
