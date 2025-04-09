import React, { useEffect } from 'react';
import Navbar from '../../components/Navbar';
import TickLogo from "../../assets/images/correct.svg";
import { Link, useNavigate } from 'react-router-dom';

import Cookies from 'js-cookie';
const EmailVerified = () => {

    const navigate = useNavigate();
    const protect = Cookies.get('protectverify'); // Get the protect from cookies
    // Check if the protect is available
    useEffect(() => {
        if (!protect) {
            navigate('/login'); // Redirect to login if no token
        }
    }, [protect, navigate]);


    const handleGoToDashboard = () => {
        // Remove the cookies
        Cookies.remove('protectverify');
        Cookies.remove('useremail');
        localStorage.removeItem("otp_timer_start");
        // Navigate to the dashboard
        navigate('/dashboard/kyc');
    };

    return (
        <>
            <Navbar />
            <div className="mt-top m-h-75 d-flex align-items-center justify-content-center mb-5">
                <div className="container mt-5">
                    <div className="row justify-content-center">

                        <div className="col-md-6">
                            <div className="verify-card p-5">
                                <div className="text-center">
                                    <img src={TickLogo} alt="" />
                                </div>
                                <h2 className="mt-3 text-center text-coomon-color">Email Verified</h2>
                                <p className="common-text d-clr text-center mb-5">
                                    Your email address was successfully verified.
                                </p>

                                <button onClick={handleGoToDashboard} type='button' className='sub-btn-b d-flex justify-content-center w-100'>Go to Dashboard</button>


                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default EmailVerified;