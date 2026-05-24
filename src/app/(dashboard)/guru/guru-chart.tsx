'use client'

import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export function GuruChart({ data }: { data: any[] }) {
  const chartData = {
    labels: data.map(d => d.nama.split(' ').pop()),
    datasets: [{
      label: 'Total Setoran',
      data: data.map(d => d.totalSetoran),
      backgroundColor: 'rgba(45, 212, 160, 0.3)',
      borderColor: '#2dd4a0',
      borderWidth: 1,
      borderRadius: 4
    }]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Aktivitas Setoran', color: '#7a9484' }
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: '#7a9484' }, grid: { color: 'rgba(45,212,160,0.1)' } },
      x: { ticks: { color: '#7a9484' }, grid: { display: false } }
    }
  }

  return <Bar options={options} data={chartData} />
}