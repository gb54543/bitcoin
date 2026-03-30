// 🔗 Mapeamento moedas → Binance
const pares = {
  bitcoin: "BTCUSDT",
  ethereum: "ETHUSDT",
  solana: "SOLUSDT",
  ripple: "XRPUSDT",
  cardano: "ADAUSDT"
};

let moedaAtual = "bitcoin";
let historico = [];
let widget = null;

// 📊 Criar gráfico
function criarGrafico(par) {
  document.getElementById("chart").innerHTML = "";

  widget = new TradingView.widget({
    width: "100%",
    height: 300,
    symbol: "BINANCE:" + par,
    interval: "1",
    theme: "dark",
    style: "1",
    container_id: "chart"
  });
}

// 💰 Pegar preço real
async function pegarPreco() {
  const par = pares[moedaAtual];

  const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${par}`);
  const data = await res.json();

  const preco = parseFloat(data.price);

  document.getElementById("preco").innerText =
    "$ " + preco.toLocaleString();

  analisar(preco);
}

// 🧠 Análise inteligente (melhorada)
function analisar(preco) {
  historico.push(preco);

  if (historico.length > 30) historico.shift();

  let media = historico.reduce((a, b) => a + b, 0) / historico.length;

  let direcao = preco > media ? "alta" : "baixa";

  let diff = ((preco - media) / media) * 100;
  let forca = Math.abs(diff);

  // 📊 Volatilidade
  let max = Math.max(...historico);
  let min = Math.min(...historico);
  let volatilidade = ((max - min) / min) * 100;

  // 🎯 Sinal
  let sinal = "";

  if (direcao === "alta" && forca > 0.3) {
    sinal = "🟢 Compra forte";
  } else if (direcao === "alta") {
    sinal = "🟢 Compra leve";
  } else if (direcao === "baixa" && forca > 0.3) {
    sinal = "🔴 Venda forte";
  } else {
    sinal = "🔴 Venda leve";
  }

  // 🧠 Confiança
  let confianca = "";

  if (forca > 0.5) confianca = "🔥 Alta";
  else if (forca > 0.2) confianca = "⚖️ Média";
  else confianca = "❄️ Baixa";

  // 🖥️ Atualizar tela
  document.getElementById("sinal").innerText = `Sinal: ${sinal}`;
  document.getElementById("tendencia").innerText = `Tendência: ${direcao}`;
  document.getElementById("forca").innerText = `Força: ${forca.toFixed(2)}%`;
  document.getElementById("volatilidade").innerText =
    `Volatilidade: ${volatilidade.toFixed(2)}% | Confiança: ${confianca}`;
}

  // 🎯 Lógica mais refinada
  if (direcao === "alta" && forca > 0.3) {
    sinal = "🟢 Compra forte (tendência de alta)";
  } 
  else if (direcao === "alta") {
    sinal = "🟢 Possível compra (alta leve)";
  }
  else if (direcao === "baixa" && forca > 0.3) {
    sinal = "🔴 Venda forte (tendência de baixa)";
  } 
  else {
    sinal = "🔴 Possível venda (baixa leve)";
  }

  // 🧠 Confiança
  let confianca = "";

  if (forca > 0.5) confianca = "🔥 Alta confiança";
  else if (forca > 0.2) confianca = "⚖️ Média confiança";
  else confianca = "❄️ Baixa confiança";

  document.getElementById("sinal").innerText =
    `${sinal}\n${confianca}`;
}

// 🔄 Trocar moeda
document.getElementById("moeda").addEventListener("change", (e) => {
  moedaAtual = e.target.value;
  historico = [];

  criarGrafico(pares[moedaAtual]);
  pegarPreco();
});

// 🚀 Inicializar
criarGrafico(pares[moedaAtual]);
pegarPreco();
setInterval(pegarPreco, 3000);
// ⏱️ Timer da vela (1 minuto)
function iniciarTimer() {
  setInterval(() => {
    const agora = new Date();

    const segundos = agora.getSeconds();
    const restante = 60 - segundos;

    const min = String(Math.floor(restante / 60)).padStart(2, "0");
    const sec = String(restante % 60).padStart(2, "0");

    document.getElementById("timer").innerText = `${min}:${sec}`;
  }, 1000);
}

iniciarTimer();
