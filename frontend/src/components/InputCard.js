import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

const InputCard = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const [loading, setLoading] = useState(false);

    // Handle input change
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Form submission
    const onSubmit = async (e) => {
        e.preventDefault();

        // Form validation
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            toast.error("All fields are required!");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API}/api/v1/auth/submit-complaint`, formData);

            if (response.status === 201 || response.success === true) {
                toast.success("Message sent successfully!");
                setFormData({ name: "", email: "", subject: "", message: "" });
            } else {
                toast.error("Failed to send message. Try again!");
            }
        } catch (error) {
            console.error("Error:", error);

        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {loading && <Loader />}
            <div className="inp-card">
                <div className="inp-card-sub">
                    <h6 className="get-t">Get in Touch</h6>
                    <h3 className="c-form">Complete the Form Below</h3>
                    <form onSubmit={onSubmit}>
                        <div className="form-inp-main">
                            <label className="form-label">Your Name</label>
                            <input type="text" name="name" className="form-inp" value={formData.name} onChange={handleChange} />
                        </div>
                        <div className="form-inp-main">
                            <label className="form-label">Your Email</label>
                            <input type="email" name="email" className="form-inp" value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="form-inp-main">
                            <label className="form-label">Subject</label>
                            <input type="text" name="subject" className="form-inp" value={formData.subject} onChange={handleChange} />
                        </div>
                        <div className="form-inp-main">
                            <label className="form-label">Message</label>
                            <textarea name="message" rows="8" className="form-inp" value={formData.message} onChange={handleChange}></textarea>
                        </div>
                        <div className="mt-5">
                            <button type="submit" className="sub-btn" disabled={loading}>
                                {loading ? "Sending..." : "Send Message"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default InputCard;
