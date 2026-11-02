import { useEffect, useMemo, useRef } from 'react'
import { Chart } from '../model/chartSetup'
import { calcularEscala, formatarNumero, lerCores } from '../model/formato'
import styles from './graficos.module.css'

const pluginValores = {
  id: 'valoresBarras',
  afterDatasetsDraw(grafico, _argumentos, opcoes) {
    if (!opcoes || opcoes.ativo === false) {
      return
    }

    const { ctx } = grafico

    ctx.save()
    ctx.font = '600 10px "Roboto", Arial, sans-serif'
    ctx.fillStyle = opcoes.cor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'

    grafico.data.datasets.forEach((dataset, indiceDataset) => {
      grafico.getDatasetMeta(indiceDataset).data.forEach((elemento, indice) => {
        const valor = Number(dataset.data[indice] || 0)

        if (valor <= 0) {
          return
        }

        const topoBarra = elemento.y - 5

        if (topoBarra < 2) {
          return
        }

        ctx.fillText(opcoes.formatar(valor), elemento.x, topoBarra)
      })
    })

    ctx.restore()
  },
}

function GraficoBarras({
  rotulos = [],
  series = [],
  tema,
  altura = 180,
  ariaLabel = 'Gráfico de barras',
}) {
  const canvasRef = useRef(null)
  const areaRef = useRef(null)
  const vazio = !rotulos.length || !series.length

  const chave = useMemo(
    () => JSON.stringify({ rotulos, series }),
    [rotulos, series],
  )

  useEffect(() => {
    if (vazio || !canvasRef.current || !areaRef.current) {
      return undefined
    }

    const cores = lerCores(areaRef.current)
    const maiorValor = Math.max(
      0,
      ...series.flatMap((serie) => serie.valores.map((valor) => Number(valor) || 0)),
    )
    const { passo, topo } = calcularEscala(maiorValor)

    const grafico = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: rotulos,
        datasets: series.map((serie) => ({
          label: serie.rotulo,
          data: serie.valores,
          backgroundColor: cores[serie.cor] || cores.vermelho,
          borderRadius: 2,
          borderSkipped: false,
          barPercentage: 0.82,
          categoryPercentage: 0.62,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        layout: {
          padding: { top: 22 },
        },
        scales: {
          x: {
            border: { color: cores.grade },
            grid: { display: false },
            ticks: {
              color: cores.secundario,
              font: { size: 10 },
              maxRotation: 0,
            },
          },
          y: {
            beginAtZero: true,
            max: topo,
            border: { display: false },
            grid: { color: cores.grade },
            ticks: {
              color: cores.secundario,
              font: { size: 10 },
              stepSize: passo,
              callback: (valor) => formatarNumero(valor),
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (contexto) => (
                `${contexto.dataset.label}: ${formatarNumero(contexto.parsed.y)}`
              ),
            },
          },
          valoresBarras: {
            ativo: true,
            cor: cores.texto,
            formatar: formatarNumero,
          },
        },
      },
      plugins: [pluginValores],
    })

    return () => grafico.destroy()
  }, [chave, tema, vazio]) // eslint-disable-line react-hooks/exhaustive-deps

  if (vazio) {
    return (
      <div className={styles.graficoVazio} style={{ minHeight: altura }}>
        Sem dados no período.
      </div>
    )
  }

  return (
    <div className={styles.areaGrafico} style={{ height: altura }} ref={areaRef}>
      <canvas ref={canvasRef} role="img" aria-label={ariaLabel} />
    </div>
  )
}

export default GraficoBarras
