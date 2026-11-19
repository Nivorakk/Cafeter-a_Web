/* Cafetería Sobremesa: interacción de la web */
(function () {
  "use strict";

  const D = window.SOBREMESA;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const eur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
  const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];
  const MESES_LARGO = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const DIAS_CORTO = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

  /* ----------------------------------------------------------------------
     Utilidades
     ---------------------------------------------------------------------- */

  // Hora actual en San Juan de Alicante, sea cual sea la zona del visitante.
  function ahoraMadrid() {
    return new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid" }));
  }

  function aMinutos(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  }

  function horaBonita(hhmm) {
    const [h, m] = hhmm.split(":");
    return `${Number(h)}:${m}`;
  }

  function claveFecha(d) {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  const almacen = {
    leer(clave, porDefecto) {
      try {
        const v = localStorage.getItem(clave);
        return v ? JSON.parse(v) : porDefecto;
      } catch (e) {
        return porDefecto;
      }
    },
    guardar(clave, valor) {
      try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* sin almacenamiento */ }
    }
  };

  /* ----------------------------------------------------------------------
     Estado: abierto / cerrado
     ---------------------------------------------------------------------- */

  function estadoApertura(now) {
    const dia = now.getDay();
    const min = now.getHours() * 60 + now.getMinutes();
    const hoy = D.horario[dia];
    const abre = aMinutos(hoy.abre);
    const cierra = aMinutos(hoy.cierra);

    if (min >= abre && min < cierra) {
      const quedan = cierra - min;
      if (quedan <= 30) {
        return { estado: "closing", largo: `Cerramos en ${quedan} min`, corto: "Cierra pronto", abierto: true };
      }
      const charla = charlaEnCurso(now);
      if (charla) {
        return { estado: "open", largo: `Abierto, hay charla hasta las ${horaBonita(D.charlas.fin)}`, corto: "Abierto", abierto: true };
      }
      return { estado: "open", largo: `Abierto hasta las ${horaBonita(hoy.cierra)}`, corto: "Abierto", abierto: true };
    }

    if (min < abre) {
      return { estado: "closed", largo: `Cerrado, abrimos hoy a las ${horaBonita(hoy.abre)}`, corto: "Cerrado", abierto: false };
    }
    const manana = D.horario[(dia + 1) % 7];
    return { estado: "closed", largo: `Cerrado, abrimos mañana a las ${horaBonita(manana.abre)}`, corto: "Cerrado", abierto: false };
  }

  function charlaEnCurso(now) {
    const min = now.getHours() * 60 + now.getMinutes();
    const enHorario = min >= aMinutos(D.charlas.inicio) && min < aMinutos(D.charlas.fin);
    if (!enHorario) return null;
    if (now.getDay() === D.charlas.ellas.diaSemana) return "ellas";
    if (now.getDay() === D.charlas.ellos.diaSemana) return "ellos";
    return null;
  }

  function pintarEstado() {
    const now = ahoraMadrid();
    const st = estadoApertura(now);
    const el = $("#status");
    el.dataset.state = st.estado;
    $(".status__long", el).textContent = st.largo;
    $(".status__short", el).textContent = st.corto;

    const neon = $("#neon-open");
    neon.textContent = st.abierto ? "abierto" : "cerrado";
    neon.classList.toggle("is-off", !st.abierto);
  }

  /* ----------------------------------------------------------------------
     Horario
     ---------------------------------------------------------------------- */

  function pintarHorario() {
    const hoy = ahoraMadrid().getDay();
    const orden = [1, 2, 3, 4, 5, 6, 0];
    const tbody = $("#horario tbody");
    tbody.innerHTML = "";

    orden.forEach((i) => {
      const h = D.horario[i];
      const tr = document.createElement("tr");
      if (i === hoy) tr.className = "is-today";

      const th = document.createElement("th");
      th.scope = "row";
      th.textContent = h.dia;
      if (i === hoy) {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = "Hoy";
        th.appendChild(tag);
      }
      if (i === D.charlas.ellas.diaSemana || i === D.charlas.ellos.diaSemana) {
        const nota = document.createElement("small");
        const g = i === D.charlas.ellas.diaSemana ? D.charlas.ellas : D.charlas.ellos;
        nota.textContent = `${g.nombre}, de ${horaBonita(D.charlas.inicio)} a ${horaBonita(D.charlas.fin)}`;
        th.appendChild(nota);
      }

      const td = document.createElement("td");
      td.textContent = `${horaBonita(h.abre)} a ${horaBonita(h.cierra)}`;

      tr.append(th, td);
      tbody.appendChild(tr);
    });
  }

  /* ----------------------------------------------------------------------
     Carta y desayuno
     ---------------------------------------------------------------------- */

  const seleccion = { bebida: null, bollo: null };
  const porId = {};

  function pintarCarta() {
    const grupos = [
      { lista: $("#lista-bebidas"), datos: D.carta.bebidas, tipo: "bebida" },
      { lista: $("#lista-bolleria"), datos: D.carta.bolleria, tipo: "bollo" }
    ];

    grupos.forEach(({ lista, datos, tipo }) => {
      datos.forEach((p) => {
        porId[p.id] = Object.assign({ tipo }, p);
        const li = document.createElement("li");
        if (p.casa) li.dataset.casa = "true";

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "item";
        btn.dataset.id = p.id;
        btn.setAttribute("aria-pressed", "false");

        const mark = document.createElement("span");
        mark.className = "item__mark";
        mark.setAttribute("aria-hidden", "true");

        const name = document.createElement("span");
        name.className = "item__name";
        name.textContent = p.nombre;
        if (p.casa) {
          const tag = document.createElement("span");
          tag.className = "tag";
          tag.textContent = "Solo aquí";
          name.appendChild(tag);
        }

        const dots = document.createElement("span");
        dots.className = "item__dots";
        dots.setAttribute("aria-hidden", "true");

        const price = document.createElement("span");
        price.className = "item__price";
        price.textContent = eur.format(p.precio);

        const desc = document.createElement("span");
        desc.className = "item__desc";
        desc.textContent = p.desc;

        btn.append(mark, name, dots, price, desc);
        li.appendChild(btn);
        lista.appendChild(li);
      });
    });

    $$(".item").forEach((btn) => btn.addEventListener("click", () => elegir(btn.dataset.id)));

    $("#filtro-casa").addEventListener("click", (e) => {
      const btn = e.currentTarget;
      const activo = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", String(activo));
      $$(".menu-list li").forEach((li) => { li.hidden = activo && li.dataset.casa !== "true"; });
    });

    $("#ticket-clear").addEventListener("click", () => {
      seleccion.bebida = null;
      seleccion.bollo = null;
      actualizarTicket();
    });
  }

  function elegir(id) {
    const p = porId[id];
    seleccion[p.tipo] = seleccion[p.tipo] === id ? null : id;
    actualizarTicket();
  }

  function actualizarTicket() {
    $$(".item").forEach((btn) => {
      const p = porId[btn.dataset.id];
      btn.setAttribute("aria-pressed", String(seleccion[p.tipo] === btn.dataset.id));
    });

    const ticket = $("#ticket");
    const b = seleccion.bebida && porId[seleccion.bebida];
    const o = seleccion.bollo && porId[seleccion.bollo];

    if (!b && !o) {
      ticket.hidden = true;
      document.body.classList.remove("has-ticket");
      return;
    }

    const items = [b, o].filter(Boolean);
    let total = items.reduce((s, p) => s + p.precio, 0);
    let hint;

    if (b && o) {
      total -= D.descuentoDesayuno;
      hint = `Ahorras ${eur.format(D.descuentoDesayuno)}. Pídelo así en barra.`;
    } else if (b) {
      hint = `Añade un bollo y te descontamos ${eur.format(D.descuentoDesayuno)}.`;
    } else {
      hint = `Añade una bebida y te descontamos ${eur.format(D.descuentoDesayuno)}.`;
    }

    $("#ticket-items").textContent = items.map((p) => p.nombre).join(" + ");
    $("#ticket-hint").textContent = hint;
    $("#ticket-total").textContent = eur.format(total);
    ticket.hidden = false;
    document.body.classList.add("has-ticket");
  }

  /* ----------------------------------------------------------------------
     Cartas de conversación
     ---------------------------------------------------------------------- */

  function iniciarCartas() {
    let modo = "amistad";
    const mazos = {};
    const card = $("#carta-pregunta");
    const btn = $("#sacar-carta");

    function barajar(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function sacar() {
      if (!mazos[modo] || mazos[modo].length === 0) mazos[modo] = barajar(D.conversacion[modo]);
      const pregunta = mazos[modo].pop();
      card.classList.remove("is-dealing");
      void card.offsetWidth; // reinicia la animación
      card.classList.add("is-dealing");
      $(".deck__q", card).textContent = pregunta;
      btn.textContent = "Sacar otra carta";
    }

    $$(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        modo = chip.dataset.modo;
        $$(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
        sacar();
      });
    });

    btn.addEventListener("click", sacar);

    // Primera carta ya visible al entrar, sin animación.
    mazos[modo] = barajar(D.conversacion[modo]);
    $(".deck__q", card).textContent = mazos[modo].pop();
    btn.textContent = "Sacar otra carta";
  }

  /* ----------------------------------------------------------------------
     Charlas: martes (mujeres) y jueves (hombres)
     ---------------------------------------------------------------------- */

  const RESERVAS_KEY = "sobremesa-reservas";
  let reservas = almacen.leer(RESERVAS_KEY, {});

  // Próximas fechas de un día de la semana (incluye hoy si la charla no ha terminado).
  function proximasFechas(diaSemana, n) {
    const now = ahoraMadrid();
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let diff = (diaSemana - base.getDay() + 7) % 7;
    const minutos = now.getHours() * 60 + now.getMinutes();
    if (diff === 0 && minutos >= aMinutos(D.charlas.fin)) diff = 7;
    base.setDate(base.getDate() + diff);

    const fechas = [];
    for (let i = 0; i < n; i++) {
      fechas.push(new Date(base));
      base.setDate(base.getDate() + 7);
    }
    return fechas;
  }

  // Tema fijo para cada fecha: rota semana a semana.
  function temaPara(grupo, fecha) {
    const temas = D.charlas[grupo].temas;
    const semanas = Math.floor(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()) / (7 * 864e5));
    return temas[((semanas % temas.length) + temas.length) % temas.length];
  }

  // Plazas ocupadas de ejemplo, estables para cada fecha.
  function plazasOcupadas(clave) {
    let h = 7;
    for (const c of clave) h = (h * 31 + c.charCodeAt(0)) % 9973;
    return 6 + (h % 11);
  }

  function esHoy(fecha) {
    return claveFecha(fecha) === claveFecha(ahoraMadrid());
  }

  function textoFecha(fecha) {
    return `${DIAS[fecha.getDay()]} ${fecha.getDate()} de ${MESES_LARGO[fecha.getMonth()]}`;
  }

  function sesiones(grupo, n) {
    return proximasFechas(D.charlas[grupo].diaSemana, n).map((fecha) => {
      const clave = `${grupo}-${claveFecha(fecha)}`;
      const reservada = Boolean(reservas[clave]);
      const ocupadas = plazasOcupadas(clave) + (reservada ? 1 : 0);
      return {
        grupo,
        clave,
        fecha,
        tema: temaPara(grupo, fecha),
        ocupadas,
        libres: Math.max(0, D.charlas.plazas - ocupadas),
        reservada,
        hoy: esHoy(fecha)
      };
    });
  }

  function pintarSesiones(grupo) {
    const ol = $(`#sesiones-${grupo}`);
    ol.innerHTML = "";

    sesiones(grupo, 4).forEach((s) => {
      const li = document.createElement("li");
      li.className = "session" + (s.hoy ? " is-today" : "");

      const date = document.createElement("div");
      date.className = "session__date";
      date.innerHTML =
        `<span class="session__dow">${DIAS_CORTO[s.fecha.getDay()]}</span>` +
        `<span class="session__day">${s.fecha.getDate()}</span>` +
        `<span class="session__month">${MESES[s.fecha.getMonth()]}</span>`;

      const info = document.createElement("div");
      const title = document.createElement("h3");
      title.className = "session__title";
      title.textContent = s.tema.titulo;
      if (s.hoy) {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = "Hoy";
        title.appendChild(tag);
      }
      const who = document.createElement("p");
      who.className = "session__who";
      who.textContent = `Con ${s.tema.ponente}. De ${horaBonita(D.charlas.inicio)} a ${horaBonita(D.charlas.fin)}.`;
      info.append(title, who);

      const side = document.createElement("div");
      side.className = "session__side";

      const seats = document.createElement("div");
      seats.className = "seats" + (s.libres <= 5 ? " seats--low" : "");
      const pct = Math.round((s.ocupadas / D.charlas.plazas) * 100);
      seats.innerHTML =
        `<span>${s.libres === 0 ? "Completa" : `Quedan ${s.libres} plazas`}</span>` +
        `<span class="seats__bar" aria-hidden="true"><span class="seats__fill" style="width:${pct}%"></span></span>`;
      side.appendChild(seats);

      if (s.reservada) {
        const booked = document.createElement("div");
        booked.className = "session__booked";
        booked.innerHTML = "<span>Tienes plaza</span>";
        const cancel = document.createElement("button");
        cancel.type = "button";
        cancel.className = "session__cancel";
        cancel.textContent = "Anular";
        cancel.setAttribute("aria-label", `Anular la reserva del ${textoFecha(s.fecha)}`);
        cancel.addEventListener("click", () => {
          delete reservas[s.clave];
          almacen.guardar(RESERVAS_KEY, reservas);
          pintarSesiones(grupo);
          pintarAviso();
        });
        booked.appendChild(cancel);
        side.appendChild(booked);
      } else {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn--solid session__btn";
        btn.textContent = "Reservar plaza";
        btn.setAttribute("aria-label", `Reservar plaza para el ${textoFecha(s.fecha)}: ${s.tema.titulo}`);
        if (s.libres === 0) btn.disabled = true;
        btn.addEventListener("click", () => abrirReserva(s, btn));
        side.appendChild(btn);
      }

      li.append(date, info, side);
      ol.appendChild(li);
    });
  }

  function iniciarPestanas() {
    const tabs = $$(".day");

    function activar(tab, enfocar) {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        $("#" + t.getAttribute("aria-controls")).hidden = !on;
      });
      if (enfocar) tab.focus();
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => activar(tab, false));
      tab.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          const sig = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
          activar(sig, true);
        }
      });
    });

    // Abre por defecto la pestaña de la próxima charla.
    const prox = proximaCharla();
    if (prox && prox.grupo === "ellos") activar($("#tab-ellos"), false);

    return activar;
  }

  function proximaCharla() {
    const todas = [...sesiones("ellas", 1), ...sesiones("ellos", 1)];
    todas.sort((a, b) => a.fecha - b.fecha);
    return todas[0];
  }

  let activarPestana = null;

  function pintarAviso() {
    const s = proximaCharla();
    const aviso = $("#next-talk");
    if (!s) return;
    const g = D.charlas[s.grupo];
    const publico = s.grupo === "ellas" ? "para mujeres" : "para hombres";
    const enCurso = s.hoy && charlaEnCurso(ahoraMadrid()) === s.grupo;
    const cuando = enCurso
      ? `Ahora mismo, hasta las ${horaBonita(D.charlas.fin)}`
      : s.hoy
      ? `Hoy ${DIAS[s.fecha.getDay()]}, ${horaBonita(D.charlas.inicio)}`
      : `${DIAS[s.fecha.getDay()].replace(/^./, (c) => c.toUpperCase())} ${s.fecha.getDate()} de ${MESES_LARGO[s.fecha.getMonth()]}, ${horaBonita(D.charlas.inicio)}`;

    aviso.className = `next-talk next-talk--${s.grupo}`;
    aviso.innerHTML = "";
    const inner = document.createElement("div");
    inner.className = "next-talk__inner";

    const when = document.createElement("span");
    when.className = "next-talk__when";
    when.textContent = cuando;

    const what = document.createElement("span");
    what.className = "next-talk__what";
    const plazas = enCurso ? "" : s.reservada ? " Ya tienes plaza." : ` Quedan ${s.libres} plazas.`;
    what.textContent = `${g.nombre}, ${publico}: «${s.tema.titulo}».${plazas}`;

    const link = document.createElement("a");
    link.className = "next-talk__link";
    link.href = "#charlas";
    link.textContent = s.reservada || enCurso ? "Ver charlas" : "Reservar plaza";
    link.addEventListener("click", () => {
      if (activarPestana) activarPestana($(`#tab-${s.grupo}`), false);
    });

    inner.append(when, what, link);
    aviso.appendChild(inner);
    aviso.hidden = false;
  }

  /* ----------------------------------------------------------------------
     Diálogo de reserva
     ---------------------------------------------------------------------- */

  let sesionActual = null;
  let botonOrigen = null;

  function abrirReserva(s, origen) {
    sesionActual = s;
    botonOrigen = origen;
    const dlg = $("#reserva");
    const form = $("#reserva-form");
    form.reset();
    limpiarErrores();
    $('[data-step="form"]', dlg).hidden = false;
    $('[data-step="ok"]', dlg).hidden = true;

    const g = D.charlas[s.grupo];
    $("#reserva-sesion").innerHTML = "";
    const strong = document.createElement("strong");
    strong.textContent = s.tema.titulo;
    $("#reserva-sesion").append(
      strong,
      document.createElement("br"),
      `${g.nombre}, ${textoFecha(s.fecha)}, de ${horaBonita(D.charlas.inicio)} a ${horaBonita(D.charlas.fin)}.`
    );

    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");
    $("#r-nombre").focus();
  }

  function cerrarReserva() {
    const dlg = $("#reserva");
    if (typeof dlg.close === "function") dlg.close();
    else dlg.removeAttribute("open");
  }

  function limpiarErrores() {
    ["r-nombre", "r-telefono"].forEach((id) => {
      $("#" + id).removeAttribute("aria-invalid");
      $("#" + id).removeAttribute("aria-describedby");
      const err = $(`#${id}-error`);
      err.hidden = true;
      err.textContent = "";
    });
  }

  function marcarError(id, msg) {
    const input = $("#" + id);
    const err = $(`#${id}-error`);
    input.setAttribute("aria-invalid", "true");
    input.setAttribute("aria-describedby", `${id}-error`);
    err.textContent = msg;
    err.hidden = false;
  }

  function iniciarReserva() {
    const dlg = $("#reserva");
    const form = $("#reserva-form");

    $$("[data-close]", dlg).forEach((b) => b.addEventListener("click", cerrarReserva));
    dlg.addEventListener("click", (e) => { if (e.target === dlg) cerrarReserva(); });
    dlg.addEventListener("close", () => {
      if (botonOrigen && document.body.contains(botonOrigen)) botonOrigen.focus();
      else $("#charlas").scrollIntoView({ block: "start" });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      limpiarErrores();

      const nombre = $("#r-nombre").value.trim();
      const telefono = $("#r-telefono").value.replace(/[\s.-]/g, "");
      let primero = null;

      if (nombre.length < 2) {
        marcarError("r-nombre", "Escribe tu nombre para guardar la plaza.");
        primero = primero || "r-nombre";
      }
      if (!/^(\+34)?[6789]\d{8}$/.test(telefono)) {
        marcarError("r-telefono", "Escribe un teléfono de 9 cifras, por ejemplo 612 345 678.");
        primero = primero || "r-telefono";
      }
      if (primero) {
        $("#" + primero).focus();
        return;
      }

      const s = sesionActual;
      reservas[s.clave] = { nombre, fecha: claveFecha(s.fecha) };
      almacen.guardar(RESERVAS_KEY, reservas);

      $('[data-step="form"]', dlg).hidden = true;
      const ok = $('[data-step="ok"]', dlg);
      ok.hidden = false;
      const pregunta = $("#r-pregunta").value.trim();
      $("#reserva-ok").textContent =
        `${nombre}, te esperamos el ${textoFecha(s.fecha)} a las ${horaBonita(D.charlas.inicio)} en el salón del fondo.` +
        (pregunta ? " Hemos recibido tu pregunta: se leerá sin decir tu nombre." : "");
      $("[data-close].btn", ok).focus();

      botonOrigen = null;
      pintarSesiones(s.grupo);
      pintarAviso();
    });
  }

  /* ----------------------------------------------------------------------
     Navegación
     ---------------------------------------------------------------------- */

  function iniciarNav() {
    const toggle = $(".nav-toggle");
    const nav = $("#nav");

    function cerrar() {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    }

    toggle.addEventListener("click", () => {
      const abierto = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!abierto));
      nav.classList.toggle("is-open", !abierto);
    });
    $$("a", nav).forEach((a) => a.addEventListener("click", cerrar));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrar(); });

    // Resalta la sección visible.
    if ("IntersectionObserver" in window) {
      const enlaces = $$("a", nav);
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          enlaces.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${en.target.id}`));
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      ["carta", "sin-prisa", "charlas", "visitanos"].forEach((id) => obs.observe(document.getElementById(id)));
    }
  }

  /* ----------------------------------------------------------------------
     Arranque
     ---------------------------------------------------------------------- */

  pintarEstado();
  setInterval(pintarEstado, 60 * 1000);
  pintarHorario();
  pintarCarta();
  iniciarCartas();
  pintarSesiones("ellas");
  pintarSesiones("ellos");
  activarPestana = iniciarPestanas();
  pintarAviso();
  iniciarReserva();
  iniciarNav();
})();
