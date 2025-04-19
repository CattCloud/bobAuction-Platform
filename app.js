// app.js

// Utilidades
const generarId = (prefijo) => `${prefijo}${Date.now().toString().slice(-6)}`;
const obtenerFechaHoraActual = () => new Date().toISOString();

// Secciones
const secciones = document.querySelectorAll("main > section");
document.querySelectorAll("aside button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const seccion = btn.dataset.section;
    secciones.forEach((s) => s.classList.add("hidden"));
    document.getElementById(seccion).classList.remove("hidden");
    if (seccion === "ingresos" || seccion === "egresos" || seccion === "reportes") {
      cargarClientesSelect();
    }
    if (seccion === "dashboard") {
      actualizarDashboard();
    }
  });
});

// Clientes
let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
let ingresos = JSON.parse(localStorage.getItem("ingresos")) || [];
let egresos = JSON.parse(localStorage.getItem("egresos")) || [];

document.getElementById("form-cliente").addEventListener("submit", (e) => {
  e.preventDefault();
  const nuevo = {
    id: generarId("C"),
    email: document.getElementById("cliente-email").value,
    nombre: document.getElementById("cliente-nombre").value,
    telefono: document.getElementById("cliente-telefono").value,
    tipoDocumento: document.getElementById("cliente-tipo-documento").value,
    numeroDocumento: document.getElementById("cliente-numero-documento").value,
    facturacionRuc: document.getElementById("cliente-facturacion-ruc").value,
    facturacionNombre: document.getElementById("cliente-facturacion-nombre").value,
    observaciones: document.getElementById("cliente-observaciones").value,
    fechaRegistro: obtenerFechaHoraActual()
  };
  clientes.push(nuevo);
  localStorage.setItem("clientes", JSON.stringify(clientes));
  e.target.reset();
  mostrarClientes();
});

function mostrarClientes() {
  const contenedor = document.getElementById("tabla-clientes");
  if (clientes.length === 0) {
    contenedor.innerHTML = "<p>No hay clientes registrados.</p>";
    return;
  }
  contenedor.innerHTML = `
    <table class="min-w-full">
      <thead><tr><th>Email</th><th>Nombre</th><th>Teléfono</th><th>Documento</th></tr></thead>
      <tbody>
        ${clientes.map(c => `
          <tr>
            <td>${c.email}</td>
            <td>${c.nombre}</td>
            <td>${c.telefono}</td>
            <td>${c.tipoDocumento} ${c.numeroDocumento}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>`;
}

// Ingresos
document.getElementById("nuevo-ingreso-btn").addEventListener("click", () => {
  document.getElementById("form-ingreso").classList.remove("hidden");
});

document.getElementById("cancelar-ingreso").addEventListener("click", () => {
  document.getElementById("form-ingreso").classList.add("hidden");
});

document.getElementById("form-ingreso").addEventListener("submit", (e) => {
  e.preventDefault();
  const nuevo = {
    id: generarId("I"),
    clienteId: document.getElementById("ingreso-cliente").value,
    fecha: obtenerFechaHoraActual(),
    placaVehiculo: document.getElementById("vehiculo-datos").value,
    empresaVehiculo: document.getElementById("subasta-detalles").value,
    fechaSubasta: "", // Podrías agregar input si deseas
    numeroLote: "", // Idem
    entidadFinanciera: "", // Idem
    numeroCuentaOrigen: "",
    moneda: "PEN",
    importe: parseFloat(document.getElementById("pago-garantia").value),
    tieneComprobante: true,
    concepto: "Garantía para subasta",
    estado: "PENDIENTE",
    registradoPor: "Admin",
    fechaRegistro: obtenerFechaHoraActual()
  };
  ingresos.push(nuevo);
  localStorage.setItem("ingresos", JSON.stringify(ingresos));
  e.target.reset();
  e.target.classList.add("hidden");
  actualizarDashboard();
});

// Egresos
document.getElementById("nuevo-egreso-btn").addEventListener("click", () => {
  document.getElementById("form-egreso").classList.remove("hidden");
});

document.getElementById("cancelar-egreso").addEventListener("click", () => {
  document.getElementById("form-egreso").classList.add("hidden");
});

document.getElementById("form-egreso").addEventListener("submit", (e) => {
  e.preventDefault();
  const nuevo = {
    id: generarId("E"),
    clienteId: document.getElementById("egreso-cliente").value,
    fecha: obtenerFechaHoraActual(),
    medio: "Transferencia",
    banco: "",
    numeroCuentaDestino: document.getElementById("cuenta-destino").value,
    moneda: "PEN",
    importe: parseFloat(document.getElementById("egreso-monto").value),
    concepto: document.getElementById("concepto").value,
    estado: "COMPLETADO",
    registradoPor: "Admin",
    fechaRegistro: obtenerFechaHoraActual()
  };
  egresos.push(nuevo);
  localStorage.setItem("egresos", JSON.stringify(egresos));
  e.target.reset();
  e.target.classList.add("hidden");
  actualizarDashboard();
});

// Selects de clientes
function cargarClientesSelect() {
  const selects = [
    document.getElementById("ingreso-cliente"),
    document.getElementById("egreso-cliente"),
    document.getElementById("reporte-cliente")
  ];
  selects.forEach(select => {
    if (!select) return;
    select.innerHTML = '<option value="">Seleccione un cliente</option>' +
      clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join("");
  });
}

// Dashboard
function actualizarDashboard() {
  const totalIngresos = ingresos.reduce((sum, i) => sum + i.importe, 0);
  const totalEgresos = egresos.reduce((sum, e) => sum + e.importe, 0);
  document.getElementById("total-ingresos").textContent = `S/ ${totalIngresos.toFixed(2)}`;
  document.getElementById("total-egresos").textContent = `S/ ${totalEgresos.toFixed(2)}`;
  document.getElementById("balance-general").textContent = `S/ ${(totalIngresos - totalEgresos).toFixed(2)}`;
  actualizarGrafico();
}

// Gráfico
let chart;
function actualizarGrafico() {
  const ctx = document.getElementById("chart-ingresos-egresos").getContext("2d");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Ingresos', 'Egresos'],
      datasets: [{
        label: 'Soles',
        data: [
          ingresos.reduce((sum, i) => sum + i.importe, 0),
          egresos.reduce((sum, e) => sum + e.importe, 0)
        ],
        backgroundColor: ['#22c55e', '#ef4444']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

// Inicialización
mostrarClientes();
cargarClientesSelect();
actualizarDashboard();
