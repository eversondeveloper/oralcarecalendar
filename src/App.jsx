import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import "./App.css";

import unidade1 from "/unidade1.png";
import unidade2 from "/unidade2.png";

function App() {
  const [ano, definirAno] = useState(2026);
  const [mes, definirMes] = useState(4);

  const [logotipo, definirLogotipo] = useState(unidade1);

  const [logotiposLista, setLogotiposLista] = useState([
    unidade1,
    unidade2,
  ]);

  const [notas, definirNotas] = useState({});
  const [feriados, definirFeriados] = useState({});
  const [dataHora, setDataHora] = useState(new Date());
  const [limiteExcedido, setLimiteExcedido] = useState(false);
  const [avisoVisivel, setAvisoVisivel] = useState(false);

  const referenciaFolha = useRef(null);
  const referenciaAviso = useRef(null);

  const nomesDosMeses = [
    "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
    "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
  ];

  const diasDaSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

  useEffect(() => {
    const timer = setInterval(() => setDataHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const ehDomingo = (dia) => {
    const data = new Date(ano, mes, dia);
    return data.getDay() === 0;
  };

  useEffect(() => {
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const feriadosAutomaticos = {};
    
    for (let dia = 1; dia <= diasNoMes; dia++) {
      if (ehDomingo(dia)) {
        const chave = `${ano}-${mes}-${dia}`;
        feriadosAutomaticos[chave] = true;
      }
    }
    
    definirFeriados(feriadosAutomaticos);
    
    definirNotas((anterior) => {
      const novoEstado = { ...anterior };
      for (let dia = 1; dia <= diasNoMes; dia++) {
        if (ehDomingo(dia)) {
          const chave = `${ano}-${mes}-${dia}`;
          delete novoEstado[chave];
        }
      }
      return novoEstado;
    });
  }, [ano, mes]);

  const verificarLimiteTexto = () => {
    if (referenciaAviso.current) {
      const el = referenciaAviso.current;
      const alturaMaxima = el.parentElement.clientHeight - 20;
      const alturaAtual = el.scrollHeight;
      const excedeu = alturaAtual > alturaMaxima;
      
      setLimiteExcedido(excedeu);
      
      if (excedeu) {
        setAvisoVisivel(true);
        setTimeout(() => {
          setAvisoVisivel(false);
        }, 2000);
      } else {
        setAvisoVisivel(false);
      }
    }
  };

  const gerarCalendarioCompleto = () => {
    const primeiroDiaDoMes = new Date(ano, mes, 1).getDay();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const calendario = [];

    for (let i = 0; i < primeiroDiaDoMes; i++) {
      calendario.push({ dia: null, final: false });
    }

    for (let i = 1; i <= diasNoMes; i++) {
      calendario.push({ dia: i, final: false });
    }

    const celulasRestantes = 42 - calendario.length;
    for (let i = 0; i < celulasRestantes; i++) {
      calendario.push({ dia: null, final: true });
    }

    return calendario;
  };

  const adicionarNovoLogotipo = (evento) => {
    const arquivo = evento.target.files[0];
    if (arquivo) {
      const url = URL.createObjectURL(arquivo);
      setLogotiposLista((prev) => [...prev, url]);
      definirLogotipo(url);
    }
  };

  const atualizarNota = (dia, valor) => {
    const chave = `${ano}-${mes}-${dia}`;
    if (feriados[chave]) {
      return;
    }
    definirNotas((anterior) => ({
      ...anterior,
      [chave]: valor,
    }));
  };

  const alternarFeriado = (dia) => {
    const chave = `${ano}-${mes}-${dia}`;
    const seraFeriado = !feriados[chave];

    definirFeriados((anterior) => ({
      ...anterior,
      [chave]: seraFeriado,
    }));

    if (seraFeriado) {
      definirNotas((anterior) => {
        const novoEstado = { ...anterior };
        delete novoEstado[chave];
        return novoEstado;
      });
    }
  };

  const aplicarEstilo = (comando, valor = null) => {
    document.execCommand(comando, false, valor);
    setTimeout(verificarLimiteTexto, 10);
  };

  const ativarEdicaoAviso = () => {
    if (referenciaAviso.current) {
      referenciaAviso.current.focus();
    }
  };

  const handleAvisoInput = (e) => {
    verificarLimiteTexto();
  };

  const handleAvisoKeyDown = (e) => {
    if (limiteExcedido) {
      const teclaPermitida = e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Home' || e.key === 'End';
      
      if (!teclaPermitida) {
        e.preventDefault();
      }
    }
  };

  const exportarComoImagem = async () => {
    if (referenciaFolha.current) {
      referenciaFolha.current.classList.add("modo-exportacao");
      const canvas = await html2canvas(referenciaFolha.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });
      referenciaFolha.current.classList.remove("modo-exportacao");
      const link = document.createElement("a");
      link.download = `calendario-${nomesDosMeses[mes]}-${ano}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
    }
  };

  return (
    <div className="container-sistema">
      <header className="topo-site ocultar-na-impressao">
        <div className="marca-sistema">
          <span className="icone-sistema">⊕</span>
          <span className="nome-sistema">Oral Care Calendar</span>
        </div>
        <div className="controles-topo">
          <select
            value={mes}
            onChange={(e) => definirMes(parseInt(e.target.value))}
          >
            {nomesDosMeses.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>
          <input
            type="number"
            value={ano}
            onChange={(e) => definirAno(parseInt(e.target.value))}
          />
        </div>
      </header>

      <div className="layout-principal">
        <aside className="seletor-instrucoes ocultar-na-impressao">
          <h3>📋 COMO USAR</h3>
          <div className="passo-container">
            <div className="passo-card">
              <div className="passo-numero">1</div>
              <div className="passo-conteudo">
                <strong>ESCOLHA A DATA</strong>
                <p>Selecione o mês e o ano no topo da página para gerar o calendário desejado</p>
              </div>
            </div>

            <div className="passo-card">
              <div className="passo-numero">2</div>
              <div className="passo-conteudo">
                <strong>SELECIONE A UNIDADE</strong>
                <p>Na lateral direita, escolha qual unidade irá utilizar o calendário</p>
              </div>
            </div>

            <div className="passo-card">
              <div className="passo-numero">3</div>
              <div className="passo-conteudo">
                <strong>MARCAR FERIADOS</strong>
                <p>Use o checkbox em cada dia para marcar quando o estabelecimento estiver fechado. Você pode marcar e desmarcar à vontade</p>
              </div>
            </div>

            <div className="passo-card">
              <div className="passo-numero">4</div>
              <div className="passo-conteudo">
                <strong>ADICIONAR PROCEDIMENTOS</strong>
                <p>Clique em qualquer dia do calendário e escreva os procedimentos que serão realizados</p>
              </div>
            </div>

            <div className="passo-card">
              <div className="passo-numero">5</div>
              <div className="passo-conteudo">
                <strong>INSERIR AVISO</strong>
                <p>Na área de aviso no rodapé, escreva informações importantes (deixe em branco se não houver)</p>
              </div>
            </div>

            <div className="passo-card">
              <div className="passo-numero">6</div>
              <div className="passo-conteudo">
                <strong>EXPORTAR</strong>
                <p>Clique em "Exportar PNG" ou "Gerar PDF" para salvar o calendário</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="area-impressao">
          <div className="folha-a4" ref={referenciaFolha}>
            <header className="cabecalho-calendario">
              <div className="area-logotipo-cliente">
                <img src={logotipo} alt="Logo Cliente" />
              </div>
              <div className="titulo-mes">
                {nomesDosMeses[mes].substring(0, 3)}
              </div>
              <div className="titulo-ano">{ano}</div>
            </header>

            <div className="grade-calendario">
              <div className="cabecalho-grade">
                {diasDaSemana.map((d) => (
                  <div key={d} className="dia-semana">{d}</div>
                ))}
              </div>

              <div className="corpo-grade">
                {gerarCalendarioCompleto().map((item, indice) => {
                  const chaveDia = `${ano}-${mes}-${item.dia}`;
                  const eFeriado = feriados[chaveDia] || false;
                  const temTexto = notas[chaveDia] && notas[chaveDia].trim() !== "";
                  const valorNota = eFeriado ? "" : (notas[chaveDia] || "");

                  return (
                    <div
                      key={indice}
                      className={`celula-dia 
                        ${!item.dia && !item.final ? "vazia-inicio" : ""} 
                        ${item.final ? "vazia-final" : ""} 
                        ${eFeriado ? "dia-feriado" : ""} 
                        ${temTexto ? "preenchido" : ""}`}
                    >
                      {item.dia && (
                        <>
                          <div className="cabecalho-dia">
                            <div className="info-data">
                              <span className="numero-dia">{item.dia}</span>
                            </div>
                            <input
                              type="checkbox"
                              className="marcador-feriado ocultar-na-impressao"
                              checked={eFeriado}
                              onChange={() => alternarFeriado(item.dia)}
                            />
                          </div>
                          <textarea
                            className={`entrada-dia ${eFeriado ? "feriado-ativo" : ""}`}
                            placeholder={eFeriado ? "" : "Clique aqui para adicionar texto..."}
                            value={valorNota}
                            onChange={(e) => atualizarNota(item.dia, e.target.value)}
                            disabled={eFeriado}
                          />
                          {eFeriado && <div className="risco-diagonal"></div>}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <footer className="rodape-calendario">
              <div className="barra-ferramentas-aviso ocultar-na-impressao">
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => aplicarEstilo("bold")}>B</button>
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => aplicarEstilo("italic")}>I</button>
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => aplicarEstilo("underline")}>U</button>
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => aplicarEstilo("justifyLeft")}>←</button>
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => aplicarEstilo("justifyCenter")}>↔</button>
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => aplicarEstilo("justifyRight")}>→</button>
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => aplicarEstilo("fontSize", "5")}>A+</button>
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => aplicarEstilo("fontSize", "3")}>A-</button>
              </div>
              <div
                className={`area-avisos ${limiteExcedido ? "limite-atingido" : ""}`}
                onClick={ativarEdicaoAviso}
                style={{ 
                  cursor: "text", 
                  position: "relative"
                }}
              >
                {avisoVisivel && (
                  <span className="aviso-limite" style={{
                    position: "absolute",
                    bottom: "5px",
                    right: "10px",
                    background: "#e74c3c",
                    color: "white",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    zIndex: 10,
                    pointerEvents: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    animation: "fadeInOut 2s ease"
                  }}>
                    ⚠️ Limite atingido
                  </span>
                )}
                <div
                  ref={referenciaAviso}
                  contentEditable="true"
                  onInput={handleAvisoInput}
                  onKeyDown={handleAvisoKeyDown}
                  data-placeholder="Escreva aqui o aviso importante (deixe em branco se não houver)..."
                  style={{
                    width: "100%",
                    outline: "none",
                    textAlign: "center",
                    fontSize: "16px",
                    color: "black",
                    lineHeight: "1.4",
                    cursor: "text",
                    overflowY: "auto",
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                    minHeight: "100%"
                  }}
                ></div>
              </div>
            </footer>
          </div>
          
          <div className="botoes-exportacao ocultar-na-impressao">
            <button className="botao-imagem" onClick={exportarComoImagem}>
              📸 EXPORTAR PNG
            </button>
            <button className="botao-imprimir" onClick={() => window.print()}>
              📄 GERAR PDF
            </button>
          </div>
        </main>

        <aside className="seletor-logotipos ocultar-na-impressao">
          <h3>🏢 UNIDADES</h3>
          <div className="lista-logotipos">
            {logotiposLista.map((url, index) => (
              <button
                key={index}
                className={`item-logotipo ${logotipo === url ? "ativo" : ""}`}
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

      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(10px); }
          15% { opacity: 1; transform: translateX(0); }
          85% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
}

export default App;