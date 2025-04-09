import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import UserSidebar from './UserSidebar';
import Loader from '../../components/Loader';
import SignLogo from "../../assets/images/logo-w.png";
import UserNav from './UserNav';
import Cookies from "js-cookie";
import axios from 'axios';
import { toast } from 'react-toastify';
import { currencyOptions, crptoOptionsFlag } from '../admin/currencyOptions';
import jsPDF from "jspdf";
import "jspdf-autotable";
import Papa from 'papaparse';
const { Option } = Select;

const Reports = () => {
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [allTransactions, setAllTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedAssets, setSelectedAssets] = useState([]);
    const [status, setStatus] = useState('all');
    const [transactionId, setTransactionId] = useState('');
    const [userData, setUserData] = useState("");
    const [isSpaceActive, setIsSpaceActive] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };
    const handleSpaceToggle = () => {
        setIsSpaceActive(!isSpaceActive);
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

    const authData = Cookies.get('auth') ? JSON.parse(Cookies.get('auth')) : null;
    const token = Cookies.get("token");
    useEffect(() => {
        setUserData(authData.user.profile.details[0]);

    }, [authData.user._id, token]);
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
                    setFilteredTransactions(sortedTransactions);

                } else {
                    console.log(data.message);
                }


            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactionsData();
    }, []);


    // Filter Logic
    useEffect(() => {
        let filtered = [...allTransactions];

        // Date Range Filter
        if (startDate && endDate) {
            filtered = filtered.filter(transaction => {
                const transactionDate = new Date(transaction.date);
                const adjustedEndDate = new Date(endDate);
                adjustedEndDate.setDate(adjustedEndDate.getDate() + 1); // Move to the next day
                return transactionDate >= new Date(startDate) && transactionDate < adjustedEndDate;
            });
        }


        // Type Filter
        if (selectedTypes.length > 0) {
            filtered = filtered.filter(transaction => selectedTypes.includes(transaction.type));
        }

        // Asset Filter
        if (selectedAssets.length > 0) {
            filtered = filtered.filter(transaction => selectedAssets.includes(transaction.currency || transaction.asset));
        }

        // Status Filter
        if (status !== 'all') {
            const statusValue = parseInt(status, 10);
            filtered = filtered.filter(transaction => transaction.status === statusValue);
        }

        // Transaction ID Search
        if (transactionId) {
            filtered = filtered.filter(transaction => transaction._id.includes(transactionId));
        }

        setFilteredTransactions(filtered);
    }, [startDate, endDate, selectedTypes, selectedAssets, status, transactionId, allTransactions]);

    const uniqueTypes = [...new Set(allTransactions.map(transaction => transaction.type))];
    const uniqueAssets = [...new Set(allTransactions.map(transaction => transaction.currency || transaction.asset))];

    const clearDateFilters = () => {
        setStartDate('');
        setEndDate('');
    };




    const exportToPdf = () => {
        const doc = new jsPDF();
        const image = new Image();
        image.src = SignLogo;

        image.onload = () => {
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const leftMargin = 14;
            const lineSpacing = 6;

            const renderHeader = () => {
                const headerHeight = 30;
                doc.setFillColor("#F0F0F0");
                doc.rect(0, 0, pageWidth, headerHeight, "F");

                const imageWidth = 50;
                const imageHeight = (imageWidth * image.height) / image.width;
                const logoX = leftMargin + 2;
                const logoY = (headerHeight - imageHeight) / 2;
                doc.addImage(image, "PNG", logoX, logoY, imageWidth, imageHeight);

                doc.setFontSize(16);
                doc.setTextColor("#0E2340");
                doc.text("Premier Quantitative Strategies (PQS) SPC FUND", logoX + imageWidth + 10, logoY + 6);
                doc.setFontSize(12);
                doc.text("21 Arlington St, London SW1A 1RD, United Kingdom", logoX + imageWidth + 10, logoY + 14);
            };

            const addFooter = () => {
                const footerText =
                    "The Premier Quantitative Strategies SP Fund is our main investment vehicle which is an open-ended mutual fund based in the Cayman Islands and regulated by the Cayman Island Monetary Authority (CIMA). The Premier Quantitative Strategies (PQS) SP Fund is only available to institutional investors and high net worth individuals who can be classified as professional investors. The Offering Memorandum is the only authorized document for the offering of shares in the PQS SP FUND. Its distribution is subject to the particular laws and regulations of the jurisdictions in which a potential investor resides as well as the categorization of the potential investor as a professional client in accordance with FCA rules.";
                doc.setFontSize(8);
                doc.text(footerText, pageWidth / 2, pageHeight - 20, { align: "center", maxWidth: pageWidth - 40 });
            };

            const renderToAndPeriod = (sectionStartY) => {
                const toDetails = [
                    userData?.firstName + " " + userData?.lastName || "No Name" + userData?.companyName || "No Name",
                    userData?.address || "No Address",
                    userData?.street || "No Street",
                    userData?.country || "No Country",
                ];

                let yPosition = sectionStartY;

                toDetails.forEach((line) => {
                    doc.text(line, leftMargin, yPosition);
                    yPosition += lineSpacing;
                });

                const todayDate = new Date().toLocaleDateString("en-GB");
                const calculatedStartDate = startDate || (filteredTransactions.length > 0 ? filteredTransactions[filteredTransactions.length - 1]?.date : "N/A");
                const calculatedEndDate = endDate || (filteredTransactions.length > 0 ? filteredTransactions[0]?.date : "N/A");

                const formattedStartDate = calculatedStartDate !== "N/A" ? new Date(calculatedStartDate).toLocaleDateString("en-GB") : "N/A";
                const formattedEndDate = calculatedEndDate !== "N/A" ? new Date(calculatedEndDate).toLocaleDateString("en-GB") : "N/A";

                const statementInfoX = pageWidth / 2 + 10;
                doc.text(`Statement Date: ${todayDate}`, statementInfoX, sectionStartY);
                doc.text(`Period Covered: ${formattedStartDate} - ${formattedEndDate}`, statementInfoX, sectionStartY + lineSpacing);

                // Separator Line
                doc.setDrawColor("#0E2340");
                doc.setLineWidth(0.5);
                const lineStartY = yPosition;
                doc.line(leftMargin, lineStartY, pageWidth - leftMargin, lineStartY);

                return yPosition + 10; // Return updated Y position
            };

            const transactionsByAsset = filteredTransactions.reduce((acc, txn) => {
                const asset = txn.currency || txn.asset;
                if (!acc[asset]) acc[asset] = [];
                acc[asset].push(txn);
                return acc;
            }, {});
            let yPosition = 0; // Initialize yPosition globally to track vertical position


            renderHeader();
            const sectionStartY = 50; // Adjust starting Y position
            yPosition = renderToAndPeriod(sectionStartY); // Render the "To and Period" section and update yPosition

            // Add the Account Summary table once at the top
            doc.setFont(undefined, "bold");
            doc.setFontSize(14);
            doc.text("Account Summary", leftMargin, yPosition);
            doc.setFont(undefined, "normal");
            doc.setFontSize(12);
            yPosition += lineSpacing;

            // Create a list of all assets or currencies for the summary
            const assetSummaryData = Object.keys(transactionsByAsset).map((asset) => {
                const transactions = transactionsByAsset[asset];
                const totalPaidIn = transactions.filter((txn) => txn.type === "Deposit").reduce((sum, txn) => sum + txn.amount, 0);
                const totalPaidOut = transactions.filter((txn) => txn.type !== "Deposit").reduce((sum, txn) => sum + txn.amount, 0);
                const firstTransaction = transactions[0];
                const closingBalance = firstTransaction ? firstTransaction.closingBalance : 0;
                const lastTran = transactions[transactions.length - 1];

                let openingVal = lastTran.closingBalance - lastTran.amount;
                return [
                    asset,
                    openingVal + " " + asset,
                    totalPaidOut.toFixed(2) + " " + asset,
                    totalPaidIn.toFixed(2) + " " + asset,
                    closingBalance.toFixed(2) + " " + asset,
                ];
            });

            // Add summary table for all assets
            const headers = [["Asset/Currency", "Opening Value", "Amount Out", "Amount In", "Closing Value"]];
            doc.autoTable({
                startY: yPosition,
                head: headers,
                body: assetSummaryData,
                margin: { left: leftMargin },
                headStyles: {
                    fillColor: null,
                    textColor: "#0E2340",
                    fontStyle: "bold",

                },
                bodyStyles: {
                    fillColor: null,
                    textColor: "#0E2340",

                },
                didParseCell: (data) => {
                    // Draw a line below the header (first row)
                    if (data.row.index === 0) {
                        const headerBottomY = data.cell.y + data.cell.height; // Get the Y position of the header's bottom edge
                        doc.setDrawColor("#0E2340");  // Set the draw color to match the title color
                        doc.setLineWidth(0.5);  // Set the line width
                        doc.line(data.cell.x, headerBottomY, data.cell.x + data.cell.width * headers[0].length, headerBottomY); // Draw the line below the header
                    }

                    // Draw a line below each row (except the last one)
                    const rowBottomY = data.cell.y + data.cell.height; // Get the Y position of the row's bottom edge
                    if (data.row.index < data.table.body.length - 1) {  // Only draw a line for non-last rows
                        doc.setDrawColor("#0E2340");  // Set the draw color
                        doc.setLineWidth(0.5);  // Set the line width
                        doc.line(data.cell.x, rowBottomY, data.cell.x + data.cell.width * headers[0].length, rowBottomY); // Draw the line below the row
                    }
                },
            });



            yPosition = doc.lastAutoTable.finalY + lineSpacing + 20;

            // Now for each asset, add its individual transactions
            Object.keys(transactionsByAsset).forEach((asset, index) => {
                // Add heading for the current asset/currency transactions
                doc.setFont(undefined, "bold");
                doc.setFontSize(14);
                doc.text(`Transactions for ${asset}`, leftMargin, yPosition);
                doc.setFont(undefined, "normal");
                doc.setFontSize(12);
                yPosition += lineSpacing;

                const transactions = transactionsByAsset[asset];

                // Add transaction details table for the asset
                doc.autoTable({
                    head: [["Date", "Type", "Debit", "Credit", "Transaction ID", "Balance"]],
                    body: transactions.map((txn) => [
                        new Date(txn.date).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                        }),
                        txn.type,
                        txn.type !== "Deposit" && txn.amount ? `- ${txn.amount} ${asset}` : "",
                        txn.type === "Deposit" && txn.amount ? `+ ${txn.amount} ${asset}` : "",
                        txn._id,
                        txn.closingBalance ? `${txn.closingBalance.toFixed(2)} ${asset}` : "",
                    ]),
                    startY: yPosition,
                    styles: { fontSize: 10 },
                    headStyles: { fillColor: "#0E2340", textColor: "#FFFFFF", fontStyle: "bold" },
                    bodyStyles: { textColor: "#0E2340" },
                    didParseCell: (data) => {
                        if (data.column.index === 2 && data.cell.raw?.startsWith("-")) {
                            data.cell.styles.textColor = "#FF0000";
                        }
                        if (data.column.index === 3 && data.cell.raw?.startsWith("+")) {
                            data.cell.styles.textColor = "#00AA00";
                        }
                    },
                });

                yPosition = doc.lastAutoTable.finalY + 20; // Update yPosition after the transaction table
            });

            // Final footer (only added once, after all transactions are rendered)
            addFooter();


            doc.save("transaction-report.pdf");
        };

        image.onerror = () => {
            console.error("Failed to load logo image.");
        };
    };

    const exportToCsv = () => {
        // Extract transactions with only necessary fields
        const csvData = [];

        // Add header row
        csvData.push(["Date", "Type", "Debit", "Credit", "Network", "Transaction ID", "Balance"]);

        // Add transaction data
        filteredTransactions.forEach((txn) => {
            csvData.push([
                new Date(txn.date).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                }),
                txn.type,
                txn.type !== "Deposit" && txn.amount ? `- ${txn.amount} ${txn.asset || txn.currency}` : "",
                txn.type === "Deposit" && txn.amount ? `+ ${txn.amount} ${txn.asset || txn.currency}` : "",
                txn?.network ? txn.network : "-",
                txn._id,
                txn?.closingBalance
                    ? `${txn.closingBalance.toFixed(2)} ${txn.asset || txn.currency}`
                    : ""

            ]);
        });

        // Generate and download the CSV
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = "transaction-report.csv";
        link.click();
    };




    return (
        <>
            <div className="dashboard-container"></div>
            {loading && <Loader />}
            <UserSidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} onSpaceToggle={handleSpaceToggle}
                isSpaceActive={isSpaceActive} />
            {/* Main Content */}
            <div className={`dashboard-main ${sidebarOpen ? 'shifted' : ''}  ${isSpaceActive ? 'freeSpaceDash' : 'dashboard-main'}`}>
                <UserNav title={"Reports"} />
                <div className="dashboard-content">
                    <div className="reports-main">
                        <div className="filters-main">
                            <div className="date-filter-main">
                                <div className="date-filter">
                                    <label className='bc-clr mb-3'>Date Range</label>
                                    <div className="d-flex align-items-center gap-3">
                                        <input
                                            type="date"
                                            className='filter-inp w-50'
                                            value={startDate}
                                            max={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                        <input
                                            type="date"
                                            className='filter-inp w-50'
                                            value={endDate}
                                            max={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                        <button
                                            className="clear-btn"
                                            onClick={clearDateFilters}
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                <div style={{ position: "relative", display: "inline-block" }}>
                                    <button
                                        className="download-pdf"
                                        onClick={() => setShowOptions((prev) => !prev)}
                                    >
                                        Export Data
                                    </button>
                                    {showOptions && (
                                        <div className='download-dropdown'
                                        >
                                            <div
                                                onClick={() => exportToPdf()}
                                            >
                                                Download  PDF
                                            </div>
                                            <div
                                                onClick={() => exportToCsv()}
                                            >
                                                Download CSV
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="other-filter mt-3">
                                <div className="other-filter-sub">
                                    <label className='bc-clr'>Type</label>
                                    <Select
                                        mode="multiple"
                                        placeholder="Select Type(s)"
                                        value={selectedTypes}
                                        onChange={setSelectedTypes}
                                    >
                                        {uniqueTypes.map((type) => (
                                            <Option key={type} value={type}>{type}</Option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="other-filter-sub">
                                    <label className='bc-clr'>Asset/Currency</label>
                                    <Select
                                        mode="multiple"
                                        placeholder="Select Asset(s)"
                                        value={selectedAssets}
                                        onChange={setSelectedAssets}
                                    >
                                        {uniqueAssets.map((asset) => (
                                            <Option key={asset} value={asset}>{asset}</Option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="other-filter-sub">
                                    <label className='bc-clr'>Status</label>
                                    <select
                                        className='filter-inp'
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="all">All</option>
                                        <option value="0">Pending</option>
                                        <option value="1">Completed</option>
                                        <option value="2">Failed</option>
                                    </select>
                                </div>
                                <div className="other-filter-sub">
                                    <label className='bc-clr'>Transaction ID</label>
                                    <input
                                        type='text'
                                        className='filter-inp'
                                        placeholder='Search'
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-3">
                            {filteredTransactions.length > 0 ? (
                                <div className="reports-table-wrapper">
                                    <table className='reports-table table-responsive'>
                                        <thead>
                                            <tr>
                                                <th>Date/Time</th>
                                                <th>Debit/Credit</th>
                                                <th>Network</th>
                                                <th>Type</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Transaction Id</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTransactions.map((transaction) => (
                                                <tr key={transaction._id} className="transaction-row">
                                                    <td>
                                                        {new Date(transaction.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, <br />
                                                        {new Date(transaction.date).toLocaleTimeString('en-GB')}
                                                    </td>
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
                                                    <td> {transaction?.network || '-'} </td>
                                                    <td className='text-capitalize'>{transaction.type}</td>
                                                    <td>{transaction.amount}</td>
                                                    <td>
                                                        <div className={
                                                            transaction.status === 0
                                                                ? "text-warning"
                                                                : transaction.status === 1
                                                                    ? "text-success"
                                                                    : "text-danger"
                                                        }>
                                                            {transaction.status === 0
                                                                ? "Pending"
                                                                : transaction.status === 1
                                                                    ? "Completed"
                                                                    : "Failed"}
                                                        </div>
                                                    </td>
                                                    <td>{transaction._id}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="no-data-found">
                                    No Data Found
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default Reports;
