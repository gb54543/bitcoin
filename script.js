// 🔗 Moedas
const pares = {
  bitcoin: "BTCUSDT",
  ethereum: "ETHUSDT",
  solana: "SOLUSDT",
  ripple: "XRPUSDT",
  cardano: "ADAUSDT"
};

let moedaAtual = "bitcoin";
let historico = [];

// 📊 Criar gráfico com segurança
function criarGrafico(par) {
  const el = document.getElementById("chart");
  if (!el) return;

  el.innerHTML = "";

  if (typeof TradingView === "undefined") {
    console.log("TradingView não carregou ainda...");
    return;
  }

  new TradingView.widget({
    width: "100%",
    height: 300,
    symbol: "BINANCE:" + par,
    interval: "1",
    theme: "dark",
    container_id: "chart"
  });
}

// 💰 Preço
async function pegarPreco() {
  try {
    const par = pares[moedaAtual];

    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${par}`);
    const data = await res.json();

    const preco = parseFloat(data.price);

    const el = document.getElementById("preco");
    if (el) {
      el.innerText = "$ " + preco.toLocaleString();
    }

    analisar(preco);

  } catch (erro) {
    console.log("Erro API:", erro);
  }
}

// 🧠 Análise
function analisar(preco) {
  historico.push(preco);
  if (historico.length > 30) historico.shift();

  let media = historico.reduce((a, b) => a + b, 0) / historico.length;

  let direcao = preco > media ? "Alta" : "Baixa";
  let diff = ((preco - media) / media) * 100;
  let forca = Math.abs(diff);

  let sinal = "";

  if (direcao === "Alta" && forca > 0.3) {
    sinal = "🟢 Compra forte";
  } else if (direcao === "Alta") {
    sinal = "🟢 Compra leve";
  } else if (direcao === "Baixa" && forca > 0.3) {
    sinal = "🔴 Venda forte";
  } else {
    sinal = "🔴 Venda leve";
  }

  let confianca = forca > 0.5 ? "🔥 Alta" : forca > 0.2 ? "⚖️ Média" : "❄️ Baixa";

  const el = document.getElementById("sinal");
  if (el) {
    el.innerText = `${sinal}\nConfiança: ${confianca}`;
  }
}

// ⏱️ TIMER (corrigido)
function iniciarTimer() {
  function atualizar() {
    const el = document.getElementById("timer");
    if (!el) return;

    const agora = new Date();
    const restante = 60 - agora.getSeconds();

    el.innerText = "00:" + String(restante).padStart(2, "0");
  }

  atualizar();
  setInterval(atualizar, 1000);
}

// 🔄 Troca moeda
const select = document.getElementById("moeda");
if (select) {
  select.addEventListener("change", (e) => {
    moedaAtual = e.target.value;
    historico = [];
    criarGrafico(pares[moedaAtual]);
    pegarPreco();
  });
}

// 🚀 INIT (espera carregar tudo)
window.onload = () => {
  criarGrafico(pares[moedaAtual]);
  pegarPreco();
  iniciarTimer();

  setInterval(pegarPreco, 3000);
};


