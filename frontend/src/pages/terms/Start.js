import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LOGOD from "../../assets/images/logo-w.png";
import { Link } from 'react-router-dom';

const Start = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if the "accepted" flag is set
        const isAccepted = localStorage.getItem("accepted");
        if (isAccepted) {
            // Redirect to /home if the user already accepted
            navigate("/home");
        }
    }, [navigate]);

    const handleAccept = () => {
        // Store the "accepted" flag in localStorage
        localStorage.setItem("accepted", "true");
        navigate("/home");
    };

    return (
        <>
            <div className="disclaimer-m">
                <div className='m-h-100 disclaimer-sub'>
                    <div className="container">
                        <div className="pt-5">
                            <img src={LOGOD} alt="Logo" />
                        </div>
                        <h3 className='text-coomon-color'>Welcome to the Premier Quantitative Strategies (PQS) website</h3>
                        <p className="common-text text-coomon-color">
                            <br />
                            By continuing to use the website you:
                            <br />
                            <ul>
                                <li className='my-3'>Agree to the website terms and conditions and privacy policy.</li>
                                <li className='my-3'>
                                    Agree that you are a professional customer or eligible counterparty. <br />
                                    This website is not intended for retail clients - if you are in doubt as to what type of customer you are, you should consult your financial adviser.
                                </li>
                            </ul>
                            <br />
                        </p>
                        <div className="pb-4">
                            <button onClick={handleAccept} className='accept-btn-c accept-btn mx-3'>ACCEPT</button>
                            <Link to="/" className='accept-btn-c decline-btn mx-3'>DECLINE</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Start;
