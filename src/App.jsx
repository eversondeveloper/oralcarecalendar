import { useState, useEffect, useRef } from 'react'
import html2canvas from 'html2canvas'
import './App.css'

// Importando as imagens para que o Vite reconheça os caminhos corretamente
import unidade1 from '/public/unidade1.png'
import unidade2 from '/public/unidade2.png'
import unidade3 from '/public/unidade3.png'
import unidade4 from '/public/unidade4.png'

function App() {
  const [ano, definirAno] = useState(2026)
  const [mes, definirMes] = useState(4)
  
  // Define a Unidade 1 importada como padrão
  const [logotipo, definirLogotipo] = useState(unidade1)
  
  // Lista inicial usando as variáveis importadas
  const [logotiposLista, setLogotiposLista] = useState([
    unidade1,
    unidade2,
    unidade3,
    unidade4
  ])
  
  const [notas, definirNotas] = useState({})
  const [feriados, definirFeriados] = useState({})
  const [dataHora, setDataHora] = useState(new Date())
  const [limiteExcedido, setLimiteExcedido] = useState(false)
  
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

  const verificarLimiteTexto = () => {
    if (referenciaAviso.current) {
      const el = referenciaAviso.current
      const excedeu = el.scrollHeight > el.clientHeight
      setLimiteExcedido(excedeu)
    }
  }

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

  const adicionarNovoLogotipo = (evento) => {
    const arquivo = evento.target.files[0]
    if (arquivo) {
      const url = URL.createObjectURL(arquivo)
      setLogotiposLista(prev => [...prev, url])
      definirLogotipo(url)
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
    setTimeout(verificarLimiteTexto, 10)
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
      link.download = `calendario-${nomesDosMeses[mes]}-${ano}.png`
      link.href = canvas.toDataURL('image/png', 1.0)
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
          <button className="botao-imagem" onClick={exportarComoImagem}>Exportar PNG</button>
          <button className="botao-imprimir" onClick={() => window.print()}>Gerar PDF</button>
        </div>
      </header>

      <div className="layout-principal">
        <main className="area-impressao">
          <div className="folha-a4" ref={referenciaFolha}>
            <header className="cabecalho-calendario">
              <div className="area-logotipo-cliente">
                <img src={logotipo} alt="Logo Cliente" />
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
              <div className={`area-avisos ${limiteExcedido ? 'limite-atingido' : ''}`}>
                {limiteExcedido && <span className="aviso-limite ocultar-na-impressao">Limite de texto atingido!</span>}
                <div 
                  className="editor-aviso"
                  contentEditable="true"
                  ref={referenciaAviso}
                  onInput={verificarLimiteTexto}
                  data-placeholder="Adicionar aviso importante aqui..."
                ></div>
              </div>
            </footer>
          </div>
        </main>

        <aside className="seletor-logotipos ocultar-na-impressao">
          <h3>Unidades</h3>
          <div className="lista-logotipos">
            {logotiposLista.map((url, index) => (
              <button 
                key={index} 
                className={`item-logotipo ${logotipo === url ? 'ativo' : ''}`}
                onClick={() => definirLogotipo(url)}
              >
                <img src={url} alt={`Unidade ${index + 1}`} />
              </button>
            ))}
            <label className="botao-adicionar-logo">
              <span>+</span>
              <input type="file" accept="image/*" onChange={adicionarNovoLogotipo} />
            </label>
          </div>
        </aside>
      </div>

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