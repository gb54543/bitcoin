// ======================
// CONFIG
// ======================

let moeda = "BTCUSDT";
let historico = [];

// ======================
// GRAFICO (VELAS REAL)
// ======================

const chart = LightweightCharts.createChart(document.getElementById('grafico'), {
  height: 350,
  layout: {
    background: { color: '#0f0f0f' },
    textColor: '#ffffff'
  },
  grid: {
    vertLines: { color: '#1f1f1f' },
    horzLines: { color: '#1f1f1f' }
  }
});

const candles = chart.addCandlestickSeries();

// ======================
// CARREGAR VELAS
// ======================

async function carregar() {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${moeda}&interval=1m&limit=100`);
    const data = await res.json();

    const velas = data.map(v => ({
      time: v[0] / 1000,
      open: +v[1],
      high: +v[2],
      low: +v[3],
      close: +v[4]
    }));

    candles.setData(velas);
  } catch (e) {
    console.log("Erro ao carregar velas");
  }
}

carregar();

// ======================
// ATUALIZAÇÃO TEMPO REAL
// ======================

setInterval(async () => {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${moeda}&interval=1m&limit=2`);
    const data = await res.json();

    const v = data[data.length - 1];

    candles.update({
      time: v[0] / 1000,
      open: +v[1],
      high: +v[2],
      low: +v[3],
      close: +v[4]
    });

  } catch {}
}, 2000);

// ======================
// TROCAR MOEDA
// ======================

function trocarMoeda(m) {
  moeda = m;
  historico = [];
  carregar();
}

// ======================
// ANALISE BASE
// ======================

function media(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

setInterval(async () => {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${moeda}`);
    const data = await res.json();

    let preco = +data.price;

    historico.push(preco);
    if (historico.length > 50) historico.shift();

    if (historico.length < 10) return;

    let curta = media(historico.slice(-5));
    let longa = media(historico);

    let tendencia = curta > longa ? "ALTA" : "BAIXA";
    let forca = ((curta - longa) / longa) * 100;
    let momentum = preco > historico[historico.length - 2] ? "SUBINDO" : "CAINDO";

    let max = Math.max(...historico);
    let min = Math.min(...historico);
    let vol = ((max - min) / min) * 100;

    document.getElementById("tendencia").innerText = tendencia;
    document.getElementById("forca").innerText = forca.toFixed(2) + "%";
    document.getElementById("momentum").innerText = momentum;
    document.getElementById("vol").innerText = vol.toFixed(2) + "%";

  } catch {}
}, 1000);

// ======================
// ANALISE INTELIGENTE
// ======================

function analiseInteligente() {

  if (historico.length < 20) {
    alert("Aguardando dados...");
    return;
  }

  let preco = historico[historico.length - 1];

  let max = Math.max(...historico);
  let min = Math.min(...historico);

  let suporte = min * 1.01;
  let resistencia = max * 0.99;

  let direcao = preco > historico[historico.length - 5] ? "ALTA" : "BAIXA";

  let probAlta = direcao === "ALTA" ? 72 : 28;
  let probBaixa = 100 - probAlta;

  document.getElementById("probAlta").innerText = probAlta + "%";
  document.getElementById("probBaixa").innerText = probBaixa + "%";
  document.getElementById("buyZone").innerText = suporte.toFixed(2);
  document.getElementById("sellZone").innerText = resistencia.toFixed(2);
  document.getElementById("sinal").innerText = direcao === "ALTA" ? "COMPRA" : "VENDA";

  document.getElementById("leitura").innerText =
`Mercado em ${direcao}
Preço atual: ${preco.toFixed(2)}

Suporte: ${suporte.toFixed(2)}
Resistência: ${resistencia.toFixed(2)}

Maior chance de ${direcao === "ALTA" ? "continuação de alta" : "queda"}`;

}
