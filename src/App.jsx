import { useState, useEffect, useRef } from 'react'
import html2canvas from 'html2canvas'
import './App.css'

function App() {
  const [ano, definirAno] = useState(2026)
  const [mes, definirMes] = useState(4)
  const [logotipo, definirLogotipo] = useState(null)
  const [notas, definirNotas] = useState({})
  const [feriados, definirFeriados] = useState({})
  const [dataHora, setDataHora] = useState(new Date())
  
  const referenciaFolha = useRef(null)
  const referenciaAviso = useRef(null)

  const nomesDosMeses = [
    "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
    "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
  ]

  const diasDaSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"]

  useEffect(() => {
    const timer = setInterval(() => setDataHora(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const novosFeriados = {}
    const diasNoMes = new Date(ano, mes + 1, 0).getDate()

    for (let i = 1; i <= diasNoMes; i++) {
      const data = new Date(ano, mes, i)
      if (data.getDay() === 0) {
        novosFeriados[`${ano}-${mes}-${i}`] = true
      }
    }
    definirFeriados(novosFeriados)
  }, [ano, mes])

  const gerarCalendarioCompleto = () => {
    const primeiroDiaDoMes = new Date(ano, mes, 1).getDay()
    const diasNoMes = new Date(ano, mes + 1, 0).getDate()
    const calendario = []

    for (let i = 0; i < primeiroDiaDoMes; i++) {
      calendario.push({ dia: null, eDomingo: false, final: false })
    }

    for (let i = 1; i <= diasNoMes; i++) {
      const data = new Date(ano, mes, i)
      const indiceSemana = data.getDay()
      calendario.push({ 
        dia: i, 
        eDomingo: indiceSemana === 0,
        final: false
      })
    }

    const celulasRestantes = 42 - calendario.length
    for (let i = 0; i < celulasRestantes; i++) {
      calendario.push({ dia: null, eDomingo: false, final: true })
    }

    return calendario
  }

  const manipularTrocaDeLogotipo = (evento) => {
    const arquivo = evento.target.files[0]
    if (arquivo) {
      definirLogotipo(URL.createObjectURL(arquivo))
    }
  }

  const atualizarNota = (dia, valor) => {
    definirNotas(anterior => ({ ...anterior, [`${ano}-${mes}-${dia}`]: valor }))
  }

  const alternarFeriado = (dia) => {
    definirFeriados(anterior => ({ ...anterior, [`${ano}-${mes}-${dia}`]: !anterior[`${ano}-${mes}-${dia}`] }))
  }

  const aplicarEstilo = (comando, valor = null) => {
    document.execCommand(comando, false, valor)
  }

  const exportarComoImagem = async () => {
    if (referenciaFolha.current) {
      referenciaFolha.current.classList.add('modo-exportacao')
      const canvas = await html2canvas(referenciaFolha.current, {
        scale: 3, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff"
      })
      referenciaFolha.current.classList.remove('modo-exportacao')
      const link = document.createElement('a')
      link.download = `calendario-${nomesDosMeses[mes]}-${ano}.jpg`
      link.href = canvas.toDataURL('image/jpeg', 0.95)
      link.click()
    }
  }

  return (
    <div className="container-sistema">
      <header className="topo-site ocultar-na-impressao">
        <div className="marca-sistema">
          <span className="icone-sistema">⊕</span>
          <span className="nome-sistema">Odonto Care Calendar</span>
        </div>
        <div className="controles-topo">
          <select value={mes} onChange={(e) => definirMes(parseInt(e.target.value))}>
            {nomesDosMeses.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <input type="number" value={ano} onChange={(e) => definirAno(parseInt(e.target.value))} />
          <label className="botao-upload">
            Trocar Logo
            <input type="file" accept="image/*" onChange={manipularTrocaDeLogotipo} />
          </label>
          <button className="botao-imagem" onClick={exportarComoImagem}>Exportar JPG</button>
          <button className="botao-imprimir" onClick={() => window.print()}>Gerar PDF</button>
        </div>
      </header>

      <main className="area-impressao">
        <div className="folha-a4" ref={referenciaFolha}>
          <header className="cabecalho-calendario">
            <div className="area-logotipo-cliente">
              {logotipo ? (
                <img src={logotipo} alt="Logo Cliente" />
              ) : (
                <div className="marcador-logo ocultar-na-impressao">Logotipo</div>
              )}
            </div>
            
            <div className="titulo-mes">
              {nomesDosMeses[mes].substring(0, 3)}
            </div>
            
            <div className="titulo-ano">
              {ano}
            </div>
          </header>

          <div className="grade-calendario">
            <div className="cabecalho-grade">
              {diasDaSemana.map(d => <div key={d} className="dia-semana">{d}</div>)}
            </div>

            <div className="corpo-grade">
              {gerarCalendarioCompleto().map((item, indice) => {
                const chaveDia = `${ano}-${mes}-${item.dia}`
                const eFeriado = feriados[chaveDia]
                
                return (
                  <div 
                    key={indice} 
                    className={`celula-dia ${!item.dia && !item.final ? 'vazia-inicio' : ''} ${item.final ? 'vazia-final' : ''} ${eFeriado ? 'dia-feriado' : ''} ${item.eDomingo ? 'celula-domingo' : ''}`}
                  >
                    {item.dia && (
                      <>
                        <div className="cabecalho-dia">
                          <div className="info-data">
                            <span className="numero-dia">{item.dia}</span>
                          </div>
                          <input 
                            type="checkbox" 
                            className="marcador-feriado"
                            checked={eFeriado || false}
                            onChange={() => alternarFeriado(item.dia)}
                          />
                        </div>
                        <textarea
                          className="entrada-dia"
                          placeholder={!eFeriado ? "Adicionar texto..." : ""}
                          value={notas[chaveDia] || ""}
                          onChange={(e) => atualizarNota(item.dia, e.target.value)}
                          disabled={eFeriado}
                        />
                        {eFeriado && <div className="risco-diagonal"></div>}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <footer className="rodape-calendario">
            <div className="barra-ferramentas-aviso ocultar-na-impressao">
              <button onClick={() => aplicarEstilo('bold')}>B</button>
              <button onClick={() => aplicarEstilo('italic')}>I</button>
              <button onClick={() => aplicarEstilo('underline')}>U</button>
              <button onClick={() => aplicarEstilo('justifyLeft')}>←</button>
              <button onClick={() => aplicarEstilo('justifyCenter')}>↔</button>
              <button onClick={() => aplicarEstilo('justifyRight')}>→</button>
              <button onClick={() => aplicarEstilo('fontSize', '5')}>A+</button>
              <button onClick={() => aplicarEstilo('fontSize', '3')}>A-</button>
            </div>
            <div className="area-avisos">
              <div 
                className="editor-aviso"
                contentEditable="true"
                ref={referenciaAviso}
                data-placeholder="Adicionar aviso importante aqui..."
              ></div>
            </div>
          </footer>
        </div>
      </main>

      <footer className="footer-geral ocultar-na-impressao">
        <div className="footer-conteudo">
          <span>{dataHora.toLocaleDateString()} - {dataHora.toLocaleTimeString()}</span>
          <span className="divisor">|</span>
          <span>Desenvolvido por: <strong>Everscript</strong></span>
        </div>
      </footer>
    </div>
  )
}

export default App