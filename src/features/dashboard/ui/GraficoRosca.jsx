import { useEffect, useRef } from 'react'
import { Chart } from '../model/chartSetup'
import { formatarNumero, lerCores } from '../model/formato'
import styles from './graficos.module.css'

function GraficoRosca({ ativos = 0, inativos = 0, percentual = 0, tema }) {
  const canvasRef = useRef(null)
  const areaRef = useRef(null)
  const quantidadeAtivos = Number(ativos) || 0
  const quantidadeInativos = Number(inativos) || 0
  const total = quantidadeAtivos + quantidadeInativos

  useEffect(() => {
    if (!canvasRef.current || !areaRef.current) {
      return undefined
    }

    const cores = lerCores(areaRef.current)

    const grafico = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Ativos', 'Inativos'],
        datasets: [{
          data: total > 0 ? [quantidadeAtivos, quantidadeInativos] : [1, 0],
          backgroundColor: total > 0
            ? [cores.verde, cores.vermelho]
            : [cores.grade, cores.grade],
          borderWidth: 0,
          hoverOffset: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: total > 0,
            callbacks: {
              label: (contexto) => `${contexto.label}: ${formatarNumero(contexto.parsed)}`,
            },
          },
        },
      },
    })

    return () => grafico.destroy()
  }, [quantidadeAtivos, quantidadeInativos, total, tema])

  return (
    <div className={styles.rosca} ref={areaRef}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`${Math.round(Number(percentual) || 0)}% dos insumos estão ativos`}
      />
      <div className={styles.roscaCentro}>
        <strong>{Math.round(Number(percentual) || 0)}%</strong>
        <span>ativos</span>
      </div>
    </div>
  )
}

export default GraficoRosca
