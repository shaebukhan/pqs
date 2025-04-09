import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import VerifyLogo from "../../assets/images/logo-w.png";
import { toast } from 'react-toastify'; // Assuming you're using react-toastify for notifications
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post(`${process.env.REACT_APP_API}/api/v1/auth/forgot-password`, { email });
            if (res.data.success) {
                toast.success("Email sent successfully!");
                setEmailSent(true); // Show success message
            } else {
                toast.error(res.data.message || "Failed to send email.");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
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

                                {/* Conditional rendering based on email sent state */}
                                {!emailSent ? (
                                    <>
                                        <h2 className="mt-3 text-center text-coomon-color">
                                            Reset Password
                                        </h2>
                                        <p className="mt-3 text-center text-coomon-color">
                                            Please provide your email to send you a verification code.
                                        </p>
                                        <form onSubmit={handleForgotPassword}>
                                            <div className="auth-inp-main">
                                                <label className="text-coomon-color">Email Address</label>
                                                <input
                                                    type="email"
                                                    className="auth-inp"
                                                    placeholder="Input Your Registered Email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="my-3">
                                                <button
                                                    type="submit"
                                                    className="sub-btn-b w-100"
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Sending...' : 'Send Code'}
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                ) : (
                                    <div className="text-center">
                                        <h2 className="mt-3 text-center text-coomon-color">
                                            Email Sent!
                                        </h2>
                                        <p className="mt-3 text-center text-coomon-color">
                                            A verification link has been sent to <strong>{email}</strong>.
                                            Please check your inbox   to reset your password.
                                        </p>
                                        <div className="my-5">
                                            <Link to="/login" className="sub-btn-b w-100 d-block">Back to Login</Link>

                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ForgotPassword;
