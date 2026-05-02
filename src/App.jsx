import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import "./App.css";

import unidade1 from "/unidade1.png";
import unidade2 from "/unidade2.png";
import logo1 from "/logo1.png";

import back1 from "/back1.jpg";
import backfolha2 from "/backfolha2.jpg";
import backfolha3 from "/backfolha3.jpg";
import backfolha4 from "/backfolha4.jpg";
import backfolha5 from "/backfolha5.jpg";
import backfolha6 from "/backfolha6.jpg";
import backfolha7 from "/backfolha7.jpg";
import backfolha8 from "/backfolha8.jpg";
import backfolha9 from "/backfolha9.jpg";
import backfolha10 from "/backfolha10.jpg";

function App() {
  const [ano, definirAno] = useState(2026);
  const [mes, definirMes] = useState(4);

  const [logotipo, definirLogotipo] = useState(unidade1);

  const [logotiposLista, setLogotiposLista] = useState([unidade1, unidade2]);

  const [backgroundAtual, setBackgroundAtual] = useState(back1);

  const backgroundsDisponiveis = [
    { id: 1, nome: "Padrão", arquivo: back1, miniatura: back1 },
    { id: 2, nome: "Background 2", arquivo: backfolha2, miniatura: backfolha2 },
    { id: 3, nome: "Background 3", arquivo: backfolha3, miniatura: backfolha3 },
    { id: 4, nome: "Background 4", arquivo: backfolha4, miniatura: backfolha4 },
    { id: 5, nome: "Background 5", arquivo: backfolha5, miniatura: backfolha5 },
    { id: 6, nome: "Background 6", arquivo: backfolha6, miniatura: backfolha6 },
    { id: 7, nome: "Background 7", arquivo: backfolha7, miniatura: backfolha7 },
    { id: 8, nome: "Background 8", arquivo: backfolha8, miniatura: backfolha8 },
    { id: 9, nome: "Background 9", arquivo: backfolha9, miniatura: backfolha9 },
    {
      id: 10,
      nome: "Background 10",
      arquivo: backfolha10,
      miniatura: backfolha10,
    },
  ];

  const [notas, definirNotas] = useState({});
  const [feriados, definirFeriados] = useState({});
  const [dataHora, setDataHora] = useState(new Date());
  const [limiteExcedido, setLimiteExcedido] = useState(false);
  const [avisoVisivel, setAvisoVisivel] = useState(false);
  const [avisoHTML, setAvisoHTML] = useState("");

  const referenciaFolha = useRef(null);
  const referenciaAviso = useRef(null);

  const nomesDosMeses = [
    "JANEIRO",
    "FEVEREIRO",
    "MARÇO",
    "ABRIL",
    "MAIO",
    "JUNHO",
    "JULHO",
    "AGOSTO",
    "SETEMBRO",
    "OUTUBRO",
    "NOVEMBRO",
    "DEZEMBRO",
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
    setTimeout(() => {
      if (referenciaAviso.current) {
        setAvisoHTML(referenciaAviso.current.innerHTML);
      }
    }, 20);
  };

  const ativarEdicaoAviso = () => {
    if (referenciaAviso.current) {
      referenciaAviso.current.focus();
    }
  };

  const handleAvisoInput = (e) => {
    verificarLimiteTexto();
    if (referenciaAviso.current) {
      setAvisoHTML(referenciaAviso.current.innerHTML);
    }
  };

  const handleAvisoKeyDown = (e) => {
    if (limiteExcedido) {
      const teclaPermitida =
        e.key === "Backspace" ||
        e.key === "Delete" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "Home" ||
        e.key === "End";

      if (!teclaPermitida) {
        e.preventDefault();
      }
    }
  };

  const trocarBackground = (arquivo) => {
    setBackgroundAtual(arquivo);
  };

  const formatarTextoComQuebras = (texto) => {
    if (!texto) return "";
    return texto.split("\n").map((linha, i) => (
      <React.Fragment key={i}>
        {linha}
        {i < texto.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const exportarComoImagem = async () => {
    if (referenciaFolha.current) {
      referenciaFolha.current.classList.add("modo-exportacao");

      const elementoParaExportar = referenciaFolha.current.cloneNode(true);

      const textareas = elementoParaExportar.querySelectorAll(".entrada-dia");
      textareas.forEach((textarea) => {
        const valor = textarea.value;
        if (valor && textarea.parentElement) {
          const divVisualizacao = document.createElement("div");
          divVisualizacao.className = "entrada-dia-visualizacao";
          divVisualizacao.style.cssText = textarea.style.cssText;
          divVisualizacao.style.whiteSpace = "pre-wrap";
          divVisualizacao.style.wordWrap = "break-word";
          divVisualizacao.style.overflow = "auto";
          divVisualizacao.style.height = "100%";
          divVisualizacao.style.display = "flex";
          divVisualizacao.style.alignItems = "center";
          divVisualizacao.style.justifyContent = "center";
          divVisualizacao.style.textAlign = "center";

          const linhas = valor.split("\n");
          linhas.forEach((linha, index) => {
            if (index > 0) {
              divVisualizacao.appendChild(document.createElement("br"));
            }
            divVisualizacao.appendChild(document.createTextNode(linha));
          });

          textarea.style.display = "none";
          textarea.parentElement.appendChild(divVisualizacao);
        }
      });

      const avisoOriginal = elementoParaExportar.querySelector(".editor-aviso");
      if (avisoOriginal && avisoOriginal.innerHTML) {
        const divAviso = document.createElement("div");
        divAviso.className = "editor-aviso-visualizacao";
        divAviso.style.cssText = avisoOriginal.style.cssText;
        divAviso.style.whiteSpace = "pre-wrap";
        divAviso.style.wordWrap = "break-word";
        divAviso.innerHTML = avisoOriginal.innerHTML;
        avisoOriginal.style.display = "none";
        avisoOriginal.parentElement.appendChild(divAviso);
      }

      document.body.appendChild(elementoParaExportar);
      elementoParaExportar.style.position = "absolute";
      elementoParaExportar.style.left = "-9999px";
      elementoParaExportar.style.top = "-9999px";

      const canvas = await html2canvas(elementoParaExportar, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      document.body.removeChild(elementoParaExportar);
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
          <img src={logo1} alt="Logo" className="logo-sistema" />
          <span className="nome-sistema">Oral Care Calendar</span>
        </div>
        <div className="controles-topo">
          <select
            value={mes}
            onChange={(e) => definirMes(parseInt(e.target.value))}
          >
            {nomesDosMeses.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
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
          <h3>📋 GUIA RÁPIDO</h3>
          <div className="passo-container">
            <div className="passo-card">
              <div className="passo-numero">1</div>
              <div className="passo-conteudo">
                <strong>1. DEFINIR PERÍODO</strong>
                <p>
                  Utilize os seletores no topo da página para escolher o mês e o
                  ano de referência.
                </p>
              </div>
            </div>

            <div className="passo-card">
              <div className="passo-numero">2</div>
              <div className="passo-conteudo">
                <strong>2. INDICAR FERIADOS</strong>
                <p>
                  Marque a caixa de seleção nos dias específicos para sinalizar
                  pontos facultativos ou data de fechamento.
                </p>
              </div>
            </div>

            <div className="passo-card">
              <div className="passo-numero">3</div>
              <div className="passo-conteudo">
                <strong>3. REGISTRAR PROCEDIMENTOS</strong>
                <p>
                  Clique sobre qualquer dia do calendário e insira as
                  informações dos atendimentos ou atividades agendadas.
                </p>
              </div>
            </div>

            <div className="passo-card">
              <div className="passo-numero">4</div>
              <div className="passo-conteudo">
                <strong>4. INSERIR OBSERVAÇÕES</strong>
                <p>
                  Use o campo "Avisos" no rodapé para adicionar lembretes ou
                  comunicados gerais.
                </p>
              </div>
            </div>

            <div className="passo-card">
              <div className="passo-numero">5</div>
              <div className="passo-conteudo">
                <strong>5. SELECIONAR UNIDADE</strong>
                <p>
                  Escolha a unidade operacional que utilizará o calendário para
                  personalizar o cabeçalho.
                </p>
              </div>
            </div>

            <div className="passo-card">
              <div className="passo-numero">6</div>
              <div className="passo-conteudo">
                <strong>6. EXPORTAR DOCUMENTO</strong>
                <p>Finalize gerando uma imagem.</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="area-impressao">
          <div
            className="folha-a4"
            ref={referenciaFolha}
            style={{
              backgroundImage: `url('${backgroundAtual}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
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
                  <div key={d} className="dia-semana">
                    {d}
                  </div>
                ))}
              </div>

              <div className="corpo-grade">
                {gerarCalendarioCompleto().map((item, indice) => {
                  const chaveDia = `${ano}-${mes}-${item.dia}`;
                  const eFeriado = feriados[chaveDia] || false;
                  const temTexto =
                    notas[chaveDia] && notas[chaveDia].trim() !== "";
                  const valorNota = eFeriado ? "" : notas[chaveDia] || "";

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
                            placeholder={
                              eFeriado
                                ? ""
                                : "Clique aqui para adicionar texto..."
                            }
                            value={valorNota}
                            onChange={(e) =>
                              atualizarNota(item.dia, e.target.value)
                            }
                            disabled={eFeriado}
                            style={{
                              whiteSpace: "pre-wrap",
                              wordWrap: "break-word",
                            }}
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
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => aplicarEstilo("bold")}
                >
                  B
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => aplicarEstilo("italic")}
                >
                  I
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => aplicarEstilo("underline")}
                >
                  U
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => aplicarEstilo("justifyLeft")}
                >
                  ←
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => aplicarEstilo("justifyCenter")}
                >
                  ↔
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => aplicarEstilo("justifyRight")}
                >
                  →
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => aplicarEstilo("fontSize", "5")}
                >
                  A+
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => aplicarEstilo("fontSize", "3")}
                >
                  A-
                </button>
              </div>
              <div
                className={`area-avisos ${limiteExcedido ? "limite-atingido" : ""}`}
                onClick={ativarEdicaoAviso}
                style={{
                  cursor: "text",
                  position: "relative",
                }}
              >
                {avisoVisivel && (
                  <span
                    className="aviso-limite"
                    style={{
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
                      animation: "fadeInOut 2s ease",
                    }}
                  >
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
                    whiteSpace: "pre-wrap",
                    minHeight: "100%",
                  }}
                ></div>
              </div>
            </footer>
          </div>

          <div className="botoes-exportacao ocultar-na-impressao">
            <button className="botao-imagem" onClick={exportarComoImagem}>
              📸 EXPORTAR IMAGEM
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
              <input
                type="file"
                accept="image/*"
                onChange={adicionarNovoLogotipo}
              />
            </label>
          </div>

          <div className="seletor-background">
            <h3>🎨 FUNDO DA FOLHA</h3>
            <div className="lista-backgrounds">
              {backgroundsDisponiveis.map((bg) => (
                <button
                  key={bg.id}
                  className={`item-background ${backgroundAtual === bg.arquivo ? "ativo" : ""}`}
                  onClick={() => trocarBackground(bg.arquivo)}
                  title={bg.nome}
                >
                  <div className="miniatura-background">
                    <img src={bg.miniatura} alt={bg.nome} />
                    <div className="miniatura-overlay">
                      <span>{bg.nome}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <footer className="footer-geral ocultar-na-impressao">
        <div className="footer-conteudo">
          <span>
            {dataHora.toLocaleDateString()} - {dataHora.toLocaleTimeString()}
          </span>
          <span className="divisor">|</span>
          <span>
            Desenvolvido por: <strong>Everscript</strong>
          </span>
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