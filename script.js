let moeda = "BTCUSDT";
let historico = [];

// ======================
// CRIAR GRAFICO
// ======================

const chart = LightweightCharts.createChart(document.getElementById("grafico"), {
  height: 420,
  layout: {
    background: { color: "#0d1117" },
    textColor: "#fff"
  },
  grid: {
    vertLines: { color: "#1f2937" },
    horzLines: { color: "#1f2937" }
  }
});

const candles = chart.addCandlestickSeries();

// ======================
// CARREGAR DADOS
// ======================

async function carregarVelas() {
  const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${moeda}&interval=1m&limit=100`);
  const data = await res.json();

  candles.setData(data.map(v => ({
    time: v[0] / 1000,
    open: +v[1],
    high: +v[2],
    low: +v[3],
    close: +v[4]
  })));
}

carregarVelas();

// ======================
// UPDATE TEMPO REAL
// ======================

setInterval(async () => {
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

  const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${moeda}`);
  const data = await res.json();

  let preco = +data.price;

  historico.push(preco);
  if(historico.length>50) historico.shift();

  if(historico.length<10) return;

  let curta = media(historico.slice(-5));
  let longa = media(historico);

  let tendencia = curta>longa ? "ALTA" : "BAIXA";
  let forca = ((curta-longa)/longa)*100;
  let momentum = preco>historico[historico.length-2] ? "SUBINDO" : "CAINDO";

  let max = Math.max(...historico);
  let min = Math.min(...historico);
  let vol = ((max-min)/min)*100;

  document.getElementById("tendencia").innerText = tendencia;
  document.getElementById("forca").innerText = forca.toFixed(2)+"%";
  document.getElementById("momentum").innerText = momentum;
  document.getElementById("vol").innerText = vol.toFixed(2)+"%";

},1000);

// ======================
// ANALISE INTELIGENTE
// ======================

document.getElementById("btnAI").onclick = () => {

  if(historico.length < 20){
    alert("Carregando...");
    return;
  }

  let preco = historico[historico.length-1];
  let max = Math.max(...historico);
  let min = Math.min(...historico);

  let suporte = min * 1.01;
  let resistencia = max * 0.99;

  let direcao = preco > historico[historico.length-5] ? "ALTA" : "BAIXA";

  let probAlta = direcao==="ALTA"?75:25;
  let probBaixa = 100 - probAlta;

  document.getElementById("probAlta").innerText = probAlta+"%";
  document.getElementById("probBaixa").innerText = probBaixa+"%";
  document.getElementById("buyZone").innerText = suporte.toFixed(2);
  document.getElementById("sellZone").innerText = resistencia.toFixed(2);
  document.getElementById("sinal").innerText = direcao==="ALTA"?"COMPRA":"VENDA";

  document.getElementById("leitura").innerText =
`Mercado em ${direcao}
Preço atual: ${preco.toFixed(2)}

Suporte: ${suporte.toFixed(2)}
Resistência: ${resistencia.toFixed(2)}

Probabilidade maior de ${direcao==="ALTA"?"continuação de alta":"queda"}.`;

};
