let moedaAtual = "bitcoin";
let simboloAtual = "BTCUSDT";

// 🔄 trocar gráfico
function carregarGrafico() {
  document.getElementById("chart").innerHTML = "";

  new TradingView.widget({
    "width": "100%",
    "height": 400,
    "symbol": "BINANCE:" + simboloAtual,
    "interval": "5",
    "theme": "dark",
    "container_id": "chart"
  });
}

// 🔥 pegar preço real
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

  if (historico.length > 10) {
    historico.shift();
  }

  let media = historico.reduce((a, b) => a + b, 0) / historico.length;

  let sinal = "";

  if (preco > media) {
    sinal = "🟢 Alta (possível compra)";
  } else {
    sinal = "🔴 Baixa (possível venda)";
  }

  document.getElementById("sinal").innerText = sinal;
}

// 🎯 trocar moeda
document.getElementById("moeda").addEventListener("change", (e) => {
  moedaAtual = e.target.value;

  historico = [];

  if (moedaAtual === "bitcoin") simboloAtual = "BTCUSDT";
  if (moedaAtual === "ethereum") simboloAtual = "ETHUSDT";
  if (moedaAtual === "solana") simboloAtual = "SOLUSDT";
  if (moedaAtual === "ripple") simboloAtual = "XRPUSDT";
  if (moedaAtual === "cardano") simboloAtual = "ADAUSDT";

  carregarGrafico();
  pegarPreco();
});

// iniciar
carregarGrafico();
setInterval(pegarPreco, 10000);
pegarPreco();
