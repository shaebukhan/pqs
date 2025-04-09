import { Link } from "react-router-dom";
import Logo from "../assets/images/logo.png";
const Footer = () => {
    return (
        <div className="common-space pb-1 ftr">
            <div className="container-fluid mb-5">
                <div className="row">
                    <div className="col-md-3">
                        <img className="ftr-logo" src={Logo} alt="logo" />
                    </div>
                    <div className="col-md-3">
                        <h6 className="ftr-small-title">Quick Links</h6>
                        <div className="ftr-link">
                            <Link to="/home">Home</Link>
                        </div>
                        <div className="ftr-link">
                            <Link to="/careers">Careers</Link>
                        </div>
                        <div className="ftr-link">
                            <Link to="/contact">Contact Us</Link>
                        </div>
                        <div className="ftr-link">
                            <Link to="/login">Login</Link>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <h6 className="ftr-small-title">Legal</h6>
                        <div className="ftr-link">
                            <Link to="/privacy-policy">Privacy Policy</Link>
                        </div>
                        <div className="ftr-link">
                            <Link to="/terms&conditions">Terms & Conditions</Link>
                        </div>
                        <div className="ftr-link">
                            <Link to="/aml-statement">AML Statement</Link>
                        </div>
                        <div className="ftr-link">
                            <Link to="/disclaimer">Disclaimer</Link>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <h6 className="ftr-small-title">Contact Info</h6>
                        <div className="ftr-link">
                            <Link >  21 Arlington St <br />
                                London
                                SW1A 1RD <br />
                                United Kingdom  </Link>
                        </div>
                        <div className="ftr-link">
                            <Link to="tel:+4402071675747" target="_blank"> <span className="text-uppercase"> </span> +44 (0) 207 167 5747</Link>
                        </div>
                        <div className="ftr-link">
                            <Link to="mailto:support@pqs.fund" target="_blank">    support@pqs.fund    </Link>
                        </div>


                    </div>
                </div>
            </div>
            <hr className="border-white" />
            <div className="my-2">
                <p className="text-center">
                    ©  2024 Premier Quantitative Strategies (PQS) SPC FUND. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Footer;
