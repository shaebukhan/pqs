import React from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useAuth } from '../../Context/authContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Avatar, Dropdown, Menu } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
const UserNav = ({ title }) => {
    const navigate = useNavigate();
    const authDataString = Cookies.get('auth');
    const authData = JSON.parse(authDataString);
    const userName = authData.user.name;
    const [auth, setAuth] = useAuth();

    const handleLogout = async () => {
        try {
            const res = await axios.post(`${process.env.REACT_APP_API}/api/v1/auth/logout`);

            if (res.data.success) {
                setAuth({
                    ...auth, user: null, token: ""
                });

                Cookies.remove("token");
                Cookies.remove("auth");

                toast.info("Logged out successfully");
                navigate('/login');
            } else {
                toast.error("Logout failed. Please try again.");
            }
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    const userMenu = (
        <Menu>
            <Menu.Item key="1" icon={<SettingOutlined />}>
                <Link to={"/dashboard/user/profile"}>Profile</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<LogoutOutlined />} onClick={handleLogout}>
                <span>Logout</span>
            </Menu.Item>
        </Menu>
    );


    return (
        <>
            <div className="dashboard-header">
                <h3 className='nav-title'>{title}</h3>
                <Dropdown overlay={userMenu} trigger={['click']}>
                    <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Avatar icon={<UserOutlined />} />
                        <span style={{ marginLeft: 8, }}>{userName}</span>
                    </div>
                </Dropdown>
            </div>
        </>
    );
};

export default UserNav;