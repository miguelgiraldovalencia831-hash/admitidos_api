import Estudiante from "./estudiantes.model.js";

/* Cambia los _id de facultad y programa por sus datos (nombre, código, nivel) */
const DETALLE = [
    { path: "facultad", select: "nombre" },
    { path: "programa", select: "nombre codigo nivel" }
];

export async function listarEstudiantes() {
    return await Estudiante.find().populate(DETALLE).sort({ apellido: 1 }); /* Ordena por apellido de forma ascendente */
}

export async function obtenerEstudiantePorId(id) {
    return await Estudiante.findById(id).populate(DETALLE);
}

export async function crearEstudiante(datos) {
    return await Estudiante.create(datos);
}

export async function actualizarEstudiante(id, datos) {
    return await Estudiante.findByIdAndUpdate(
        id,
        datos,
        { returnDocument: "after", runValidators: true }
    ).populate(DETALLE);
}

export async function eliminarEstudiante(id) {
    const eliminado = await Estudiante.findByIdAndDelete(id);
    return eliminado !== null; /* Devuelve true si se eliminó, false si no se encontró */
}