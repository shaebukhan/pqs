import React from 'react';
import Navbar from '../../components/Navbar';
import VerifyLogo from "../../assets/images/logo-w.png";
import { Link } from 'react-router-dom';
const Verification = () => {

    return (
        <>
            <Navbar />
            <div className="mt-top m-h-75 d-flex align-items-center justify-content-center">
                <div className="container mt-5">
                    <div className="row justify-content-center">

                        <div className="col-md-6">
                            <div className="verify-card">
                                <div className="text-center">
                                    <img src={VerifyLogo} alt="" />
                                </div>
                                <h2 className="mt-5 text-center text-coomon-color">Verify your email address</h2>
                                <p className="common-text d-clr text-center mb-5">
                                    Please use this link to verify your email.
                                </p>
                                <div className="my-3">
                                    <button type="submit" className='sub-btn-b w-100'>Send Code</button>
                                </div>
                                <p className="common-text d-clr text-center">
                                    Question? Email us at <Link className='text-coomon-color' to="mailto:support@pqs.com" target='_blank'>support@pqs.com</Link>
                                </p>

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default Verification;