'use client'

import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export function OrtuChart({ logs }: { logs: any[] }) {
  if (logs.length === 0) return <p className="text-[#7a9484] text-sm text-center py-4">Belum ada data grafik</p>

  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const chartData = {
    labels: sortedLogs.map(l => new Date(l.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })),
    datasets: [{
      label: 'Kelancaran',
      data: sortedLogs.map(l => l.kelancaran),
      borderColor: '#2dd4a0',
      backgroundColor: 'rgba(45, 212, 160, 0.1)',
      fill: true,
      tension: 0.3,
      pointBackgroundColor: '#2dd4a0',
      pointRadius: 4
    }]
  }

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 5, ticks: { color: '#7a9484' }, grid: { color: 'rgba(45,212,160,0.05)' } },
      x: { ticks: { color: '#7a9484' }, grid: { display: false } }
    }
  }

  return <Line options={options} data={chartData} />
}