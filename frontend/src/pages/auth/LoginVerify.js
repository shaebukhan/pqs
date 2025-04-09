import React, { useEffect, useRef, useState } from "react";
import Navbar from "../../components/Navbar";
import VerifyLogo from "../../assets/images/logo-w.png";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import axios from "axios";
import Loader from "../../components/Loader";
import { useAuth } from "../../Context/authContext";

const LoginVerify = () => {
  const navigate = useNavigate();
  const protect = Cookies.get("protectlogin");
  const email = Cookies.get("useremail");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 600 seconds = 10 minutes
  const [isExpired, setIsExpired] = useState(false); // OTP expiration flag
  const [auth, setAuth] = useAuth();

  //timer codes
  const OTP_TIMER_KEY = "otp_timer_start"; // Key to store OTP timer start time

  useEffect(() => {
    const startTime = localStorage.getItem(OTP_TIMER_KEY);

    if (startTime) {
      // If a timer already exists in localStorage, calculate the remaining time
      const currentTime = Date.now();
      const timeElapsed = Math.floor((currentTime - startTime) / 1000); // Time in seconds

      const remainingTime = 600 - timeElapsed; // 600 seconds = 10 minutes

      if (remainingTime > 0) {
        setTimeLeft(remainingTime); // Set the remaining time
      } else {
        setTimeLeft(0); // Expired
        setIsExpired(true);
        toast.error("OTP expired! Please request a new code.");
      }
    } else {
      // If no timer exists, set the current time as the start time
      localStorage.setItem(OTP_TIMER_KEY, Date.now());
    }
  }, []);

  // Countdown Timer Effect
  useEffect(() => {
    if (timeLeft > 0 && !isExpired) {
      const timerId = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0) {
      setIsExpired(true);
      toast.error("OTP expired! Please request a new code.");
    }
  }, [timeLeft, isExpired]);

  // Format time into minutes and seconds
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Check if the protect is available
  useEffect(() => {
    if (!protect) {
      navigate("/login"); // Redirect to login if no token
    }
  }, [protect, navigate]);

  // Handle input changes
  const handleChange = (index, value) => {
    const newCode = [...code];

    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);

      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex].focus();
    } else {
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  // Handle Backspace key press
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalCode = code.join(""); // Concatenate the code

    if (finalCode.length === 6) {
      setLoading(true); // Start loading

      try {
        const res = await axios.post(
          `${process.env.REACT_APP_API}/api/v1/auth/verify-login`,
          { code: finalCode }
        );

        if (res.data.success) {
          toast.success(res.data.message);
          Cookies.set("token", res.data.token, {
            expires: 1,
            sameSite: "Lax",
            secure: true,
          });
          Cookies.set(
            "auth",
            JSON.stringify({
              user: res.data.user,
              token: res.data.token,
            }),
            { expires: 1, sameSite: "Lax", secure: true }
          );

          // Remove the cookies
          Cookies.remove("protectlogin");
          Cookies.remove("useremail");
          localStorage.removeItem("otp_timer_start");

          // Update auth context
          setAuth({
            user: res.data.user,
            token: res.data.token,
          });

          if (res.data.user.kycstatus === 2) {
            navigate("/dashboard/user");
            return;
          }
          // navigate("/dashboard/user");
          window.location.href = "/dashboard/kyc";
        } else {
          toast.error(res.data.message);
        }
      } catch (error) {
        toast.error(error.message || "Something went wrong!");
      } finally {
        setLoading(false); // Stop loading
      }
    } else {
      toast.error("Please enter a valid 6-digit code");
    }
  };

  // Resend OTP and reset the timer
  const handleResend = async (e) => {
    e.preventDefault();

    setLoading(true); // Start loading

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API}/api/v1/auth/login-otp-again`,
        { email }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setTimeLeft(600); // Reset timer to 10 minutes
        setIsExpired(false); // Reset expiration flag
        localStorage.setItem(OTP_TIMER_KEY, Date.now()); // Store the new timer start time
        setCode(["", "", "", "", "", ""]);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong!");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Check if all inputs are filled
  const isButtonDisabled = code.some((digit) => digit === "") || isExpired;

  return (
    <>
      <Navbar />
      {loading && <Loader />}
      <div className="mt-top m-h-75 d-flex align-items-center justify-content-center mb-5">
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="verify-card">
                <div className="text-center">
                  <img src={VerifyLogo} alt="" />
                </div>
                <h2
                  className="mt-3 text-center text-coomon-color"
                  style={{ wordBreak: "break-word" }}
                >
                  A verification code has been sent to {email}
                </h2>
                <p className="common-text d-clr text-center pb-5">
                  Please check your inbox and enter the verification code below
                  to verify and access the dashboard. The code will expire in{" "}
                  <h3 className="text-coomon-color">{formatTime(timeLeft)}</h3>
                </p>
                <form onSubmit={handleSubmit}>
                  <div className="d-flex justify-content-between">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="number"
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="d-flex justify-content-center align-items-center pinCode-inp"
                        min="0"
                        max="9"
                        maxLength="1" // Limit input length to 1
                      />
                    ))}
                  </div>
                  <div className="my-3">
                    <button
                      type="submit"
                      className={`sub-btn-b w-100 ${
                        isExpired ? "btn-expired" : ""
                      }`}
                      disabled={isButtonDisabled} // Disable button if inputs are incomplete or expired
                    >
                      {isExpired ? "OTP Expired" : "Verify"}
                    </button>
                  </div>
                </form>
                <div className="d-flex justify-content-around">
                  <button
                    className="fs-5 text-coomon-color bg-transparent border-0"
                    onClick={handleResend}
                    disabled={loading}
                  >
                    Resend
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginVerify;
