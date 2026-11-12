/* ---------- Utilidades ---------- */
async function pedir(ruta, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(ruta, {
      headers: { "Content-Type": "application/json" },
      ...opciones,
    });
  } catch {
    throw new Error("No se pudo conectar con la API. Revisa que el backend esté encendido.");
  }
  const resultado = await respuesta.json();
  if (!respuesta.ok || resultado.success === false) {
    throw new Error(resultado.message || "Ocurrió un error");
  }
  return resultado.data;
}

let temporizadorMensaje;
function mostrarMensaje(texto, esError = false) {
  const caja = document.getElementById("mensaje");
  caja.textContent = texto;
  caja.className = esError ? "mensaje error" : "mensaje";
  caja.hidden = false;
  clearTimeout(temporizadorMensaje);
  temporizadorMensaje = setTimeout(() => (caja.hidden = true), 4000);
}

/* ---------- Panel (totales) ---------- */
async function cargarTotales() {
  try {
    const facultades = await pedir("/api/facultades/show/");
    document.getElementById("total-facultades").textContent = facultades.length;
  } catch {
    document.getElementById("total-facultades").textContent = "-";
  }
  try {
    const estudiantes = await pedir("/api/estudiantes/show/");
    document.getElementById("total-estudiantes").textContent = estudiantes.length;
  } catch {
    document.getElementById("total-estudiantes").textContent = "-";
  }
}

/* ---------- Navegación entre pantallas ---------- */
function mostrarVista(nombre) {
  ["panel", "facultades", "estudiantes"].forEach((v) => {
    document.getElementById("vista-" + v).hidden = v !== nombre;
  });
  document.querySelectorAll(".nav-link").forEach((enlace) => {
    enlace.classList.toggle("activo", enlace.dataset.vista === nombre);
  });

  if (nombre === "panel") cargarTotales();
  if (nombre === "facultades") cargarFacultades();
  if (nombre === "estudiantes") cargarEstudiantes();
}

document.querySelectorAll(".nav-link").forEach((enlace) => {
  enlace.addEventListener("click", (e) => {
    e.preventDefault();
    mostrarVista(enlace.dataset.vista);
  });
});

/* ---------- Facultades ---------- */
const form = document.getElementById("form-facultad");
const inputNombre = document.getElementById("nombre-facultad");
const btnGuardar = document.getElementById("btn-guardar");
const btnCancelar = document.getElementById("btn-cancelar");
let editandoId = null; // null = creando, texto = editando esa facultad

async function cargarFacultades() {
  const cuerpo = document.getElementById("tabla-facultades");
  cuerpo.innerHTML = "";

  try {
    const facultades = await pedir("/api/facultades/show/");
    document.getElementById("vacio").hidden = facultades.length > 0;

    facultades.forEach((facultad) => {
      const fila = document.createElement("tr");

      const celdaNombre = document.createElement("td");
      celdaNombre.textContent = facultad.nombre;

      const celdaAcciones = document.createElement("td");
      celdaAcciones.className = "acciones";

      const btnEditar = document.createElement("button");
      btnEditar.className = "btn-chico";
      btnEditar.textContent = "Editar";
      btnEditar.addEventListener("click", () => empezarEdicion(facultad));

      const btnBorrar = document.createElement("button");
      btnBorrar.className = "btn-chico borrar";
      btnBorrar.textContent = "Eliminar";
      btnBorrar.addEventListener("click", () => eliminarFacultad(facultad));

      celdaAcciones.append(btnEditar, " ", btnBorrar);
      fila.append(celdaNombre, celdaAcciones);
      cuerpo.appendChild(fila);
    });
  } catch (error) {
    mostrarMensaje(error.message, true);
  }
}

function empezarEdicion(facultad) {
  editandoId = facultad._id;
  inputNombre.value = facultad.nombre;
  btnGuardar.textContent = "Guardar cambios";
  btnCancelar.hidden = false;
  inputNombre.focus();
}

function terminarEdicion() {
  editandoId = null;
  form.reset();
  btnGuardar.textContent = "Crear facultad";
  btnCancelar.hidden = true;
}

btnCancelar.addEventListener("click", terminarEdicion);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = inputNombre.value.trim();

  try {
    if (editandoId) {
      await pedir("/api/facultades/update/" + editandoId, {
        method: "PUT",
        body: JSON.stringify({ nombre }),
      });
      mostrarMensaje("Facultad actualizada");
    } else {
      await pedir("/api/facultades/create/", {
        method: "POST",
        body: JSON.stringify({ nombre }),
      });
      mostrarMensaje("Facultad creada");
    }
    terminarEdicion();
    cargarFacultades();
  } catch (error) {
    mostrarMensaje(error.message, true);
  }
});

