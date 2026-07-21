// js/charts.js

function initConsumptionLineChart(container) {
  const canvas = container.querySelector('canvas');
  if (!canvas) return;

  const data = JSON.parse(container.dataset.values || '[]');
  const labels = JSON.parse(container.dataset.labels || '[]');
  const max = Math.max(...data);

  new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels.length ? labels : data.map((_, i) => i),
      datasets: [{
        data,
        borderColor: '#4e8fd1',
        borderWidth: 1.5,
        backgroundColor: 'transparent',
        pointBackgroundColor: data.map(v => v === 0 ? '#e74c3c' : v === max ? '#1e8449' : '#fff'),
        pointBorderColor: data.map(v => v === 0 ? '#e74c3c' : v === max ? '#1e8449' : '#4e8fd1'),
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true },
        x: { ticks: { maxRotation: 90, minRotation: 90, font: { size: 10 } } }
      }
    }
  });
}

function initConsumptionBarChart(container) {
  const canvas = container.querySelector('canvas');
  if (!canvas) return;

  const seriesA = JSON.parse(container.dataset.seriesA || '[]');
  const seriesB = JSON.parse(container.dataset.seriesB || '[]');
  const labels = seriesA.map((_, i) => i);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Текущий период', data: seriesA, backgroundColor: '#2e6da4', barPercentage: 0.9, categoryPercentage: 0.8 },
        { label: 'Предыдущий период', data: seriesB, backgroundColor: '#f4a63a', barPercentage: 0.9, categoryPercentage: 0.8 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, max: 12, ticks: { stepSize: 3 } } }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-chart="consumption-line"]').forEach(initConsumptionLineChart);
  document.querySelectorAll('[data-chart="consumption-bar"]').forEach(initConsumptionBarChart);
});