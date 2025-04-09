import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import UserSidebar from './UserSidebar';
import { currencyOptions, crptoOptionsFlag } from '../admin/currencyOptions';
import { toast } from 'react-toastify';
import { RiArrowGoForwardFill, RiBarChart2Fill } from 'react-icons/ri';
import { FaBtc } from 'react-icons/fa6';
import UserNav from './UserNav';
import Loader from '../../components/Loader';
import axios from 'axios';
import LineChart from './LineChart';
import BarChart from './BarChart';
import DonutChart from './DonutChart ';
import TransactionDown from "../../assets/images/transaction-down.svg";
import { MdOutlineAccountBalanceWallet, MdOutlineCurrencyPound } from 'react-icons/md';
import { PiHandWithdraw } from 'react-icons/pi';
import { IoIosArrowDown } from "react-icons/io";
import Select from 'react-select';
import { LuPercent } from 'react-icons/lu';
import { Menu, Dropdown, Button } from 'antd';
const UserDashboard = ({ children }) => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [allTransactions, setAllTransactions] = useState([]);
    const [btcTotal, setBtcTotal] = useState(0);
    const [showAll, setShowAll] = useState(false);
    const [btcToCurrency, setBtcToCurrency] = useState();
    const [currency, setCurrency] = useState("");
    const [gbpBalance, setGbpBalance] = useState("");
    const [isSpaceActive, setIsSpaceActive] = useState(false);
    const [balances, setBalances] = useState("");
    const [selectedCurrency, setSelectedCurrency] = useState({
        currency: 'GBP', // Default currency
        balance: gbpBalance, // Default balance
        flag: currencyOptions.find((option) => option.value === 'GBP')?.flag || '', // Default flag
    });


    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleSpaceToggle = () => {
        setIsSpaceActive(!isSpaceActive);
    };

    const authData = Cookies.get('auth') ? JSON.parse(Cookies.get('auth')) : null;
    const token = Cookies.get("token");

    const id = authData.user._id;
    // Fetch Transactions
    useEffect(() => {
        const fetchTransactionsData = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${process.env.REACT_APP_API}/api/v1/transaction/user-transactions/${authData.user._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (data?.success) {
                    const sortedTransactions = data.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setAllTransactions(sortedTransactions);

                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                console.log(error);

            } finally {
                setLoading(false);
            }
        };

        fetchTransactionsData();
    }, []);

    const displayedTransactions = showAll ? allTransactions.slice(0, 30) : allTransactions.slice(0, 3);
    // Toggle `showAll` state
    const handleToggleShowAll = () => {
        setShowAll(!showAll);
    };

    const getCurrencyFlag = (currency) => {
        if (!currency) return null; // Ensure currency is defined
        const currencyData = currencyOptions.find(option => option.value === currency);
        return currencyData ? currencyData.flag : null;
    };

    const getAssetFlag = (asset) => {
        if (!asset) return null; // Ensure asset is defined
        const assetData = crptoOptionsFlag.find(option => option.value === asset);
        return assetData ? assetData.flag : null;
    };

    // Fetch balance

    useEffect(() => {
        const getUserBalance = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(
                    `${process.env.REACT_APP_API}/api/v1/auth/get-user-b/${authData.user._id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (data?.success) {
                    // Calculate BTC total
                    const btcBalance =
                        data.balances.crypto
                            .find((crypto) => crypto.asset === "BTC")
                            ?.networks.reduce(
                                (total, network) => total + network.availableBalance,
                                0
                            ) || 0;

                    setBtcTotal(btcBalance);
                    setBalances(data.balances);
                    // Handle fiat balances
                    let gbpBalance = 0;
                    setGbpBalance(gbpBalance.toFixed(2));
                }
            } catch (error) {
                console.error("Error fetching user balance:", error);
            } finally {
                setLoading(false);
            }
        };

        getUserBalance();
    }, [authData.user._id, token]);


    // Fetch the base currency
    useEffect(() => {
        const fetchBaseCurrency = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(
                    `${process.env.REACT_APP_API}/api/v1/wallet/get-currency/${id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (data?.success && data.currency?.currency) {
                    setCurrency(data.currency.currency);
                } else {

                    setCurrency("GBP"); // Default to GBP if no currency is returned
                }
            } catch (error) {
                console.error("Error fetching base currency:", error);
                setCurrency("GBP"); // Default to GBP in case of an error
            } finally {
                setLoading(false);
            }
        };

        fetchBaseCurrency();
    }, [id, token]);

    // Fetch BTC price in the selected currency
    useEffect(() => {
        if (currency) {
            const fetchCurrencyValue = async () => {
                try {
                    const response = await fetch(
                        `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currency.toLowerCase()}`
                    );
                    const data = await response.json();

                    if (data?.bitcoin?.[currency.toLowerCase()]) {
                        setBtcToCurrency(data.bitcoin[currency.toLowerCase()]);
                    } else {
                        console.warn(`BTC price for ${currency} not found.`);
                        setBtcToCurrency(null);
                    }
                } catch (error) {
                    console.error("Error fetching BTC price:", error);
                    setBtcToCurrency(null);
                }
            };

            fetchCurrencyValue();
        }
    }, [currency]);

    const handleFiatChange = ({ key }) => {
        // `key` is the selected currency code from the Menu.Item key
        const selectedCurrencyCode = key;

        // Find the matching currency from balances.fiat
        const matchedCurrency = balances.fiat.find((curr) => curr.currency === selectedCurrencyCode);

        // Find the matching flag from currencyOptions
        const matchedOption = currencyOptions.find((option) => option.value === selectedCurrencyCode);

        if (matchedCurrency && matchedOption) {
            setSelectedCurrency({
                currency: matchedCurrency.currency,
                balance: matchedCurrency.availableBalance,
                flag: matchedOption.flag,
            });
        }
    };


    const menu = (
        <Menu onClick={handleFiatChange}>
            {balances?.fiat?.map((curr) => (
                <Menu.Item key={curr.currency}>
                    {curr.currency}
                </Menu.Item>
            ))}
        </Menu>
    );



    return (
        <>
            <div className="dashboard-container"></div>
            {loading && <Loader />}
            <UserSidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} onSpaceToggle={handleSpaceToggle}
                isSpaceActive={isSpaceActive} />
            {/* Main Content */}
            <div className={`dashboard-main ${sidebarOpen ? 'shifted' : ''}  ${isSpaceActive ? 'freeSpaceDash' : 'dashboard-main'}`}>
                <UserNav title={"Dashboard"} />
                <div className="dashboard-content" >
                    <div className="user-cards-main">

                        <div className="dashboard-user-card">
                            <div className="dashboard-user-card-icon-main">
                                <div className="dashboard-user-card-icon">
                                    <RiBarChart2Fill />
                                </div>
                                <div className="dashboard-user-card-text">NAV</div>
                            </div>
                            <div className="wallet-value text-center py-2">---</div>

                        </div>
                        <div className="dashboard-user-card">
                            <div className="dashboard-user-card-icon-main">
                                <div className="dashboard-user-card-icon">
                                    <MdOutlineCurrencyPound />
                                </div>
                                <div className="dashboard-user-card-text">Deposits</div>
                            </div>
                            <div className="wallet-value-sm text-center pt-2">
                                {/* Display image and balance */}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '10px',
                                    }}
                                >
                                    {selectedCurrency.flag && (
                                        <img
                                            src={selectedCurrency.flag}
                                            alt={selectedCurrency.currency}
                                            style={{ width: 25, height: 25, marginRight: 10 }}
                                        />
                                    )}
                                    <span>
                                        {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(selectedCurrency.balance)}{' '}
                                        {selectedCurrency.currency}
                                    </span>

                                    <div className="ms-2">
                                        <div className="ms-2">
                                            <Dropdown overlay={menu} trigger={['click']}>
                                                <Button className="currency-select">
                                                    <IoIosArrowDown />
                                                </Button>
                                            </Dropdown>
                                        </div>
                                    </div>
                                </div>


                            </div>
                        </div>
                        <div className="dashboard-user-card">
                            <div className="dashboard-user-card-icon-main">
                                <div className="dashboard-user-card-icon">
                                    <PiHandWithdraw />
                                </div>
                                <div className="dashboard-user-card-text">Redemptions</div>
                            </div>
                            <div className="wallet-value text-center py-2"> ---</div>

                        </div>
                        <div className="dashboard-user-card">
                            <div className="dashboard-user-card-icon-main">
                                <div className="dashboard-user-card-icon">
                                    <LuPercent />
                                </div>
                                <div className="dashboard-user-card-text">Returns </div>
                            </div>
                            <div className="wallet-value text-center py-2">   ---</div>

                        </div>
                        <div className="dashboard-user-card">
                            <div className="dashboard-user-card-icon-main">
                                <div className="dashboard-user-card-icon">
                                    <MdOutlineAccountBalanceWallet />
                                </div>
                                <div className="dashboard-user-card-text">Wallet</div>
                            </div>
                            <div className="wallet-value text-center pt-2">{btcTotal.toFixed(2)} BTC</div>
                            <div className="wallet-value-sm text-center">
                                {btcToCurrency
                                    ? `${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(
                                        btcTotal * btcToCurrency
                                    )} ${currency}`
                                    : "0"}
                            </div>


                        </div>
                    </div>

                    <div className="my-3">
                        <div className="charts-main">
                            <div className="charts-left">
                                <div className="chart-nav">NAV Chart</div>
                                <LineChart sidebarExpanded={isSpaceActive} />

                            </div>
                            <div className="charts-right">
                                <h4 className='recent-title'>Fees</h4>
                                <BarChart allTransactions={allTransactions} />
                            </div>
                        </div>

                    </div>
                    <div className="my-3">
                        <div className="charts-main">
                            <div className="charts-left">
                                <div className="recent-activity-main">
                                    <h3 className='recent-title'>Recent Activities</h3>
                                    <div className="recent-activities-sub">
                                        <div className="tbl-main">
                                            <div className="tbl-main">
                                                <table className="simple-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Date</th>
                                                            <th>Asset</th>
                                                            <th>Debit</th>
                                                            <th>Credit</th>
                                                            <th>Type</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>

                                                        {displayedTransactions?.map((transaction) => (
                                                            <tr key={transaction._id} className="transaction-row">
                                                                <td>{new Date(transaction.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, <br /> {new Date(transaction.date).toLocaleTimeString('en-GB')}</td>
                                                                <td>
                                                                    {(() => {
                                                                        const currencyFlag = getCurrencyFlag(transaction.currency);
                                                                        const assetFlag = getAssetFlag(transaction.asset);
                                                                        const flag = currencyFlag || assetFlag;

                                                                        if (flag) {
                                                                            return (
                                                                                <img
                                                                                    src={flag}
                                                                                    alt={transaction.currency || transaction.asset}
                                                                                    style={{ width: '20px', marginRight: '5px' }}
                                                                                />
                                                                            );
                                                                        }
                                                                        return null;
                                                                    })()}
                                                                    {transaction.currency || transaction.asset}
                                                                </td>
                                                                <td>
                                                                    {transaction.type !== "Deposit" ? (
                                                                        <>
                                                                            {transaction.amount}
                                                                        </>
                                                                    ) : (
                                                                        '-'
                                                                    )}
                                                                </td>

                                                                <td>
                                                                    {transaction.type === "Deposit" ? (
                                                                        <>
                                                                            {transaction.amount}

                                                                        </>
                                                                    ) : (
                                                                        '-'
                                                                    )}
                                                                </td>

                                                                <td>{transaction.type}</td>
                                                                <td

                                                                >
                                                                    <button className={
                                                                        transaction.status === 0
                                                                            ? "trans-pending trans-btn"
                                                                            : transaction.status === 1
                                                                                ? "trans-success trans-btn"
                                                                                : "trans-failed trans-btn"
                                                                    }>
                                                                        {transaction.status === 0
                                                                            ? "Pending"
                                                                            : transaction.status === 1
                                                                                ? "Completed"
                                                                                : "Failed"}
                                                                    </button>

                                                                </td>

                                                            </tr>
                                                        ))}

                                                    </tbody>
                                                </table>
                                                <div className="text-center">
                                                    <button style={{
                                                        transform: showAll ? 'rotate(180deg)' : 'rotate(0deg)',
                                                        transition: 'transform 0.3s ease' // Smooth transition
                                                    }} onClick={handleToggleShowAll} className='border-0 bg-transparent'><img src={TransactionDown} alt="" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="charts-right">
                                <h4 className='recent-title'>Portfolio</h4>

                                <DonutChart allTransactions={allTransactions} />

                            </div>
                        </div>

                    </div>

                </div>


            </div>
        </>
    );
};

export default UserDashboard;



