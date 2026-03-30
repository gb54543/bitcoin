const pares = {
  bitcoin: "BTCUSDT",
  ethereum: "ETHUSDT",
  solana: "SOLUSDT",
  ripple: "XRPUSDT",
  cardano: "ADAUSDT",
  dogecoin: "DOGEUSDT",
  toncoin: "TONUSDT",
  chainlink: "LINKUSDT"
};

let moedaAtual = "bitcoin";
let historico = [];
let indicadorPersonalizado = null;

/* 🔄 BOTÕES */
function iniciarBotoes() {
  document.querySelectorAll(".moeda").forEach(btn => {
    btn.onclick = () => {

      document.querySelectorAll(".moeda")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");

      moedaAtual = btn.dataset.moeda;
      historico = [];

      criarGrafico();
      pegarPreco();
    };
  });
}

/* 📊 GRÁFICO */
function criarGrafico() {
  const el = document.getElementById("chart");
  if (!el) return;

  el.innerHTML = "";

  new TradingView.widget({
    width: "100%",
    height: 500,
    symbol: "BINANCE:" + pares[moedaAtual],
    interval: "1",
    theme: "dark",
    style: "1",
    container_id: "chart"
  });
}

/* 💰 PREÇO */
async function pegarPreco() {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pares[moedaAtual]}`);
    const data = await res.json();

    const preco = parseFloat(data.price);

    document.getElementById("preco").innerText =
      "$ " + preco.toLocaleString();

    analisar(preco);

  } catch (e) {
    console.log(e);
  }
}

/* 🧠 ANALISE */
function analisar(preco) {
  historico.push(preco);
  if (historico.length > 50) historico.shift();

  let media = historico.reduce((a,b)=>a+b,0)/historico.length;
  let diff = ((preco - media)/media)*100;

  let tendencia = preco > media ? "Alta" : "Baixa";
  let forca = Math.abs(diff);

  let acao = preco > media ? "COMPRAR" : "VENDER";
  let classe = preco > media ? "compra" : "venda";

  let ultimo = historico[historico.length - 2] || preco;
  let momentum = preco > ultimo ? "Subindo" : "Caindo";

  let max = Math.max(...historico);
  let min = Math.min(...historico);
  let vol = ((max - min)/min)*100;

  document.getElementById("sinalBox").className = "sinal-box " + classe;
  document.getElementById("acao").innerText = acao;
  document.getElementById("confianca").innerText =
    forca > 0.5 ? "Alta" : forca > 0.2 ? "Média" : "Baixa";

  document.getElementById("tendencia").innerText = tendencia;
  document.getElementById("forca").innerText = forca.toFixed(2) + "%";
  document.getElementById("momentum").innerText = momentum;
  document.getElementById("volatilidade").innerText = vol.toFixed(2) + "%";

  // indicador personalizado
  if (indicadorPersonalizado) {
    try {
      indicadorPersonalizado(preco, historico);
    } catch {}
  }
}

/* ⏱️ TIMER */
function iniciarTimer() {
  setInterval(() => {
    const s = new Date().getSeconds();
    document.getElementById("timer").innerText =
      "00:" + String(60 - s).padStart(2, "0");
  }, 1000);
}

/* 📂 INDICADOR */
function carregarIndicador() {
  const input = document.getElementById("fileInput");
  const status = document.getElementById("statusIndicador");

  if (!input.files.length) {
    status.innerText = "Escolha um arquivo";
    return;
  }

  const reader = new FileReader();

  reader.onload = e => {
    try {
      indicadorPersonalizado =
        new Function("preco", "historico", e.target.result);

      status.innerText = "Indicador ativo 🚀";
    } catch {
      status.innerText = "Erro no arquivo ❌";
    }
  };

  reader.readAsText(input.files[0]);
}

/* 🚀 START */
window.onload = () => {

  iniciarBotoes();
  iniciarTimer();

  const wait = setInterval(() => {
    if (window.TradingView) {
      criarGrafico();
      clearInterval(wait);
    }
  }, 500);

  pegarPreco();
  setInterval(pegarPreco, 2000);
};
