// ================= CONFIG =================
const ctx = document.getElementById("grafico").getContext("2d");

let moeda = "BTCUSDT";

const moedas = {
  BTC: "BTCUSDT",
  ETH: "ETHUSDT",
  SOL: "SOLUSDT",
  BNB: "BNBUSDT",
  XRP: "XRPUSDT"
};

let historico = [];

// ================= GRÁFICO =================
const grafico = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "Preço",
      data: [],
      tension: 0.2,
      borderWidth: 2,
      pointRadius: 0
    }]
  },
  options: {
    responsive: true,
    animation: false,
    scales: {
      x: { display: false },
      y: { beginAtZero: false }
    }
  }
});

// ================= TROCAR MOEDA =================
function trocarMoeda(m) {
  moeda = moedas[m];
  historico = [];
  grafico.data.labels = [];
  grafico.data.datasets[0].data = [];
  grafico.update();
}

// ================= PEGAR PREÇO (RÁPIDO) =================
async function getPreco() {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${moeda}`);
    const data = await res.json();
    return parseFloat(data.price);
  } catch {
    return null;
  }
}

// ================= ATUALIZAÇÃO RÁPIDA =================
setInterval(async () => {
  const preco = await getPreco();
  if (!preco) return;

  // gráfico
  if (grafico.data.labels.length > 50) {
    grafico.data.labels.shift();
    grafico.data.datasets[0].data.shift();
  }

  grafico.data.labels.push("");
  grafico.data.datasets[0].data.push(preco);
  grafico.update();

  analisar(preco);

}, 1200); // 🔥 atualiza rápido

// ================= ANÁLISE INTELIGENTE =================
function analisar(preco) {

  historico.push(preco);
  if (historico.length > 100) historico.shift();
  if (historico.length < 15) return;

  const media = arr => arr.reduce((a,b)=>a+b,0)/arr.length;

  let curta = media(historico.slice(-7));
  let longa = media(historico);

  let tendencia = curta > longa ? "ALTA" : "BAIXA";
  let forca = ((curta - longa)/longa)*100;

  // RSI
  let ganhos=0, perdas=0;
  for(let i=1;i<historico.length;i++){
    let d = historico[i]-historico[i-1];
    if(d>0) ganhos+=d; else perdas-=d;
  }
  let rsi = 100 - (100/(1+(ganhos/(perdas||1))));

  // Momentum
  let momentum = preco > historico[historico.length-2] ? "SUBINDO" : "CAINDO";

  // Volatilidade
  let max = Math.max(...historico);
  let min = Math.min(...historico);
  let vol = ((max-min)/min)*100;

  // SCORE INTELIGENTE
  let score = 0;

  if(tendencia==="ALTA") score+=2;
  if(forca>0.1) score+=2;
  if(rsi<30) score+=3;
  if(rsi>70) score-=3;
  if(momentum==="SUBINDO") score+=2;
  if(vol>0.4) score+=1;

  // PROBABILIDADE
  let probAlta = Math.min(100, 50 + score*7);
  let probBaixa = 100 - probAlta;

  // ZONAS
  let buyZone = (preco * 0.995).toFixed(2);
  let sellZone = (preco * 1.005).toFixed(2);

  // SINAL
  let sinal = "NEUTRO";
  if(score >= 7) sinal = "COMPRA FORTE";
  else if(score >= 4) sinal = "COMPRA";
  else if(score <= 1) sinal = "VENDA";

  // LEITURA HUMANA (TOP)
  let leitura = "";

  if(sinal === "COMPRA FORTE"){
    leitura = "Alta forte com pressão compradora dominante. Possível continuação de movimento.";
  } 
  else if(sinal === "COMPRA"){
    leitura = "Mercado com viés de alta, mas ainda precisa de confirmação.";
  }
  else if(sinal === "VENDA"){
    leitura = "Pressão vendedora ativa, possível continuação de queda.";
  }
  else {
    leitura = "Mercado lateral, indecisão entre compradores e vendedores.";
  }

  atualizarUI({
    sinal,
    tendencia,
    forca,
    rsi,
    momentum,
    vol,
    score,
    probAlta,
    probBaixa,
    buyZone,
    sellZone,
    leitura
  });
}

// ================= ATUALIZAR UI (SEM BUG) =================
function atualizarUI(d) {

  const set = (id, val) => {
    const el = document.getElementById(id);
    if(el) el.innerText = val;
  };

  set("sinal", d.sinal);
  set("tendencia", d.tendencia);
  set("forca", d.forca.toFixed(2)+"%");
  set("rsi", d.rsi.toFixed(0));
  set("momentum", d.momentum);
  set("vol", d.vol.toFixed(2)+"%");
  set("score", d.score);

  set("probAlta", d.probAlta.toFixed(0)+"%");
  set("probBaixa", d.probBaixa.toFixed(0)+"%");

  set("buyZone", "$"+d.buyZone);
  set("sellZone", "$"+d.sellZone);

  set("leitura", d.leitura);
}

// ================= UPLOAD DE INDICADOR =================
document.getElementById("uploadIndicador")?.addEventListener("change", function(e){
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(evt){
    alert("Indicador carregado (simulação). Em breve você poderá integrar lógica real.");
    console.log(evt.target.result);
  };

  reader.readAsText(file);
});
