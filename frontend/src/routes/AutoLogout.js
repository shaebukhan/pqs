import React, { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming you're using react-router v6
import axios from "axios";
import Cookies from 'js-cookie';
import { toast } from "react-toastify";

const AutoLogout = () => {
  const timeoutIdRef = useRef(null);
  const navigate = useNavigate();
  const authDataString = Cookies.get('auth');
  const auth = authDataString ? JSON.parse(authDataString) : null;
  const logout = useCallback(async () => {
    try {
      // Send POST request to the server to log out
      const res = await axios.post(`${process.env.REACT_APP_API}/api/v1/auth/logout`);

      if (res.data.success) {

        Cookies.remove("token"); // Removes the 'token' cookie
        Cookies.remove("auth");  // Removes the 'auth' cookie

        // Show a logout notification
        toast.info("Logged out successfully");

        // Redirect to the login page
        navigate('/login');
      } else {
        toast.error("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("An error occurred while logging out. Please try again.");
    }
  }, [navigate,]);

  const resetTimer = useCallback(() => {
    // Clear the existing timer if any
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    // Set a new timer for 30 minutes (1800000 ms)
    timeoutIdRef.current = setTimeout(logout, 1800000); // 30 minutes
  }, [logout]);

  useEffect(() => {
    // Check if user is logged in before setting up the auto-logout timer
    if (auth && auth.token) {
      // Set the initial timer on component mount
      resetTimer();

      // Events to track user activity
      const events = ['mousemove', 'keydown', 'scroll', 'click'];

      // Reset the timer when any activity is detected
      events.forEach((event) => {
        window.addEventListener(event, resetTimer);
      });

      // Cleanup function to remove event listeners and clear the timer
      return () => {
        events.forEach((event) => {
          window.removeEventListener(event, resetTimer);
        });
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
        }
      };
    }
  }, [auth, resetTimer]); // Include auth in the dependency array

  return <div>{/* Your application UI */}</div>;
};

export default AutoLogout;
