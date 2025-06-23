function eliminarUltimoGasto() {
      gastos.pop();
      actualizarTabla();
    }

    function reiniciarGastos() {
      gastos.length = 0;
      actualizarTabla();
      document.getElementById("grafica").getContext("2d").clearRect(0, 0, 800, 400);
      document.getElementById("diagnostico").textContent = "";
      document.getElementById("recomendaciones").textContent = "";
      document.getElementById("advertenciaPresupuesto").textContent = "";
      document.getElementById("totalGastos").textContent = "";
    }

    function actualizarTabla() {
      const cuerpo = document.getElementById("tablaGastos");
      cuerpo.innerHTML = "";
      gastos.forEach(g => {
        const fila = `<tr><td>${g.tipo}</td><td>$${g.monto.toFixed(2)}</td></tr>`;
        cuerpo.innerHTML += fila;
      });
    }



    const clasificacion = {
      necesarios: ["Alimentos", "Agua", "Gas", "Luz", "Renta", "Gasolina", "Transporte público", "Medicamentos", "Consultas", "Colegios", "Internet esencial", "Limpieza", "Deudas", "Ropa básica", "Reparaciones"],
      neutros: ["Streaming", "Internet extra", "Restaurantes económicos", "Regalos", "Teléfono", "Mantenimiento auto", "Cursos", "Suscripciones educativas", "Libros", "Ahorro voluntario", "Gimnasio", "Equipo entrenamiento"],
      innecesarios: ["Ropa de marca", "Restaurantes caros", "Compras impulsivas", "Apuestas", "Apps pagadas", "Suscripciones no usadas", "Alcohol", "Antojitos", "Accesorios", "Eventos sociales", "Compras online", "Delivery", "Cine", "Servicios de belleza", "Juegos", "Viajes", "Decoración", "Bebidas energéticas", "Suscripciones premium"]
    };

    let listaGastos = [], chart;

    function agregarGasto() {
      const categoria = document.getElementById("categoria").value;
      const monto = parseFloat(document.getElementById("monto").value);
      if (!isNaN(monto) && categoria) {
        listaGastos.push({ categoria, monto });
        document.getElementById("tablaGastos").innerHTML += `<tr><td>${categoria}</td><td>$${monto.toFixed(2)}</td></tr>`;
        document.getElementById("monto").value = "";
      }
    }

    function analizarGastos() {
      const gastoPorCategoria = {};
      listaGastos.forEach(gasto => {
        gastoPorCategoria[gasto.categoria] = (gastoPorCategoria[gasto.categoria] || 0) + gasto.monto;
      });

      const labels = Object.keys(gastoPorCategoria);
      const data = Object.values(gastoPorCategoria);
      
const total = data.reduce((a, b) => a + b, 0);
const backgroundColors = labels.map((cat, i) => {
  const porcentaje = (data[i] / total) * 100;
  if (clasificacion.necesarios.includes(cat)) {
    return porcentaje < 30 ? "#81C784" : "#388E3C";  // verde claro a oscuro
  } else if (clasificacion.innecesarios.includes(cat)) {
    return porcentaje < 10 ? "#E57373" : "#C62828";  // rojo claro a intenso
  } else {
    return porcentaje < 15 ? "#FFF176" : "#FBC02D";  // amarillo claro a fuerte
  }
});


      const ctx = document.getElementById("graficaGastos").getContext("2d");
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [{
            label: "Gasto total por categoría",
            data: data,
            backgroundColor: backgroundColors
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          
animation: {
  duration: 1000,
  easing: "easeOutQuart"
}

        }
      });

      const ul = document.getElementById("listaClasificacion");
      ul.innerHTML = "";
      for (let cat in gastoPorCategoria) {
        let tipo = "🟨 Neutro";
        if (clasificacion.necesarios.includes(cat)) tipo = "🟩 Necesario";
        else if (clasificacion.innecesarios.includes(cat)) tipo = "🟥 Innecesario";
        ul.innerHTML += `<li>${cat}: $${gastoPorCategoria[cat].toFixed(2)} - ${tipo}</li>`;
      }

      const sueldo = parseFloat(document.getElementById("sueldo").value);
      let necesarios = 0, neutros = 0, innecesarios = 0;
      for (let cat in gastoPorCategoria) {
        const monto = gastoPorCategoria[cat];
        if (clasificacion.necesarios.includes(cat)) necesarios += monto;
        else if (clasificacion.innecesarios.includes(cat)) innecesarios += monto;
        else neutros += monto;
      }

      document.getElementById("diagnostico").textContent =
        `Gasto necesario: $${necesarios.toFixed(2)}, neutro: $${neutros.toFixed(2)}, innecesario: $${innecesarios.toFixed(2)}.`;

      let mensaje = "";
      if (innecesarios > necesarios) mensaje += "Estás gastando más en cosas innecesarias que en necesarias. ";
      if (necesarios > sueldo * 0.7) mensaje += "Tus gastos esenciales superan el 70% de tu sueldo. ";
      if (innecesarios < sueldo * 0.1) mensaje += "¡Buen trabajo! Tus gastos innecesarios están bajo control. ";
      if (!mensaje) mensaje = "Tus gastos están equilibrados. Sigue así.";
      document.getElementById("recomendaciones").textContent = mensaje;
      const totalGastado = necesarios + neutros + innecesarios;
      document.getElementById("totalGastos").textContent = `Total gastado: $${totalGastado.toFixed(2)}`;
