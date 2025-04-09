import React, { useState, useEffect } from 'react';
import UserSidebar from './UserSidebar';
import UserNav from './UserNav';
import Loader from '../../components/Loader';
import Cookies from 'js-cookie';
import axios from 'axios';
import Select from 'react-select';
import { toast } from 'react-toastify';
import 'currency-flags/dist/currency-flags.min.css';
import cryptoOptions from "../admin/CryptoCoins";
import { IoMdTime } from "react-icons/io";

const UserWithdrawals = () => {
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [account, setAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [disable, setDisable] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [selectedNetwork, setSelectedNetwork] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [balances, setBalances] = useState({ fiat: [], crypto: [] });
    const [error, setError] = useState("");
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [processSection, setProcessSection] = useState(false);
    const [isSpaceActive, setIsSpaceActive] = useState(false);
    const authData = Cookies.get('auth') ? JSON.parse(Cookies.get('auth')) : null;
    const token = Cookies.get('token');
    const id = authData?.user?._id;
    const user = authData.user;


    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };
    const handleSpaceToggle = () => {
        setIsSpaceActive(!isSpaceActive);
    };
    const fetchBalances = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(
                `${process.env.REACT_APP_API}/api/v1/auth/get-user-b/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (data?.success) {
                setBalances(data.balances);
            }
        } catch (error) {
            console.error('Error fetching balances:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalances();
    }, []);

    const handleAssetChange = (selectedOption) => {
        setSelectedAsset(selectedOption);
        setSelectedNetwork(null);
    };

    const handleNetworkChange = (selectedOption) => {
        setSelectedNetwork(selectedOption);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (account === 'wallet') {
            if (!selectedAsset || !selectedNetwork || !amount) {
                toast.error('Please select an asset, network, and enter an amount.');
                return;
            }
        } else if (account === 'pqsfund') {
            if (!selectedClass || !amount) {
                toast.error('Please select a class and enter an amount.');
                return;
            }
        } else {
            toast.error('Please select an Account type.');
            return;
        }

        setShowConfirmationModal(true);
    };


    // Filter available networks based on selected asset
    const availableNetworks = selectedAsset
        ? balances.crypto
            ?.find((crypto) => crypto.asset === selectedAsset?.value) // Use .value for selectedAsset (if using react-select)
            ?.networks || []
        : [];

    const availableBalance = (() => {
        if (account === 'wallet' && selectedAsset && selectedNetwork) {
            // Get balance for selected crypto asset and network
            return balances.crypto
                ?.find((crypto) => crypto.asset === selectedAsset?.value)
                ?.networks.find((network) => network.networkName === selectedNetwork?.value)
                ?.availableBalance || '0';
        } else if (account === 'pqsfund' && selectedAsset) {
            // Get balance for selected fiat currency
            return balances.fiat
                ?.find((fiat) => fiat.currency === selectedAsset?.value)
                ?.availableBalance || '0';
        }
        return '0';
    })();





    const formatOptionLabel = ({ label, flag }) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={flag} alt={label} style={{ width: 20, marginRight: 10 }} />
            <span>{label}</span>
        </div>
    );

    const handleAmountChange = (e) => {
        const value = e.target.value;

        // Check if the amount is negative
        if (value < 0) {
            setError("Amount cannot be negative.");
            setDisable(true);
        } else if (account === 'wallet' && value > availableBalance) {
            // Apply availableBalance condition only for wallet accounts
            setError("Insufficient amount. Please deposit.");
            setDisable(true);
        } else {
            // Reset errors and enable input
            setError("");
            setDisable(false);
        }

        setAmount(value);
    };


    const handleConfirm = async (e) => {
        const name = user?.name || "";
        const email = user?.email || "";

        e.preventDefault();
        setLoading(true);

        try {

            const assetValue = selectedAsset?.value || "";
            const networkValue = selectedNetwork?.value || "";
            const classValue = selectedClass?.value || "";

            // Post withdrawal request
            const { data } = await axios.post(
                `${process.env.REACT_APP_API}/api/v1/withdraw/new-request`,
                {
                    name,
                    email,
                    id,
                    account,
                    asset: assetValue,
                    network: networkValue,
                    classa: classValue,
                    walletAddress,
                    amount,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (data.success) {
                toast.success(data.message);
                setShowConfirmationModal(false);
                resetForm();
                setProcessSection(true);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            // Handle known errors
            if (error.response?.status === 404) {
                toast.error('User not found. Please check your details and try again.');
            } else if (error.response?.status === 400) {
                toast.error(error.response.message);
            } else {
                console.error('Withdrawal failed:', error);
                toast.error(error.response?.data?.message || 'An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };



    const handleAccountChange = (selectedAccount) => {
        setAccount(selectedAccount);
        setAmount('');
        setSelectedAsset(null);

    };


    const resetForm = () => {
        setAmount('');
        setAccount('');
        setSelectedAsset('');
        setSelectedNetwork('');
        setWalletAddress("");
    };

    const handleClassChange = (selectedOption) => {
        setSelectedClass(selectedOption);
    };

    const ClassOptions = [
        { value: 'Class One', label: 'Class One' },
        { value: 'Class Two', label: 'Class Two' },
        { value: 'Class Three', label: 'Class Three' },
        { value: 'Class  Four', label: 'Class  Four' },
        { value: 'Class  Five', label: 'Class  Five' },
        { value: 'Class  Six', label: 'Class  Six' },

    ];

    return (
        <>
            {loading && <Loader />}
            <UserSidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} onSpaceToggle={handleSpaceToggle}
                isSpaceActive={isSpaceActive} />
            {/* Main Content */}
            <div className={`dashboard-main ${sidebarOpen ? 'shifted' : ''}  ${isSpaceActive ? 'freeSpaceDash' : 'dashboard-main'}`}>

                <UserNav />
                <div className="dashboard-content">
                    <div className="shadow-lg rounded-3 p-3 deposit-card">
                        {processSection ? (
                            <>
                                <div className="redemption-animation">
                                    <div className="redemption-icon animate">
                                        <IoMdTime />
                                    </div>
                                    <h2 className="text-center  redemption-title">Redemption Request Processing</h2>

                                    <p className='text-center m-3'>Your redemption request has been received and we are processing on it. We will Shorty Contact With you.</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <h4 className="text-center redemption-title">Redemption Request</h4>
                                <form className='redemption-form'>
                                    <div className="mb-3">
                                        <label className='withdraw-lable'>Username</label>
                                        <input
                                            type="text"
                                            className="form-control withdraw-lable"
                                            disabled
                                            value={authData?.user?.name || ''}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className='withdraw-lable'>Email</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            disabled
                                            value={authData?.user?.email || ''}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className='withdraw-lable'>Select Account</label>
                                        <select
                                            className="form-control"
                                            value={account}
                                            onChange={(e) => handleAccountChange(e.target.value)}
                                            required
                                        >
                                            <option value="" disabled>
                                                Select Account
                                            </option>
                                            <option value="wallet">Wallet</option>
                                            <option value="pqsfund">PQS Fund</option>
                                        </select>
                                    </div>

                                    {account === 'wallet' && (
                                        <>
                                            <div className="mb-3">
                                                <label className='withdraw-lable'>Select Asset</label>
                                                <Select
                                                    options={balances?.crypto?.map((crypto) => {
                                                        const matchedOption = cryptoOptions.find(option => option.value === crypto.asset);
                                                        return {
                                                            value: crypto.asset,
                                                            label: crypto.asset,
                                                            flag: matchedOption?.flag || '',
                                                        };
                                                    })}
                                                    formatOptionLabel={formatOptionLabel}
                                                    value={selectedAsset}
                                                    onChange={handleAssetChange}
                                                    placeholder="Select Asset"
                                                    isSearchable
                                                />
                                            </div>

                                            {availableNetworks.length > 0 && (
                                                <div className="mb-3">
                                                    <label className='withdraw-lable'>Select Network</label>
                                                    <Select
                                                        options={availableNetworks.map((network) => ({
                                                            value: network.networkName,
                                                            label: network.networkName,
                                                        }))}
                                                        value={selectedNetwork}
                                                        onChange={handleNetworkChange}
                                                        placeholder="Select Network"
                                                        isSearchable
                                                    />
                                                </div>
                                            )}
                                            <div className="mb-3">
                                                <label className='withdraw-lable'>Wallet Address</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={walletAddress}
                                                    onChange={(e) => setWalletAddress(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}
                                    {account === 'pqsfund' && (
                                        <div className="mb-3">
                                            <label className='withdraw-lable'>Select Class</label>
                                            <Select
                                                options={ClassOptions}
                                                value={selectedClass}
                                                onChange={handleClassChange}
                                                placeholder="Select Class"
                                                isSearchable
                                            />
                                        </div>
                                    )}
                                    {availableBalance !== '0' && (
                                        <div className="mt-2">
                                            <h4 className="b-clr">
                                                Available Balance : {selectedAsset && `${selectedAsset.label || selectedAsset.value}`}  {availableBalance}{' '}

                                            </h4>
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label className='withdraw-lable'>Amount</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={amount}
                                            onChange={handleAmountChange}
                                            required
                                        />
                                        {error && <small className="text-danger">{error}</small>}
                                    </div>
                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={handleFormSubmit}
                                            className="btn btn-primary my-3"
                                            disabled={disable}
                                        >
                                            Send Request
                                        </button>
                                    </div>
                                </form>


                            </>
                        )}



                    </div>
                    {showConfirmationModal && (
                        <div className="modal show d-block" tabIndex="-1">
                            <div className="modal-dialog">
                                <div className="modal-content" style={{ padding: "0px" }}>
                                    <div className="modal-header">
                                        <h5 className="modal-title">Confirm Transaction</h5>
                                        <button type="button" className="btn-close" onClick={() => setShowConfirmationModal(false)}></button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="d-flex flex-column align-items-start justify-content-start">
                                            <h6>Name: {user.name}</h6>
                                            <h6>Email: {user.email}</h6>

                                            {account === 'pqsfund' && (
                                                <>
                                                    <h6>Account: PQS Fund</h6>
                                                    <h6>Class: {selectedClass.value}</h6>
                                                    <h6>Amount: {amount}</h6>
                                                </>
                                            )}

                                            {account === 'wallet' && (
                                                <>
                                                    <h6>Account: Wallet</h6>
                                                    <h6>Asset: {selectedAsset.value}</h6>
                                                    <h6>Network: {selectedNetwork.value}</h6>
                                                    <h6>Wallet Address : {walletAddress}</h6>
                                                    <h6>Amount: {amount}</h6>
                                                </>
                                            )}
                                        </div>
                                        <div className="text-end">
                                            <button className="btn btn-secondary mx-2" onClick={() => setShowConfirmationModal(false)}>
                                                Cancel
                                            </button>
                                            <button className="btn btn-primary mx-2" onClick={handleConfirm}>
                                                Confirm
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default UserWithdrawals;
