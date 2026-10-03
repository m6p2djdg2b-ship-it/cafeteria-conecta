/* Cafetería Conecta
   Aplicación web sencilla para consultar el menú, hacer pedidos y seguir su estado.
   Los datos se guardan en localStorage, así que no necesita servidor. */

const CLAVE = "cafeteria-conecta-v1";
const ESTADOS = ["Recibido", "En preparación", "Listo"];
const CLASE_ESTADO = ["recibido", "preparacion", "listo"];

const MENU_INICIAL = [
  { id: 1, nombre: "Café americano", precio: 4500, disponible: true },
  { id: 2, nombre: "Capuchino", precio: 6500, disponible: true },
  { id: 3, nombre: "Chocolate caliente", precio: 6000, disponible: true },
  { id: 4, nombre: "Jugo natural", precio: 6500, disponible: true },
  { id: 5, nombre: "Croissant", precio: 5500, disponible: true },
  { id: 6, nombre: "Sándwich de pollo", precio: 12000, disponible: true },
  { id: 7, nombre: "Empanada", precio: 3500, disponible: true },
  { id: 8, nombre: "Torta de chocolate", precio: 8000, disponible: false }
];

/* ---------- Estado y almacenamiento ---------- */

function datosIniciales() {
  return { menu: MENU_INICIAL, pedidos: [], proximoNumero: 1, misPedidos: [] };
}

function cargar() {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado) return JSON.parse(guardado);
  } catch (e) {
    console.warn("No se pudieron leer los datos guardados:", e);
  }
  return datosIniciales();
}

function guardar() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(datos));
  } catch (e) {
    console.warn("No se pudieron guardar los datos:", e);
  }
}

let datos = cargar();
let carrito = {}; // { idProducto: cantidad }

/* ---------- Utilidades ---------- */

const $ = (id) => document.getElementById(id);

function dinero(valor) {
  return "$" + valor.toLocaleString("es-CO");
}

function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function numeroPedido(n) {
  return "#" + String(n).padStart(3, "0");
}

function totalPedido(items) {
  return items.reduce((suma, it) => suma + it.precio * it.cantidad, 0);
}

function producto(id) {
  return datos.menu.find((p) => p.id === id);
}

/* ---------- Historia 1: ver el menú ---------- */

function pintarMenu() {
  $("lista-menu").innerHTML = datos.menu.map((p) => {
    const cantidad = carrito[p.id] || 0;
    const etiqueta = p.disponible
      ? '<span class="etiqueta ok">Disponible</span>'
      : '<span class="etiqueta">Agotado</span>';
    const controles = p.disponible
      ? `<div class="cantidad">
           <button type="button" data-accion="quitar" data-id="${p.id}" aria-label="Quitar uno de ${escapar(p.nombre)}">−</button>
           <output aria-label="Cantidad de ${escapar(p.nombre)}">${cantidad}</output>
           <button type="button" data-accion="agregar" data-id="${p.id}" aria-label="Agregar uno de ${escapar(p.nombre)}">+</button>
         </div>`
      : "";
    return `<li class="${p.disponible ? "" : "agotado"}">
      <span class="nombre">${escapar(p.nombre)}</span>
      ${controles}
      <span class="precio">${dinero(p.precio)} ${etiqueta}</span>
    </li>`;
  }).join("");
}

/* ---------- Historia 2: hacer un pedido ---------- */

function itemsDelCarrito() {
  return Object.entries(carrito)
    .filter(([, cantidad]) => cantidad > 0)
    .map(([id, cantidad]) => {
      const p = producto(Number(id));
      return { id: p.id, nombre: p.nombre, precio: p.precio, cantidad };
    });
}

function pintarCarrito() {
  const items = itemsDelCarrito();
  $("lista-carrito").innerHTML = items.length
    ? items.map((it) => `<li><span>${it.cantidad} × ${escapar(it.nombre)}</span><span>${dinero(it.precio * it.cantidad)}</span></li>`).join("")
    : '<li class="vacio">Aún no has elegido productos.</li>';
  $("total-carrito").textContent = items.length ? "Total: " + dinero(totalPedido(items)) : "";
}

function mostrarError(mensaje) {
  const el = $("error-pedido");
  el.textContent = mensaje;
  el.hidden = !mensaje;
}

function confirmarPedido() {
  const items = itemsDelCarrito();
  const nombre = $("nombre-cliente").value.trim();

  if (!items.length) return mostrarError("Elige al menos un producto del menú.");
  if (!nombre) return mostrarError("Escribe tu nombre para identificar el pedido.");
  mostrarError("");

  const pedido = {
    numero: datos.proximoNumero,
    cliente: nombre,
    items,
    estado: 0, // posición en ESTADOS
    creado: new Date().toISOString()
  };
  datos.pedidos.push(pedido);
  datos.misPedidos.push(pedido.numero);
  datos.proximoNumero += 1;
  guardar();

  carrito = {};
  $("nombre-cliente").value = "";
  $("resultado-buscar").textContent = `Pedido ${numeroPedido(pedido.numero)} confirmado. Guarda el número para consultarlo.`;
  pintarTodo();
}

/* ---------- Historia 3: consultar el estado del pedido ---------- */

