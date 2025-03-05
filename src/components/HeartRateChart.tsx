// import React from 'react';
// import { Line } from 'react-chartjs-2';
// import { HeartRate } from '../types';
// import { formatDate } from 'date-fns';

// export const HeartRateChart = React.memo(({ data }: { data: HeartRate[] }) => {
//     const chartData = {
//         labels: data.map(d => formatDate(d.timestamp)),
//         datasets: [{
//             label: 'Heart Rate (BPM)',
//             data: data.map(d => d.value),
//             borderColor: '#f87171',
//             fill: false,
//         }]
//     };

//     return <Line data={chartData} />;
// });