const restante = sueldo - totalGastado;
      document.getElementById("restantePresupuesto").textContent = `Presupuesto restante: $${restante.toFixed(2)}`;

      const advertencia = document.getElementById("advertenciaPresupuesto");
      if (!isNaN(sueldo) && sueldo > 0 && totalGastado > sueldo) {
        advertencia.textContent = "⚠️ Has superado tu presupuesto mensual. Revisa tus gastos para evitar desequilibrios financieros. Procura ajustar tus gastos para no comprometer tu estabilidad económica.";
      } else {
        advertencia.textContent = "";
      }

    }

    function generarPDF() {
      html2canvas(document.getElementById("reporte")).then(canvas => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jspdf.jsPDF("p", "mm", "a4");
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("reporte_gastos.pdf");
      });
    }
  function eliminarUltimoGasto() {
      gastos.pop();
      actualizarTabla();
    }

    function reiniciarGastos() {
      gastos.length = 0;
      actualizarTabla();
      document.getElementById("grafica").getContext("2d").clearRect(0, 0, 800, 400);
      document.getElementById("diagnostico").textContent = "";
      document.getElementById("recomendaciones").textContent = "";
      document.getElementById("advertenciaPresupuesto").textContent = "";
      document.getElementById("totalGastos").textContent = "";
    }

    function actualizarTabla() {
      const cuerpo = document.getElementById("tablaGastos");
      cuerpo.innerHTML = "";
      gastos.forEach(g => {
        const fila = `<tr><td>${g.tipo}</td><td>$${g.monto.toFixed(2)}</td></tr>`;
        cuerpo.innerHTML += fila;
      });
    }



// =================== NUEVAS FUNCIONES ===================

// Guardar y cargar desde localStorage
function guardarDatos() {
  localStorage.setItem("listaGastos", JSON.stringify(listaGastos));
  localStorage.setItem("sueldoMensual", document.getElementById("sueldo").value);
}
function cargarDatos() {
  const gastosGuardados = localStorage.getItem("listaGastos");
  const sueldoGuardado = localStorage.getItem("sueldoMensual");
  if (gastosGuardados) {
    listaGastos = JSON.parse(gastosGuardados);
    listaGastos.forEach(g => {
      document.getElementById("tablaGastos").innerHTML += `<tr><td>${g.categoria}</td><td>${g.fecha}</td><td>$${g.monto.toFixed(2)}</td></tr>`;
    });
  }
  if (sueldoGuardado) {
    document.getElementById("sueldo").value = sueldoGuardado;
  }
}

