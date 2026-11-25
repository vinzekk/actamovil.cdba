(() => {
  const LS_PERFIL = "op_cba_perfil_v1";
  const LS_BORRADOR = "op_cba_borrador_v1";
  const LS_FAV = "op_cba_favs_v1";
  const LS_TEMA = "op_cba_tema_v1";
  const LS_TEMA2 = "op_cba_tema_v2";

  const MESES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];

  const DIAS_LETRAS = {
    1: "uno", 2: "dos", 3: "tres", 4: "cuatro", 5: "cinco",
    6: "seis", 7: "siete", 8: "ocho", 9: "nueve", 10: "diez",
    11: "once", 12: "doce", 13: "trece", 14: "catorce", 15: "quince",
    16: "dieciséis", 17: "diecisiete", 18: "dieciocho", 19: "diecinueve", 20: "veinte",
    21: "veintiuno", 22: "veintidós", 23: "veintitrés", 24: "veinticuatro", 25: "veinticinco",
    26: "veintiséis", 27: "veintisiete", 28: "veintiocho", 29: "veintinueve", 30: "treinta",
    31: "treinta y uno"
  };

  const ANOS_DOS_MIL = {
    24: "veinticuatro",
    25: "veinticinco",
    26: "veintiséis",
    27: "veintisiete",
    28: "veintiocho",
    29: "veintinueve",
    30: "treinta",
    31: "treinta y uno",
    32: "treinta y dos",
    33: "treinta y tres",
    34: "treinta y cuatro",
    35: "treinta y cinco"
  };

  const CATALOGO_CODIGOS = typeof CODIGOS_BASE !== "undefined" ? CODIGOS_BASE : [];

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];

  let estado = {
    tipo: Object.keys(PLANTILLAS)[0],
    valores: {},
    testigoOk: false
  };

  let perfil = loadJSON(LS_PERFIL, {
    FUNCIONARIO: "",
    DEPENDENCIA: "",
    LOCALIDAD: "Río Cuarto",
    DEPARTAMENTO: "Río Cuarto"
  });

  let favoritos = loadJSON(LS_FAV, []);

  const LS_BORR = "op_cba_borradores_v2";
  const LS_CFG = "op_cba_cfg_v1";
  const LS_CONT = "op_cba_contactos_v1";
  const LS_GUIA = "op_cba_guia_v1";
  const NORMATIVA_VERSION = "20/11/2026 (Ley 10.326 según B.O. 28/03/2016; Código Penal T.O. 1984 actualizado; CPP Córdoba Ley 8.123 según SAIJ)";
  const CONT_DEF = [
    { n: "Emergencias 911", t: "911" }, { n: "Fiscalía de turno", t: "" },
    { n: "Unidad Judicial", t: "" }, { n: "SeNAF", t: "" }, { n: "Mi dependencia", t: "" }
  ];
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  let store = { list: [], act: null };
  let cfg = loadJSON(LS_CFG, { horas: 24 });
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  async function persistir() {
    try { localStorage.setItem(LS_BORR, JSON.stringify(store)); } catch {}
  }
  function nuevoItem(est) {
    return { id: uid(), ts: Date.now(), estado: est || { tipo: Object.keys(PLANTILLAS)[0], valores: {}, testigoOk: false } };
  }
  function purgar() {
    if (cfg.horas > 0) {
      const lim = Date.now() - cfg.horas * 3600000;
      store.list = store.list.filter((x) => x.ts >= lim);
    }
  }
  async function cargarStore() {
    const raw = localStorage.getItem(LS_BORR);
    if (raw) {
      try {
        const o = JSON.parse(raw);
        store = o.enc ? { list: [], act: null } : o;
      } catch { store = { list: [], act: null }; }
    }
    const viejo = loadJSON(LS_BORRADOR, null);
    if (viejo && PLANTILLAS[viejo.tipo]) {
      store.list.push(nuevoItem({ tipo: viejo.tipo, valores: viejo.valores || {}, testigoOk: !!viejo.testigoOk }));
    }
    try { localStorage.removeItem(LS_BORRADOR); } catch {}
    store.list = (store.list || []).filter((x) => x && x.estado && PLANTILLAS[x.estado.tipo]);
    purgar();
    if (!store.list.length) store.list.push(nuevoItem());
    const it = store.list.find((x) => x.id === store.act) || store.list[0];
    store.act = it.id;
    estado = it.estado;
    await persistir();
  }

  function setVal(id, v) {
    if (id in estado.valores) {
      estado.valores[id] = v;
      const el = $(`#f_${id}`);
      if (el) el.value = v;
    }
  }

  function aplicarFechaHora() {
    const now = new Date();
    const diaNum = now.getDate();
    const yy = now.getFullYear() % 100;
    setVal("DIA", DIAS_LETRAS[diaNum] || String(diaNum));
    setVal("MES", MESES[now.getMonth()]);
    setVal("AÑO", ANOS_DOS_MIL[yy] || String(yy).padStart(2, "0"));
    setVal("HORA", String(now.getHours()).padStart(2, "0"));
    setVal("MINUTOS", String(now.getMinutes()).padStart(2, "0"));
  }

  function htmlActa(txt) {
    // Si un dato ocupa varios párrafos, se cierra y reabre la marca en cada uno
    txt = String(txt).replace(/\u0001([\s\S]*?)\u0002/g, (m, x) =>
      x.split(/(\n\s*\n)/).map((s) => (/^\n\s*\n$/.test(s) || !s ? s : "\u0001" + s + "\u0002")).join(""));
    const partes = String(txt).split(/\n\s*\n/);
    const titulo = partes.length > 1 && partes[0].length < 90 ? `<h1>${escapeHtml(partes.shift().replace(/[\u0001\u0002]/g, "").trim())}</h1>` : "";
    const cuerpo = partes.map((p) => `<p>${conTinta(escapeHtml(p).replace(/\n/g, "<br>"), true)}</p>`).join("");
    return `<div class="acta"><div class="enc">POLICÍA DE LA PROVINCIA DE CÓRDOBA</div>${titulo}${cuerpo}</div>`;
  }

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJSON(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  }

  function normalizarTexto(str) {
    return String(str ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function extraerTerminosBusqueda(qRaw) {
    const qNorm = normalizarTexto(qRaw);
    if (!qNorm) return [];
    const tokens = qNorm.split(/[\s.,;:()°º-]+/).filter(Boolean);
    const limpios = tokens.filter((t) => !STOPWORDS.has(t));
    return limpios.length ? limpios : tokens;
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function sincronizarPerfilEnActa(forzar = false) {
    const pl = PLANTILLAS[estado.tipo];
    if (!pl) return;
    pl.campos.forEach((c) => {
      if (c.perfil && perfil[c.id] && (forzar || !estado.valores[c.id])) {
        estado.valores[c.id] = perfil[c.id];
        const inp = $(`#f_${c.id}`);
        if (inp) inp.value = perfil[c.id];
      }
    });
  }

  function cargarValoresPorDefecto(limpiarTodo) {
    const pl = PLANTILLAS[estado.tipo];
    const nuevos = {};
    pl.campos.forEach((c) => {
      if (!limpiarTodo && estado.valores[c.id] !== undefined) {
        nuevos[c.id] = estado.valores[c.id];
      } else if (c.perfil && perfil[c.id]) {
        nuevos[c.id] = perfil[c.id];
      } else if (c.def !== undefined) {
        nuevos[c.id] = c.def;
      } else {
        nuevos[c.id] = "";
      }
    });
    estado.valores = nuevos;
  }

  // Marcas internas para pintar lo completado (U+0001 abre, U+0002 cierra)
  const TINTA = "#1f4fc4";
  function construirTextoActa(conMarcas = false) {
    const pl = PLANTILLAS[estado.tipo];
    const datos = {};
    pl.campos.forEach((c) => {
      const v = (estado.valores[c.id] ?? "").trim();
      datos[c.id] = v ? (conMarcas ? "\u0001" + v + "\u0002" : v) : "______________________";
    });
    return pl.texto(datos);
  }
  function conTinta(html, inline) {
    const abre = inline ? `<span style="color:${TINTA}">` : '<span class="tinta">';
    return html.replace(/\u0001/g, abre).replace(/\u0002/g, "</span>");
  }

  const STOPWORDS = new Set(["art", "arts", "articulo", "articulos", "ley", "del", "de", "la", "el", "en", "y", "o", "por", "sin", "con"]);


  // =====================================================================
  //  Interfaz v4 · utilidades
  // =====================================================================
  const PAGINA = 30;
  const TABS = ["actas", "codigos", "perfil"];

  function toast(msg, opt) {
    const el = $("#toast");
    const dlg = document.querySelector("dialog[open]");
    (dlg || document.body).appendChild(el);
    $("#toastTx").textContent = msg;
    const b = $("#toastBtn");
    if (opt && opt.accion) {
      b.hidden = false;
      b.textContent = opt.accion;
      b.onclick = () => { el.classList.remove("ver"); opt.fn(); };
    } else {
      b.hidden = true;
      b.onclick = null;
    }
    el.classList.add("ver");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("ver"), (opt && opt.dur) || (opt && opt.accion ? 8000 : 2400));
  }

  // ---------- Tema: Auto (sistema) / Día (sol) / Noche ----------
  const MODOS = ["auto", "dia", "noche"];
  const ETQ_MODO = { auto: "Auto", dia: "Día", noche: "Noche" };
  let modoTema = (() => {
    const v2 = loadJSON(LS_TEMA2, null);
    if (MODOS.includes(v2)) return v2;
    const v1 = loadJSON(LS_TEMA, null); // compatibilidad con la versión anterior
    return v1 === "light" ? "dia" : v1 === "dark" ? "noche" : "auto";
  })();
  const mqClaro = window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;
  function aplicarTema(modo) {
    modoTema = modo;
    const claro = modo === "dia" || (modo === "auto" && mqClaro && mqClaro.matches);
    document.documentElement.setAttribute("data-theme", claro ? "light" : "dark");
    saveJSON(LS_TEMA2, modo);
    const tc = document.querySelector('meta[name="theme-color"]');
    if (tc) tc.setAttribute("content", claro ? "#EDF0F5" : "#0A111C");
    const b = $("#th");
    if (b) { b.textContent = ETQ_MODO[modo]; b.setAttribute("aria-label", `Tema: ${ETQ_MODO[modo]}. Tocar para cambiar`); }
  }
  if (mqClaro && mqClaro.addEventListener) mqClaro.addEventListener("change", () => { if (modoTema === "auto") aplicarTema("auto"); });
  $("#th").addEventListener("click", () => aplicarTema(MODOS[(MODOS.indexOf(modoTema) + 1) % MODOS.length]));
  aplicarTema(modoTema);

  // ---------- Navegación inferior (con botón "atrás" del teléfono) ----------
  function mostrar(t) {
    if (!TABS.includes(t)) t = "actas";
    document.body.dataset.tab = t;
    $$("main .tab").forEach((s) => s.classList.toggle("on", s.id === t));
    $$("nav.bar button").forEach((b) => {
      if (b.dataset.t === t) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
    window.scrollTo(0, 0);
    if (t === "codigos") renderCodigos();
  }
  function irA(t) {
    if ((location.hash.slice(1) || "actas") === t) mostrar(t); else location.hash = t;
  }
  $$("nav.bar button").forEach((b) => b.addEventListener("click", () => {
    irA(b.dataset.t);
    if (b.dataset.t === "codigos") setTimeout(() => $("#q").focus(), 60);
  }));
  $$("[data-ir]").forEach((b) => b.addEventListener("click", () => irA(b.dataset.ir)));
  window.addEventListener("hashchange", () => mostrar(location.hash.slice(1)));

  // =====================================================================
  //  Borradores (con "Deshacer" en lugar de ventanas de confirmación)
  // =====================================================================
  function renderBorradores() {
    $("#hBorrN").textContent = store.list.length;
    if ($("#dBorr").open) pintarBorradores();
  }
  function pintarBorradores() {
    $("#listaBorr").innerHTML = store.list.map((x, i) => {
      const h = new Date(x.ts).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
      return `<div class="item-borr" data-act="${x.id === store.act ? 1 : 0}"><button type="button" class="nom" data-abrir="${x.id}">${i + 1}. ${escapeHtml(nombreCorto(x.estado.tipo))}<small>${h}${x.id === store.act ? " · en edición" : ""}</small></button><button type="button" class="crit sm" data-quitar="${x.id}">Borrar</button></div>`;
    }).join("");
    $("#notaBorr2").textContent = cfg.horas > 0 ? `Se borran solos a las ${cfg.horas} h de la última edición.` : "No se borran automáticamente.";
  }
  function abrirBorradores() {
    const d = $("#dBorr");
    if (!d.open) { if (d.showModal) d.showModal(); else d.setAttribute("open", ""); }
    pintarBorradores();
  }
  function borrarPorId(id) {
    const snap = instantanea();
    store.list = store.list.filter((x) => x.id !== id);
    if (!store.list.length) store.list.push(nuevoItem());
    if (id === store.act || !store.list.find((x) => x.id === store.act)) { store.act = null; persistir(); cambiarBorrador(store.list[0].id); }
    else { persistir(); renderBorradores(); }
    toast("Borrador borrado", { accion: "Deshacer", fn: () => restaurar(snap) });
  }
  $("#hBorr").addEventListener("click", abrirBorradores);
  $("#cerrarBorr").addEventListener("click", () => $("#dBorr").close());
  $("#nuevoBorr2").addEventListener("click", () => { nuevoBorrador(); $("#dBorr").close(); });
  $("#listaBorr").addEventListener("click", (e) => {
    const ab = e.target.closest("[data-abrir]"), qu = e.target.closest("[data-quitar]");
    if (ab) { cambiarBorrador(ab.dataset.abrir); $("#dBorr").close(); }
    if (qu) borrarPorId(qu.dataset.quitar);
  });
  function cambiarBorrador(id) {
    guardarBorrador();
    const it = store.list.find((x) => x.id === id);
    if (!it) return;
    store.act = id;
    estado = it.estado;
    renderTipos();
    cargarValoresPorDefecto(false);
    renderFormulario();
    renderChecklist();
    autoCompletar();
  }
  function nuevoBorrador() {
    const it = nuevoItem();
    store.list.push(it);
    cambiarBorrador(it.id);
    toast("Borrador nuevo");
  }
  const instantanea = () => JSON.stringify(store);
  function restaurar(s) {
    try { store = JSON.parse(s); } catch { return; }
    const it = store.list.find((x) => x.id === store.act) || store.list[0];
    store.act = it.id;
    estado = it.estado;
    persistir();
    renderTipos(); renderFormulario(); renderChecklist(); autoCompletar();
    toast("Restaurado");
  }
  function borrarBorrador() {
    const snap = instantanea();
    store.list = store.list.filter((x) => x.id !== store.act);
    if (!store.list.length) store.list.push(nuevoItem());
    store.act = null;
    persistir();
    cambiarBorrador(store.list[0].id);
    toast("Borrador borrado", { accion: "Deshacer", fn: () => restaurar(snap) });
  }
  function vaciarActa() {
    const snap = instantanea();
    cargarValoresPorDefecto(true);
    estado.chk = {};
    renderFormulario(); renderChecklist(); autoCompletar();
    toast("Acta vaciada", { accion: "Deshacer", fn: () => restaurar(snap) });
  }

  // =====================================================================
  //  Tipo de acta (selector grande en lugar de lista desplegable)
  // =====================================================================
  const CORTO = { contravencional: "Contravencional", secuestro: "Secuestro", inspeccion: "Inspección", aprehension: "Aprehensión" };
  const nombreCorto = (k) => CORTO[k] || PLANTILLAS[k].nombre.replace(/^\d+\.\s*/, "");
  function renderTipos() {
    $("#tipos").innerHTML = Object.keys(PLANTILLAS).map((k) => {
      const a = nombreCorto(k);
      return `<button type="button" role="radio" data-tipo="${k}" aria-checked="${k === estado.tipo}">${escapeHtml(a)}</button>`;
    }).join("");
  }
  $("#tipos").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-tipo]");
    if (!b || b.dataset.tipo === estado.tipo) return;
    estado.tipo = b.dataset.tipo;
    renderTipos();
    cargarValoresPorDefecto(false);
    renderFormulario();
    autoCompletar();
  });

  // =====================================================================
  //  Guía y contactos
  // =====================================================================
  // ---------- Dictado por voz ----------
  let reco = null;
  function toggleDictado(id, btn) {
    if (reco) { reco.stop(); return; }
    if (!loadJSON("op_cba_aviso_voz", false)) {
      saveJSON("op_cba_aviso_voz", true);
      toast("El dictado usa el servicio de voz del navegador y puede enviar el audio a servidores externos. Evitá dictar datos personales.", { dur: 7000 });
    }
    reco = new SR();
    reco.lang = "es-AR"; reco.continuous = true; reco.interimResults = false;
    btn.textContent = "Detener dictado";
    btn.classList.add("rec");
    reco.onresult = (e) => {
      let t = "";
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) t += e.results[i][0].transcript;
      if (!t) return;
      const el = $(`#f_${id}`);
      el.value = (el.value ? el.value.replace(/\s*$/, " ") : "") + t.trim();
      estado.valores[id] = el.value;
      actualizarVista(); guardarBorrador();
    };
    reco.onend = () => { reco = null; btn.textContent = "Dictar por voz"; btn.classList.remove("rec"); };
    reco.onerror = () => toast("No se pudo usar el micrófono");
    reco.start();
  }

  // =====================================================================
  //  Mis datos (perfil) y privacidad
  // =====================================================================
  function renderPerfil() {
    const camposPerfil = [
      { id: "FUNCIONARIO", label: "Jerarquía, nombre y apellido", ph: "Ej.: Cabo 1° Juan Pérez" },
      { id: "DEPENDENCIA", label: "Dependencia o patrulla", ph: "Ej.: C.A.P. 2" }
    ];
    $("#pf").innerHTML = camposPerfil.map((c) => `
      <div style="margin-bottom:12px">
        <label for="pf_${c.id}">${c.label}</label>
        <input id="pf_${c.id}" type="text" autocomplete="off" autocapitalize="words" value="${escapeAttr(perfil[c.id] || "")}" placeholder="${escapeAttr(c.ph)}">
      </div>`).join("") + `<button type="button" class="pri" id="guardarPerfil" style="width:100%">Guardar y aplicar a esta acta</button>`;
    camposPerfil.forEach((c) => {
      $(`#pf_${c.id}`).addEventListener("input", (e) => { perfil[c.id] = e.target.value; saveJSON(LS_PERFIL, perfil); avisoPerfil(); });
    });
    $("#guardarPerfil").addEventListener("click", () => {
      sincronizarPerfilEnActa(true);
      actualizarVista(); guardarBorrador(); avisoPerfil();
      toast("Datos guardados");
    });
    $("#cfgHoras").value = String(cfg.horas);
  }
  function avisoPerfil() { $("#avisoPerfil").hidden = !!((perfil.FUNCIONARIO || "").trim()); }
  $("#cfgHoras").addEventListener("change", (e) => {
    cfg.horas = Number(e.target.value);
    saveJSON(LS_CFG, cfg);
    renderBorradores();
    toast("Preferencia guardada");
  });
  $("#borrarTodo").addEventListener("click", () => {
    const snap = instantanea();
    store.list = [nuevoItem()];
    store.act = null;
    persistir();
    cambiarBorrador(store.list[0].id);
    toast("Borradores borrados", { accion: "Deshacer", fn: () => restaurar(snap) });
  });

  // =====================================================================
  //  Formulario del acta: grupos, progreso y frases rápidas
  // =====================================================================
  const GRUPOS = [
    { id: "fecha", t: "Fecha, hora y localidad", ids: ["LOCALIDAD", "DEPARTAMENTO", "DIA", "MES", "AÑO", "HORA", "MINUTOS"] },
    { id: "hecho", t: "Lugar del hecho", test: (id) => /_HECHO$/.test(id) },
    { id: "relato", t: "Relato y diligencias", ids: ["RELATO", "SECUESTRO", "INFRACTOR", "UNIDAD_JUDICIAL", "ARTICULOS", "FIRMA_SI"] },
    { id: "testigo", t: "Testigo hábil", test: (id) => id.startsWith("TESTIGO_") },
    { id: "aprehendido", t: "Persona aprehendida", ids: ["DISPOSICION"], test: (id) => id.startsWith("APREHENDIDO_") },
    { id: "filiacion", t: "Filiación y vestimenta", ids: ["CUTIS", "ALTURA", "CONTEXTURA", "CABELLO", "VESTIMENTA"] },
    { id: "funcionario", t: "Funcionario actuante", ids: ["FUNCIONARIO", "DEPENDENCIA"] }
  ];
  const GRUPO_OTROS = { id: "otros", t: "Otros datos" };
  function grupoDe(id) {
    return GRUPOS.find((g) => (g.ids && g.ids.includes(id)) || (g.test && g.test(id))) || GRUPO_OTROS;
  }
  function spanDe(id) {
    if (/^(DIA|MES|AÑO)$/.test(id)) return "c3";
    if (/^(HORA|MINUTOS)$/.test(id)) return "q";
    if (/(_CALLE|^CALLE_HECHO)$/.test(id)) return "c4";
    if (/(_NRO|^NRO_HECHO)$/.test(id)) return "c2";
    if (/(_PISO|_BARRIO|_CIUDAD|_DNI|_EDAD|_PROFESION|_ESTADO_CIVIL)$/.test(id)) return "c3";
    if (/^(LOCALIDAD|DEPARTAMENTO|UNIDAD_JUDICIAL|ALTURA|CUTIS|CONTEXTURA|CABELLO|FIRMA_SI)$/.test(id)) return "c3";
    return "";
  }
  function atributosDe(id) {
    const a = ['autocomplete="off"', 'enterkeyhint="next"'];
    if (/_DNI$|_EDAD$|^(HORA|MINUTOS|UNIDAD_JUDICIAL)$/.test(id)) a.push('inputmode="numeric"', 'autocorrect="off"', 'spellcheck="false"');
    if (id === "ALTURA") a.push('inputmode="decimal"');
    if (/_DNI$/.test(id)) a.push('maxlength="10"');
    if (/^(HORA|MINUTOS)$/.test(id)) a.push('maxlength="2"');
    if (/NOMBRE$|^FUNCIONARIO$|^INFRACTOR$|_CALLE$|^CALLE_HECHO$|BARRIO|PROFESION|CIUDAD|^DEPENDENCIA$/.test(id)) a.push('autocapitalize="words"');
    return a.join(" ");
  }
  function frasesActuales() {
    return []; // frases rápidas desactivadas
  }
  const ETQ_UI = { "AÑO": "Año", HORA: "Hora", MINUTOS: "Min." };
  function campoHtml(c) {
    const v = estado.valores[c.id] ?? "";
    c = ETQ_UI[c.id] ? { ...c, label: ETQ_UI[c.id] } : c;
    if (c.area) {
      const lista = frasesActuales();
      const insp = estado.tipo === "inspeccion";
      const frases = c.id === "RELATO" && lista.length
        ? (insp
          ? `<div class="fr-tit">Frases rápidas: tocá para agregar</div><div class="frases lista" aria-label="Frases rápidas">${lista.map((f, i) => `<button type="button" data-frase="${i}">${escapeHtml(f)}</button>`).join("")}</div>`
          : `<div class="frases" aria-label="Frases rápidas">${lista.map((f, i) => `<button type="button" data-frase="${i}">${escapeHtml(f.replace(/^Que\s+/i, "").slice(0, 40))}…</button>`).join("")}</div>`) : "";
      return `<div class="campo"><label for="f_${c.id}">${escapeHtml(c.label)}</label>${frases}
        <textarea id="f_${c.id}" autocapitalize="sentences" autocomplete="off">${escapeHtml(v)}</textarea>
        ${SR ? `<button type="button" class="mic sm" data-mic="${c.id}" style="margin-top:8px">Dictar por voz</button>` : ""}</div>`;
    }
    return `<div class="campo ${spanDe(c.id)}"><label for="f_${c.id}">${escapeHtml(c.label)}</label>
      <input id="f_${c.id}" type="text" value="${escapeAttr(v)}" ${atributosDe(c.id)}></div>`;
  }
  function renderFormulario() {
    const pl = PLANTILLAS[estado.tipo];
    if ("DIA" in estado.valores && !(estado.valores.DIA || "").trim()) aplicarFechaHora(); // fecha y hora al abrir el acta
    const mapa = {};
    pl.campos.forEach((c) => {
      const g = grupoDe(c.id);
      (mapa[g.id] = mapa[g.id] || { g, campos: [] }).campos.push(c);
    });
    const orden = [...GRUPOS, GRUPO_OTROS].map((g) => mapa[g.id]).filter(Boolean);
    const vacio = (c) => !(estado.valores[c.id] || "").trim();
    const primera = orden.find((o) => o.g.id === "relato") || orden.find((o) => o.campos.some(vacio));
    $("#form").innerHTML = orden.map((o) => `
      <details class="grupo" data-g="${o.g.id}" ${o === primera ? "open" : ""}>
        <summary><span class="t">${o.g.t}</span><span class="n"></span></summary>
        <div class="campos">
          ${o.g.id === "hecho" ? `<div class="campo"><button type="button" id="gps" class="sm">Usar mi ubicación (GPS)</button> <span id="gpsEstado" role="status"></span></div>` : ""}
          ${o.campos.map(campoHtml).join("")}
        </div>
      </details>`).join("");
    actualizarProgreso();
  }
  function actualizarProgreso() {
    const pl = PLANTILLAS[estado.tipo];
    $$("#form details.grupo").forEach((d) => {
      const campos = pl.campos.filter((c) => grupoDe(c.id).id === d.dataset.g);
      const ok = campos.filter((c) => (estado.valores[c.id] || "").trim()).length;
      d.querySelector(".n").textContent = ok === campos.length ? "Completo" : `${ok}/${campos.length}`;
      d.dataset.ok = ok === campos.length ? "1" : "0";
    });
  }

  function insertarEnCursor(el, txt) {
    const s = el.selectionStart ?? el.value.length;
    const e = el.selectionEnd ?? el.value.length;
    const antes = el.value.slice(0, s);
    const sep = antes && !/\s$/.test(antes) ? " " : "";
    el.value = antes + sep + txt + el.value.slice(e);
    const pos = (antes + sep + txt).length;
    el.setSelectionRange(pos, pos);
    el.focus();
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // Un solo juego de escuchas para todo el formulario
  $("#form").addEventListener("input", (e) => {
    const el = e.target;
    if (!el.id || !el.id.startsWith("f_")) return;
    estado.valores[el.id.slice(2)] = el.value;
    actualizarVista();
    guardarBorrador();
  });
  $("#form").addEventListener("change", (e) => {
    const el = e.target;
    if (!el.id || !el.id.startsWith("f_")) return;
    const id = el.id.slice(2), t = el.value.trim();
    let nuevo = null;
    if (id === "DIA" && /^\d{1,2}$/.test(t) && DIAS_LETRAS[+t]) nuevo = DIAS_LETRAS[+t];
    if (id === "MES" && /^\d{1,2}$/.test(t) && MESES[+t - 1]) nuevo = MESES[+t - 1];
    if (id === "AÑO" && /^(\d{2}|\d{4})$/.test(t) && ANOS_DOS_MIL[+t.slice(-2)]) nuevo = ANOS_DOS_MIL[+t.slice(-2)];
    if ((id === "HORA" || id === "MINUTOS") && /^\d$/.test(t)) nuevo = "0" + t;
    if (nuevo !== null) { el.value = nuevo; estado.valores[id] = nuevo; actualizarVista(); guardarBorrador(); }
  });
  $("#form").addEventListener("click", (e) => {
    const f = e.target.closest("[data-frase]");
    if (f) { insertarEnCursor($("#f_RELATO"), frasesActuales()[+f.dataset.frase]); return; }
    const m = e.target.closest("[data-mic]");
    if (m) { toggleDictado(m.dataset.mic, m); return; }
    if (e.target.closest("#gps")) aplicarUbicacion(false, true);
  });

  // ---------- Fecha, hora y ubicación ----------
  let geoEnCurso = false;
  async function aplicarUbicacion(silencioso = false, forzar = false) {
    if (!navigator.geolocation) {
      if (!silencioso) toast("Este dispositivo no permite geolocalización");
      return;
    }
    if (geoEnCurso) return;
    geoEnCurso = true;
    const est = () => $("#gpsEstado");
    if (est()) est().textContent = "Buscando ubicación…";
    if (!silencioso) toast("Obteniendo ubicación GPS…");
    try {
      const pos = await new Promise((ok, err) =>
        navigator.geolocation.getCurrentPosition(ok, err, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 })
      );
      const { latitude: lat, longitude: lon, accuracy } = pos.coords;
      const coords = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
      let calle = "", nro = "", barrio = "", ciudad = "", depto = "";
      try {
        const ctl = new AbortController();
        const to = setTimeout(() => ctl.abort(), 8000);
        const r = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&accept-language=es&lat=${lat}&lon=${lon}`,
          { signal: ctl.signal }
        );
        clearTimeout(to);
        const ad = (await r.json()).address || {};
        calle = ad.road || ad.pedestrian || ad.footway || ad.path || "";
        nro = ad.house_number || "";
        barrio = ad.suburb || ad.neighbourhood || "";
        ciudad = ad.city || ad.town || ad.village || ad.municipality || "";
        // En Córdoba el mapa suele devolver la Pedanía en "county": no es el departamento y se descarta.
        const candDepto = [ad.state_district, ad.county, ad.region].find((v) => /^Departamento\s+/i.test(v || ""));
        depto = candDepto ? candDepto.replace(/^Departamento\s+/i, "") : "";
      } catch {
        // sin internet: se completan solo las coordenadas
      }
      // Solo se completa lo que está vacío (o es un valor por defecto / coordenadas), salvo que se fuerce con el botón GPS.
      const pl = PLANTILLAS[estado.tipo];
      const poner = (id, v) => {
        if (!v || !(id in estado.valores)) return;
        const act = (estado.valores[id] || "").trim();
        const def = (pl.campos.find((c) => c.id === id) || {}).def;
        if (forzar || !act || act === def || /^Coordenadas GPS/.test(act)) setVal(id, v);
      };
      poner("CALLE_HECHO", calle || `Coordenadas GPS ${coords}`);
      poner("NRO_HECHO", nro);
      poner("BARRIO_HECHO", barrio);
      poner("CIUDAD_HECHO", ciudad);
      poner("LOCALIDAD", ciudad);
      poner("DEPARTAMENTO", depto);
      actualizarVista();
      guardarBorrador();
      if (est()) est().textContent = `Precisión ±${Math.round(accuracy)} m`;
      if (!silencioso) toast(calle ? "Ubicación completada" : "Sin internet: se cargaron coordenadas, completá la calle a mano");
    } catch (e) {
      if (est()) est().textContent = "";
      if (!silencioso) toast(e && e.code === 1 ? "Permiso de ubicación denegado" : "No se pudo obtener la ubicación");
    } finally {
      geoEnCurso = false;
    }
  }

  // Al redactar un acta: fecha y hora al instante (si están vacías) y GPS si falta el lugar.
  function autoCompletar() {
    const v = estado.valores;
    if ("DIA" in v && !(v.DIA || "").trim()) aplicarFechaHora();
    if (("LUGAR_HECHO" in v && !(v.LUGAR_HECHO || "").trim()) ||
        ("CALLE_HECHO" in v && !(v.CALLE_HECHO || "").trim())) {
      aplicarUbicacion(true);
    }
    renderBorradores();
    actualizarVista();
    guardarBorrador();
  }
  $("#ahora").addEventListener("click", () => {
    aplicarFechaHora();
    actualizarVista();
    guardarBorrador();
    toast("Fecha y hora actualizadas");
    aplicarUbicacion(false, false);
  });
  $("#limpiar").addEventListener("click", vaciarActa);

  // ---------- Control CPP (usa CHECKLIST_CPP de data.js) ----------
  function renderChecklist() {
    if (typeof CHECKLIST_CPP === "undefined") { $("#chkCPP").hidden = true; return; }
    estado.chk = estado.chk || {};
    $("#chkLista").innerHTML = CHECKLIST_CPP.map((x, i) =>
      `<label class="ck"><input type="checkbox" data-c="${i}" ${estado.chk[i] ? "checked" : ""}><span>${escapeHtml(x)}</span></label>`).join("");
    contarChecklist();
  }
  function contarChecklist() {
    const n = CHECKLIST_CPP.filter((_, i) => estado.chk && estado.chk[i]).length;
    const el = $("#chkN");
    el.textContent = `${n}/${CHECKLIST_CPP.length}`;
    $("#chkCPP").dataset.ok = n === CHECKLIST_CPP.length ? "1" : "0";
  }
  $("#chkLista").addEventListener("change", (e) => {
    const c = e.target.closest("input[data-c]");
    if (!c) return;
    estado.chk = estado.chk || {};
    estado.chk[c.dataset.c] = c.checked;
    contarChecklist();
    guardarBorrador();
  });

  // =====================================================================
  //  Validación, estado y vista del acta
  // =====================================================================
  function evaluar() {
    const d = estado.valores;
    const pl = PLANTILLAS[estado.tipo];
    const graves = [], leves = [];
    if (!(d.DIA || "").trim() || !(d.MES || "").trim() || !(d.AÑO || "").trim()) {
      graves.push("Falta la fecha completa: sin fecha el acta es nula (Art. 137 CPP).");
    }
    if (!(d.FUNCIONARIO || "").trim()) {
      graves.push("Falta jerarquía, nombre y apellido del funcionario actuante (Art. 135 CPP).");
    }
    if ("RELATO" in d && !(d.RELATO || "").trim()) {
      graves.push("Falta consignar las diligencias realizadas y su resultado (Art. 135 CPP).");
    }
    if ("TESTIGO_EDAD" in d) {
      const n = parseInt(d.TESTIGO_EDAD, 10);
      if (!isNaN(n) && n < 16) graves.push("El testigo es menor de 16 años: no puede ser testigo de actuación (Art. 136 CPP).");
    }
    if ("TESTIGO_NOMBRE" in d && !(d.TESTIGO_NOMBRE || "").trim()) {
      leves.push("Sin testigo hábil. Si no se consiguió, dejalo asentado en el relato con las diligencias practicadas.");
    }
    [["TESTIGO_DNI", "del testigo"], ["APREHENDIDO_DNI", "del aprehendido"]].forEach(([k, q]) => {
      const v = (d[k] || "").replace(/[.\s]/g, "");
      if (k in d && v && !/^\d{7,8}$/.test(v)) leves.push(`Revisá el D.N.I. ${q}: se esperan 7 u 8 dígitos.`);
    });
    const vacios = pl.campos.filter((c) => !(d[c.id] || "").trim()).length;
    return { graves, leves, vacios };
  }
  function actualizarVista() {
    const ev = evaluar();
    const chip = $("#estadoActa");
    let s, txt;
    if (ev.graves.length) { s = "crit"; txt = `Revisar ${ev.graves.length} ${ev.graves.length === 1 ? "aviso" : "avisos"}`; }
    else if (ev.vacios) { s = "falta"; txt = `${ev.vacios} ${ev.vacios === 1 ? "dato sin completar" : "datos sin completar"}`; }
    else { s = "ok"; txt = "Acta completa"; }
    chip.dataset.s = s;
    chip.innerHTML = `${txt}<br><span style="font-weight:500;font-size:13px">Ver acta</span>`;
    actualizarProgreso();
    if ($("#vista").open) pintarVista(ev);
  }
  function pintarVista(ev) {
    ev = ev || evaluar();
    $("#nul").innerHTML = ev.graves.map((a) => `<div>${escapeHtml(a)}</div>`).join("") +
      ev.leves.map((a) => `<div class="leve">${escapeHtml(a)}</div>`).join("");
    $("#out").innerHTML = conTinta(escapeHtml(construirTextoActa(true)), false)
      .replace(/_{10,}/g, (m) => `<span class="falta">${m}</span>`);
  }
  function abrirVista() {
    const dlg = $("#vista");
    if (!dlg.open) { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", ""); }
    pintarVista();
    $(".db").scrollTop = 0;
  }
  $("#estadoActa").addEventListener("click", abrirVista);
  $("#cerrarVista").addEventListener("click", () => $("#vista").close ? $("#vista").close() : $("#vista").removeAttribute("open"));

  function guardarBorrador() {
    const it = store.list.find((x) => x.id === store.act);
    if (it) { it.estado = estado; it.ts = Date.now(); }
    clearTimeout(guardarBorrador._t);
    guardarBorrador._t = setTimeout(persistir, 400);
  }

  // ---------- Exportación ----------
  async function copiarActa() {
    const txt = construirTextoActa();
    try {
      await navigator.clipboard.writeText(txt);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = txt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    const g = evaluar().graves.length;
    if (g) toast(`Acta copiada. Ojo: ${g} ${g === 1 ? "aviso" : "avisos"} por revisar`, { accion: "Ver", fn: abrirVista, dur: 9000 });
    else toast("Acta copiada", { accion: "Borrar borrador", fn: borrarBorrador, dur: 9000 });
  }
  $$("[data-act=copiar]").forEach((b) => b.addEventListener("click", copiarActa));

  $("#wd").addEventListener("click", () => {
    const txt = construirTextoActa(true);
    const htmlDoc = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><style>
      @page WordSection1 { size: 21.0cm 29.7cm; margin: 2.5cm 2cm 2.5cm 3cm; }
      div.WordSection1 { page: WordSection1; }
      .acta { font-family: "Times New Roman", serif; font-size: 12pt; line-height: 1.5; text-align: justify; }
      .enc { text-align: center; font-weight: bold; font-size: 11pt; margin-bottom: 14pt; }
      h1 { text-align: center; font-size: 14pt; text-decoration: underline; margin: 0 0 14pt; }
      p { margin: 0 0 10pt; }
    </style></head><body><div class="WordSection1">${htmlActa(txt)}</div></body></html>`;
    const blob = new Blob(["\ufeff", htmlDoc], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${estado.tipo}_URD_Rio_Cuarto.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("Word descargado", { accion: "Borrar borrador", fn: borrarBorrador, dur: 9000 });
  });
  $("#pdf").addEventListener("click", () => {
    $("#pr").innerHTML = htmlActa(construirTextoActa(true));
    window.print();
  });



  // =====================================================================
  //  Buscador normativo (índice precalculado, resultados paginados)
  // =====================================================================
  let indice = null;
  let cuerpoSel = "";
  let visibles = PAGINA;

  function construirIndice() {
    if (indice) return;
    indice = CATALOGO_CODIGOS.map((it) => {
      const etq = normalizarTexto(it.etiqueta), tit = normalizarTexto(it.titulo);
      const txt = normalizarTexto(it.texto), tags = normalizarTexto(it.tags || "");
      return { it, etq, tit, txt, tags, todo: `${etq} ${tit} ${txt} ${tags}` };
    });
  }
  const regexNumero = (t) => new RegExp(`(^|[^0-9a-zA-Z])${t}([^0-9a-zA-Z]|$)`);
  function rxTolerante(t) {
    return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/a/g, "[aáàâä]").replace(/e/g, "[eéèêë]").replace(/i/g, "[iíìîï]")
      .replace(/o/g, "[oóòôö]").replace(/u/g, "[uúùûü]").replace(/n/g, "[nñ]");
  }
  function resaltar(texto, terminos) {
    const limpio = escapeHtml(texto);
    const utiles = terminos.filter((t) => t.length >= 2 || /^\d+$/.test(t));
    if (!utiles.length) return limpio;
    return limpio.replace(new RegExp(`(${utiles.map(rxTolerante).join("|")})`, "gi"), "<mark>$1</mark>");
  }
  function badgeCuerpo(c) {
    return c === "10326" ? "Ley 10.326" : c === "CPP" ? "CPP Cba" : c === "CP" ? "Cód. Penal" : c;
  }
  const etiquetaCorta = (e) => e.replace(/^(Ley 10\.326|CPP Córdoba \(Ley 8\.123\)|Código Penal)\s·\s/, "");

  function buscar(terminos) {
    construirIndice();
    const rx = terminos.map((t) => (/^\d+$/.test(t) ? regexNumero(t) : null));
    const res = indice.filter((r) => {
      if (cuerpoSel === "fav") { if (!favoritos.includes(r.it.id)) return false; }
      else if (cuerpoSel && r.it.cuerpo !== cuerpoSel) return false;
      return terminos.every((t, i) => rx[i]
        ? rx[i].test(r.etq) || rx[i].test(r.tags) || rx[i].test(r.tit) || rx[i].test(r.txt)
        : r.todo.includes(t));
    });
    if (terminos.length) {
      const puntaje = (r) => {
        let s = 0;
        terminos.forEach((t, i) => {
          if (rx[i]) {
            if (rx[i].test(r.etq)) s += 10; if (rx[i].test(r.tags)) s += 6;
            if (rx[i].test(r.tit)) s += 4; if (rx[i].test(r.txt)) s += 2;
          } else {
            if (r.etq.includes(t)) s += 4; if (r.tit.includes(t)) s += 3;
            if (r.tags.includes(t)) s += 2; if (r.txt.includes(t)) s += 1;
          }
        });
        return s;
      };
      const pt = new Map(res.map((r) => [r, puntaje(r)]));
      res.sort((a, b) => pt.get(b) - pt.get(a));
    }
    return res;
  }

  function renderCodigos(reiniciar) {
    if (reiniciar) visibles = PAGINA;
    const qRaw = $("#q").value || "";
    const terminos = extraerTerminosBusqueda(qRaw);
    $("#filtrosRapidos").hidden = !!qRaw;
    $("#fuenteNorm").textContent = `Catálogo: ${NORMATIVA_VERSION}. Verificá la vigencia en la fuente oficial.`;
    const lista = $("#lista");

    if (!terminos.length && !cuerpoSel) {
      $("#conteo").textContent = "";
      $("#masWrap").hidden = true;
      lista.innerHTML = `<p class="vacio">Escribí un número de artículo (por ejemplo 111) o un tema, o elegí un cuerpo normativo.</p>`;
      return;
    }
    const res = buscar(terminos);
    const total = res.length;
    $("#conteo").textContent = total ? `${total} ${total === 1 ? "resultado" : "resultados"}` : "";
    if (!total) {
      $("#masWrap").hidden = true;
      lista.innerHTML = `<p class="vacio">${cuerpoSel === "fav" && !terminos.length ? "Todavía no guardaste artículos. Tocá “Guardar” en cualquier resultado." : `Sin resultados para “${escapeHtml(qRaw.trim())}”.`}</p>`;
      return;
    }
    const mostrar = res.slice(0, visibles);
    const abrir = total <= 2;
    lista.innerHTML = mostrar.map(({ it }) => {
      const fav = favoritos.includes(it.id);
      return `<article class="art ${abrir ? "abierto" : ""}" data-id="${escapeAttr(it.id)}">
        <div class="cab"><span class="tag">${escapeHtml(badgeCuerpo(it.cuerpo))}</span><b>${resaltar(etiquetaCorta(it.etiqueta), terminos)}</b></div>
        <div class="tit">${resaltar(it.titulo, terminos)}</div>
        <div class="txt">${resaltar(it.texto, terminos)}</div>
        <div class="acc">
          <button type="button" class="sm" data-copy-art>Copiar</button>
          <button type="button" class="sm" data-cita-art>Citar en acta</button>
          <button type="button" class="sm" data-fav aria-pressed="${fav}">${fav ? "Guardado" : "Guardar"}</button>
        </div>
      </article>`;
    }).join("");
    const restan = total - mostrar.length;
    $("#masWrap").hidden = restan <= 0;
    if (restan > 0) $("#mas").textContent = `Mostrar ${Math.min(PAGINA, restan)} más (quedan ${restan})`;
  }

  $("#lista").addEventListener("click", async (e) => {
    const card = e.target.closest(".art");
    if (!card) return;
    const item = CATALOGO_CODIGOS.find((x) => x.id === card.dataset.id);
    if (!item) return;
    if (e.target.closest(".txt")) { card.classList.toggle("abierto"); return; }
    if (e.target.closest("[data-fav]")) {
      favoritos = favoritos.includes(item.id) ? favoritos.filter((x) => x !== item.id) : [...favoritos, item.id];
      saveJSON(LS_FAV, favoritos);
      if (cuerpoSel === "fav") renderCodigos(); else {
        const b = e.target.closest("[data-fav]"), on = favoritos.includes(item.id);
        b.textContent = on ? "Guardado" : "Guardar"; b.setAttribute("aria-pressed", on);
      }
      return;
    }
    if (e.target.closest("[data-copy-art]")) {
      try { await navigator.clipboard.writeText(`${item.etiqueta} (${item.titulo}): ${item.texto}`); toast("Artículo copiado"); }
      catch { toast("No se pudo copiar"); }
      return;
    }
    if (e.target.closest("[data-cita-art]")) {
      if (!("RELATO" in estado.valores)) { toast("El acta en edición no tiene campo de relato"); return; }
      const cita = `${etiquetaCorta(item.etiqueta)} (${item.titulo})`;
      const act = (estado.valores.RELATO || "").trim();
      setVal("RELATO", act ? `${act} ${cita}` : cita);
      actualizarVista(); guardarBorrador();
      toast("Citado en el relato del acta", { accion: "Ir al acta", fn: () => irA("actas") });
    }
  });
  $("#mas").addEventListener("click", () => { visibles += PAGINA; renderCodigos(); });

  let _deb;
  $("#q").addEventListener("input", () => { clearTimeout(_deb); _deb = setTimeout(() => renderCodigos(true), 140); });
  $("#cuerpos").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-cu]");
    if (!b) return;
    cuerpoSel = b.dataset.cu;
    $$("#cuerpos button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    renderCodigos(true);
  });
  $("#filtrosRapidos").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    $("#q").value = b.dataset.q;
    renderCodigos(true);
  });

  // =====================================================================
  //  Arranque
  // =====================================================================
  async function iniciar() {
    try { localStorage.removeItem("op_cba_pin_v1"); } catch {}
    await cargarStore();
    cargarValoresPorDefecto(false);
    renderTipos();
    renderPerfil();
    avisoPerfil();
    renderFormulario();
    renderChecklist();
    autoCompletar();
    mostrar(location.hash.slice(1));
    // El índice de búsqueda se prepara en segundo plano, sin frenar la carga
    (window.requestIdleCallback || ((f) => setTimeout(f, 800)))(construirIndice);
  }
  iniciar();

  if ("serviceWorker" in navigator) {
    const teniaSW = !!navigator.serviceWorker.controller;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch(() => {});
    });
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (teniaSW) toast("App actualizada. Cerrala y abrila para ver los cambios.", { dur: 6000 });
    });
  }
})();