async function eliminarFacultad(facultad) {
  if (!confirm("¿Eliminar la facultad " + facultad.nombre + "?")) return;
  try {
    await pedir("/api/facultades/delete/" + facultad._id, { method: "DELETE" });
    mostrarMensaje("Facultad eliminada");
    cargarFacultades();
  } catch (error) {
    mostrarMensaje(error.message, true);
  }
}

/* ---------- Estudiantes ---------- */
const formEst = document.getElementById("form-estudiante");
const estNombre = document.getElementById("est-nombre");
const estApellido = document.getElementById("est-apellido");
const estDocumento = document.getElementById("est-documento");
const estEmail = document.getElementById("est-email");
const estGuardar = document.getElementById("est-guardar");
const estCancelar = document.getElementById("est-cancelar");
let editandoEstId = null;

async function cargarEstudiantes() {
  const cuerpo = document.getElementById("tabla-estudiantes");
  cuerpo.innerHTML = "";

  try {
    const estudiantes = await pedir("/api/estudiantes/show/");
    document.getElementById("est-vacio").hidden = estudiantes.length > 0;

    estudiantes.forEach((est) => {
      const fila = document.createElement("tr");

      const celdaNombre = document.createElement("td");
      const negrita = document.createElement("strong");
      negrita.textContent = est.apellido;
      celdaNombre.append(negrita, ", " + est.nombre);

      const celdaDocumento = document.createElement("td");
      celdaDocumento.textContent = est.documento;

      const celdaEmail = document.createElement("td");
      celdaEmail.textContent = est.email;

      const celdaAcciones = document.createElement("td");
      celdaAcciones.className = "acciones";

      const btnEditar = document.createElement("button");
      btnEditar.className = "btn-chico";
      btnEditar.textContent = "Editar";
      btnEditar.addEventListener("click", () => empezarEdicionEst(est));

      const btnBorrar = document.createElement("button");
      btnBorrar.className = "btn-chico borrar";
      btnBorrar.textContent = "Eliminar";
      btnBorrar.addEventListener("click", () => eliminarEstudiante(est));

      celdaAcciones.append(btnEditar, " ", btnBorrar);
      fila.append(celdaNombre, celdaDocumento, celdaEmail, celdaAcciones);
      cuerpo.appendChild(fila);
    });
  } catch (error) {
    mostrarMensaje(error.message, true);
  }
}

function empezarEdicionEst(est) {
  editandoEstId = est._id;
  estNombre.value = est.nombre;
  estApellido.value = est.apellido;
  estDocumento.value = est.documento;
  estEmail.value = est.email;
  estGuardar.textContent = "Guardar cambios";
  estCancelar.hidden = false;
  estNombre.focus();
}

function terminarEdicionEst() {
  editandoEstId = null;
  formEst.reset();
  estGuardar.textContent = "Crear estudiante";
  estCancelar.hidden = true;
}

estCancelar.addEventListener("click", terminarEdicionEst);

formEst.addEventListener("submit", async (e) => {
  e.preventDefault();
  const datos = {
    nombre: estNombre.value.trim(),
    apellido: estApellido.value.trim(),
    documento: estDocumento.value.trim(),
    email: estEmail.value.trim(),
  };

  try {
    if (editandoEstId) {
      await pedir("/api/estudiantes/update/" + editandoEstId, {
        method: "PUT",
        body: JSON.stringify(datos),
      });
      mostrarMensaje("Estudiante actualizado");
    } else {
      await pedir("/api/estudiantes/create/", {
        method: "POST",
        body: JSON.stringify(datos),
      });
      mostrarMensaje("Estudiante creado");
    }
    terminarEdicionEst();
    cargarEstudiantes();
  } catch (error) {
    mostrarMensaje(error.message, true);
  }
});

async function eliminarEstudiante(est) {
  if (!confirm("¿Eliminar a " + est.nombre + " " + est.apellido + "?")) return;
  try {
    await pedir("/api/estudiantes/delete/" + est._id, { method: "DELETE" });
    mostrarMensaje("Estudiante eliminado");
    cargarEstudiantes();
  } catch (error) {
    mostrarMensaje(error.message, true);
  }
}

/* ---------- Inicio ---------- */
document.getElementById("fecha").textContent =
  new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });

cargarTotales();