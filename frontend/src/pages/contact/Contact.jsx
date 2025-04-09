import { Link } from "react-router-dom";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Location from "../../assets/images/location.svg";
import Mail from "../../assets/images/mail.svg";
import Phone from "../../assets/images/phone.svg";
import ContactBanner from "../../components/ContactBanner";
import InputCard from "../../components/InputCard";
import Ctext from "../../components/Ctext";

const Contact = () => {


    return (
        <>
            <Navbar />
            <ContactBanner />
            <div className="bg-little-dark common-space">
                <div className="container mb-5">
                    <div className="row">
                        <div className="col-md-4">
                            <div className="contact-card-icon">
                                <img src={Location} alt="" />
                            </div>

                            <p className="common-text t-dark text-center"> 21 Arlington St
                                London
                                SW1A 1RD
                                United Kingdom </p>
                        </div>

                        <div className="col-md-4">

                            <div className="contact-card-icon">
                                <img src={Mail} alt="" />
                            </div>
                            <p className="common-text t-dark text-center">
                                <Link className="t-dark" to="mailto:support@pqs.fund" target="_blank">support@pqs.fund</Link> </p>

                        </div>
                        <div className="col-md-4">

                            <div className="contact-card-icon">
                                <img src={Phone} alt="" />
                            </div>
                            <p className="common-text t-dark text-center">
                                <Link to="tel:+4402071675747" target="_blank" className="t-dark">+44 (0) 207 167 5747</Link>
                            </p>

                        </div>
                    </div>
                </div>
                <InputCard />
            </div>
            <Ctext />
            <Footer />
        </>
    );
};

export default Contact;