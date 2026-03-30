const pares = {
  bitcoin: "BTCUSDT",
  ethereum: "ETHUSDT",
  solana: "SOLUSDT",
  ripple: "XRPUSDT",
  cardano: "ADAUSDT",
  dogecoin: "DOGEUSDT"
};

let moedaAtual = "bitcoin";
let historico = [];

/* trocar moeda */
document.querySelectorAll(".moeda").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".moeda").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    moedaAtual = btn.dataset.moeda;
    historico = [];

    criarGrafico();
  };
});

/* gráfico */
function criarGrafico() {
  document.getElementById("chart").innerHTML = "";

  new TradingView.widget({
    symbol: "BINANCE:" + pares[moedaAtual],
    width: "100%",
    height: 420,
    theme: "dark",
    interval: "1",
    container_id: "chart"
  });
}

/* atualizar */
async function atualizar() {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pares[moedaAtual]}`);
    const data = await res.json();

    let preco = parseFloat(data.price);

    document.getElementById("preco").innerText = "$ " + preco.toFixed(2);
    document.getElementById("status").innerText = "Online";

    analisar(preco);

  } catch {
    document.getElementById("status").innerText = "Erro";
  }
}

function analisar(preco) {

  historico.push(preco);
  if (historico.length > 60) historico.shift();

  if (historico.length < 10) return;

  const media = arr => arr.reduce((a,b)=>a+b,0)/arr.length;

  let curta = media(historico.slice(-5));
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
  let momentum = preco > historico[historico.length-2] ? "FORTE" : "FRACO";

  // Volatilidade
  let max = Math.max(...historico);
  let min = Math.min(...historico);
  let vol = ((max-min)/min)*100;

  // SCORE INTELIGENTE
  let score = 0;

  if(tendencia==="ALTA") score+=2;
  if(forca>0.15) score+=2;
  if(rsi<30) score+=2;
  if(rsi>70) score-=2;
  if(momentum==="FORTE") score+=2;
  if(vol>0.5) score+=1;

  // PROBABILIDADE
  let probAlta = Math.min(100, 50 + score*8);
  let probBaixa = 100 - probAlta;

  // ZONAS
  let buyZone = (preco * 0.995).toFixed(2);
  let sellZone = (preco * 1.005).toFixed(2);

  // SINAL
  let sinal = "NEUTRO";
  if(score >= 6) sinal = "COMPRA FORTE";
  else if(score >= 4) sinal = "COMPRA";
  else if(score <= 2) sinal = "VENDA";

  // LEITURA INTELIGENTE (ESTILO IA)
  let leitura = "";

  if(sinal.includes("COMPRA")){
    leitura = "O mercado apresenta sinais de continuação de alta com base na média móvel curta acima da longa. O RSI indica possível região de valorização e o momentum reforça pressão compradora. Existe probabilidade de continuação do movimento.";
  } else if(sinal === "VENDA"){
    leitura = "O ativo demonstra fraqueza estrutural com tendência de baixa consolidada. O momentum negativo e a falta de força indicam possível continuação da queda. Atenção a rompimentos inferiores.";
  } else {
    leitura = "O mercado está indeciso no momento. A baixa força e sinais mistos indicam consolidação. O ideal é aguardar confirmação de tendência antes de entrar.";
  }

  // UPDATE UI
  document.getElementById("sinal").innerText = sinal;
  document.getElementById("tendencia").innerText = tendencia;
  document.getElementById("forca").innerText = forca.toFixed(2)+"%";
  document.getElementById("rsi").innerText = rsi.toFixed(0);
  document.getElementById("momentum").innerText = momentum;
  document.getElementById("vol").innerText = vol.toFixed(2)+"%";
  document.getElementById("score").innerText = score;

  document.getElementById("probAlta").innerText = probAlta.toFixed(0)+"%";
  document.getElementById("probBaixa").innerText = probBaixa.toFixed(0)+"%";

  document.getElementById("buyZone").innerText = "$"+buyZone;
  document.getElementById("sellZone").innerText = "$"+sellZone;

  document.getElementById("leitura").innerText = leitura;
}

  // RSI
  let ganhos=0, perdas=0;
  for(let i=1;i<historico.length;i++){
    let d = historico[i]-historico[i-1];
    if(d>0) ganhos+=d; else perdas-=d;
  }
  let rsi = 100 - (100/(1+(ganhos/(perdas||1))));

  let momentum = preco > historico[historico.length-2] ? "FORTE" : "FRACO";

  let max = Math.max(...historico);
  let min = Math.min(...historico);
  let vol = ((max-min)/min)*100;

  let score = 0;
  if(tendencia==="ALTA") score+=2;
  if(forca>0.1) score+=2;
  if(rsi<30) score+=2;
  if(momentum==="FORTE") score+=2;

  let sinal = "NEUTRO";
  if(score>=6) sinal="COMPRA FORTE";
  else if(score>=4) sinal="COMPRA";
  else if(score<=2) sinal="VENDA";

  document.getElementById("sinal").innerText = sinal;
  document.getElementById("tendencia").innerText = tendencia;
  document.getElementById("forca").innerText = forca.toFixed(2)+"%";
  document.getElementById("rsi").innerText = rsi.toFixed(0);
  document.getElementById("momentum").innerText = momentum;
  document.getElementById("vol").innerText = vol.toFixed(2)+"%";
  document.getElementById("score").innerText = score;
}

/* timer */
setInterval(()=>{
  let s=new Date().getSeconds();
  document.getElementById("timer").innerText="00:"+String(60-s).padStart(2,"0");
},1000);

/* start */
window.onload=()=>{
  criarGrafico();
  atualizar();
  setInterval(atualizar,1500);
};
