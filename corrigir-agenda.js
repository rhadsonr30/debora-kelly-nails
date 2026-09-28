const fs = require("fs");

const p = "app/agenda/page.tsx";
let s = fs.readFileSync(p, "utf8");

const anterior = String.fromCharCode(8592) + " Anterior";
const proximo = "Próximo " + String.fromCharCode(8594);
const ok = String.fromCodePoint(0x1f7e2);
const bloqueio = String.fromCodePoint(0x1f512);
const agenda = String.fromCodePoint(0x1f485);
const info = String.fromCodePoint(0x23f1);

s = s.replace(/Anterior Anterior/g, anterior);
s = s.replace(/Proximo Anterior'/g, proximo);
s = s.replace(/\[OK\]/g, ok);
s = s.replace(/\[BLOQUEIO\]/g, bloqueio);
s = s.replace(/\[AGENDA\]/g, agenda);
s = s.replace(/\[INFO\]/g, info);

s = s.replace(/horarios/g, "horários");
s = s.replace(/Horario disponivel/g, "Horário disponível");
s = s.replace(/Tolerancia/g, "Tolerância");
s = s.replace(/Apos/g, "Após");
s = s.replace(/periodo/g, "período");
s = s.replace(/podera/g, "poderá");
s = s.replace(/Controle dos horarios da Debora/g, "Controle dos horários da Débora");
s = s.replace(/\bas\b/g, "às");

fs.writeFileSync(p, s, "utf8");
console.log("AGENDA FORMATADA");
