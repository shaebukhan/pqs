import { useState } from 'react';
import Navbar from '../../components/Navbar';
import SignLogo from "../../assets/images/logo-w.png";
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import Loader from '../../components/Loader';
import axios from 'axios';
import Cookies from 'js-cookie';

const Complaint = () => {

    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [complaintType, setComplaintType] = useState("");
    const [description, setDescription] = useState("");
    const [isChecked, setIsChecked] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCheckboxChange = (e) => {
        setIsChecked(e.target.checked);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (name === "") {
            toast.error("Name is required!");
            return;
        } else if (email === "") {
            toast.error("Email is required!");
            return;
        } else if (accountNumber === "") {
            toast.error("Account Number is required!");
            return;
        } else if (complaintType === "") {
            toast.error("Please select a complaint type!");
            return;
        } else if (description === "") {
            toast.error("Description of the issue is required!");
            return;
        } else if (!isChecked) {
            toast.error("You must agree to the Terms & Privacy.");
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post(`${process.env.REACT_APP_API}/api/v1/complaint`, {
                name,
                email,
                accountNumber,
                complaintType,
                description
            });

            if (res.data.success) {
                toast.success(res.data.message);
                Cookies.set("complaint", res.data.complaintID, { expires: 1 });
                navigate("/complaint-success");
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.message || "Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            {loading && <Loader />}
            <div className="mt-top">
                <div className="complaint-main">
                    <div className="container">
                        <div >
                            <div className="text-center">
                                <img src={SignLogo} alt="" />
                            </div>

                            <h1 className='my-3'>Submit a Complaint</h1>
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="auth-inp-main">
                                            <label className='form-label'>Name*</label>
                                            <input
                                                type="text"
                                                className='auth-inp'
                                                placeholder='John Smith'
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="auth-inp-main">
                                            <label className='form-label'>Email*</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className='auth-inp'
                                                placeholder='support@pqs.fund'
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">

                                        <div className="auth-inp-main">
                                            <label className='form-label'>Phone Number*</label>
                                            <input
                                                type="text"
                                                value={accountNumber}
                                                onChange={(e) => setAccountNumber(e.target.value)}
                                                className='auth-inp'
                                                placeholder='123456789'
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="auth-inp-main">
                                            <label className='form-label'>Complaint Type*</label>
                                            <select
                                                value={complaintType}
                                                onChange={(e) => setComplaintType(e.target.value)}
                                                className='auth-inp'
                                            >
                                                <option value="">Select Complaint Type</option>
                                                <option value="fraud">Fraud</option>
                                                <option value="service">Service Issue</option>
                                                <option value="transaction">Transaction Issue</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>


                                <div className="auth-inp-main">
                                    <label className='form-label'>Description*</label>
                                    <textarea rows={'5'}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className='auth-inp'
                                        placeholder='Describe your issue...'
                                    />
                                </div>
                                <div className="d-flex">
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={handleCheckboxChange}
                                    />
                                    <label className='form-label ms-3'>Please checkbox to continue</label>
                                </div>
                                <div className="my-3">
                                    <button type="submit" className='sub-btn-b w-100' disabled={loading}>
                                        {loading ? "Submitting..." : "Submit Complaint"}
                                    </button>
                                </div>
                                <p className="text-center form-label">
                                    Go back to <Link className='text-coomon-color' to="/home"> Home</Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Complaint;
