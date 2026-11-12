/* ---------- Sesión ---------- */
const CLAVE_SESION = "admitidos_sesion";
let sesion = null; /* { token, estudiante } para estudiantes, { token, admisor: true } para el maestro */

function leerSesionGuardada() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION));
  } catch {
    return null;
  }
}

function guardarSesion(nueva) {
  sesion = nueva;
  try {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(nueva));
  } catch { /* si el navegador no deja guardar, la sesión dura hasta recargar */ }
}

function tokenVencido(token) {
  try {
    const cuerpo = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return cuerpo.exp < Date.now() / 1000;
  } catch {
    return true;
  }
}

/* ---------- Utilidades ---------- */
async function pedir(ruta, opciones = {}) {
  const headers = { "Content-Type": "application/json" };
  if (sesion?.token) headers.Authorization = "Bearer " + sesion.token;

  let respuesta;
  try {
    respuesta = await fetch(ruta, { ...opciones, headers });
  } catch {
    throw new Error("No se pudo conectar con la API. Revisa que el backend esté encendido.");
  }
  let resultado = {};
  try {
    resultado = await respuesta.json();
  } catch { /* la respuesta no era JSON (por ejemplo un error del servidor) */ }
  if (respuesta.status === 401 && sesion) {
    cerrarSesion();
    mensajeAcceso("Tu sesión venció. Inicia sesión de nuevo.");
    throw new Error("Sesión vencida");
  }
  if (!respuesta.ok || resultado.success === false) {
    throw new Error(resultado.message || "Ocurrió un error (código " + respuesta.status + ")");
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

function llenarSelect(select, items, textoInicial) {
  select.innerHTML = "";
  const inicial = document.createElement("option");
  inicial.value = "";
  inicial.textContent = textoInicial;
  select.appendChild(inicial);
  items.forEach((item) => {
    const opcion = document.createElement("option");
    opcion.value = item._id;
    opcion.textContent = item.nombre;
    select.appendChild(opcion);
  });
}

function nombreNivel(nivel) {
  return nivel ? nivel.charAt(0).toUpperCase() + nivel.slice(1) : "-";
}

/* ---------- Panel (totales) ---------- */
async function cargarTotales() {
  try {
    const facultades = await pedir("/api/facultades/show/");
    document.getElementById("total-facultades").textContent = facultades.length;
  } catch {
    document.getElementById("total-facultades").textContent = "-";
  }
  if (!sesion?.admisor) return;
  try {
    const estudiantes = await pedir("/api/estudiantes/show/");
    document.getElementById("total-estudiantes").textContent = estudiantes.length;
  } catch {
    document.getElementById("total-estudiantes").textContent = "-";
  }
}

/* ---------- Navegación entre pantallas ---------- */
function mostrarVista(nombre) {
  if (!sesion?.admisor && nombre !== "panel") nombre = "panel";
  ["panel", "facultades", "programas", "estudiantes"].forEach((v) => {
    document.getElementById("vista-" + v).hidden = v !== nombre;
  });
  document.querySelectorAll(".nav-link").forEach((enlace) => {
    enlace.classList.toggle("activo", enlace.dataset.vista === nombre);
  });

  if (nombre === "panel") {
    cargarTotales();
    if (!sesion?.admisor) cargarMiCarrera();
  }
  if (nombre === "facultades") cargarFacultades();
  if (nombre === "programas") cargarProgramas();
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

/* ---------- Programas (maestro) ---------- */
const formProg = document.getElementById("form-programa");
const progNombre = document.getElementById("prog-nombre");
const progNivel = document.getElementById("prog-nivel");
const progFacultad = document.getElementById("prog-facultad");
const progGuardar = document.getElementById("prog-guardar");
const progCancelar = document.getElementById("prog-cancelar");
let editandoProgId = null;

async function cargarProgramas() {
  const cuerpo = document.getElementById("tabla-programas");
  cuerpo.innerHTML = "";

  try {
    const [facultades, programas] = await Promise.all([
      pedir("/api/facultades/show/"),
      pedir("/api/programas/show/"),
    ]);

    const elegida = progFacultad.value;
    llenarSelect(progFacultad, facultades, "Elige la facultad");
    progFacultad.value = elegida;

    document.getElementById("prog-vacio").hidden = programas.length > 0;

    programas.forEach((prog) => {
      const fila = document.createElement("tr");

      const celdaCodigo = document.createElement("td");
      celdaCodigo.textContent = prog.codigo;

      const celdaNombre = document.createElement("td");
      celdaNombre.textContent = prog.nombre;

      const celdaNivel = document.createElement("td");
      celdaNivel.textContent = nombreNivel(prog.nivel);

      const celdaFacultad = document.createElement("td");
      celdaFacultad.textContent = prog.facultad?.nombre ?? "-";

      const celdaAcciones = document.createElement("td");
      celdaAcciones.className = "acciones";

      const btnEditar = document.createElement("button");
      btnEditar.className = "btn-chico";
      btnEditar.textContent = "Editar";
      btnEditar.addEventListener("click", () => empezarEdicionProg(prog));

      const btnBorrar = document.createElement("button");
      btnBorrar.className = "btn-chico borrar";
      btnBorrar.textContent = "Eliminar";
      btnBorrar.addEventListener("click", () => eliminarPrograma(prog));

      celdaAcciones.append(btnEditar, " ", btnBorrar);
      fila.append(celdaCodigo, celdaNombre, celdaNivel, celdaFacultad, celdaAcciones);
      cuerpo.appendChild(fila);
    });
  } catch (error) {
    mostrarMensaje(error.message, true);
  }
}

function empezarEdicionProg(prog) {
  editandoProgId = prog._id;
  progNombre.value = prog.nombre;
  progNivel.value = prog.nivel;
  progFacultad.value = prog.facultad?._id ?? "";
  progGuardar.textContent = "Guardar cambios";
  progCancelar.hidden = false;
  progNombre.focus();
}

function terminarEdicionProg() {
  editandoProgId = null;
  formProg.reset();
  progGuardar.textContent = "Crear programa";
  progCancelar.hidden = true;
}

progCancelar.addEventListener("click", terminarEdicionProg);

formProg.addEventListener("submit", async (e) => {
  e.preventDefault();
  const datos = {
    nombre: progNombre.value.trim(),
    nivel: progNivel.value,
    facultad: progFacultad.value,
  };

  try {
    if (editandoProgId) {
      await pedir("/api/programas/update/" + editandoProgId, {
        method: "PUT",
        body: JSON.stringify(datos),
      });
      mostrarMensaje("Programa actualizado");
    } else {
      await pedir("/api/programas/create/", {
        method: "POST",
        body: JSON.stringify(datos),
      });
      mostrarMensaje("Programa creado");
    }
    terminarEdicionProg();
    cargarProgramas();
  } catch (error) {
    mostrarMensaje(error.message, true);
  }
});

async function eliminarPrograma(prog) {
  if (!confirm("¿Eliminar el programa " + prog.nombre + "?")) return;
  try {
    await pedir("/api/programas/delete/" + prog._id, { method: "DELETE" });
    mostrarMensaje("Programa eliminado");
    cargarProgramas();
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

      const celdaFacultad = document.createElement("td");
      celdaFacultad.textContent = est.facultad?.nombre ?? "-";

      const celdaCarrera = document.createElement("td");
      celdaCarrera.textContent = est.programa?.nombre ?? "-";

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
      fila.append(celdaNombre, celdaDocumento, celdaEmail, celdaFacultad, celdaCarrera, celdaAcciones);
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

/* ---------- Mi carrera (estudiante) ---------- */
const formCarrera = document.getElementById("form-carrera");
const selFacultad = document.getElementById("sel-facultad");
const selPrograma = document.getElementById("sel-programa");

function mostrarDatosEstudiante(est) {
  document.getElementById("dato-nombre").textContent = est.nombre + " " + est.apellido;
  document.getElementById("dato-documento").textContent = est.documento;
  document.getElementById("dato-email").textContent = est.email;
  document.getElementById("dato-facultad").textContent = est.facultad?.nombre ?? "Sin elegir";
  document.getElementById("dato-carrera").textContent = est.programa?.nombre ?? "Sin elegir";
  document.getElementById("dato-nivel").textContent = nombreNivel(est.programa?.nivel);
  document.getElementById("dato-codigo").textContent = est.programa?.codigo ?? "-";

  /* Una vez elegida la carrera ya no se puede cambiar: se oculta el formulario */
  const bloqueada = !!est.programa;
  formCarrera.hidden = bloqueada;
  document.getElementById("titulo-carrera").textContent = bloqueada ? "Tu carrera" : "Elige tu carrera";
  document.getElementById("texto-carrera").textContent = bloqueada
    ? "Tu carrera ya fue elegida y no se puede cambiar. Si necesitas un cambio, comunícate con el maestro."
    : "Primero escoge la facultad y luego la carrera que quieres cursar.";
}

async function cargarProgramasDeFacultad(idFacultad) {
  if (!idFacultad) {
    llenarSelect(selPrograma, [], "Primero elige una facultad");
    selPrograma.disabled = true;
    return;
  }
  const programas = await pedir("/api/programas/show/?facultad=" + idFacultad);
  llenarSelect(selPrograma, programas, programas.length ? "Elige una carrera" : "Esta facultad aún no tiene carreras");
  selPrograma.disabled = programas.length === 0;
}

async function prepararSelectores(perfil) {
  if (perfil.programa) return; /* ya eligió: no hace falta cargar los selectores */
  const facultades = await pedir("/api/facultades/show/");
  llenarSelect(selFacultad, facultades, "Elige una facultad");

  if (perfil.facultad) {
    selFacultad.value = perfil.facultad._id;
    await cargarProgramasDeFacultad(perfil.facultad._id);
    if (perfil.programa) selPrograma.value = perfil.programa._id;
  } else {
    await cargarProgramasDeFacultad("");
  }
}

async function cargarMiCarrera() {
  try {
    const perfil = await pedir("/api/auth/me");
    if (!sesion) return; /* si cerró sesión mientras cargaba, no hacemos nada */
    guardarSesion({ ...sesion, estudiante: { ...sesion.estudiante, ...perfil } });
    mostrarDatosEstudiante(perfil);
    await prepararSelectores(perfil);
  } catch (error) {
    mostrarMensaje(error.message, true);
  }
}

selFacultad.addEventListener("change", async () => {
  try {
    await cargarProgramasDeFacultad(selFacultad.value);
  } catch (error) {
    mostrarMensaje(error.message, true);
  }
});

formCarrera.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!confirm("Una vez guardada, tu carrera NO se podrá cambiar. ¿Confirmas tu elección?")) return;
  try {
    const perfil = await pedir("/api/auth/me/carrera", {
      method: "PUT",
      body: JSON.stringify({ facultad: selFacultad.value, programa: selPrograma.value }),
    });
    guardarSesion({ ...sesion, estudiante: { ...sesion.estudiante, ...perfil } });
    mostrarDatosEstudiante(perfil);
    mostrarMensaje("Carrera guardada correctamente");
  } catch (error) {
    mostrarMensaje(error.message, true);
  }
});

/* ---------- Inicio ---------- */
document.getElementById("fecha").textContent =
  new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });

