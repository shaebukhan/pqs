import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Logo from "../assets/images/logo.png";
import LoginIcon from "../assets/images/login-icon.svg";
import { FaBarsStaggered } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import Cookies from 'js-cookie';
import axios from "axios";
const Navbar = () => {

    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const openMenu = () => setIsMenuOpen(true);
    const closeMenu = () => setIsMenuOpen(false);

    const authDataString = Cookies.get('auth');
    const auth = authDataString ? JSON.parse(authDataString) : null;

    const handleLogout = async () => {
        try {
            // Send POST request to the server to log out
            const res = await axios.post(`${process.env.REACT_APP_API}/api/v1/auth/logout`);

            if (res.data.success) {
                Cookies.remove("token"); // Removes the 'token' cookie
                Cookies.remove("auth");  // Removes the 'auth' cookie

                // Show a logout notification
                toast.info("Logged out successfully");

                // Redirect to the login page
                navigate('/login');
            } else {
                toast.error("Logout failed. Please try again.");
            }
        } catch (error) {
            console.error("Error during logout:", error);
            toast.error("An error occurred while logging out. Please try again.");
        }
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (


        <>
            <div className={`navbarr ${isMenuOpen ? 'open' : ''}`}>
                <div className="navbar-logo">
                    <Link to="/home">
                        <img className="logo" src={Logo} alt="logo" />
                    </Link>
                </div>
                <div id="sidemenu" className={`navbar-left ${isMenuOpen ? 'active-menu' : ''}`}>
                    <button className="close-btn" onClick={closeMenu}>
                        <IoClose />
                    </button>

                    <Link className="nav-link" to="/home">About Us</Link>
                    <Link className="nav-link" to="/careers">Careers</Link>
                    <Link className="nav-link" to="/contact">Contact Us</Link>
                    {
                        !auth?.user ? (<>  <Link className="login-btn" to="/login"><img src={LoginIcon} alt="" /> Login</Link>  </>) : (<>

                            <div className="custom-nav-item">
                                <button
                                    className="acc-circle border-0"
                                    onClick={toggleDropdown}
                                    aria-expanded={dropdownOpen}
                                >

                                    {auth?.user?.name && auth.user.name[0].toUpperCase()}
                                </button>
                                {dropdownOpen && (
                                    <ul className="custom-dropdown-menu">
                                        <li>
                                            <NavLink
                                                className="custom-dropdown-item"
                                                to={`/dashboard/${auth?.user.role === 1 ? "admin" : "user"}`}
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                Dashboard
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink
                                                className="custom-dropdown-item"
                                                onClick={() => {
                                                    handleLogout();
                                                    setDropdownOpen(false);
                                                }}
                                            >
                                                Logout
                                            </NavLink>
                                        </li>
                                    </ul>
                                )}
                            </div>
                        </>)
                    }



                </div>
                <button className="open-nav" onClick={openMenu}>
                    <FaBarsStaggered />
                </button>
            </div>

        </>
    );
};

export default Navbar;
