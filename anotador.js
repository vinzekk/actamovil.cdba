/* ANOTADOR · bloc de notas operativo con hora automática.
   Se guarda solo en este dispositivo (localStorage) y respeta el borrado automático configurado en "Mis datos". */
(() => {
  const LS = "op_cba_anot_v1";
  const LS_CFG = "op_cba_cfg_v1";
  const $ = (s) => document.querySelector(s);

  // Tipos de anotación rápida y datos que se piden en el panel lateral
  const TIPOS = {
    amb_llegada: { chip: "Llegó ambulancia", texto: "Llegó la ambulancia", campos: [
      ["medico", "Médico/a (Dr./Dra.)", "Apellido y nombre"],
      ["mat", "Matrícula M.P.", "N° de matrícula"],
      ["movil", "N° de móvil", "Ej: 12"],
      ["serv", "Servicio / empresa", "Emergencias, hospital, privado"],
      ["pers", "Chofer / enfermero/a", ""],
      ["obs", "Observaciones", "", true]
    ] },
    amb_retiro: { chip: "Se retiró ambulancia", texto: "Se retiró la ambulancia", campos: [
      ["destino", "Destino del traslado", "Hospital / clínica"],
      ["pers", "Persona trasladada", "Apellido y nombre"],
      ["obs", "Observaciones", "", true]
    ] },
    movil: { chip: "Llegó móvil policial", texto: "Llegó móvil policial", campos: [
      ["movil", "N° de móvil", ""],
      ["jefe", "Jefe/a de móvil", "Jerarquía, apellido y nombre"],
      ["dot", "Dotación (cantidad)", ""],
      ["obs", "Observaciones", "", true]
    ] },
    cientifica: { chip: "Llegó Pol. Científica", texto: "Llegó Policía Científica", campos: [
      ["jefe", "Responsable", "Jerarquía, apellido y nombre"],
      ["movil", "N° de móvil", ""],
      ["obs", "Observaciones", "", true]
    ] },
    judicial: { chip: "Llegó autoridad judicial", texto: "Llegó autoridad judicial", campos: [
      ["nombre", "Nombre y cargo", "Fiscal, secretario/a"],
      ["unidad", "Fiscalía / Unidad Judicial", ""],
      ["obs", "Observaciones", "", true]
    ] },
    bomberos: { chip: "Llegaron bomberos", texto: "Llegaron bomberos", campos: [
      ["jefe", "Jefe/a de dotación", ""],
      ["movil", "N° de unidad", ""],
      ["obs", "Observaciones", "", true]
    ] },
    libre: { texto: "", campos: [["obs", "Datos adicionales", "", true]] }
  };
  const ROT = {
    medico: "Dr./Dra.", mat: "M.P.", movil: "Móvil", serv: "Servicio", pers: "Personal", destino: "Destino",
    jefe: "Jefe", dot: "Dotación", nombre: "Nombre", unidad: "Unidad", obs: "Obs."
  };

  let datos = { upd: 0, items: [] };
  try { const g = JSON.parse(localStorage.getItem(LS)); if (g && Array.isArray(g.items)) datos = g; } catch {}
  // Borrado automático según lo configurado para los borradores
  try {
    const cfg = JSON.parse(localStorage.getItem(LS_CFG)) || { horas: 24 };
    if (cfg.horas > 0 && datos.upd && Date.now() - datos.upd > cfg.horas * 3600000) datos = { upd: 0, items: [] };
  } catch {}

  const guardar = () => {
    datos.upd = Date.now();
    try { localStorage.setItem(LS, JSON.stringify(datos)); } catch {}
  };
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const p2 = (n) => String(n).padStart(2, "0");
  const hhmm = (ts) => { const d = new Date(ts); return `${p2(d.getHours())}:${p2(d.getMinutes())}`; };
  const idNuevo = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const toast = (m) => {
    const el = $("#toast"); if (!el) return;
    const dlg = document.querySelector("dialog[open]");
    (dlg || document.body).appendChild(el);
    $("#toastTx").textContent = m; $("#toastBtn").hidden = true;
    el.classList.add("ver"); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove("ver"), 2200);
  };

  function resumen(it) {
    const t = TIPOS[it.tipo] || TIPOS.libre;
    return t.campos.map(([k]) => (it.f && it.f[k] ? `${ROT[k]} ${it.f[k]}` : "")).filter(Boolean).join(" · ");
  }

  function pintar() {
    const items = [...datos.items].sort((a, b) => a.ts - b.ts);
    const hoy = new Date();
    $("#anFecha").textContent = hoy.toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
    $("#anLista").innerHTML = items.length ? items.map((it) => {
      const r = resumen(it);
      return `<button type="button" class="an-item${it.nuevo ? " nuevo" : ""}" data-id="${it.id}">
        <span class="an-h">${hhmm(it.ts)}</span><span class="an-t">${esc(it.txt || "(sin texto)")}</span>${r ? `<span class="an-d">${esc(r)}</span>` : ""}</button>`;
    }).join("") : `<p class="an-vacio">Todavía no hay anotaciones. Tocá una opción rápida o escribí abajo: la hora se pone sola.</p>`;
  }

  function agregar(tipo, txt) {
    const t = TIPOS[tipo] || TIPOS.libre;
    const it = { id: idNuevo(), ts: Date.now(), tipo, txt: txt || t.texto, f: {}, nuevo: true };
    datos.items.push(it);
    guardar(); pintar();
    setTimeout(() => { it.nuevo = false; pintar(); }, 1500);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    return it;
  }

  // ---- Panel lateral ----
  let actual = null;
  const panel = $("#anPanel");
  function abrirPanel(id) {
    const it = datos.items.find((x) => x.id === id); if (!it) return;
    actual = it;
    const t = TIPOS[it.tipo] || TIPOS.libre;
    const campos = t.campos.map(([k, et, ph, area]) => `
      <div class="an-camp"><label for="anf_${k}">${et}</label>
        ${area ? `<textarea id="anf_${k}" data-k="${k}" rows="3" placeholder="${esc(ph)}">${esc(it.f[k] || "")}</textarea>`
               : `<input id="anf_${k}" data-k="${k}" type="text" autocomplete="off" placeholder="${esc(ph)}" value="${esc(it.f[k] || "")}">`}</div>`).join("");
    $("#anPanelCuerpo").innerHTML = `
      <div class="an-camp"><label for="anf_hora">Hora</label><input id="anf_hora" type="time" value="${hhmm(it.ts)}"></div>
      <div class="an-camp"><label for="anf_txt">Anotación</label><input id="anf_txt" type="text" autocomplete="off" value="${esc(it.txt)}"></div>
      ${campos}`;
    $("#anPanelTit").textContent = (t.chip || "Anotación") + " · " + hhmm(it.ts);
    $("#anBorrar").textContent = "Borrar anotación"; $("#anBorrar").dataset.c = "";
    if (!panel.open) panel.showModal();
  }
  function cerrarPanel() { if (panel.open) panel.close(); actual = null; pintar(); }

  $("#anPanelCuerpo").addEventListener("input", (e) => {
    if (!actual) return;
    const el = e.target;
    if (el.id === "anf_hora") {
      const m = /^(\d{2}):(\d{2})$/.exec(el.value); if (!m) return;
      const d = new Date(actual.ts); d.setHours(+m[1], +m[2], 0, 0); actual.ts = d.getTime();
      $("#anPanelTit").textContent = ((TIPOS[actual.tipo] || {}).chip || "Anotación") + " · " + hhmm(actual.ts);
    } else if (el.id === "anf_txt") actual.txt = el.value;
    else if (el.dataset.k) actual.f[el.dataset.k] = el.value;
    guardar();
  });
  $("#anCerrar").addEventListener("click", cerrarPanel);
  panel.addEventListener("close", () => { actual = null; pintar(); });
  panel.addEventListener("click", (e) => { if (e.target === panel) cerrarPanel(); }); // toque en el fondo
  $("#anBorrar").addEventListener("click", (e) => {
    const b = e.currentTarget;
    if (b.dataset.c !== "1") { b.dataset.c = "1"; b.textContent = "Tocá de nuevo para borrar"; setTimeout(() => { b.dataset.c = ""; b.textContent = "Borrar anotación"; }, 4000); return; }
    datos.items = datos.items.filter((x) => x !== actual); guardar(); cerrarPanel(); toast("Anotación borrada");
  });

  // ---- Entrada y opciones rápidas ----
  $("#anChips").innerHTML = Object.entries(TIPOS).filter(([, t]) => t.chip)
    .map(([k, t]) => `<button type="button" class="chip" data-tipo="${k}">${t.chip}</button>`).join("");
  $("#anChips").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tipo]"); if (!b) return;
    const it = agregar(b.dataset.tipo);
    abrirPanel(it.id); // se abre el formulario lateral para cargar los datos
  });
  function anotarTexto() {
    const i = $("#anTxt"); const v = i.value.trim(); if (!v) { i.focus(); return; }
    agregar("libre", v); i.value = ""; i.focus();
  }
  $("#anAdd").addEventListener("click", anotarTexto);
  $("#anTxt").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); anotarTexto(); } });
  $("#anLista").addEventListener("click", (e) => { const b = e.target.closest("[data-id]"); if (b) abrirPanel(b.dataset.id); });

  // ---- Copiar / vaciar ----
  function textoPlano() {
    const f = new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const l = [...datos.items].sort((a, b) => a.ts - b.ts).map((it) => {
      const r = resumen(it);
      return `${hhmm(it.ts)} - ${it.txt || "(sin texto)"}${r ? " (" + r + ")" : ""}`;
    });
    return `ANOTADOR - ${f}\n` + l.join("\n");
  }
  $("#anCopiar").addEventListener("click", async () => {
    if (!datos.items.length) { toast("No hay anotaciones para copiar"); return; }
    const txt = textoPlano();
    try { await navigator.clipboard.writeText(txt); toast("Anotador copiado"); }
    catch {
      const ta = document.createElement("textarea"); ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand("copy"); } catch {}
      ta.remove(); toast(ok ? "Anotador copiado" : "No se pudo copiar");
    }
  });
  $("#anVaciar").addEventListener("click", (e) => {
    const b = e.currentTarget;
    if (!datos.items.length) { toast("El anotador ya está vacío"); return; }
    if (b.dataset.c !== "1") { b.dataset.c = "1"; b.textContent = "¿Seguro? Tocá de nuevo"; setTimeout(() => { b.dataset.c = ""; b.textContent = "Vaciar"; }, 4000); return; }
    b.dataset.c = ""; b.textContent = "Vaciar";
    datos = { upd: 0, items: [] }; try { localStorage.removeItem(LS); } catch {}
    pintar(); toast("Anotador vaciado");
  });

  pintar();
})();
