import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import SignLogo from "../../assets/images/logo-w.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import axios from "axios";
import Loader from '../../components/Loader';
import Cookies from 'js-cookie';

const Login = () => {

    const navigate = useNavigate();

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [email, setEmail] = useState("");
    const [emailVisible, setEmailVisible] = useState(true); // New state for email visibility
    const [password, setPassword] = useState("");
    const [isChecked, setIsChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    // Toggle email visibility
    const toggleEmailVisibility = () => {
        setEmailVisible(!emailVisible);
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    // Handle checkbox change
    const handleCheckboxChange = (e) => {
        setIsChecked(e.target.checked);
    };

    // Handle form submit with email validation
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate email contains "@"
        if (!email.includes('@')) {
            toast.error("Invalid Email! Please include '@' in your email.");
            return;
        }

        if (email === "") {
            toast.error("Email is Required !!");
            return;
        } else if (password === "") {
            toast.error("Password is Required !!");
            return;
        } else

            setLoading(true); // Show loader

        try {
            const res = await axios.post(`${process.env.REACT_APP_API}/api/v1/auth/login`, {
                email,
                password,
            });

            if (res.data.condition === 204) {
                toast.error(res.data.message);
                Cookies.set("protectverify", res.data.protect, { expires: 1 });
                Cookies.set("useremail", res.data.email, { expires: 1 });
                navigate("/verify-email");
                return;
            } else if (res.data.success) {
                toast.success(res.data.message);
                Cookies.set("protectlogin", res.data.protect, { expires: 1 });
                Cookies.set("useremail", res.data.user.email, { expires: 1 });

                navigate("/verify-login");
                return;
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false); // Hide loader
        }
    };

    return (
        <>
            <Navbar />
            {loading && <Loader />}
            <div className='mt-top'>
                <div className="reg-main">
                    <div className="reg-sub">
                        <div className="reg-right">
                            <img src={SignLogo} alt="" />
                            <form onSubmit={handleSubmit}>
                                <div className="auth-inp-main position-relative">
                                    <label className='form-label'>Email*</label>
                                    <input
                                        type={emailVisible ? "text" : "password"}  // Email input hidden by default
                                        className='auth-inp'
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}

                                    />
                                    <span
                                        className="toggle-btn" id="togglePassword"
                                        onClick={toggleEmailVisibility}
                                    >
                                        {emailVisible ? <FaEye /> : <FaEyeSlash />}
                                    </span>
                                </div>
                                <div className="auth-inp-main position-relative">
                                    <label className="form-label">Password*</label>
                                    <input
                                        type={passwordVisible ? "text" : "password"}
                                        className="auth-inp"

                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <span
                                        className="toggle-btn"
                                        id="togglePassword"
                                        onClick={togglePasswordVisibility}
                                    >
                                        {passwordVisible ? <FaEye /> : <FaEyeSlash />}
                                    </span>
                                </div>
                                <div className="d-flex">
                                    <input type="checkbox" checked={isChecked}
                                        onChange={handleCheckboxChange} />
                                    <label className='form-label ms-3'>Remember Me</label>
                                </div>
                                <div className="text-center login-btns-sub mt-3 mb-4">
                                    <button className='login-sub login-sub-c'>LOGIN</button>
                                    <Link className='login-sub login-sub-r' to="/register">CREATE ACCOUNT</Link>
                                </div>
                                <p className="text-center form-label">
                                    Forgotten your login details? <Link className='text-coomon-color' to="/forgot-password"> Get Help Signing In</Link>
                                </p>
                            </form>
                        </div>
                        <div className="login-left px-5">
                            <p className="text-white login-wel">
                                WELCOME TO
                            </p>
                            <h3 className="text-white login-t">Premier Quantitative Strategies (PQS)</h3>
                            <p className="text-white  login-wel">
                                Login to Access Dashboard
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
