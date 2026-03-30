let moedaAtual = "bitcoin";
let simboloAtual = "BTCUSDT";
let widget = null;

// 🔥 função pra criar gráfico
function criarGrafico() {
  if (widget) {
    document.getElementById("chart").innerHTML = "";
  }

  widget = new TradingView.widget({
    width: "100%",
    height: 400,
    symbol: "BINANCE:" + simboloAtual,
    interval: "5",
    theme: "dark",
    style: "1",
    locale: "br",
    container_id: "chart"
  });
}

// 🔥 preço real (CoinGecko)
async function pegarPreco() {
  const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${moedaAtual}&vs_currencies=usd`);
  const data = await res.json();

  const preco = data[moedaAtual].usd;
  document.getElementById("preco").innerText = "$ " + preco;

  analisar(preco);
}

// 🧠 análise simples
let historico = [];

function analisar(preco) {
  historico.push(preco);

  if (historico.length > 10) historico.shift();

  let media = historico.reduce((a, b) => a + b, 0) / historico.length;

  let sinal = preco > media
    ? "🟢 Alta (compra)"
    : "🔴 Baixa (venda)";

  document.getElementById("sinal").innerText = sinal;
}

// 🎯 troca de moeda (BUG CORRIGIDO)
document.getElementById("moeda").addEventListener("change", (e) => {
  moedaAtual = e.target.value;
  historico = [];

  const mapa = {
    bitcoin: "BTCUSDT",
    ethereum: "ETHUSDT",
    solana: "SOLUSDT",
    ripple: "XRPUSDT",
    cardano: "ADAUSDT"
  };

  simboloAtual = mapa[moedaAtual];

  criarGrafico();
  pegarPreco();
});

// iniciar
criarGrafico();
pegarPreco();
setInterval(pegarPreco, 10000);