// Agregar fecha, guardar y animación
function agregarGasto() {
  const categoria = document.getElementById("categoria").value;
  const monto = parseFloat(document.getElementById("monto").value);
  const fecha = document.getElementById("fecha").value;
  if (!isNaN(monto) && categoria && fecha) {
    const nuevoGasto = { categoria, monto, fecha };
    listaGastos.push(nuevoGasto);
    guardarDatos();

    const fila = document.createElement("tr");
    fila.innerHTML = `<td>${categoria}</td><td>${fecha}</td><td>$${monto.toFixed(2)}</td>`;
    fila.style.backgroundColor = "#d0f0c0";
    setTimeout(() => fila.style.backgroundColor = "", 700);
    document.getElementById("tablaGastos").appendChild(fila);

    document.getElementById("monto").value = "";
    document.getElementById("fecha").value = "";
  }
}

// Botón para resetear todo
function reiniciarTodo() {
  localStorage.clear();
  listaGastos = [];
  document.getElementById("tablaGastos").innerHTML = "";
  document.getElementById("sueldo").value = "";
  document.getElementById("graficaGastos").getContext("2d").clearRect(0, 0, 800, 400);
  document.getElementById("diagnostico").textContent = "";
  document.getElementById("recomendaciones").textContent = "";
  document.getElementById("advertenciaPresupuesto").textContent = "";
  document.getElementById("totalGastos").textContent = "";
  document.getElementById("restantePresupuesto").textContent = "";
  if (chart) chart.destroy();
}

// Mostrar porcentaje y advertencia por categoría
function mostrarPorcentajes(gastoPorCategoria, totalGastado) {
  const ul = document.getElementById("listaClasificacion");
  for (let cat in gastoPorCategoria) {
    const porcentaje = ((gastoPorCategoria[cat] / totalGastado) * 100).toFixed(1);
    let tipo = "🟨 Neutro";
    if (clasificacion.necesarios.includes(cat)) tipo = "🟩 Necesario";
    else if (clasificacion.innecesarios.includes(cat)) tipo = "🟥 Innecesario";

    let advertencia = "";
    if (clasificacion.innecesarios.includes(cat) && gastoPorCategoria[cat] > 500) {
      advertencia = " ⚠️ Exceso innecesario";
    }

    ul.innerHTML += `<li>${cat}: $${gastoPorCategoria[cat].toFixed(2)} (${porcentaje}%) - ${tipo}${advertencia}</li>`;
  }
}

document.addEventListener("DOMContentLoaded", cargarDatos);



function filtrarPorFecha() {
  const mesSeleccionado = document.getElementById("filtroMes").value;
  const anioSeleccionado = document.getElementById("filtroAnio").value;
  const tbody = document.getElementById("tablaGastos");
  tbody.innerHTML = "";

  const gastosFiltrados = listaGastos.filter(g => {
    const fecha = new Date(g.fecha);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
    const anio = fecha.getFullYear().toString();
    return (!mesSeleccionado || mes === mesSeleccionado) &&
           (!anioSeleccionado || anio === anioSeleccionado);
  });

  gastosFiltrados.forEach(g => {
    tbody.innerHTML += `<tr><td>${g.categoria}</td><td>${g.fecha}</td><td>$${g.monto.toFixed(2)}</td></tr>`;
  });

  // actualizar gráfica, clasificación y diagnóstico con los datos filtrados
  analizarGastosConDatos(gastosFiltrados);
}

