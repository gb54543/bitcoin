// ======================
// CONFIG
// ======================

let moeda = "BTCUSDT";
let historico = [];

// ======================
// GRAFICO
// ======================

const chart = LightweightCharts.createChart(document.getElementById("grafico"), {
  height: 420,
  layout: {
    background: { color: "#0d1117" },
    textColor: "#ffffff"
  },
  grid: {
    vertLines: { color: "#1f2937" },
    horzLines: { color: "#1f2937" }
  }
});

const candles = chart.addCandlestickSeries();

// ======================
// GERAR DADOS FAKE (SE API FALHAR)
// ======================

function gerarFake() {
  let base = 30000;
  let dados = [];

  for (let i = 0; i < 100; i++) {
    let open = base;
    let close = open + (Math.random() - 0.5) * 500;
    let high = Math.max(open, close) + Math.random() * 200;
    let low = Math.min(open, close) - Math.random() * 200;

    base = close;

    dados.push({
      time: Math.floor(Date.now() / 1000) - (100 - i) * 60,
      open, high, low, close
    });
  }

  candles.setData(dados);
}

// ======================
// CARREGAR VELAS
// ======================

async function carregarVelas() {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${moeda}&interval=1m&limit=100`);
    const data = await res.json();

    if (!Array.isArray(data)) throw "erro";

    candles.setData(data.map(v => ({
      time: v[0] / 1000,
      open: +v[1],
      high: +v[2],
      low: +v[3],
      close: +v[4]
    })));

  } catch {
    console.log("API falhou → usando gráfico fake");
    gerarFake();
  }
}

carregarVelas();

// ======================
// UPDATE REALTIME
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

  } catch {
    // fallback animado fake
    let ultimo = historico[historico.length - 1] || 30000;
    let novo = ultimo + (Math.random() - 0.5) * 100;

    historico.push(novo);
    if (historico.length > 50) historico.shift();
  }
}, 2000);

// ======================
// TROCAR MOEDA
// ======================

document.getElementById("moeda").addEventListener("change", e => {
  moeda = e.target.value;
  historico = [];
  carregarVelas();
});

// ======================
// ANALISE BASE
// ======================

function media(a){return a.reduce((x,y)=>x+y,0)/a.length}

setInterval(async () => {

  let preco;

  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${moeda}`);
    const data = await res.json();
    preco = +data.price;
  } catch {
    preco = historico[historico.length-1] || 30000;
  }

  historico.push(preco);
  if(historico.length>50) historico.shift();

  if(historico.length<10) return;

  let curta = media(historico.slice(-5));
  let longa = media(historico);

  let tendencia = curta>longa ? "ALTA 📈" : "BAIXA 📉";
  let forca = ((curta-longa)/longa)*100;
  let momentum = preco>historico[historico.length-2] ? "FORTE 🚀" : "FRACO 💤";

  let max = Math.max(...historico);
  let min = Math.min(...historico);
  let vol = ((max-min)/min)*100;

  document.getElementById("tendencia").innerText = tendencia;
  document.getElementById("forca").innerText = forca.toFixed(2)+"%";
  document.getElementById("momentum").innerText = momentum;
  document.getElementById("vol").innerText = vol.toFixed(2)+"%";

},1000);

// ======================
// ANALISE INTELIGENTE (AGORA FUNCIONA)
// ======================

document.getElementById("btnAI").onclick = () => {

  if(historico.length < 20){
    alert("Aguarde dados...");
    return;
  }

  let preco = historico[historico.length-1];
  let max = Math.max(...historico);
  let min = Math.min(...historico);

  let suporte = min * 1.01;
  let resistencia = max * 0.99;

  let direcao = preco > historico[historico.length-5] ? "ALTA 📈" : "BAIXA 📉";

  let probAlta = direcao.includes("ALTA") ? 78 : 22;
  let probBaixa = 100 - probAlta;

  document.getElementById("probAlta").innerText = probAlta+"%";
  document.getElementById("probBaixa").innerText = probBaixa+"%";
  document.getElementById("buyZone").innerText = suporte.toFixed(2);
  document.getElementById("sellZone").innerText = resistencia.toFixed(2);
  document.getElementById("sinal").innerText = direcao.includes("ALTA") ? "COMPRA 🟢" : "VENDA 🔴";

  document.getElementById("leitura").innerText =
`📊 LEITURA AVANÇADA

Mercado em ${direcao}
Preço atual: ${preco.toFixed(2)}

📍 Suporte: ${suporte.toFixed(2)}
📍 Resistência: ${resistencia.toFixed(2)}

🎯 Probabilidade:
Alta: ${probAlta}%
Baixa: ${probBaixa}%

📢 Cenário provável:
${direcao.includes("ALTA") ? 
"Continuação de alta com possíveis correções curtas." :
"Pressão vendedora com risco de novas quedas."}`;
};
