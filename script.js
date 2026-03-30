// 🔗 PARES
const pares = {
  bitcoin: "BTCUSDT",
  ethereum: "ETHUSDT",
  solana: "SOLUSDT",
  ripple: "XRPUSDT",
  cardano: "ADAUSDT"
};

let moedaAtual = "bitcoin";
let historico = [];

// 📊 GRÁFICO (seguro)
function criarGrafico() {
  const el = document.getElementById("chart");
  if (!el || typeof TradingView === "undefined") return;

  el.innerHTML = ""; // LIMPA TUDO

  new TradingView.widget({
    width: "100%",
    height: 500,
    symbol: "BINANCE:" + pares[moedaAtual],
    interval: "1",
    theme: "dark",
    style: "1",
    locale: "br",
    container_id: "chart"
  });
}

// 💰 PREÇO
async function pegarPreco() {
  try {
    const par = pares[moedaAtual];

    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${par}`);
    const data = await res.json();

    const preco = parseFloat(data.price);

    const elPreco = document.getElementById("preco");
    if (elPreco) {
      elPreco.innerText = "$ " + preco.toLocaleString();
    }

    analisar(preco);

  } catch (e) {
    console.log("Erro API:", e);
  }
}

// 🧠 ANÁLISE BONITA
function analisar(preco) {
  historico.push(preco);
  if (historico.length > 40) historico.shift();

  let media = historico.reduce((a,b)=>a+b,0)/historico.length;

  let diff = ((preco - media)/media)*100;
  let forca = Math.abs(diff);

  let tendencia = preco > media ? "Alta" : "Baixa";

  let acao = "";
  let classe = "";

  if (preco > media) {
    acao = forca > 0.3 ? "COMPRAR" : "COMPRA FRACA";
    classe = "compra";
  } else {
    acao = forca > 0.3 ? "VENDER" : "VENDA FRACA";
    classe = "venda";
  }

  let confianca =
    forca > 0.5 ? "Alta"
    : forca > 0.2 ? "Média"
    : "Baixa";

  let ultimo = historico[historico.length - 2] || preco;
  let momentum = preco > ultimo ? "Subindo" : "Caindo";

  let max = Math.max(...historico);
  let min = Math.min(...historico);
  let volatilidade = ((max - min)/min)*100;

  // 🎨 UI
  const box = document.getElementById("sinalBox");
  if (box) box.className = "sinal-box " + classe;

  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
  };

  set("acao", acao);
  set("confianca", " • " + confianca);
  set("tendencia", tendencia);
  set("forca", forca.toFixed(2) + "%");
  set("momentum", momentum);
  set("volatilidade", volatilidade.toFixed(2) + "%");
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

// 🔄 TROCAR MOEDA
  function iniciarSelect() {
  const select = document.getElementById("moeda");

  if (!select) return;

  select.addEventListener("change", (e) => {
    moedaAtual = e.target.value;
    historico = [];

    console.log("Moeda:", moedaAtual);

    criarGrafico();
    pegarPreco();
  });
}
// 🚀 INICIAR TUDO
window.addEventListener("load", () => {
  iniciarSelect();
  iniciarTimer();

  // tenta criar gráfico até carregar
  const intervaloGrafico = setInterval(() => {
    if (typeof TradingView !== "undefined") {
      criarGrafico();
      clearInterval(intervaloGrafico);
    }
  }, 500);

  pegarPreco();
  setInterval(pegarPreco, 2000);
});
