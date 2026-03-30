// 📊 Gráfico TradingView
new TradingView.widget({
  "width": "100%",
  "height": 400,
  "symbol": "BINANCE:BTCUSDT",
  "interval": "5",
  "theme": "dark",
  "container_id": "chart"
});

// 🔥 Buscar preço REAL
async function pegarPreco() {
  const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
  const data = await res.json();

  const preco = data.bitcoin.usd;
  document.getElementById("preco").innerText = "$ " + preco;

  analisar(preco);
}

// 🧠 Lógica de análise (simples mas melhor)
let historico = [];

function analisar(preco) {
  historico.push(preco);

  if (historico.length > 10) {
    historico.shift();
  }

  let media = historico.reduce((a, b) => a + b, 0) / historico.length;

  let sinal = "";

  if (preco > media) {
    sinal = "🟢 Tendência de ALTA (possível compra)";
  } else {
    sinal = "🔴 Tendência de BAIXA (possível venda)";
  }

  document.getElementById("sinal").innerText = sinal;
}

// Atualiza a cada 10s
setInterval(pegarPreco, 10000);
pegarPreco();
