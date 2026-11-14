import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  LinearScale,
  Tooltip,
} from 'chart.js'

Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  LinearScale,
  Tooltip,
)

Chart.defaults.font.family = '"Roboto", Arial, sans-serif'
Chart.defaults.font.size = 11

export { Chart }
