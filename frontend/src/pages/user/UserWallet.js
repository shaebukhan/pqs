import React, { useState, useEffect, useRef } from 'react';
import UserSidebar from './UserSidebar';
import Loader from '../../components/Loader';
import Cookies from 'js-cookie';
import axios from 'axios';
import { Menu, Button, Dropdown, message } from 'antd';
import { IoIosArrowDown } from 'react-icons/io';
import { toast } from 'react-toastify';
import 'currency-flags/dist/currency-flags.min.css';
import { crptoOptionsFlag } from '../admin/currencyOptions';
import { FaArrowUp, FaCopy, FaWallet } from 'react-icons/fa6';
import { PiHandWithdraw } from 'react-icons/pi';
import { TbArrowsExchange } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import cryptoOptions from "../admin/CryptoCoins";
import QRCode from 'react-qr-code';
import { FaArrowLeftLong } from "react-icons/fa6";
import { MdClose } from 'react-icons/md';
import { IoCopy, IoSearchOutline } from 'react-icons/io5';

const UserWallet = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showAmount, setShowAmount] = useState(0);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [depositAsset, setDepositAsset] = useState(null);
    const [selectedNetwork, setSelectedNetwork] = useState(null);
    const [selectedDepositNetwork, setSelectedDepositNetwork] = useState(null);
    const [depositAddress, setDepositAddress] = useState('');
    const [selectedDepositNetworks, setSelectedDepositNetworks] = useState([]);
    const [balances, setBalances] = useState({ fiat: [], crypto: [] });
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isSpaceActive, setIsSpaceActive] = useState(false);
    const [isDepositSidebarOpen, setIsDepositSidebarOpen] = useState(false);
    const [isTransactionSidebarOpen, setIsTransactionSidebarOpen] = useState(false);
    const [filteredTransactionsSearch, setFilteredTransactionsSearch] = useState([]);

    const authData = Cookies.get('auth') ? JSON.parse(Cookies.get('auth')) : null;
    const token = Cookies.get('token');
    const id = authData?.user?._id;

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const handleSpaceToggle = () => setIsSpaceActive(!isSpaceActive);
    const [resetKey, setResetKey] = React.useState(0);

    const openDepositSidebar = () => setIsDepositSidebarOpen(true);
    const openTransactionSidebar = () => setIsTransactionSidebarOpen(true);
    const closeDepositSidebar = () => setIsDepositSidebarOpen(false);
    const closeTransactionSidebar = () => setIsTransactionSidebarOpen(false);



    // Fetch balances
    const fetchBalances = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(
                `${process.env.REACT_APP_API}/api/v1/auth/get-user-b/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data?.success) setBalances(data.balances);
        } catch (error) {
            console.error('Error fetching balances:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch transactions for the selected asset
    const fetchTransactions = async (asset) => {
        setLoading(true);
        try {
            const { data } = await axios.get(
                `${process.env.REACT_APP_API}/api/v1/transaction/user-transactions-wallet/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data?.success) {
                const sortedTransactions = data.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
                const filtered = sortedTransactions.filter((tx) => tx.asset === asset);
                setFilteredTransactions(filtered);
            } else {
                toast.error(data.message || 'Failed to fetch transactions');
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle asset change
    const handleAssetChange = ({ key }) => {
        const selected = balances.crypto.find((asset) => asset.asset === key);
        const matchedOption = crptoOptionsFlag.find((option) => option.value === key);

        if (selected && matchedOption) {
            const networkBalances = selected.networks.map((network) => ({
                networkName: network.networkName,
                availableBalance: network.availableBalance,
            }));

            setSelectedAsset({
                asset: selected.asset,
                networks: networkBalances,
                flag: matchedOption.flag,
            });

            // Default to the first network
            const defaultNetwork = networkBalances[0];
            setSelectedNetwork(defaultNetwork);
            setShowAmount(defaultNetwork.availableBalance);

            // Fetch transactions for the selected asset
            fetchTransactions(selected.asset);
        }
    };

    // Handle network change
    const handleNetworkChange = ({ key }) => {
        const network = selectedAsset?.networks?.find((n) => n.networkName === key);

        if (network) {
            setSelectedNetwork(network);
            setShowAmount(network.availableBalance);
        }
    };

    useEffect(() => {
        fetchBalances();
    }, [id, token]);

    // Automatically select the first asset and network on load
    useEffect(() => {
        if (balances?.crypto?.length > 0) {
            const firstAsset = balances.crypto[0];
            const matchedOption = crptoOptionsFlag.find((option) => option.value === firstAsset.asset);

            if (matchedOption) {
                const networkBalances = firstAsset.networks.map((network) => ({
                    networkName: network.networkName,
                    availableBalance: network.availableBalance,
                }));

                setSelectedAsset({
                    asset: firstAsset.asset,
                    networks: networkBalances,
                    flag: matchedOption.flag,
                });

                // Default to the first network
                const defaultNetwork = networkBalances[0];
                setSelectedNetwork(defaultNetwork);
                setShowAmount(defaultNetwork.availableBalance);

                // Fetch transactions for the selected asset
                fetchTransactions(firstAsset.asset);
            }
        }
    }, [balances]);

    const menu = (
        <Menu onClick={handleAssetChange}>
            {balances?.crypto?.map((ast) => (
                <Menu.Item key={ast.asset}>{ast.asset}</Menu.Item>
            ))}
        </Menu>
    );

    const networkMenu = (
        <Menu onClick={handleNetworkChange}>
            {selectedAsset?.networks?.map((network) => (
                <Menu.Item key={network.networkName}>{network.networkName}</Menu.Item>
            ))}
        </Menu>
    );

    const getAssetFlag = (asset) => {
        if (!asset) return null; // Ensure asset is defined
        const assetData = crptoOptionsFlag.find(option => option.value === asset);
        return assetData ? assetData.flag : null;
    };

    const RedirectWithdraw = async () => {
        navigate('/dashboard/user/withdrawals');

    };
    const handleDepositAssetChange = (option) => {
        setDepositAsset(option.value); // Set the selected asset
        const selectedCoin = cryptoOptions.find(coin => coin.value === option.value); // Find the selected coin
        setSelectedDepositNetworks(selectedCoin ? selectedCoin.networks : []); // Set the networks for the selected coin
        setSelectedDepositNetwork(''); // Reset the selected network
        setResetKey((prevKey) => prevKey + 1); // Force re-render of the network Select component
    };
    const handleDepositNetworkChange = (network) => {
        setSelectedDepositNetwork(network.value);
        const newAddress = generateRandomAddress(26);
        setDepositAddress(newAddress);
    };

    const generateRandomAddress = (length) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }
        return result;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(depositAddress).then(
            () => {
                message.success("Address copied to clipboard");

            },
            (err) => {
                console.error('Could not copy text: ', err);
            }
        );
    };

    const formatOptionLabel = ({ label, flag }) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={flag} alt="" style={{ width: 20, marginRight: 10 }} />
            <span>{label}</span>
        </div>
    );


    const customStyles = {
        control: (baseStyles, state) => ({
            ...baseStyles,
            backgroundColor: "#0D233A", // Use prop for background color
            color: "#fff", // Use prop for text color
            borderColor: state.isFocused ? "#ffffff" : "#0D233A",
            "&:hover": {
                borderColor: "#ffffff",
            },
        }),
        singleValue: (baseStyles) => ({
            ...baseStyles,
            color: "#fff",
        }),
        menu: (baseStyles) => ({
            ...baseStyles,
            backgroundColor: "#0D233A",
        }),
        option: (baseStyles, { isFocused, isSelected }) => ({
            ...baseStyles,
            backgroundColor: isSelected ? "#ffffff" : isFocused ? "#123456" : "#0D233A",
            color: isSelected ? "#0D233A" : "#fff",
            "&:hover": {
                backgroundColor: "#123456",
                color: "#fff",
            },
        }),
        placeholder: (baseStyles) => ({
            ...baseStyles,
            color: "#fff",
        }),
        input: (baseStyles) => ({
            ...baseStyles,
            color: "#fff",
        }),
    };


    const TransactionSelect = async (trx) => {
        setSelectedTransaction(trx);
        openTransactionSidebar();
    };

    const copyText = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                message.success("Copied to clipboard!");
            })
            .catch((err) => {
                console.error("Failed to copy: ", err);
            });
    };

    const getTotalDepositsThisMonth = () => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const depositsThisMonth = filteredTransactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return (
                transactionDate.getMonth() === currentMonth &&
                transactionDate.getFullYear() === currentYear &&
                transaction.type === "Deposit" // Ensure it's a deposit
            );
        });

        const totalDeposit = depositsThisMonth.reduce((sum, transaction) => sum + transaction.amount, 0);

        // Check if there are any deposits before accessing the asset property
        const Totalasset = depositsThisMonth.length > 0 ? depositsThisMonth[0].asset : "";

        return { totalDeposit, Totalasset };
    };

    const { totalDeposit, Totalasset } = getTotalDepositsThisMonth();

    useEffect(() => {
        if (!searchTerm) {
            // Reset to the original list of transactions when search term is empty
            setFilteredTransactionsSearch(filteredTransactions);
            return;
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        const filtered = filteredTransactions.filter((tx) => {
            // Safely access transactionWallet properties using optional chaining
            return (
                tx.transactionWallet?.txID?.includes(lowerCaseSearchTerm) ||
                tx.transactionWallet?.fromWallet?.includes(lowerCaseSearchTerm) ||
                tx.transactionWallet?.toWallet?.includes(lowerCaseSearchTerm)
            );
        });

        setFilteredTransactionsSearch(filtered);
    }, [searchTerm, filteredTransactions]);
    return (
        <>
            {loading && <Loader />}
            <UserSidebar
                sidebarOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                onSpaceToggle={handleSpaceToggle}
                isSpaceActive={isSpaceActive}
            />
            <div className={`dashboard-main ${sidebarOpen ? 'shifted' : ''} ${isSpaceActive ? 'freeSpaceDash' : ''}`}>
                <div className="dashboard-content">
                    <div className="asset-sec">
                        <div style={{ display: 'flex', alignItems: 'end', marginBottom: 10 }}>
                            {selectedAsset?.flag && (
                                <img
                                    src={selectedAsset.flag}
                                    alt={selectedAsset.asset}
                                    style={{ width: 35, height: 35, marginRight: 10 }}
                                />
                            )}
                            <span className='selected-asset-wallet'>{selectedAsset?.asset} </span>
                            <span className='selected-network-wallet ps-1'> /  {selectedNetwork?.networkName}  </span>
                            {<Dropdown overlay={networkMenu} trigger={['click']}>
                                <Button className="network-select-wallet">
                                    <IoIosArrowDown />
                                </Button>
                            </Dropdown>}
                        </div>
                        <div className="search-main mt-0">
                            <input
                                type="text"
                                className='search-inp'
                                placeholder='Address TrxID'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="search-icon">
                                <IoSearchOutline />
                            </div>


                        </div>
                    </div>
                    <div className="asset-balance-sec">
                        <div className="d-flex align-items-center gap-2">
                            <h1 className="wallet-amount">
                                {new Intl.NumberFormat('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }).format(showAmount || 0)}
                            </h1>

                            <h6 className="mb-0">{selectedAsset?.asset}</h6>
                            <Dropdown overlay={menu} trigger={['click']}>
                                <Button className="asset-select-wallet">
                                    <IoIosArrowDown />
                                </Button>
                            </Dropdown>
                        </div>
                        <div className="asset-balance-btns">
                            <button className="mid-circle-sec" onClick={openDepositSidebar} >
                                <div className='mid-circle'>
                                    <FaWallet className='circle-icon' />
                                </div>
                                <p className="mid-circle-text">Deposit</p>
                            </button>
                            <button onClick={RedirectWithdraw} className="mid-circle-sec" >
                                <div className='mid-circle'>
                                    <PiHandWithdraw className='circle-icon' />
                                </div>
                                <p className="mid-circle-text">Withdraw</p>
                            </button>
                            <button className="mid-circle-sec" onClick={openDepositSidebar}>
                                <div className='mid-circle'>
                                    <TbArrowsExchange className='circle-icon' />
                                </div>
                                <p className="mid-circle-text">Exchange</p>
                            </button>
                        </div>
                    </div>
                    <div className="new-wallet-design mt-5 mb-3">
                        <span className="selected-asset-wallet">
                            This Month <span className="fw-bold">{totalDeposit.toFixed(2)} {Totalasset}</span>
                        </span>
                    </div>
                    <hr />
                    <div className="wallet-transactions-sec">
                        {filteredTransactionsSearch.map((tx) => (
                            <div key={tx._id} className="wallet-transaction" onClick={() => TransactionSelect(tx)}>
                                <div className="wallet-transaction-circle">
                                    <FaArrowUp className={`${tx.type === "Deposit" ? "wallet-trans-arrow-credit" : "wallet-trans-arrow-debit"}`} />
                                </div>
                                <div className="wallet-transaction-sub">
                                    <div className="d-flex justify-content-between">
                                        <div className="wallet-transaction-sub-left">
                                            <div className="wallet-trans-amount">
                                                {tx.type}
                                            </div>
                                            <div className="wallet-trans-sm-text">
                                                Sender : {tx?.transactionWallet?.fromWallet ? tx.transactionWallet.fromWallet : "-"}
                                            </div>
                                            <div className="wallet-trans-sm-text">
                                                Receiver : {tx?.transactionWallet?.toWallet ? tx.transactionWallet.toWallet : "-"}
                                            </div>
                                        </div>
                                        <div className="wallet-transaction-sub-right">
                                            <div className="wallet-trans-amount">
                                                {(() => {

                                                    const assetFlag = getAssetFlag(tx.asset);
                                                    const flag = assetFlag;

                                                    if (flag) {
                                                        return (
                                                            <img
                                                                src={flag}
                                                                alt={tx.asset}
                                                                style={{ width: '35px', marginRight: '10px' }}
                                                            />
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                                {new Intl.NumberFormat('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                }).format(tx.amount || 0)}
                                                <span className='ms-1 fw-normal'>{tx.asset}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <hr />
                                    <div className="wallet-trans-sm-text">
                                        {new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} {" "}
                                        {new Date(tx.date).toLocaleTimeString('en-GB')}
                                    </div>
                                </div>
                            </div>

                        ))}
                    </div>
                    <div className={`wallet-deposit-sidebar ${isDepositSidebarOpen ? 'active-deposit-menu' : ''}`} >
                        <div className="">
                            <button className="close-btn-deposit-sidebar" onClick={closeDepositSidebar}>
                                <FaArrowLeftLong />
                            </button>
                        </div>
                        <h2 className='text-white pt-3'>Deposit Crypto</h2>
                        <div className="deposit-address-sec">
                            <div className="mb-3">
                                <label>Asset</label>
                                <div className="mb-3">
                                    <Select
                                        options={cryptoOptions}
                                        formatOptionLabel={formatOptionLabel}
                                        value={cryptoOptions.find((option) => option.value === selectedAsset)}
                                        onChange={handleDepositAssetChange}
                                        placeholder="Select Asset"
                                        isSearchable
                                        styles={customStyles}
                                    />

                                </div>

                                {selectedDepositNetworks.length > 0 && (
                                    <div className="mb-3">
                                        <label>Network</label>
                                        <Select
                                            key={resetKey}
                                            options={selectedDepositNetworks.map((network) => ({ value: network, label: network }))}
                                            value={
                                                selectedDepositNetwork
                                                    ? { value: selectedDepositNetwork, label: selectedDepositNetwork }
                                                    : null
                                            }
                                            onChange={handleDepositNetworkChange}
                                            placeholder="Select Network"
                                            isSearchable
                                            styles={customStyles}
                                        />
                                    </div>
                                )}

                                {depositAddress && (
                                    <>
                                        <label>Your Deposit Address</label>
                                        <div className="qr-code py-3">
                                            <QRCode style={{ height: "auto", maxWidth: "70%", width: "70%" }} fgColor="#0D233A" value={depositAddress} />
                                            <label className='text-center mt-3'>Minimum Deposit Amount = 10</label>
                                            <hr />
                                            <div className="deposit-wallet-label">
                                                <div className="d-flex">
                                                    <label> ADDRESS</label>
                                                </div>
                                                <div className="deposit-address-chara">
                                                    TUN9vhyej...kDFFpk8MB
                                                    <button className='deposit-address-copy-btn' onClick={copyToClipboard}><FaCopy /></button>
                                                </div>
                                            </div>

                                        </div>


                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={`transaction-detail-sidebar ${isTransactionSidebarOpen ? 'active-transaction-sidemenu' : ''}`} >
                        <div className="">
                            <button className="close-btn-deposit-sidebar" onClick={closeTransactionSidebar}>
                                <MdClose />
                            </button>
                        </div>
                        <div className="sidebar-transaction">
                            <div className="text-center">
                                {(() => {

                                    const flag = getAssetFlag(selectedTransaction.asset);
                                    if (flag) {
                                        return (
                                            <img
                                                src={flag}
                                                alt={selectedTransaction.asset}
                                                style={{ width: '50px' }}
                                            />
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                            <div className="transaction-sidebar-w-text text-center">
                                {selectedTransaction.type === "Deposit" ? "Credit" : "Debit"}
                            </div>
                            <h4 className='text-white text-center py-3'>{selectedTransaction.type === "Deposit" ? "+" : "-"} {selectedTransaction.amount} {selectedTransaction.asset}</h4>

                            <hr />
                            <div className="pt-3 transaction-sidebar-w-text">
                                Sender <br />
                                <p className='transaction-address-sidebar'> {selectedTransaction?.transactionWallet?.fromWallet ? selectedTransaction.transactionWallet.fromWallet : "-"}  <button className='copy-transaction-btn' onClick={() => copyText("")} ><IoCopy /></button> </p>
                            </div>
                            <div className="pt-3 transaction-sidebar-w-text">
                                Receiver <br />
                                <p className='transaction-address-sidebar'> {selectedTransaction?.transactionWallet?.toWallet ? selectedTransaction.transactionWallet.toWallet : "-"}  <button className='copy-transaction-btn' onClick={() => copyText("")}><IoCopy /></button></p>
                            </div>
                            <div className="pt-3 transaction-sidebar-w-text">
                                Fee<br />
                                <p className='transaction-address-sidebar'> {selectedTransaction?.transactionWallet?.fee ? selectedTransaction.transactionWallet.fee : "-"}   {selectedTransaction.asset}</p>
                            </div>
                            <div className="pt-3 transaction-sidebar-w-text">
                                Transaction Time<br />
                                <p className='transaction-address-sidebar'> {new Date(selectedTransaction.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} {" "}
                                    {new Date(selectedTransaction.date).toLocaleTimeString('en-GB')}   </p>
                            </div>
                            <div className="pt-3 transaction-sidebar-w-text">
                                TxID<br />
                                <p className='transaction-address-sidebar'> {selectedTransaction?.transactionWallet?.hash ? selectedTransaction.transactionWallet.hash : "-"} <button className='copy-transaction-btn' onClick={() => copyText(selectedTransaction.transactionWallet?.hash)}><IoCopy /></button>  </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserWallet;