/* ---------- Acceso: iniciar sesión y crear cuenta ---------- */
const pantallaAcceso = document.getElementById("pantalla-acceso");
const appPrincipal = document.getElementById("app");
const formLogin = document.getElementById("form-login");
const formRegistro = document.getElementById("form-registro");
const tabLogin = document.getElementById("tab-login");
const tabRegistro = document.getElementById("tab-registro");

let temporizadorAcceso;
function mensajeAcceso(texto, esError = true) {
  const caja = document.getElementById("mensaje-acceso");
  caja.textContent = texto;
  caja.className = esError ? "mensaje error" : "mensaje";
  caja.hidden = false;
  clearTimeout(temporizadorAcceso);
  temporizadorAcceso = setTimeout(() => (caja.hidden = true), 5000);
}

function cambiarPestana(irARegistro) {
  formLogin.hidden = irARegistro;
  formRegistro.hidden = !irARegistro;
  tabLogin.classList.toggle("activa", !irARegistro);
  tabRegistro.classList.toggle("activa", irARegistro);
  document.getElementById("mensaje-acceso").hidden = true;
}
tabLogin.addEventListener("click", () => cambiarPestana(false));
tabRegistro.addEventListener("click", () => cambiarPestana(true));

function mostrarAcceso() {
  appPrincipal.hidden = true;
  pantallaAcceso.hidden = false;
  cambiarPestana(false);
}

