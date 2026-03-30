const pares = {
  bitcoin: "BTCUSDT",
  ethereum: "ETHUSDT",
  solana: "SOLUSDT",
  ripple: "XRPUSDT",
  cardano: "ADAUSDT"
};

let moedaAtual = "bitcoin";
let historico = [];

/* MOEDAS */
document.querySelectorAll(".moeda").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".moeda").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    moedaAtual = btn.dataset.moeda;
    historico = [];

    criarGrafico();
  };
});

/* GRÁFICO */
function criarGrafico() {
  if (!window.TradingView) return;

  document.getElementById("chart").innerHTML = "";

  new TradingView.widget({
    symbol: "BINANCE:" + pares[moedaAtual],
    width: "100%",
    height: 320,
    theme: "dark",
    interval: "1",
    container_id: "chart"
  });
}

/* ATUALIZAR */
async function atualizar() {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pares[moedaAtual]}`);
    const data = await res.json();

    const preco = parseFloat(data.price);

    document.getElementById("preco").innerText =
      "$ " + preco.toFixed(2);

    analisar(preco);

  } catch {}
}

/* ANALISE MELHORADA (ESTÁVEL) */
function analisar(preco) {

  historico.push(preco);
  if (historico.length > 25) historico.shift();

  if (historico.length < 10) return;

  let mediaCurta = media(historico.slice(-5));
  let mediaLonga = media(historico);

  let tendencia = mediaCurta > mediaLonga ? "Alta" : "Baixa";
  let forca = Math.abs((mediaCurta - mediaLonga)/mediaLonga)*100;

  let acao = tendencia === "Alta" ? "COMPRAR" : "VENDER";
  let classe = tendencia === "Alta" ? "compra" : "venda";

  let ultimo = historico[historico.length-2];
  let momentum = preco > ultimo ? "Subindo" : "Caindo";

  let max = Math.max(...historico);
  let min = Math.min(...historico);
  let vol = ((max-min)/min)*100;

  document.getElementById("sinalBox").className = "sinal-box " + classe;
  document.getElementById("sinalBox").innerText = acao;

  document.getElementById("tendencia").innerText = tendencia;
  document.getElementById("forca").innerText = forca.toFixed(2)+"%";
  document.getElementById("momentum").innerText = momentum;
  document.getElementById("volatilidade").innerText = vol.toFixed(2)+"%";
}

/* MEDIA */
function media(arr){
  return arr.reduce((a,b)=>a+b,0)/arr.length;
}

/* TIMER */
setInterval(()=>{
  let s = new Date().getSeconds();
  document.getElementById("timer").innerText =
    "00:" + String(60 - s).padStart(2,"0");
},1000);

/* START */
window.onload = () => {

  let wait = setInterval(()=>{
    if(window.TradingView){
      criarGrafico();
      clearInterval(wait);
    }
  },500);

  atualizar();
  setInterval(atualizar, 3000);
};
