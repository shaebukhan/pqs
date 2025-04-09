import React from 'react';
import { Link } from 'react-router-dom';

const Button = () => {
    return (
        <>
            <div className="btns-main">
                <div >
                    <Link to="/careers" className="btns-sub f-btn">Careers</Link>
                </div>
                <div >
                    <Link to="/contact" className="btns-sub s-btn" >Contact Us</Link>
                </div>
            </div>
        </>
    );
};

export default Button;