function entrarALaApp() {
  const esAdmisor = !!sesion.admisor;
  pantallaAcceso.hidden = true;
  appPrincipal.hidden = false;

  document.querySelectorAll(".solo-admisor").forEach((el) => (el.hidden = !esAdmisor));
  document.querySelectorAll(".solo-estudiante").forEach((el) => (el.hidden = esAdmisor));

  if (esAdmisor) {
    document.getElementById("avatar").textContent = "M";
    document.getElementById("usuario-nombre").textContent = "Maestro";
    document.getElementById("usuario-rol").textContent = "Maestro";
    document.getElementById("nav-titulo").textContent = "Panel del maestro";
    document.getElementById("nav-panel-texto").textContent = "Inicio";
    document.getElementById("saludo-titulo").textContent = "Bienvenido, Maestro";
    document.getElementById("hero-texto").textContent =
      "Este es el resumen de admisiones. Desde aquí administras las facultades, los programas y los estudiantes.";
  } else {
    const est = sesion.estudiante;
    document.getElementById("avatar").textContent = (est.nombre[0] + est.apellido[0]).toUpperCase();
    document.getElementById("usuario-nombre").textContent = est.nombre + " " + est.apellido;
    document.getElementById("usuario-rol").textContent = "Estudiante";
    document.getElementById("nav-titulo").textContent = "Mi espacio";
    document.getElementById("nav-panel-texto").textContent = "Mi panel";
    document.getElementById("saludo-titulo").textContent = "Hola, " + est.nombre;
    document.getElementById("hero-texto").textContent =
      "Bienvenido a tu espacio de admisiones. Aquí puedes ver tus datos y elegir tu carrera.";
    mostrarDatosEstudiante(est);
  }

  mostrarVista("panel");
}

