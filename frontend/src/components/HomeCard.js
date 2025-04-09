import React from 'react';
const HomeCard = ({ image, title, text }) => {
    return (
        <>
            <div className="home-card-main">
                <div className="home-card">
                    <div className="home-card-sub">
                        <div className="home-card-left">
                            <img src={image} alt="" />
                            <h3 className='card-text'>{title}</h3>
                        </div>
                        <div className="home-card-right">
                            <div className="home-card-text">
                                {text}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HomeCard;