function tarjetaPedido(p, conBoton) {
  const lista = p.items.map((it) => `<li>${it.cantidad} × ${escapar(it.nombre)}</li>`).join("");
  const progreso = [0, 1, 2].map((i) => `<span class="${i <= p.estado ? "activo" : ""}"></span>`).join("");
  const boton = conBoton && p.estado < ESTADOS.length - 1
    ? `<button type="button" class="avanzar" data-accion="avanzar" data-numero="${p.numero}">Pasar a «${ESTADOS[p.estado + 1]}»</button>`
    : "";
  return `<li class="tarjeta-pedido">
    <h3><span>${numeroPedido(p.numero)} · ${escapar(p.cliente)}</span>
        <span class="estado ${CLASE_ESTADO[p.estado]}">${ESTADOS[p.estado]}</span></h3>
    <ul>${lista}</ul>
    <p class="total-pedido">Total: ${dinero(totalPedido(p.items))}</p>
    <div class="progreso" aria-hidden="true">${progreso}</div>
    ${boton}
  </li>`;
}

function pintarMisPedidos() {
  const mios = datos.pedidos.filter((p) => datos.misPedidos.includes(p.numero)).reverse();
  $("mis-pedidos").innerHTML = mios.map((p) => tarjetaPedido(p, false)).join("");
}

function buscarPedido(evento) {
  evento.preventDefault();
  const numero = Number($("numero-buscar").value);
  const aviso = $("resultado-buscar");
  const p = datos.pedidos.find((x) => x.numero === numero);
  if (!numero) {
    aviso.textContent = "Escribe el número de tu pedido.";
  } else if (!p) {
    aviso.textContent = `No encontramos el pedido ${numeroPedido(numero)}. Revisa el número e inténtalo de nuevo.`;
  } else {
    aviso.textContent = `Pedido ${numeroPedido(p.numero)} de ${p.cliente}: ${ESTADOS[p.estado]}.`;
  }
}

/* ---------- Historia 4: el encargado actualiza el estado ---------- */

function pintarTablero() {
  $("tablero").innerHTML = ESTADOS.map((nombre, i) => {
    const pedidos = datos.pedidos.filter((p) => p.estado === i);
    const contenido = pedidos.length
      ? `<ul class="tarjetas" style="display:block">${pedidos.map((p) => tarjetaPedido(p, true)).join("")}</ul>`
      : '<p class="vacio">Sin pedidos.</p>';
    return `<div class="columna"><h3>${nombre} (${pedidos.length})</h3>${contenido}</div>`;
  }).join("");
}

function avanzarPedido(numero) {
  const p = datos.pedidos.find((x) => x.numero === numero);
  if (!p || p.estado >= ESTADOS.length - 1) return;
  p.estado += 1; // el cambio queda ligado al pedido correcto por su número
  guardar();
  pintarTodo();
}

function pintarDisponibilidad() {
  $("lista-disponibilidad").innerHTML = datos.menu.map((p) => `
    <li>
      <span>${escapar(p.nombre)} <span class="etiqueta ${p.disponible ? "ok" : ""}">${p.disponible ? "Disponible" : "Agotado"}</span></span>
      <button type="button" data-accion="disponibilidad" data-id="${p.id}">${p.disponible ? "Marcar agotado" : "Marcar disponible"}</button>
    </li>`).join("");
}

function cambiarDisponibilidad(id) {
  const p = producto(id);
  p.disponible = !p.disponible;
  if (!p.disponible) delete carrito[p.id]; // un producto agotado sale del pedido en curso
  guardar();
  pintarTodo();
}

/* ---------- Pestañas y eventos ---------- */

function cambiarVista(vista) {
  ["cliente", "encargado"].forEach((v) => {
    $("vista-" + v).hidden = v !== vista;
    $("tab-" + v).setAttribute("aria-selected", String(v === vista));
  });
}

function pintarTodo() {
  pintarMenu();
  pintarCarrito();
  pintarMisPedidos();
  pintarTablero();
  pintarDisponibilidad();
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-accion], [data-vista]");
  if (!btn) return;

  if (btn.dataset.vista) return cambiarVista(btn.dataset.vista);

  const id = Number(btn.dataset.id);
  switch (btn.dataset.accion) {
    case "agregar":
      carrito[id] = (carrito[id] || 0) + 1;
      mostrarError("");
      pintarMenu(); pintarCarrito();
      break;
    case "quitar":
      carrito[id] = Math.max(0, (carrito[id] || 0) - 1);
      pintarMenu(); pintarCarrito();
      break;
    case "avanzar":
      avanzarPedido(Number(btn.dataset.numero));
      break;
    case "disponibilidad":
      cambiarDisponibilidad(id);
      break;
  }
});

$("btn-confirmar").addEventListener("click", confirmarPedido);
$("form-buscar").addEventListener("submit", buscarPedido);
$("btn-reiniciar").addEventListener("click", () => {
  if (confirm("¿Borrar todos los pedidos y restaurar el menú inicial?")) {
    datos = datosIniciales();
    carrito = {};
    guardar();
    $("resultado-buscar").textContent = "";
    pintarTodo();
  }
});

// Si el encargado actualiza un pedido en otra pestaña, esta vista se refresca sola.
window.addEventListener("storage", (e) => {
  if (e.key === CLAVE) {
    datos = cargar();
    pintarTodo();
  }
});

pintarTodo();
