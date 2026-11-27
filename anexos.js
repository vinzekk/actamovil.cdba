/* ANEXOS · plantillas para completar y copiar: Anexo 2 (uso de la fuerza / arma de fuego) y Anexo 2 B (armas no letales). */
(() => {
  const $ = (s) => document.querySelector(s);
  const LS = "op_cba_anexos_v1", LS_PERFIL = "op_cba_perfil_v1", LS_CFG = "op_cba_cfg_v1";
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const p2 = (n) => String(n).padStart(2, "0");
  const SINO = ["SÍ", "NO"], CL = ["Corta", "Larga"];
  const PRE12 = "En post de hacer cesar el delito, resguardar la integridad física del personal policial y la de terceros, proteger los bienes públicos y privados, con el fin de restablecer el orden público y la paz social, se procede a realizar una intervención controlada";

  // campo: [id, numeración, etiqueta, tipo, opciones/ayuda, opcional]
  // tipos: t texto · a área · f fecha · h hora · o opción única · m opción múltiple
  const ANEXOS = {
    anexo2: {
      nombre: "ANEXO 2", sub: "Informe de uso de la fuerza y/o del arma de fuego",
      titulo: "ANEXO 2 - INFORME DE USO DE LA FUERZA Y/O DEL ARMA DE FUEGO",
      pie: "(*) El presente informe deberá ser remitido al Tribunal de Conducta Policial y Penitenciario dentro de las 24 horas del hecho.",
      firma: "Firma del funcionario",
      secs: [
        { t: "Datos del hecho", ahora: true, campos: [
          ["fecha", "1.", "Fecha", "f"], ["hora", "2.", "Hora", "h"],
          ["informa", "3.", "Personal que informa", "t", "Jerarquía, apellido y nombre"],
          ["lugar", "4.", "Lugar del hecho", "t"],
          ["usofuerza", "5.", "Personal que utilizó la fuerza", "t"],
          ["desc", "6.", "Breve descripción del hecho", "a"] ] },
        { t: "7. Características del arma utilizada para efectuar disparos", campos: [
          ["a_cl", "a.", "Corta/Larga", "o", CL], ["a_clas", "b.", "Clasificación", "t", "Pistola, revólver, escopeta, etc."],
          ["a_serie", "c.", "Número de serie", "t"], ["a_marca", "d.", "Marca del arma", "t"],
          ["a_cal", "e.", "Calibre del arma", "t"], ["a_user", "f.", "Quién era el legítimo usuario del arma", "t"],
          ["a_poder", "g.", "En poder de quién se encuentra el arma actualmente", "t"], ["a_color", "h.", "Color del arma", "t"] ] },
        { t: "8. Características de los cartuchos", campos: [
          ["c_cant", "a.", "Cantidad de disparos efectuados", "t"],
          ["c_lugar", "b.", "Lugar en el que impactaron cada proyectil (puede anexar un croquis)", "a"],
          ["c_marca", "c.", "Marca de los proyectiles utilizados", "t"] ] },
        { t: "9. Procedimiento judicial", campos: [
          ["j_ent", "a.", "¿Se entregó el procedimiento en dependencia judicial?", "o", SINO],
          ["j_sum", "b.", "Número de sumario digital", "t"], ["j_uj", "c.", "Unidad Judicial", "t"], ["j_fis", "d.", "Fiscalía interviniente", "t"] ] }
      ]
    },
    anexo2b: {
      nombre: "ANEXO 2 B", sub: "Uso de armas no letales de lanzamiento tipo Byrna o similares",
      titulo: "ANEXO 2 B - USO DE ARMAS NO LETALES DE LANZAMIENTO TIPO BYRNA O SIMILARES",
      pie: "El presente informe deberá ser remitido a la Dirección General de Control de Conducta Policial, dentro de las 24 horas del hecho.",
      firma: "Firma del operador",
      secs: [
        { t: "Datos del hecho", ahora: true, campos: [
          ["fecha", "1.", "Fecha", "f"], ["hora", "2.", "Hora", "h"],
          ["informa", "3.", "Personal que informa", "t", "Jerarquía, apellido y nombre"],
          ["lugar", "4.", "Lugar del hecho", "t"] ] },
        { t: "5. Personal que utilizó el arma no letal", campos: [
          ["u_nom", "5.", "Personal que utilizó arma no letal", "t"], ["u_dni", "a.", "D.N.I. N°", "t"], ["u_rev", "b.", "Lugar de revista", "t"] ] },
        { t: "6. Procedimiento judicial", campos: [
          ["j_ent", "a.", "¿Se entregó el procedimiento en dependencia judicial?", "o", SINO],
          ["j_sum", "b.", "Número de sumario digital", "t"], ["j_uj", "c.", "Unidad Judicial", "t"], ["j_fis", "d.", "Fiscalía interviniente", "t"] ] },
        { t: "7. Características del arma no letal", campos: [
          ["a_cl", "a.", "Corta/Larga", "o", CL], ["a_serie", "b.", "Número de serie", "t"],
          ["a_marca", "c.", "Marca del arma", "t"], ["a_dep", "d.", "Dependencia que proveyó la misma", "t"] ] },
        { t: "8. Características de los proyectiles", campos: [
          ["p_tipo", "8.", "Tipo de proyectil", "m", ["SÓLIDO", "AGENTE QUÍMICO"]],
          ["p_cant", "a.", "Cantidad de disparos efectuados", "t"],
          ["p_imp", "b.", "Lugar en el que impactaron cada proyectil", "o", ["DIRECTO", "INDIRECTO", "AMBOS"]] ] },
        { t: "9. a 11. Lesionados y daños", campos: [
          ["l_pol", "9.", "Personal policial lesionado", "o", SINO], ["l_civ", "10.", "Civiles lesionados", "o", SINO],
          ["d_mat", "11.", "Daños materiales", "o", SINO], ["d_cuales", "", "¿Cuáles?", "a", "", true] ] },
        { t: "12. Descripción del hecho", campos: [
          ["desc", "12.", "Descripción del hecho (continúa el texto de arriba)", "a", PRE12] ] }
      ]
    }
  };

  // ---- estado guardado ----
  let datos = { upd: 0, v: {} };
  try { const g = JSON.parse(localStorage.getItem(LS)); if (g && g.v) datos = g; } catch {}
  try {
    const cfg = JSON.parse(localStorage.getItem(LS_CFG)) || { horas: 24 };
    if (cfg.horas > 0 && datos.upd && Date.now() - datos.upd > cfg.horas * 3600000) datos = { upd: 0, v: {} };
  } catch {}
  const guardar = () => { datos.upd = Date.now(); try { localStorage.setItem(LS, JSON.stringify(datos)); } catch {} };
  const toast = (m) => {
    const el = $("#toast"); if (!el) return;
    const dlg = document.querySelector("dialog[open]"); (dlg || document.body).appendChild(el);
    $("#toastTx").textContent = m; $("#toastBtn").hidden = true;
    el.classList.add("ver"); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove("ver"), 2200);
  };

  let cur = null; // clave del anexo abierto
  const vals = () => (datos.v[cur] = datos.v[cur] || {});
  const hoy = () => { const d = new Date(); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`; };
  const ahoraH = () => { const d = new Date(); return `${p2(d.getHours())}:${p2(d.getMinutes())}`; };
  const fechaAR = (iso) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ""); return m ? `${m[3]}/${m[2]}/${m[1]}` : (iso || ""); };
  const perfil = () => { try { return JSON.parse(localStorage.getItem(LS_PERFIL)) || {}; } catch { return {}; } };
  const todos = (A) => A.secs.flatMap((s) => s.campos);

  function ponerAhora(forzar) {
    const v = vals();
    if (forzar || !v.fecha) v.fecha = hoy();
    if (forzar || !v.hora) v.hora = ahoraH();
  }
  function iniciar(k) {
    cur = k; const v = vals();
    ponerAhora(false);
    if (!v.informa) { const f = (perfil().FUNCIONARIO || "").trim(); if (f) v.informa = f; }
    guardar();
  }

  // ---- formulario ----
  function campoHtml(c) {
    const [id, n, et, tipo, ayuda] = c, v = vals()[id];
    const lab = `<label for="ax_${id}">${n ? `<b>${esc(n)}</b> ` : ""}${esc(et)}</label>`;
    if (tipo === "o" || tipo === "m") {
      const sel = tipo === "m" ? (Array.isArray(v) ? v : []) : v;
      return `<div class="ax-c"><div class="ax-l" id="ax_${id}">${n ? `<b>${esc(n)}</b> ` : ""}${esc(et)}</div>
        <div class="ax-opts" role="${tipo === "m" ? "group" : "radiogroup"}" aria-labelledby="ax_${id}">
        ${ayuda.map((o) => `<button type="button" class="chip" data-id="${id}" data-op="${esc(o)}" data-m="${tipo === "m" ? 1 : 0}" aria-pressed="${tipo === "m" ? sel.includes(o) : sel === o}">${esc(o)}</button>`).join("")}</div></div>`;
    }
    if (tipo === "a") return `<div class="ax-c">${lab}${id === "desc" && cur === "anexo2b" ? `<div class="ax-pre">${esc(PRE12)}…</div>` : ""}<textarea id="ax_${id}" data-id="${id}" rows="4" autocomplete="off">${esc(v || "")}</textarea></div>`;
    const ty = tipo === "f" ? "date" : tipo === "h" ? "time" : "text";
    return `<div class="ax-c">${lab}<input id="ax_${id}" data-id="${id}" type="${ty}" autocomplete="off" ${tipo === "t" ? 'autocapitalize="sentences"' : ""} placeholder="${esc(tipo === "t" && ayuda ? ayuda : "")}" value="${esc(v || "")}"></div>`;
  }
  function pintarForm() {
    const A = ANEXOS[cur];
    $("#axTit").textContent = A.nombre; $("#axSub").textContent = A.sub;
    $("#axForm").innerHTML = A.secs.map((s) => `<div class="card ax-card"><h2>${esc(s.t)}</h2>
      ${s.ahora ? `<div class="ax-ahora"><button type="button" class="sm" id="axAhora">Usar fecha y hora del dispositivo</button></div>` : ""}
      <div class="ax-campos">${s.campos.map(campoHtml).join("")}</div></div>`).join("");
    pintarVista();
  }

  // ---- texto del anexo ----
  const vacioTxt = "..........";
  function valorTxt(c) {
    const v = vals()[c[0]], t = c[3];
    if (t === "f") return v ? fechaAR(v) : "";
    if (t === "m") return Array.isArray(v) ? v.join(" / ") : "";
    return (v || "").toString().trim();
  }
  function construirTexto() {
    const A = ANEXOS[cur], L = [A.titulo, ""];
    A.secs.forEach((s) => {
      const esTitulo = /^\d+\./.test(s.t) && s.campos.every((c) => /^[a-z]\.$/.test(c[1]));
      if (esTitulo) L.push(s.t + ":");
      s.campos.forEach((c) => {
        const [id, n, et, tipo] = c, val = valorTxt(c);
        if (id === "d_cuales") { if (vals().d_mat === "SÍ" || val) L.push(`   ¿Cuáles? ${val || vacioTxt}`); return; }
        if (id === "desc" && cur === "anexo2b") { L.push(`${n} Descripción del hecho: ${PRE12}${val ? " " + val : " " + vacioTxt}`); return; }
        const sangria = /^[a-z]\.$/.test(n) ? "   " : "";
        const num = n ? n + " " : "";
        L.push(`${sangria}${num}${et.replace(/ \(.*\)$/, "").replace(/ \(continúa.*$/, "")}: ${val || vacioTxt}`);
      });
    });
    L.push("", "", "...............................", A.firma, "", A.pie);
    return L.join("\n");
  }
  function faltan() {
    const A = ANEXOS[cur];
    return todos(A).filter((c) => !c[5] && !valorTxt(c)).length;
  }
  function pintarVista() {
    $("#axOut").textContent = construirTexto();
    const f = faltan(), e = $("#axEstado");
    e.textContent = f ? `Faltan ${f} ${f === 1 ? "dato" : "datos"}` : "Completo";
    e.dataset.s = f ? "falta" : "ok";
  }

  // ---- eventos ----
  const lista = $("#axLista"), ver = $("#axVer");
  function abrir(k) { iniciar(k); lista.hidden = true; ver.hidden = false; pintarForm(); window.scrollTo({ top: 0 }); }
  function volver() { ver.hidden = true; lista.hidden = false; window.scrollTo({ top: 0 }); }
  $("#axTiles").addEventListener("click", (e) => { const b = e.target.closest("[data-ax]"); if (b) abrir(b.dataset.ax); });
  $("#axVolver").addEventListener("click", volver);
  $("#axForm").addEventListener("input", (e) => {
    const el = e.target; if (!el.dataset || !el.dataset.id) return;
    vals()[el.dataset.id] = el.value; guardar(); pintarVista();
  });
  $("#axForm").addEventListener("click", (e) => {
    if (e.target.closest("#axAhora")) {
      ponerAhora(true); guardar();
      $("#ax_fecha").value = vals().fecha; $("#ax_hora").value = vals().hora; pintarVista(); toast("Fecha y hora actualizadas"); return;
    }
    const b = e.target.closest("[data-op]"); if (!b) return;
    const id = b.dataset.id, op = b.dataset.op, v = vals();
    if (b.dataset.m === "1") {
      const a = Array.isArray(v[id]) ? v[id] : []; v[id] = a.includes(op) ? a.filter((x) => x !== op) : [...a, op];
    } else v[id] = v[id] === op ? "" : op;
    guardar();
    b.parentElement.querySelectorAll("[data-op]").forEach((x) => x.setAttribute("aria-pressed", b.dataset.m === "1" ? String((v[id] || []).includes(x.dataset.op)) : String(v[id] === x.dataset.op)));
    pintarVista();
  });
  $("#axCopiar").addEventListener("click", async () => {
    const txt = construirTexto();
    try { await navigator.clipboard.writeText(txt); toast("Anexo copiado"); }
    catch {
      const ta = document.createElement("textarea"); ta.value = txt; ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand("copy"); } catch {}
      ta.remove(); toast(ok ? "Anexo copiado" : "No se pudo copiar");
    }
  });
  $("#axVaciar").addEventListener("click", (e) => {
    const b = e.currentTarget;
    if (b.dataset.c !== "1") { b.dataset.c = "1"; b.textContent = "¿Seguro? Tocá de nuevo"; setTimeout(() => { b.dataset.c = ""; b.textContent = "Vaciar"; }, 4000); return; }
    b.dataset.c = ""; b.textContent = "Vaciar";
    datos.v[cur] = {}; iniciar(cur); pintarForm(); toast("Anexo vaciado");
  });
  window.addEventListener("hashchange", () => { if (!/^#?\/?anexos/.test(location.hash) && !ver.hidden) volver(); });
})();