// Copia de la función analizarGastos para aceptar parámetros personalizados
function analizarGastosConDatos(gastos) {
  const gastoPorCategoria = {};
  gastos.forEach(gasto => {
    gastoPorCategoria[gasto.categoria] = (gastoPorCategoria[gasto.categoria] || 0) + gasto.monto;
  });

  const labels = Object.keys(gastoPorCategoria);
  const data = Object.values(gastoPorCategoria);
  const backgroundColors = labels.map(cat => {
    if (clasificacion.necesarios.includes(cat)) return "#4CAF50";
    if (clasificacion.innecesarios.includes(cat)) return "#f44336";
    return "#FFEB3B";
  });

  const ctx = document.getElementById("graficaGastos").getContext("2d");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Gasto total por categoría",
        data: data,
        backgroundColor: backgroundColors
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
          
animation: {
  duration: 1000,
  easing: "easeOutQuart"
}

    }
  });

  const ul = document.getElementById("listaClasificacion");
  ul.innerHTML = "";
  const sueldo = parseFloat(document.getElementById("sueldo").value);
  let necesarios = 0, neutros = 0, innecesarios = 0;
  for (let cat in gastoPorCategoria) {
    const monto = gastoPorCategoria[cat];
    if (clasificacion.necesarios.includes(cat)) necesarios += monto;
    else if (clasificacion.innecesarios.includes(cat)) innecesarios += monto;
    else neutros += monto;
  }

  const totalGastado = necesarios + neutros + innecesarios;
  mostrarPorcentajes(gastoPorCategoria, totalGastado);
  document.getElementById("diagnostico").textContent =
    `Gasto necesario: $${necesarios.toFixed(2)}, neutro: $${neutros.toFixed(2)}, innecesario: $${innecesarios.toFixed(2)}.`;
  document.getElementById("totalGastos").textContent = `Total gastado: $${totalGastado.toFixed(2)}`;
  const restante = sueldo - totalGastado;
  document.getElementById("restantePresupuesto").textContent = `Presupuesto restante: $${restante.toFixed(2)}`;
  const advertencia = document.getElementById("advertenciaPresupuesto");
  if (!isNaN(sueldo) && sueldo > 0 && totalGastado > sueldo) {
    advertencia.textContent = "⚠️ Has superado tu presupuesto mensual. Revisa tus gastos para evitar desequilibrios financieros. Procura ajustar tus gastos para no comprometer tu estabilidad económica.";
  } else {
    advertencia.textContent = "";
  }
}



function mostrarTop5(gastos) {
  const lista = document.getElementById("listaTop5");
  lista.innerHTML = "";
  const top5 = [...gastos].sort((a, b) => b.monto - a.monto).slice(0, 5);
  const total = gastos.reduce((acc, g) => acc + g.monto, 0);

  top5.forEach(g => {
    const porcentaje = ((g.monto / total) * 100).toFixed(1);
    lista.innerHTML += `<li>${g.categoria} - $${g.monto.toFixed(2)} (${porcentaje}%) - ${g.fecha}</li>`;
  });
}

// Llamar a la función desde análisis general y filtrado
const originalAnalizarGastos = analizarGastos;
analizarGastos = function() {
  originalAnalizarGastos();
  mostrarTop5(listaGastos);
}

const originalAnalizarConDatos = analizarGastosConDatos;
analizarGastosConDatos = function(gastos) {
  originalAnalizarConDatos(gastos);
  mostrarTop5(gastos);
}



function actualizarGraficaPastel(gastos) {
  const datosPorCategoria = {};
  gastos.forEach(gasto => {
    datosPorCategoria[gasto.categoria] = (datosPorCategoria[gasto.categoria] || 0) + gasto.monto;
  });

  const labels = Object.keys(datosPorCategoria);
  const data = Object.values(datosPorCategoria);
  const backgroundColors = labels.map(cat => {
    if (clasificacion.necesarios.includes(cat)) return "#4CAF50";
    if (clasificacion.innecesarios.includes(cat)) return "#f44336";
    return "#FFEB3B";
  });

  const ctx = document.getElementById("graficaPastel").getContext("2d");
  if (window.chartPastel) window.chartPastel.destroy();
  window.chartPastel = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColors
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      },
      
animation: {
  duration: 1000,
  easing: "easeOutQuart"
}

    }
  });
}

// Integrar con las funciones de análisis existentes
const originalAnalizarGastos2 = analizarGastos;
analizarGastos = function() {
  originalAnalizarGastos2();
  actualizarGraficaPastel(listaGastos);
}

const originalAnalizarConDatos2 = analizarGastosConDatos;
analizarGastosConDatos = function(gastos) {
  originalAnalizarConDatos2(gastos);
  actualizarGraficaPastel(gastos);
}