function cerrarSesion() {
  sesion = null;
  document.getElementById("mensaje").hidden = true;
  try {
    localStorage.removeItem(CLAVE_SESION);
  } catch { /* nada que borrar */ }
  mostrarAcceso();
}

formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const datos = await pedir("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: document.getElementById("login-email").value.trim(),
        password: document.getElementById("login-password").value,
      }),
    });
    guardarSesion(
      datos.rol === "admisor"
        ? { token: datos.token, admisor: true }
        : { token: datos.token, estudiante: datos.estudiante }
    );
    formLogin.reset();
    entrarALaApp();
  } catch (error) {
    mensajeAcceso(error.message);
  }
});

formRegistro.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const datos = await pedir("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        nombre: document.getElementById("reg-nombre").value.trim(),
        apellido: document.getElementById("reg-apellido").value.trim(),
        documento: document.getElementById("reg-documento").value.trim(),
        email: document.getElementById("reg-email").value.trim(),
        password: document.getElementById("reg-password").value,
      }),
    });
    guardarSesion({ token: datos.token, estudiante: datos.estudiante });
    formRegistro.reset();
    entrarALaApp();
  } catch (error) {
    mensajeAcceso(error.message);
  }
});

document.getElementById("btn-salir").addEventListener("click", cerrarSesion);

/* ---------- Arranque ---------- */
const guardada = leerSesionGuardada();
const sesionValida = guardada && guardada.token && !tokenVencido(guardada.token);

if (sesionValida) {
  sesion = guardada;
  entrarALaApp();
} else {
  mostrarAcceso();
}