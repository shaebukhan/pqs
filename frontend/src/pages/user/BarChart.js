import React from 'react';
import ReactApexChart from 'react-apexcharts';
import dayjs from 'dayjs';

const BarChart = ({ allTransactions = [] }) => {
    const today = dayjs().startOf('day');
    const sevenDaysAgo = today.subtract(7, 'day');

    const categories = React.useMemo(() => {
        const days = [];
        for (let i = 0; i <= 7; i++) {
            days.push(sevenDaysAgo.add(i, 'day').clone().format('MMM D'));
        }
        return days;
    }, [sevenDaysAgo]);

    const series = React.useMemo(() => {
        const groupedData = {};
        allTransactions.forEach((transaction) => {
            const amount = Number(transaction.amount) || 0;
            const transactionDate = dayjs(transaction.date).isValid()
                ? dayjs(transaction.date).startOf('day').format('MMM D')
                : null;

            if (!transactionDate) return;

            const asset = transaction.asset || transaction.currency || 'Unknown';
            const transactionType = transaction.type || 'Unknown Type';
            const key = `${transactionType} - ${asset}`;

            if (!groupedData[key]) groupedData[key] = Array(categories.length).fill(0);

            const index = categories.indexOf(transactionDate);
            if (index !== -1 && (transactionType === 'Sales Fee' || transactionType === 'Hedging Fee')) {
                groupedData[key][index] += amount;
            }
        });

        return Object.keys(groupedData).map((key) => ({
            name: key,
            data: groupedData[key].map((value) => (isNaN(value) ? 0 : value)),
        }));
    }, [allTransactions, categories]);

    const chartData = {
        series,
        options: {
            chart: {
                id: 'feesLast7Days',
                height: 350,
                type: 'bar',
                toolbar: { show: false },
                zoom: { enabled: false },
            },
            colors: ['#001861', '#809fff'],
            dataLabels: { enabled: false },
            plotOptions: {
                bar: {
                    columnWidth: '100%',
                    borderRadius: 4,
                    barGap: '2%',
                    barSpacing: '2%',
                },
            },
            xaxis: { type: 'category', categories },
            yaxis: {
                labels: {
                    formatter: (value) => `${Math.round(value).toLocaleString()}`,
                },
            },
            tooltip: {
                y: {
                    formatter: (value) => `${value.toLocaleString()}`,
                },
                x: {
                    formatter: (val) => val,
                },
            },
            legend: { show: false },
        },
    };

    if (!allTransactions || allTransactions.length === 0) {
        return <p>Loading transactions...</p>;
    }

    return (
        <div>
            {series.some((s) => s.data.some((value) => value > 0)) ? (
                <ReactApexChart options={chartData.options} series={chartData.series} type="bar" height={350} />
            ) : (
                <p>No fee data available for the last 7 days.</p>
            )}
        </div>
    );
};

export default BarChart;
