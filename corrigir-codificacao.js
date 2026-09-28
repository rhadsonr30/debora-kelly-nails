const fs = require("fs");
const path = require("path");

function arquivos(dir) {
  let resultado = [];

  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const caminho = path.join(dir, item.name);

    if (item.isDirectory()) {
      resultado = resultado.concat(arquivos(caminho));
    } else if (item.isFile() && caminho.endsWith(".tsx")) {
      resultado.push(caminho);
    }
  }

  return resultado;
}

function corrigir(s) {
  const mapa = [
    ["ã", "ã"],
    ["á", "á"],
    ["é", "é"],
    ["í", "í"],
    ["ó", "ó"],
    ["ú", "ú"],
    ["ç", "ç"],
    ["Ã ", "à"],
    ["â", "â"],
    ["ê", "ê"],
    ["ô", "ô"],
    ["õ", "õ"],
    ["É", "É"],
    ["À", "À"],
    ["Ã ", "à"],
    ["””", "—"],
    ["”“", "–"],
    ["â†", "←"],
    ["â†’", "→"],
    ["âœ“", "✓"],
    ["ðŸŸ¢", "🟢"],
    ["ðŸ”’", "🔒"],
    ["ðŸ’…", "💅"],
    ["ðŸ“±", "📱"],
    ["â°", "⏱"],
    ["Não", "Não"],
    ["não", "não"],
    ["possível", "possível"],
    ["horário", "horário"],
    ["horários", "horários"],
    ["Serviço", "Serviço"],
    ["serviço", "serviço"],
    ["Débora", "Débora"],
    ["Olá", "Olá"],
    ["fácil", "fácil"],
    ["disponível", "disponível"],
    ["Após", "Após"],
    ["período", "período"],
    ["poderá", "poderá"]
  ];

  for (const [errado, correto] of mapa) {
    s = s.split(errado).join(correto);
  }

  return s;
}

const arquivosApp = arquivos("./app");
let alterados = 0;

for (const arquivo of arquivosApp) {
  const original = fs.readFileSync(arquivo, "utf8");
  const corrigido = corrigir(original);

  if (corrigido !== original) {
    fs.writeFileSync(arquivo, corrigido, "utf8");
    console.log("Corrigido:", arquivo);
    alterados++;
  }
}

console.log("TOTAL DE ARQUIVOS CORRIGIDOS:", alterados);
