import React from 'react';
import ReactApexChart from 'react-apexcharts';

const DonutChart = ({ allTransactions }) => {
    // Filter transactions to include only those with paymentMethod === "Crypto"
    const cryptoTransactions = allTransactions.filter(
        (transaction) => transaction.paymentMethod === 'Crypto'
    );

    // Aggregate balances by asset type
    const assetBalances = cryptoTransactions.reduce((acc, transaction) => {
        const { asset, amount, type } = transaction;
        const normalizedAmount = parseFloat(amount); // Ensure amount is a number

        if (!acc[asset]) {
            acc[asset] = 0;
        }

        if (type === 'Deposit') {
            acc[asset] += normalizedAmount;
        } else {
            acc[asset] -= normalizedAmount;
        }

        return acc;
    }, {});

    // Define colors for each cryptocurrency
    const assetColors = {
        BTC: '#F7931A', // Bitcoin
        ETH: '#627EEA', // Ethereum
        USDT: '#26A17B', // Tether
        XRP: '#00AAE4', // Ripple
        LTC: '#345C99', // Litecoin
        // Add more cryptocurrencies and their colors as needed
    };

    // Prepare data for the chart
    const series = [];
    const labels = [];
    const colors = [];

    Object.entries(assetBalances).forEach(([asset, balance]) => {
        if (balance > 0) {
            series.push(balance);
            labels.push(asset);
            colors.push(assetColors[asset] || '#000000'); // Default to black if color not defined
        }
    });

    const chartOptions = {
        chart: {
            type: 'donut',
            height: 350,
        },
        labels: labels,
        dataLabels: {
            enabled: false,
        },
        colors: colors,
        legend: {
            position: 'right',
            formatter: function (currency) {
                return `${currency}`;
            },
        },
        tooltip: {
            y: {
                formatter: (value, { seriesIndex }) => {
                    const asset = labels[seriesIndex];
                    return `${value.toFixed(2)} ${asset}`;
                },
            },
            theme: 'dark',
            style: {
                fontSize: '18px',
                fontFamily: 'Arial',
            },
            custom: function ({ seriesIndex, w }) {
                const asset = labels[seriesIndex];
                return (
                    `<div style="background: #1E293B; padding: 10px; border-radius: 5px; color: #FFFFFF; font-size: 18px;">
                         ${series[seriesIndex].toFixed(2)} ${asset}
                     </div>`
                );
            },
        },
    };

    // Function to get the path of the cryptocurrency icon
    const getCryptoIconPath = (symbol) => {
        try {
            // Attempt to require the SVG icon from the cryptocurrency-icons package
            return require(`cryptocurrency-icons/svg/color/${symbol.toLowerCase()}.svg`);
        } catch (error) {
            console.warn(`Icon for ${symbol} not found. Using default icon.`);
            // Provide a default icon path or return null
            return null;
        }
    };

    return (
        <div>
            {series.length > 0 ? (
                <ReactApexChart
                    options={chartOptions}
                    series={series}
                    type="donut"
                    height={250}
                />
            ) : (
                <p>No crypto transaction data available</p>
            )}
            {/* Show total balances below the chart */}
            {labels.map((asset, index) => (
                <h6 key={asset} className="bc-clr">
                    <img
                        style={{ width: '20px' }}
                        src={getCryptoIconPath(asset)}
                        alt={asset}
                    />{' '}
                    {asset} = {series[index].toFixed(2)}
                </h6>
            ))}
        </div>
    );
};

export default DonutChart;
