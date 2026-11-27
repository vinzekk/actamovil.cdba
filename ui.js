// Capa de interfaz: botones de tipo, secciones plegables, estado del acta y tema.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const NOM = { dark: "Noche", light: "Día", hc: "Calle" };
  const thl = $("#thl");
  const pintarTema = () => {
    if (thl) thl.textContent = NOM[document.documentElement.dataset.theme] || "Día";
  };
  new MutationObserver(pintarTema).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"]
  });
  pintarTema();

  const CORTO = [
    [/contravenc/i, "Contravencional"],
    [/secuestro/i, "Secuestro"],
    [/inspecci/i, "Inspección"],
    [/aprehens/i, "Aprehensión"]
  ];
  const corto = (t) => (CORTO.find(([r]) => r.test(t)) || [, t.replace(/^\d+\.\s*(Acta (de )?)?/i, "")])[1];
  const sel = $("#tipo"), tg = $("#tipos"), form = $("#form");

  function tipos() {
    if (!sel || !tg) return;
    tg.innerHTML = [...sel.options].map((o) =>
      `<button type="button" data-v="${o.value}" class="${o.value === sel.value ? "on" : ""}" aria-pressed="${o.value === sel.value}">${corto(o.text)}</button>`
    ).join("");
  }

  if (tg && sel) {
    tg.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-v]");
      if (!b) return;
      sel.value = b.dataset.v;
      sel.dispatchEvent(new Event("change"));
    });
    new MutationObserver(tipos).observe(sel, { childList: true });
  }

  const CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';

  function acordeon() {
    if (!form) return;
    $$(".fg", form).forEach((g, i) => {
      if (g.dataset.acc) return;
      g.dataset.acc = 1;
      const t = $(".fg-title", g);
      if (!t) return;
      const h = document.createElement("button");
      h.type = "button";
      h.className = "fg-head";
      h.setAttribute("aria-expanded", i === 0);
      h.innerHTML = `<span class="fg-t">${t.textContent}</span><span class="badge"></span>${CHEV}`;
      t.replaceWith(h);
      g.classList.toggle("abierto", i === 0);
      h.addEventListener("click", () => h.setAttribute("aria-expanded", g.classList.toggle("abierto")));
      $$(".campo", g).forEach((c) => {
        const lbl = $("label", c);
        if ((lbl && lbl.textContent.length > 26) || c.classList.contains("campo-area")) {
          c.classList.add("ancho");
        }
      });
    });
    estado();
    tipos();
  }

  function estado() {
    if (!form) return;
    let falta = 0;
    $$(".fg", form).forEach((g) => {
      const n = $$("input,textarea", g).filter((x) => !x.value.trim()).length;
      falta += n;
      const b = $(".badge", g);
      if (b) {
        b.textContent = n ? `Faltan ${n}` : "Completo";
        b.dataset.ok = String(!n);
      }
    });
    const elEstado = $("#estado");
    const elFaltan = $("#faltan");
    if (elEstado) elEstado.dataset.ok = String(!falta);
    if (elFaltan) elFaltan.textContent = falta ? `${falta} datos sin completar` : "Acta completa";
  }

  if (form) {
    new MutationObserver(acordeon).observe(form, { childList: true });
    form.addEventListener("input", estado);
  }

  function sync() {
    if (form && $$(".fg:not([data-acc])", form).length) acordeon();
    if (tg && sel) {
      const on = $("button.on", tg);
      if (!tg.children.length || !on || on.dataset.v !== sel.value) tipos();
    }
  }

  sync();
  document.addEventListener("DOMContentLoaded", sync);
  setInterval(() => {
    sync();
    estado();
  }, 1000);

  $("#estado")?.addEventListener("click", () => {
    const v = $("#vista");
    if (!v) return;
    v.open = true;
    v.scrollIntoView({ behavior: "smooth" });
  });

  // ---- Panel de borradores (usa los controles originales ocultos de app.js) ----
  const borr = $("#borr"), sheet = $("#sheet"), fondo = $("#sheetBack"), btnB = $("#btnBorr");

  function borradores() {
    if (!borr) return;
    const opts = [...borr.options];
    const nBorr = $("#nBorr");
    const shList = $("#shList");
    if (nBorr) nBorr.textContent = opts.length;
    if (shList) {
      shList.innerHTML = opts.map((o, i) => {
        const [izq, hora] = o.text.split(" · ");
        const on = o.value === borr.value;
        return `<button type="button" class="dr${on ? " on" : ""}" data-id="${o.value}"><span class="dr-n">Borrador ${i + 1}: ${corto(izq.replace(/^\d+\.\s*/, ""))}</span><span class="dr-t">${hora || ""}</span>${on ? '<span class="dr-b">Abierto</span>' : ""}</button>`;
      }).join("");
    }
  }

  const abrirB = () => {
    if (!sheet || !fondo || !btnB) return;
    borradores();
    sheet.hidden = false;
    fondo.hidden = false;
    btnB.setAttribute("aria-expanded", "true");
  };

  const cerrarB = () => {
    if (!sheet || !fondo || !btnB) return;
    sheet.hidden = true;
    fondo.hidden = true;
    btnB.setAttribute("aria-expanded", "false");
  };

  btnB?.addEventListener("click", abrirB);
  $("#sheetX")?.addEventListener("click", cerrarB);
  fondo?.addEventListener("click", cerrarB);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarB();
  });

  $("#shList")?.addEventListener("click", (e) => {
    if (!borr) return;
    const b = e.target.closest("button[data-id]");
    if (!b) return;
    borr.value = b.dataset.id;
    borr.dispatchEvent(new Event("change"));
    cerrarB();
    window.scrollTo({ top: 0 });
  });

  $("#shNew")?.addEventListener("click", () => {
    $("#bnew")?.click();
    cerrarB();
    window.scrollTo({ top: 0 });
  });

  $("#shDel")?.addEventListener("click", () => {
    $("#bdel")?.click();
    setTimeout(borradores, 80);
  });

  if (borr) {
    new MutationObserver(borradores).observe(borr, { childList: true });
  }
  borradores();
})();
