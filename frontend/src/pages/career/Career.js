import { Link } from "react-router-dom";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import CareerImg from "../../assets/images/career-img.png";
import CareerSearch from "../../assets/images/career-search.svg";
import CareerTech from "../../assets/images/career-tech.svg";
import CareerTrading from "../../assets/images/career-trading.svg";
import CareerDatabase from "../../assets/images/career-database.svg";
import CareerHand from "../../assets/images/career-hand.png";
import CareerHandMeet from "../../assets/images/career-handmeet.svg";
import CareerLast from "../../assets/images/career-last.png";
import Ctext from "../../components/Ctext";
import CareerB from "../../components/CareerB";
const Career = () => {
    return (
        <>
            <Navbar />
            <CareerB />
            <div className="bg-little-dark common-space">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6">
                            <img className="career-img" src={CareerImg} alt="" />
                        </div>
                        <div className="col-md-6">
                            <h5 className="get-t">Careers at <span className="text-coomon-color">PQS</span> </h5>
                            <h2 className="c-form">Your Next Career Move Starts Here</h2>
                            <p className="common-text t-dark">
                                We believe that our success is driven by the passion, creativity, and dedication of our people. We are dedicated to fostering an environment where our employees can thrive, grow, and make a meaningful impact. Whether you're just starting your career or looking to take the next step, we offer a wide range of opportunities across various fields to help you achieve your professional goals. <br />
                                Join us and become part of a dynamic team where your contributions are valued, your ideas are heard, and your potential is unlimited. We are committed to providing the support and resources you need to succeed, and together, we can build something extraordinary. Your journey with us will be rewarding, challenging, and full of possibilities.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
            <div className="bg-little-dark common-space">
                <div className="container">
                    <h2 className="c-form text-center">Driven to Be Part of <br /> Our Success ?</h2>
                    <p className="common-text t-dark text-center mb-5">Join us and contribute to a team that values innovation, <br /> collaboration, and the pursuit of excellence.</p>
                    <div className="row">
                        <div className="col-md-4">
                            <img src={CareerSearch} alt="" />
                            <h4 className="driven-title">Quantitative Research
                                & Analytics</h4>
                            <p className="common-text t-dark">
                                Join our team of world-class researchers and analysts who are dedicated to developing and refining the models that drive our trading strategies.
                            </p>
                        </div>
                        <div className="col-md-4 career-border">
                            <img src={CareerTech} alt="" />
                            <h4 className="driven-title">Technology & Engineering</h4>
                            <p className="common-text t-dark">
                                Our engineers are the backbone of our operations, responsible for building and maintaining the cutting-edge infrastructure that powers our business.
                            </p>
                        </div>
                        <div className="col-md-4 career-border">
                            <img src={CareerTrading} alt="" />
                            <h4 className="driven-title">Trading</h4>
                            <p className="common-text t-dark">
                                As a trader at Premier Quantitative Strategies, you’ll be at the heart of our business, executing strategies across global markets and managing risk in real-time.
                            </p>
                        </div>
                        <div className="col-md-4 career-border">
                            <img src={CareerDatabase} alt="" />
                            <h4 className="driven-title">Compliance & Risk
                                Management</h4>
                            <p className="common-text t-dark">
                                Ensuring that we operate within a robust regulatory framework is critical to our success.
                            </p>
                        </div>
                        <div className="col-md-4 career-border">
                            <img src={CareerHand} alt="" />
                            <h4 className="driven-title">Operations & Support</h4>
                            <p className="common-text t-dark">
                                Behind every successful trade is a team of professionals who ensure that our operations run smoothly and efficiently.
                            </p>
                        </div>
                        <div className="col-md-4 career-border">
                            <img src={CareerHandMeet} alt="" />
                            <h4 className="driven-title">Investor Relations</h4>
                            <p className="common-text t-dark">
                                The role will involved supporting Company investment relationships and senior colleagues in Daily Research, Analytics, Investors Reach and Heading this Practice for experienced person.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
            <div className="bg-little-dark common-space">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6">
                            <img className="career-img" src={CareerLast} alt="" />
                        </div>
                        <div className="col-md-6">
                            <h5 style={{ lineHeight: "39px" }} className="c-form"> Progress your career with <br /> <span className="c-clr"> Premier Quantitative Strategies </span> </h5>
                            <div className="my-5">
                                <Link className="sub-btn">Contact Us</Link>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <Ctext />
            <Footer />
        </>
    );
};

export default Career;