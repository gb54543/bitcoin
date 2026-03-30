const ctx = document.getElementById("grafico").getContext("2d");

let moeda = "BTCUSDT";
let historico = [];

const moedas = {
  BTC: "BTCUSDT",
  ETH: "ETHUSDT",
  SOL: "SOLUSDT",
  BNB: "BNBUSDT",
  XRP: "XRPUSDT"
};

// GRÁFICO MELHOR
const grafico = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      data: [],
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.4
    }]
  },
  options: {
    animation: false,
    responsive: true,
    scales: {
      x: { display: false },
      y: { display: true }
    }
  }
});

// TROCAR MOEDA
function trocarMoeda(m) {
  moeda = moedas[m];
  historico = [];
  grafico.data.labels = [];
  grafico.data.datasets[0].data = [];
  grafico.update();
}

// PEGAR PREÇO
async function getPreco() {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${moeda}`);
    const data = await res.json();
    return parseFloat(data.price);
  } catch {
    return null;
  }
}

// ATUALIZAÇÃO
setInterval(async () => {

  let preco = await getPreco();
  if (!preco) return;

  historico.push(preco);
  if (historico.length > 80) historico.shift();

  // GRAFICO AGORA FLUI
  grafico.data.labels.push("");
  grafico.data.datasets[0].data.push(preco);

  if (grafico.data.labels.length > 80) {
    grafico.data.labels.shift();
    grafico.data.datasets[0].data.shift();
  }

  grafico.update();

  analisar(preco);

}, 1000);

// ANALISE NORMAL
function analisar(preco) {

  if (historico.length < 15) return;

  let media = arr => arr.reduce((a,b)=>a+b,0)/arr.length;

  let curta = media(historico.slice(-5));
  let longa = media(historico);

  let tendencia = curta > longa ? "ALTA" : "BAIXA";
  let forca = ((curta - longa)/longa)*100;

  let momentum = preco > historico[historico.length-2] ? "FORTE" : "FRACO";

  let max = Math.max(...historico);
  let min = Math.min(...historico);

  let vol = ((max-min)/min)*100;

  document.getElementById("tendencia").innerText = tendencia;
  document.getElementById("forca").innerText = forca.toFixed(2)+"%";
  document.getElementById("momentum").innerText = momentum;
  document.getElementById("vol").innerText = vol.toFixed(2)+"%";
}

// 🔥 ANALISE INTELIGENTE (NOVA)
function analiseInteligente() {

  if (historico.length < 20) {
    alert("Aguardando dados...");
    return;
  }

  let preco = historico[historico.length-1];

  let max = Math.max(...historico);
  let min = Math.min(...historico);

  let suporte = min * 1.01;
  let resistencia = max * 0.99;

  let distanciaTopo = ((resistencia - preco)/preco)*100;
  let distanciaFundo = ((preco - suporte)/preco)*100;

  let direcao = preco > historico[historico.length-5] ? "SUBINDO" : "CAINDO";

  let leitura = `
Mercado ${direcao}.
Preço atual está ${(distanciaTopo < 1 ? "próximo da resistência" : "longe do topo")}.

Zona de suporte em $${suporte.toFixed(2)}  
Zona de resistência em $${resistencia.toFixed(2)}

Probabilidade maior de ${
    direcao === "SUBINDO" ? "continuação de alta" : "queda"
}.
`;

  document.getElementById("leitura").innerText = leitura;

  // PROBABILIDADE FORTE
  let probAlta = direcao === "SUBINDO" ? 70 : 30;
  let probBaixa = 100 - probAlta;

  document.getElementById("probAlta").innerText = probAlta+"%";
  document.getElementById("probBaixa").innerText = probBaixa+"%";

  document.getElementById("buyZone").innerText = "$"+suporte.toFixed(2);
  document.getElementById("sellZone").innerText = "$"+resistencia.toFixed(2);

  document.getElementById("sinal").innerText =
    direcao === "SUBINDO" ? "COMPRA" : "VENDA";
}
