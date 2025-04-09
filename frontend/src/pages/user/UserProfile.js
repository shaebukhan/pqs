import React, { useEffect, useState } from 'react';
import UserSidebar from './UserSidebar';
import Loader from '../../components/Loader';
import UserNav from './UserNav';
import { AiFillEdit } from 'react-icons/ai';
import { MdVerifiedUser } from 'react-icons/md';
import UserImg from "../../assets/images/user.png";
import Cookies from 'js-cookie';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Modal, Form, Input, Button, Select } from 'antd';
const UserProfile = () => {
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userData, setUserData] = useState("");
    const [email, setEmail] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isSpaceActive, setIsSpaceActive] = useState(false);

    const [currentEditSection, setCurrentEditSection] = useState("");
    const [formData, setFormData] = useState({
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        gender: '',
        country: '',
        street: '',
        city: '',
        state: '',
        postal: '',
        address: ''
    });

    const handleSpaceToggle = () => {
        setIsSpaceActive(!isSpaceActive);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const authData = Cookies.get('auth') ? JSON.parse(Cookies.get('auth')) : null;
    const token = Cookies.get("token");
    console.log(authData.user._id);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${process.env.REACT_APP_API}/api/v1/auth/get-user-data/${authData.user._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (data?.success) {
                    setUserData(data.details);
                    setEmail(data.email);

                }
            } catch (error) {
                console.log(error);

            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [authData.user._id, token]);

    // Open Modal for the specified section
    const openModal = (section) => {
        setCurrentEditSection(section);
        setFormData({
            id: userData._id,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email,
            phone: userData.phone || '',
            gender: userData.gender || '',
            country: userData.country || '',
            street: userData.street || '',
            city: userData.city || '',
            state: userData.state || '',
            postal: userData.postal || '',
            address: userData.address || ''
        });
        setIsModalVisible(true);
    };

    // Handle form submission and update data
    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post(`${process.env.REACT_APP_API}/api/v1/auth/update-profile-user/${authData.user._id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data?.success) {
                toast.success('Profile updated successfully');
                setUserData(data.details);
                setEmail(data.email);
                setIsModalVisible(false);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    // Handle input change in form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };


    const handleGenderChange = (value) => {
        setFormData({
            ...formData,
            gender: value,
        });
    };


    return (
        <>
            <div
                className="dashboard-container"></div>
            {loading && <Loader />}
            <UserSidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} onSpaceToggle={handleSpaceToggle}
                isSpaceActive={isSpaceActive} />
            {/* Main Content */}
            <div className={`dashboard-main ${sidebarOpen ? 'shifted' : ''}  ${isSpaceActive ? 'freeSpaceDash' : 'dashboard-main'}`}>
                <UserNav title={"Profile"} />
                <div className="dashboard-content" >
                    <div className="user-profile-main">
                        <div className="user-profile-image">
                            <div className="user-profile-image-section">
                                <div className="user-profile-image-img">
                                    <img src={UserImg} alt="" />
                                    <div className="verify-icon">
                                        <MdVerifiedUser />
                                    </div>
                                </div>
                                <div className="user-image-text-section">
                                    <h4 className='user-profile-sm-text'>
                                        {userData.firstName}  {userData.lastName} {userData.companyName} <span className='verified-text'>(Verified)</span>
                                    </h4>
                                    <h6 className='user-profil-text'>
                                        {userData.country}
                                    </h6>
                                </div>
                            </div>

                        </div>
                        <div className="user-profile-personal">
                            <h4 className='user-profile-sm-text pb-3'>
                                Personal Information
                            </h4>
                            <div className="user-personal-main">
                                <div className="">
                                    <div className="user-personal-main-left">
                                        {userData.firstName && (
                                            <div className="">
                                                <h6 className="user-profil-text">
                                                    First Name
                                                </h6>
                                                <h4 className='user-profile-sm-text'>
                                                    {userData.firstName}
                                                </h4>
                                            </div>
                                        )}
                                        {userData.lastName && (
                                            <div className="">
                                                <h6 className="user-profil-text">
                                                    Last Name
                                                </h6>
                                                <h4 className='user-profile-sm-text'>
                                                    {userData.lastName}
                                                </h4>
                                            </div>
                                        )}
                                    </div>
                                    <div className="user-personal-main-left">
                                        {email && (
                                            <div className="">
                                                <h6 className="user-profil-text">
                                                    Email address
                                                </h6>
                                                <h4 className='user-profile-sm-text'>
                                                    {email}
                                                </h4>
                                            </div>
                                        )}
                                        {userData.phone && (
                                            <div className="">
                                                <h6 className="user-profil-text">
                                                    Phone
                                                </h6>
                                                <h4 className='user-profile-sm-text'>
                                                    {userData.phone}
                                                </h4>
                                            </div>
                                        )}
                                    </div>
                                    <div className="user-personal-main-left mb-0">
                                        {userData?.gender && (
                                            <div className="">
                                                <h6 className="user-profil-text">
                                                    Gender
                                                </h6>
                                                <h4 className='user-profile-sm-text'>
                                                    {userData.gender}
                                                </h4>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="user-personal-main-right">
                                    <button className='user-profile-edit-btn' onClick={() => openModal('personalInfo')}>
                                        Edit <AiFillEdit />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="user-profile-personal">
                            <h4 className='user-profile-sm-text pb-3'>
                                Address
                            </h4>
                            <div className="user-personal-main">
                                <div className="">
                                    <div className="user-personal-main-left">
                                        {userData.country && (
                                            <div className="">
                                                <h6 className="user-profil-text">
                                                    Country
                                                </h6>
                                                <h4 className='user-profile-sm-text'>
                                                    {userData.country}
                                                </h4>
                                            </div>
                                        )}
                                        {(userData.city || userData.state) && (
                                            <div className="">
                                                <h6 className="user-profil-text">
                                                    City/State
                                                </h6>
                                                <h4 className='user-profile-sm-text'>
                                                    {userData.city}, {userData.state}
                                                </h4>
                                            </div>
                                        )}
                                    </div>
                                    <div className="user-personal-main-left">
                                        {userData.postal && (
                                            <div className="">
                                                <h6 className="user-profil-text">
                                                    Postal Code
                                                </h6>
                                                <h4 className='user-profile-sm-text'>
                                                    {userData.postal}
                                                </h4>
                                            </div>
                                        )}
                                    </div>
                                    <div className="user-personal-main-left mb-0">
                                        {(userData.street || userData.address) && (
                                            <div className="">
                                                <h6 className="user-profil-text">
                                                    Street Address
                                                </h6>
                                                <h4 className='user-profile-sm-text'>
                                                    {userData.street} {userData.address}
                                                </h4>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="user-personal-main-right">
                                    <button onClick={() => openModal('addressInfo')} className='user-profile-edit-btn'>
                                        Edit <AiFillEdit />
                                    </button>
                                </div>
                            </div>

                            <Modal
                                title={currentEditSection === 'personalInfo' ? '  Personal Info' : ' Address Info'}

                                open={isModalVisible}
                                onCancel={() => setIsModalVisible(false)}
                                footer={[
                                    <Button key="cancel" onClick={() => setIsModalVisible(false)}>
                                        Cancel
                                    </Button>,
                                    <Button key="save" type="primary" onClick={handleSave}>
                                        Save Changes
                                    </Button>,
                                ]}
                            >
                                <Form layout="vertical" onFinish={handleSave}>
                                    {currentEditSection === 'personalInfo' && (
                                        <>
                                            <Form.Item label="First Name">
                                                <Input
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                />
                                            </Form.Item>
                                            <Form.Item label="Last Name">
                                                <Input
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                />
                                            </Form.Item>
                                            <Form.Item label="Email Address">
                                                <Input
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                />
                                            </Form.Item>
                                            <Form.Item label="Phone">
                                                <Input
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                />
                                            </Form.Item>
                                            <Form.Item label="Gender">
                                                <Select
                                                    value={formData.gender}
                                                    onChange={handleGenderChange}
                                                    placeholder="Select Gender"
                                                >
                                                    <Select.Option value="male">Male</Select.Option>
                                                    <Select.Option value="memale">Female</Select.Option>
                                                </Select>
                                            </Form.Item>
                                        </>
                                    )}

                                    {currentEditSection === 'addressInfo' && (
                                        <>
                                            <Form.Item label="Street Address">
                                                <Input
                                                    name="street"
                                                    value={formData.street}
                                                    onChange={handleInputChange}
                                                />
                                            </Form.Item>
                                            <Form.Item label="Address">
                                                <Input
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                />
                                            </Form.Item>
                                            <Form.Item label="Postal Code">
                                                <Input
                                                    name="postal"
                                                    value={formData.postal}
                                                    onChange={handleInputChange}
                                                />
                                            </Form.Item>
                                            <Form.Item label="City">
                                                <Input
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                />
                                            </Form.Item>
                                            <Form.Item label="State">
                                                <Input
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleInputChange}
                                                />
                                            </Form.Item>


                                        </>
                                    )}
                                </Form>
                            </Modal>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserProfile;