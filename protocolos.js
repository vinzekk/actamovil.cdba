/* PROTOCOLOS · lector de los protocolos de actuación (texto en PROTOCOLOS_DATA, ver protocolos-data.js). */
(() => {
  const $ = (s) => document.querySelector(s);
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const sinAcentos = (t) => String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const DATA = typeof PROTOCOLOS_DATA !== "undefined" ? PROTOCOLOS_DATA : [];
  const lista = $("#prLista"), ver = $("#prVer"), cuerpo = $("#prCuerpo"), busq = $("#prBuscar");
  let actual = null, term = "";

  $("#prTiles").innerHTML = DATA.map((p, i) => `
    <button type="button" class="tile hero" data-pr="${i}">
      <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>
      <span><b>${i + 1}. ${esc(p.nombre)}</b><small>${esc(p.sub)}</small></span>
    </button>`).join("");

  function resaltar(texto) {
    const e = esc(texto);
    if (!term) return e;
    const t = sinAcentos(texto), q = sinAcentos(term);
    // el texto normalizado conserva el largo, así que los índices coinciden
    if (t.length !== texto.length) return e;
    let out = "", i = 0, k;
    while ((k = t.indexOf(q, i)) !== -1) { out += esc(texto.slice(i, k)) + "<mark>" + esc(texto.slice(k, k + q.length)) + "</mark>"; i = k + q.length; }
    return out + esc(texto.slice(i));
  }
  function parrafo(p) {
    if (p.startsWith("## ")) return `<h3>${resaltar(p.slice(3))}</h3>`;
    if (p.startsWith("• ")) return `<div class="pr-b"><span aria-hidden="true">•</span><span>${resaltar(p.slice(2))}</span></div>`;
    if (/^(\d{1,2}[\.\)]|[a-z][\.\)])\s/.test(p)) return `<div class="pr-b pr-n">${resaltar(p)}</div>`;
    return `<p>${resaltar(p)}</p>`;
  }
  function cuerpoSec(s, solo) {
    const ps = solo ? s.p.filter((p) => sinAcentos(p).includes(sinAcentos(term))) : s.p;
    return ps.map(parrafo).join("") || `<p class="nota">Sin texto en esta parte.</p>`;
  }
  function pintar() {
    const pr = DATA[actual]; if (!pr) return;
    const q = sinAcentos(term.trim());
    let n = 0;
    const html = pr.secs.map((s, i) => {
      if (s.cap) return `<h2 class="pr-cap">${esc(s.t)}</h2>`;
      const coincideTit = q && sinAcentos(s.t).includes(q);
      const coincide = q ? coincideTit || s.p.some((p) => sinAcentos(p).includes(q)) : true;
      if (!coincide) return "";
      n++;
      const abierto = !!q;
      return `<details class="grupo pr-sec" data-i="${i}" ${abierto ? "open" : ""}>
        <summary><span class="t">${resaltar(s.t)}</span></summary>
        <div class="pr-cuerpo">${abierto ? cuerpoSec(s, !coincideTit) : ""}</div></details>`;
    }).join("");
    cuerpo.innerHTML = html || `<p class="an-vacio">No se encontró «${esc(term)}» en este protocolo.</p>`;
    $("#prCuenta").textContent = q ? `${n} ${n === 1 ? "parte coincide" : "partes coinciden"}` : `${pr.secs.filter((s) => !s.cap).length} partes`;
  }
  function abrir(i) {
    actual = i; term = ""; busq.value = "";
    const pr = DATA[i];
    $("#prTit").textContent = `${i + 1}. ${pr.nombre}`;
    $("#prSub").textContent = pr.sub;
    lista.hidden = true; ver.hidden = false;
    pintar(); window.scrollTo({ top: 0 });
  }
  function volver() { ver.hidden = true; lista.hidden = false; window.scrollTo({ top: 0 }); }

  $("#prTiles").addEventListener("click", (e) => { const b = e.target.closest("[data-pr]"); if (b) abrir(+b.dataset.pr); });
  $("#prVolver").addEventListener("click", volver);
  // el contenido de cada parte se arma recién al abrirla (el texto es largo)
  cuerpo.addEventListener("toggle", (e) => {
    const d = e.target; if (!d.matches || !d.matches("details.pr-sec") || !d.open) return;
    const c = d.querySelector(".pr-cuerpo"); if (c.childElementCount) return;
    c.innerHTML = cuerpoSec(DATA[actual].secs[+d.dataset.i], false);
  }, true);
  let t0;
  busq.addEventListener("input", () => { clearTimeout(t0); t0 = setTimeout(() => { term = busq.value; pintar(); }, 200); });
  // al salir de la pestaña vuelve a la lista
  window.addEventListener("hashchange", () => { if (!/^#?\/?protocolos/.test(location.hash) && !ver.hidden) volver(); });
})();
