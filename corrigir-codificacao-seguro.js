const fs = require("fs");
const path = require("path");

const extensoes = [".tsx", ".ts", ".jsx", ".js", ".json", ".css"];

const correcoes = {
  "á": "á",
  "é": "é",
  "í": "í",
  "ó": "ó",
  "ú": "ú",
  "ã": "ã",
  "õ": "õ",
  "â": "â",
  "ê": "ê",
  "ô": "ô",
  "ç": "ç",
  "À": "À",
  "É": "É",
  "Ó": "Ó",
  "Ú": "Ú",
  "Ç": "Ç",
  "º": "º",
  "ª": "ª",
  "’": "’",
  "“": "“",
  "”": "”",
  "”“": "–",
  "””": "—"
};

function corrigirTexto(texto) {
  let resultado = texto;

  for (const [errado, correto] of Object.entries(correcoes)) {
    resultado = resultado.split(errado).join(correto);
  }

  return resultado;
}

function percorrer(pasta) {
  for (const item of fs.readdirSync(pasta)) {
    if (["node_modules", ".next", ".git"].includes(item)) {
      continue;
    }

    const caminho = path.join(pasta, item);
    const stat = fs.statSync(caminho);

    if (stat.isDirectory()) {
      percorrer(caminho);
      continue;
    }

    if (!extensoes.includes(path.extname(item))) {
      continue;
    }

    const original = fs.readFileSync(caminho, "utf8");
    const corrigido = corrigirTexto(original);

    if (original !== corrigido) {
      fs.writeFileSync(caminho, corrigido, "utf8");
      console.log("Corrigido:", caminho);
    }
  }
}

console.log("Iniciando verificação de codificação...");
percorrer(process.cwd());
console.log("Verificação concluída.");
