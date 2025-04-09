import React from 'react';
import { Link } from 'react-router-dom';

const CareerB = () => {
    return (
        <>
            <div className="career-bg-color">
                <div className='mt-top'>
                    <div className="banner-space d-flex justify-content-center align-items-center flex-column">
                        <h1 className='common-title  text-center'>Unlock Your <br />
                            <span className='c-clr'>Career Potential</span> with Us</h1>
                        <p className="common-text text-center">
                            We believe in the power of innovation, collaboration, and growth. We’re on a <br />
                            mission to create impactful solutions that make a difference.
                        </p>
                        <Link to={"/register"} className='sub-btn mt-4'>Get Started</Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CareerB;