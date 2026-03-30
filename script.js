// 🔗 PARES
const pares = {
  bitcoin: "BTCUSDT",
  ethereum: "ETHUSDT",
  solana: "SOLUSDT",
  ripple: "XRPUSDT",
  cardano: "ADAUSDT"
};

let moedaAtual = "bitcoin";
let historico = [];

};
// 📊 GRÁFICO (seguro)
function criarGrafico() {
  const el = document.getElementById("chart");
  if (!el || typeof TradingView === "undefined") return;

  el.innerHTML = ""; // LIMPA TUDO

  new TradingView.widget({
    width: "100%",
    height: 500,
    symbol: "BINANCE:" + pares[moedaAtual],
    interval: "1",
    theme: "dark",
    style: "1",
    locale: "br",
    container_id: "chart"
  });
}

// 💰 PREÇO
async function pegarPreco() {
  try {
    const par = pares[moedaAtual];

    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${par}`);
    const data = await res.json();

    const preco = parseFloat(data.price);

    const elPreco = document.getElementById("preco");
    if (elPreco) {
elPreco.innerText = "$ " + preco.toLocaleString();

elPreco.style.transform = "scale(1.1)";
setTimeout(() => {
  elPreco.style.transform = "scale(1)";
}, 150);
      if (!window.precoAnterior) window.precoAnterior = preco;

if (preco > window.precoAnterior) {
  elPreco.style.color = "#22c55e"; // verde
} else if (preco < window.precoAnterior) {
  elPreco.style.color = "#ef4444"; // vermelho
}

window.precoAnterior = preco;
    }

    analisar(preco);

  } catch (e) {
    console.log("Erro API:", e);
  }
}

// 🧠 ANÁLISE BONITA
function analisar(preco) {
  historico.push(preco);
  if (historico.length > 40) historico.shift();

  let media = historico.reduce((a,b)=>a+b,0)/historico.length;

  let diff = ((preco - media)/media)*100;
  let forca = Math.abs(diff);

  let tendencia = preco > media ? "Alta" : "Baixa";

  let acao = "";
  let classe = "";

  if (preco > media) {
    acao = forca > 0.3 ? "COMPRAR" : "COMPRA FRACA";
    classe = "compra";
  } else {
    acao = forca > 0.3 ? "VENDER" : "VENDA FRACA";
    classe = "venda";
  }

  let confianca =
    forca > 0.5 ? "Alta"
    : forca > 0.2 ? "Média"
    : "Baixa";

  let ultimo = historico[historico.length - 2] || preco;
  let momentum = preco > ultimo ? "Subindo" : "Caindo";

  let max = Math.max(...historico);
  let min = Math.min(...historico);
  let volatilidade = ((max - min)/min)*100;

  // 🎨 UI
  const box = document.getElementById("sinalBox");
  if (box) box.className = "sinal-box " + classe;

  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
  };

  set("acao", acao);
  set("confianca", " • " + confianca);
  set("tendencia", tendencia);
  set("forca", forca.toFixed(2) + "%");
  set("momentum", momentum);
  set("volatilidade", volatilidade.toFixed(2) + "%");
}

// ⏱️ TIMER
function iniciarTimer() {
  setInterval(() => {
    const el = document.getElementById("timer");
    if (!el) return;

    const agora = new Date();
    const restante = 60 - agora.getSeconds();

    el.innerText = "00:" + String(restante).padStart(2, "0");
  }, 1000);
}

// 🔄 TROCAR MOEDA
  function iniciarSelect() {
  const select = document.getElementById("moeda");

  if (!select) return;

  select.addEventListener("change", (e) => {
    moedaAtual = e.target.value;
    historico = [];

    console.log("Moeda:", moedaAtual);

    criarGrafico();
    pegarPreco();
  });
}
// 🚀 INICIAR TUDO
window.addEventListener("load", () => {
  iniciarSelect();
  iniciarTimer();

  // esperar TradingView carregar
  function esperarGrafico() {
    if (typeof TradingView !== "undefined") {
      criarGrafico();
    } else {
      setTimeout(esperarGrafico, 500);
    }
  }

  esperarGrafico();

  pegarPreco();
  setInterval(pegarPreco, 2000);
});
let ultimaOperacaoIA = null;
let ultimaAssinaturaMercado = "";

function calcularRSISimples(dados, periodo = 14) {
  if (dados.length < periodo + 1) return null;

  let ganhos = 0;
  let perdas = 0;

  for (let i = dados.length - periodo; i < dados.length; i++) {
    const diff = dados[i] - dados[i - 1];
    if (diff >= 0) ganhos += diff;
    else perdas += Math.abs(diff);
  }

  if (perdas === 0) return 100;
  const rs = ganhos / perdas;
  return 100 - (100 / (1 + rs));
}

function analisarOperacaoInteligente() {
  if (historico.length < 25) {
    return {
      direcao: "AGUARDAR",
      classe: "neutra",
      confianca: 0,
      prazo: "--",
      forca: "--",
      tendencia: "Indefinida",
      rsi: "--",
      motivo: "Ainda não há dados suficientes para validar uma operação com consistência."
    };
  }

  const atual = historico[historico.length - 1];
  const media5 = historico.slice(-5).reduce((a, b) => a + b, 0) / 5;
  const media10 = historico.slice(-10).reduce((a, b) => a + b, 0) / 10;
  const media20 = historico.slice(-20).reduce((a, b) => a + b, 0) / 20;

  const variacaoCurta = ((media5 - media10) / media10) * 100;
  const variacaoLonga = ((media10 - media20) / media20) * 100;
  const forca = Math.abs(((media5 - media20) / media20) * 100);

  const rsi = calcularRSISimples(historico);
  const ultimo = historico[historico.length - 2];
  const momentumAlta = atual > ultimo;

  let pontosCompra = 0;
  let pontosVenda = 0;
  let motivos = [];

  if (media5 > media10 && media10 > media20) {
    pontosCompra += 3;
    motivos.push("médias curtas acima das longas");
  }

  if (media5 < media10 && media10 < media20) {
    pontosVenda += 3;
    motivos.push("médias curtas abaixo das longas");
  }

  if (variacaoCurta > 0.08) {
    pontosCompra += 2;
    motivos.push("aceleração de curto prazo positiva");
  }

  if (variacaoCurta < -0.08) {
    pontosVenda += 2;
    motivos.push("aceleração de curto prazo negativa");
  }

  if (variacaoLonga > 0.08) {
    pontosCompra += 1;
  }

  if (variacaoLonga < -0.08) {
    pontosVenda += 1;
  }

  if (rsi !== null) {
    if (rsi >= 52 && rsi <= 68) {
      pontosCompra += 2;
      motivos.push("RSI em faixa favorável de continuação");
    }

    if (rsi <= 48 && rsi >= 32) {
      pontosVenda += 2;
      motivos.push("RSI em faixa favorável de continuação de queda");
    }

    if (rsi > 75) {
      pontosCompra -= 1;
      motivos.push("mercado esticado para cima");
    }

    if (rsi < 25) {
      pontosVenda -= 1;
      motivos.push("mercado esticado para baixo");
    }
  }

  if (momentumAlta) {
    pontosCompra += 1;
  } else {
    pontosVenda += 1;
  }

  const diferenca = Math.abs(pontosCompra - pontosVenda);

  let direcao = "AGUARDAR";
  let classe = "neutra";
  let confianca = 50;
  let prazo = "Curto";
  let tendencia = "Lateral";

  if (media5 > media20) tendencia = "Alta";
  if (media5 < media20) tendencia = "Baixa";

  if (pontosCompra >= pontosVenda + 2) {
    direcao = "COMPRA";
    classe = "compra";
    confianca = Math.min(92, 58 + diferenca * 8 + Math.min(forca * 10, 12));
  } else if (pontosVenda >= pontosCompra + 2) {
    direcao = "VENDA";
    classe = "venda";
    confianca = Math.min(92, 58 + diferenca * 8 + Math.min(forca * 10, 12));
  } else {
    direcao = "AGUARDAR";
    classe = "neutra";
    confianca = Math.max(45, 55 - diferenca * 4);
  }

  if (forca > 0.45) prazo = "5 min";
  else if (forca > 0.20) prazo = "3 min";
  else prazo = "1 min";

  let motivoFinal = "Sem validação suficiente.";
  if (direcao === "COMPRA") {
    motivoFinal = "Operação compradora validada por " + motivos.slice(0, 3).join(", ") + ".";
  } else if (direcao === "VENDA") {
    motivoFinal = "Operação vendedora validada por " + motivos.slice(0, 3).join(", ") + ".";
  } else {
    motivoFinal = "O mercado está sem alinhamento forte entre tendência, força e momentum. O mais seguro agora é não entrar.";
  }

  return {
    direcao,
    classe,
    confianca: Math.round(confianca),
    prazo,
    forca: forca.toFixed(2) + "%",
    tendencia,
    rsi: rsi === null ? "--" : rsi.toFixed(0),
    motivo: motivoFinal
  };
}

function renderOperacaoIA(resultado) {
  const box = document.getElementById("operacaoIA");
  if (!box) return;

  box.innerHTML = `
    <div class="ia-card-top">
      <div class="ia-direcao ${resultado.classe}">${resultado.direcao}</div>
      <div class="ia-badge">Confiança ${resultado.confianca}%</div>
    </div>

    <div class="ia-grid">
      <div class="ia-item">
        <span>Tendência</span>
        <strong>${resultado.tendencia}</strong>
      </div>
      <div class="ia-item">
        <span>Prazo sugerido</span>
        <strong>${resultado.prazo}</strong>
      </div>
      <div class="ia-item">
        <span>Força do mercado</span>
        <strong>${resultado.forca}</strong>
      </div>
      <div class="ia-item">
        <span>RSI</span>
        <strong>${resultado.rsi}</strong>
      </div>
    </div>

    <div class="ia-reason">${resultado.motivo}</div>
  `;
}

function assinaturaMercadoAtual() {
  if (historico.length < 20) return "sem-dados";

  const atual = historico[historico.length - 1];
  const media5 = historico.slice(-5).reduce((a, b) => a + b, 0) / 5;
  const media20 = historico.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const rsi = calcularRSISimples(historico);

  return [
    atual.toFixed(2),
    media5.toFixed(2),
    media20.toFixed(2),
    rsi ? rsi.toFixed(0) : "na"
  ].join("|");
}

function operacaoInteligente() {
  const assinatura = assinaturaMercadoAtual();
  if (ultimaOperacaoIA && assinatura === ultimaAssinaturaMercado) {
    renderOperacaoIA(ultimaOperacaoIA);
    return;
  }

  const resultado = analisarOperacaoInteligente();
  ultimaOperacaoIA = resultado;
  ultimaAssinaturaMercado = assinatura;

  renderOperacaoIA(resultado);
}
window.addEventListener("load", () => {
  const btnOp = document.getElementById("btnOp");
  if (btnOp) {
    btnOp.onclick = operacaoInteligente;
  }
});
function validarOperacao(op) {

  if (op.direcao === "SEM ENTRADA") return;

  const precoEntrada = historico[historico.length - 1];

  let tempo = 1;

  if (op.prazo.includes("3")) tempo = 3;
  if (op.prazo.includes("5")) tempo = 5;

  setTimeout(() => {

    const precoFinal = historico[historico.length - 1];

    let acertou = false;

    if (op.direcao === "COMPRA" && precoFinal > precoEntrada) {
      acertou = true;
    }

    if (op.direcao === "VENDA" && precoFinal < precoEntrada) {
      acertou = true;
    }

    if (acertou) {
      statsIA.acertos++;
    } else {
      statsIA.erros++;
    }

    atualizarStatsIA();

  }, tempo * 60 * 1000); // minutos reais

}
function atualizarStatsIA() {

  const total = statsIA.acertos + statsIA.erros;

  const taxa = total > 0
    ? ((statsIA.acertos / total) * 100).toFixed(0)
    : 0;

  document.getElementById("acertos").innerText = statsIA.acertos;
  document.getElementById("erros").innerText = statsIA.erros;
  document.getElementById("taxa").innerText = taxa + "%";
}
