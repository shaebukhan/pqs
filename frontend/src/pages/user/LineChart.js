import React, { useEffect, useRef } from 'react';
import ReactApexChart from 'react-apexcharts';
import dayjs from 'dayjs';

const LineChart = ({ sidebarExpanded }) => {
    const chartRef = useRef(null);

    const today = dayjs().startOf('day');
    const navData = [];

    for (let i = 4; i >= 0; i--) {
        const day = today.subtract(i, 'day').startOf('day');
        navData.push({ x: day.toDate(), y: 0 });
    }

    const chartData = {
        series: [
            { name: 'NAV', data: navData },
        ],
        options: {
            chart: {
                id: 'last5days',
                type: 'line',
                toolbar: { show: false },
                zoom: { enabled: false },
            },
            colors: ['#0E2340'],
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth' },
            markers: { size: 5 },
            xaxis: {
                type: 'datetime',
                labels: {
                    datetimeUTC: false,
                    format: 'MMM dd',
                },
                tickAmount: 5,
            },
            yaxis: {
                labels: {
                    formatter: (value) => Math.round(value).toLocaleString(),
                },
            },
            legend: { show: false },
        },
    };


    useEffect(() => {

        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100); // Optional delay to match sidebar animation
    }, [sidebarExpanded]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ReactApexChart
                ref={chartRef}
                options={chartData.options}
                series={chartData.series}
                type="line"
                height={350}
            />
        </div>
    );
};

export default LineChart;
