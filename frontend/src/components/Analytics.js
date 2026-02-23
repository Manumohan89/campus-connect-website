import React, { useEffect } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

function Analytics() {
  useEffect(() => {
    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Semester 1', 'Semester 2', 'Semester 3'],
        datasets: [{
          label: 'SGPA',
          data: [8.5, 8.7, 9.0],
          borderColor: 'rgba(75, 192, 192, 1)',
          fill: false,
        }],
      },
    });
  }, []);

  return (
    <div className="analytics-page">
      <h2>Your Academic Progress</h2>
      <canvas id="myChart"></canvas>
    </div>
  );
}

export default Analytics;
