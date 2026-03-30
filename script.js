// 🔗 Pares
const pares = {
  bitcoin: "BTCUSDT",
  ethereum: "ETHUSDT",
  solana: "SOLUSDT",
  ripple: "XRPUSDT",
  cardano: "ADAUSDT"
};

let moedaAtual = "bitcoin";
let historico = [];

// 📊 GRÁFICO (SEM FICAR RECRIANDO TODA HORA)
function criarGrafico(par) {
  const el = document.getElementById("chart");
  if (!el) return;

  el.innerHTML = "";

  new TradingView.widget({
    width: "100%",
    height: 300,
    symbol: "BINANCE:" + par,
    interval: "1",
    theme: "dark",
    style: "1",
    locale: "br",
    enable_publishing: false,
    hide_top_toolbar: false,
    withdateranges: true,
    container_id: "chart"
  });
}

// 💰 PREÇO EM TEMPO REAL (RÁPIDO)
async function pegarPreco() {
  try {
    const par = pares[moedaAtual];

    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${par}`);
    const data = await res.json();

    const preco = parseFloat(data.price);

    const el = document.getElementById("preco");
    if (el) el.innerText = "$ " + preco.toLocaleString();

    analisar(preco);

  } catch (e) {
    console.log("Erro:", e);
  }
}

// 🧠 ANÁLISE
function analisar(preco) {
  historico.push(preco);
  if (historico.length > 40) historico.shift();

  let media = historico.reduce((a,b)=>a+b,0)/historico.length;

  let diff = ((preco - media)/media)*100;
  let forca = Math.abs(diff);

  let tendencia = preco > media ? "Alta 📈" : "Baixa 📉";

  let sinal =
    preco > media
      ? (forca > 0.3 ? "🟢 Compra Forte" : "🟢 Compra Leve")
      : (forca > 0.3 ? "🔴 Venda Forte" : "🔴 Venda Leve");

  let confianca =
    forca > 0.5 ? "🔥 Alta"
    : forca > 0.2 ? "⚖️ Média"
    : "❄️ Baixa";

  // 📊 volatilidade
  let max = Math.max(...historico);
  let min = Math.min(...historico);
  let volatilidade = ((max - min)/min)*100;

  // 🎯 momentum
  let ultimo = historico[historico.length - 2] || preco;
  let momentum = preco > ultimo ? "Subindo 🚀" : "Caindo ⬇️";

  const el = document.getElementById("sinal");

  if (el) {
    el.innerHTML = `
      <div class="${preco > media ? 'green' : 'red'}" style="font-size:18px;">
        ${sinal}
      </div>

      <div class="info">📊 Tendência: ${tendencia}</div>
      <div class="info">💪 Força: ${forca.toFixed(2)}%</div>
      <div class="info">⚡ Momentum: ${momentum}</div>
      <div class="info">🌪️ Volatilidade: ${volatilidade.toFixed(2)}%</div>
      <div class="info">🎯 Confiança: ${confianca}</div>
    `;
  }
}

// ⏱️ TIMER
function iniciarTimer() {
  setInterval(() => {
    const el = document.getElementById("timer");
    if (!el) return;

    const agora = new Date();
    const restante = 60 - agora.getSeconds();

    el.innerText = "00:" + String(restante).padStart(2, "0");
  }, 1000);
}

// 🔄 TROCA MOEDA
const select = document.getElementById("moeda");
if (select) {
  select.addEventListener("change", (e) => {
    moedaAtual = e.target.value;
    historico = [];

    criarGrafico(pares[moedaAtual]);
    pegarPreco();
  });
}

// 🚀 INIT
window.onload = () => {
  criarGrafico(pares[moedaAtual]);
  pegarPreco();
  iniciarTimer();

  // ⚡ ATUALIZA RÁPIDO (1.5s)
  setInterval(pegarPreco, 1500);
};
