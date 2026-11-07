import Estudiante from "./estudiantes.model.js";

export async function listarEstudiantes() {
    return await Estudiante.find().sort({ apellido: 1 }); /* Ordena por apellido de forma ascendente */
}

export async function obtenerEstudiantePorId(id) {
    return await Estudiante.findById(id);
}

export async function crearEstudiante(datos) {
    return await Estudiante.create(datos);
}

export async function actualizarEstudiante(id, datos) {
    return await Estudiante.findByIdAndUpdate(
        id,
        datos,
        { returnDocument: "after", runValidators: true }
    );
}

export async function eliminarEstudiante(id) {
    const eliminado = await Estudiante.findByIdAndDelete(id);
    return eliminado !== null; /* Devuelve true si se eliminó, false si no se encontró */
}