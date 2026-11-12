import Programa from "./programas.model.js";
import Estudiante from "../estudiantes/estudiantes.model.js";

const DETALLE = { path: "facultad", select: "nombre" };

export async function listarProgramas(idFacultad) {
    const filtro = idFacultad ? { facultad: idFacultad } : {};
    return await Programa.find(filtro).populate(DETALLE).sort({ nombre: 1 });
}

export async function obtenerProgramaPorId(id) {
    return await Programa.findById(id).populate(DETALLE);
}

/* El código lo genera el sistema: PROG-0001, PROG-0002, ... */
async function siguienteCodigo() {
    const ultimo = await Programa.findOne().sort({ codigo: -1 }).select("codigo").lean();
    const numero = ultimo ? parseInt(ultimo.codigo.replace(/\D/g, ""), 10) + 1 : 1;
    return `PROG-${String(numero).padStart(4, "0")}`;
}

export async function crearPrograma({ nombre, nivel, facultad }) {
    /* Si dos personas crean a la vez y chocan en el código, se reintenta */
    for (let intento = 0; intento < 3; intento++) {
        try {
            const creado = await Programa.create({ codigo: await siguienteCodigo(), nombre, nivel, facultad });
            return await obtenerProgramaPorId(creado._id);
        } catch (error) {
            const choqueDeCodigo = error.code === 11000 && error.keyPattern?.codigo;
            if (!choqueDeCodigo) throw error;
        }
    }
    throw new Error("No se pudo generar un código único para el programa");
}

export async function actualizarPrograma(id, datos) {
    return await Programa.findByIdAndUpdate(
        id,
        datos,
        { returnDocument: "after", runValidators: true }
    ).populate(DETALLE);
}

export async function eliminarPrograma(id) {
    const eliminado = await Programa.findByIdAndDelete(id);
    if (!eliminado) return false;

    /* Los estudiantes que habían elegido esta carrera quedan "sin elegir" */
    await Estudiante.updateMany({ programa: id }, { $unset: { programa: "", facultad: "" } });
    return true;
}