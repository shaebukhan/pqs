import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IoClose } from "react-icons/io5";
import './sidebar.css';
import SignLogo from "../../assets/images/logo-w.png";
import { PiHandWithdraw } from "react-icons/pi";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { IoDocumentTextOutline } from "react-icons/io5";
import { AiOutlineUser } from "react-icons/ai";
import { FaAngleLeft, FaBarsStaggered } from 'react-icons/fa6';
import { RiVerifiedBadgeFill } from "react-icons/ri";
import Cookies from "js-cookie";

const UserSidebar = ({ sidebarOpen, toggleSidebar, onSpaceToggle, isSpaceActive }) => {
    const location = useLocation();
    const [activePath, setActivePath] = useState('');
    const [showKycLink, setShowKycLink] = useState(true);

    // const [freeSpace, setFreeSpace] = useState(false);
    useEffect(() => {
        setActivePath(location.pathname);
    }, [location]);


    useEffect(() => {
        const authData = Cookies.get('auth') ? JSON.parse(Cookies.get('auth')) : null;
        const kycStatus = authData?.user?.kycstatus;
        setShowKycLink(kycStatus !== 2);
    }, []);



    return (
        <>
            <button
                type="button"
                className="user-menu-bars"
                onClick={toggleSidebar}
            >
                <FaBarsStaggered />
            </button>

            <nav id="user-sidebar" className={`${sidebarOpen ? "user-active" : ""} ${isSpaceActive ? "freeSpace" : ""}`}>
                <div className="user-custom-menu">
                    <button type="button" id="user-closeSidebar" onClick={toggleSidebar}>
                        <IoClose />
                    </button>
                </div>

                <div className="pb-2">
                    <div className="my-2 inc-dec-main" >
                        <Link to="/home">
                            {isSpaceActive ? "" : <img className="user-sidebar-logo" src={SignLogo} alt="logo" />}

                        </Link>
                        <button className={`inc-dec-btn ${isSpaceActive ? "rotateIcon set-inc-dec-btn" : ""}`}
                            onClick={onSpaceToggle}>
                            <FaAngleLeft />
                        </button>
                    </div>

                    <ul style={{ listStyle: "none" }} className={`user-list-unstyled user-components mb-5 ${isSpaceActive ? "manage-side" : "mt-4"}`}>
                        <li className={activePath === '/dashboard/user' ? 'user-active-sidebar' : ''}>
                            <Link to="/dashboard/user">
                                <LuLayoutDashboard className="me-3" /> {isSpaceActive ? "" : "Dashboard"}
                            </Link>
                        </li>
                        {showKycLink && (
                            <li className={activePath === '/dashboard/kyc' ? 'user-active-sidebar' : ''}>
                                <Link to="/dashboard/kyc">
                                    <RiVerifiedBadgeFill className="me-3" /> {isSpaceActive ? "" : "KYC"}
                                </Link>
                            </li>
                        )}

                        <li className={activePath === '/dashboard/user/wallet' ? 'user-active-sidebar' : ''}>
                            <Link to="/dashboard/user/wallet">
                                <MdOutlineAccountBalanceWallet className="me-3" /> {isSpaceActive ? "" : "Wallet"}
                            </Link>
                        </li>
                        <li className={activePath === '/dashboard/user/withdrawals' ? 'user-active-sidebar' : ''}>
                            <Link to="/dashboard/user/withdrawals">
                                <PiHandWithdraw className="me-3" /> {isSpaceActive ? "" : "Redemption"}
                            </Link>
                        </li>

                        <li className={activePath === '/dashboard/user/reports' ? 'user-active-sidebar' : ''}>
                            <Link to="/dashboard/user/reports">
                                <IoDocumentTextOutline className="me-3" /> {isSpaceActive ? "" : "Reports"}
                            </Link>
                        </li>
                        <li className={activePath === '/dashboard/user/profile' ? 'user-active-sidebar' : ''}>
                            <Link to="/dashboard/user/profile">
                                <AiOutlineUser className="me-3" /> {isSpaceActive ? "" : "Profile"}
                            </Link>
                        </li>

                    </ul>
                </div>
            </nav>
        </>
    );
};

export default UserSidebar;
