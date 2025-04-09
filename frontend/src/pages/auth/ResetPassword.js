import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import VerifyLogo from "../../assets/images/logo-w.png";
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const { token } = useParams(); // Get the token from the URL
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${process.env.REACT_APP_API}/api/v1/auth/reset-password/${token}`, {
                password,
            });

            if (res.data.success) {
                toast.success("Password has been reset successfully!");
                navigate("/login");
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const toggleConfirmPasswordVisibility = () => {
        setConfirmPasswordVisible(!confirmPasswordVisible);
    };

    return (
        <>
            <Navbar />
            <div className="mt-top m-h-75 d-flex align-items-center justify-content-center mb-5">
                <div className="container mt-5">
                    <div className="row justify-content-center">
                        <div className="col-md-6">
                            <div className="verify-card">
                                <div className="text-center">
                                    <img src={VerifyLogo} alt="Logo" />
                                </div>
                                <h2 className="mt-3 text-center text-coomon-color">
                                    Reset Password
                                </h2>
                                <p className="mt-3 text-center text-coomon-color">
                                    Enter your new password below to reset it.
                                </p>
                                <form onSubmit={handleResetPassword}>
                                    <div className="auth-inp-main">
                                        <label className="text-coomon-color">New Password</label>
                                        <div className="password-field">
                                            <input
                                                type={passwordVisible ? "text" : "password"}
                                                className="auth-inp"
                                                placeholder="Enter New Password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                            <span
                                                className="toggle-btn"
                                                onClick={togglePasswordVisibility}
                                            >
                                                {passwordVisible ? <FaEye /> : <FaEyeSlash />}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="auth-inp-main">
                                        <label className="text-coomon-color">Confirm New Password</label>
                                        <div className="password-field">
                                            <input
                                                type={confirmPasswordVisible ? "text" : "password"}
                                                className="auth-inp"
                                                placeholder="Confirm New Password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                            <span
                                                className="toggle-btn"
                                                onClick={toggleConfirmPasswordVisibility}
                                            >
                                                {confirmPasswordVisible ? <FaEye /> : <FaEyeSlash />}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="my-3">
                                        <button
                                            type="submit"
                                            className="sub-btn-b w-100"
                                            disabled={loading}
                                        >
                                            {loading ? 'Resetting...' : 'Reset Password'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResetPassword;