function evaluarMetaAhorro() {
  const meta = parseFloat(document.getElementById("metaAhorro").value);
  const sueldo = parseFloat(document.getElementById("sueldo").value);
  const totalGastado = listaGastos.reduce((sum, g) => sum + g.monto, 0);
  const resultado = document.getElementById("resultadoMeta");

  if (isNaN(meta) || isNaN(sueldo)) {
    resultado.textContent = "Por favor ingresa la meta y el sueldo.";
    resultado.style.color = "orange";
    return;
  }

  const disponible = sueldo - totalGastado;
  if (disponible >= meta) {
    resultado.textContent = `¡Excelente! Puedes ahorrar $${meta.toFixed(2)} este mes.`;
    resultado.style.color = "green";
  } else {
    resultado.textContent = `No alcanzarás tu meta de ahorro. Solo te quedan $${disponible.toFixed(2)} disponibles.`;
    resultado.style.color = "red";
  }
}



function alternarModoOscuro() {
  const body = document.body;
  const btn = document.getElementById("btnModoOscuro");
  body.classList.toggle("modo-oscuro");
  if (body.classList.contains("modo-oscuro")) {
    btn.textContent = "☀️ Desactivar modo oscuro";
    localStorage.setItem("modoOscuro", "activado");
  } else {
    btn.textContent = "🌙 Activar modo oscuro";
    localStorage.setItem("modoOscuro", "desactivado");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("modoOscuro") === "activado") {
    document.body.classList.add("modo-oscuro");
    document.getElementById("btnModoOscuro").textContent = "☀️ Desactivar modo oscuro";
  }
});



function generarResumenMensual(gastos) {
  const sueldo = parseFloat(document.getElementById("sueldo").value);
  const totalGastado = gastos.reduce((sum, g) => sum + g.monto, 0);
  const restante = sueldo - totalGastado;
  const resumen = document.getElementById("resumenMes");

  if (isNaN(sueldo) || sueldo <= 0 || gastos.length === 0) {
    resumen.textContent = "Por favor, ingresa tu sueldo y al menos un gasto para generar el resumen.";
    resumen.style.color = "gray";
    return;
  }

  let mensaje = `Este mes gastaste $${totalGastado.toFixed(2)} de un sueldo de $${sueldo.toFixed(2)}. `;
  mensaje += `Te quedaron $${restante.toFixed(2)} disponibles. `;

  if (totalGastado > sueldo) {
    mensaje += "⚠️ Has gastado más de lo que ganas. Ajusta tus gastos el próximo mes.";
    resumen.style.color = "red";
  } else if (restante >= sueldo * 0.3) {
    mensaje += "¡Muy bien! Lograste conservar más del 30% de tu sueldo.";
    resumen.style.color = "green";
  } else {
    mensaje += "Podrías ahorrar un poco más el siguiente mes.";
    resumen.style.color = "orange";
  }

  resumen.textContent = mensaje;
}

// Llamar al generar resumen desde las funciones de análisis
const originalAnalizarGastos3 = analizarGastos;
analizarGastos = function() {
  originalAnalizarGastos3();
  generarResumenMensual(listaGastos);
}

const originalAnalizarConDatos3 = analizarGastosConDatos;
analizarGastosConDatos = function(gastos) {
  originalAnalizarConDatos3(gastos);
  generarResumenMensual(gastos);
}



function filtrarBusquedaRapida() {
  const texto = document.getElementById("buscador").value.toLowerCase();
  const filas = document.querySelectorAll("#tablaGastos tr");
  let coincidencias = 0;

  filas.forEach(fila => {
    const textoFila = fila.textContent.toLowerCase();
    const visible = textoFila.includes(texto);
    fila.style.display = visible ? "" : "none";
    if (visible) coincidencias++;
  });

  document.getElementById("buscadorSinResultados").style.display = coincidencias === 0 ? "block" : "none";
}



function actualizarResumenFlotante(gastos) {
  const sueldo = parseFloat(document.getElementById("sueldo").value);
  if (isNaN(sueldo) || gastos.length === 0) {
    document.getElementById("resumenFlotante").style.display = "none";
    return;
  }
  const totalGastado = gastos.reduce((sum, g) => sum + g.monto, 0);
  const restante = sueldo - totalGastado;

  document.getElementById("resumenTotalGastado").textContent = `Total: $${totalGastado.toFixed(2)}`;
  document.getElementById("resumenRestante").textContent = `Restante: $${restante.toFixed(2)}`;
  document.getElementById("resumenFlotante").style.display = "block";
}

// Inyectar la llamada al resumen desde los análisis
const origi
