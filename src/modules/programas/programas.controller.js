import mongoose from "mongoose";
import Facultad from "../facultades/facultades.model.js";
import * as ProgramasService from "./programas.service.js";

const NIVELES = ["pregrado", "posgrado", "otro"];

function error(res, codigo, mensaje) {
    return res.status(codigo).json({ statusCode: codigo, success: false, message: mensaje });
}

function ok(res, codigo, mensaje, data) {
    return res.status(codigo).json({ statusCode: codigo, success: true, message: mensaje, data });
}

/* Revisa los datos. Devuelve el mensaje de error, o null si todo está bien */
async function validarPrograma({ nombre, nivel, facultad }) {
    if (typeof nombre !== "string" || !nombre.trim()) {
        return "El campo 'nombre' es obligatorio";
    }
    if (nombre.trim().length < 3 || nombre.trim().length > 150) {
        return "El campo 'nombre' debe tener entre 3 y 150 caracteres";
    }
    if (typeof nivel !== "string" || !NIVELES.includes(nivel.toLowerCase())) {
        return "El nivel debe ser pregrado, posgrado u otro";
    }
    if (!mongoose.Types.ObjectId.isValid(facultad)) {
        return "Debes elegir una facultad válida";
    }
    if (!(await Facultad.exists({ _id: facultad }))) {
        return "La facultad elegida no existe";
    }
    return null;
}

export async function listarProgramas(req, res) {
    try {
        const { facultad } = req.query;
        if (facultad !== undefined && !mongoose.Types.ObjectId.isValid(facultad)) {
            return error(res, 400, "ID de facultad inválido");
        }
        const programas = await ProgramasService.listarProgramas(facultad);
        return ok(res, 200, "Programas listados correctamente", programas);
    } catch (e) {
        console.error(e);
        return error(res, 500, "Error al listar los programas");
    }
}

export async function obtenerProgramaPorId(req, res) {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return error(res, 400, "ID de programa inválido");

        const programa = await ProgramasService.obtenerProgramaPorId(id);
        if (!programa) return error(res, 404, "Programa no encontrado");
        return ok(res, 200, "Programa obtenido correctamente", programa);
    } catch (e) {
        console.error(e);
        return error(res, 500, "Error al obtener el programa");
    }
}

export async function crearPrograma(req, res) {
    try {
        const { nombre, nivel, facultad } = req.body ?? {};

        const mensaje = await validarPrograma({ nombre, nivel, facultad });
        if (mensaje) return error(res, 400, mensaje);

        const programa = await ProgramasService.crearPrograma({
            nombre: nombre.trim(),
            nivel: nivel.toLowerCase(),
            facultad
        });
        return ok(res, 201, "Programa creado correctamente", programa);
    } catch (e) {
        console.error(e);
        if (e.code === 11000) return error(res, 409, "Ya existe un programa con ese nombre en esa facultad");
        return error(res, 500, "Error al crear el programa");
    }
}

export async function actualizarPrograma(req, res) {
    try {
        const { id } = req.params;
        const { nombre, nivel, facultad } = req.body ?? {};

        if (!mongoose.Types.ObjectId.isValid(id)) return error(res, 400, "ID de programa inválido");
        if (!(await ProgramasService.obtenerProgramaPorId(id))) return error(res, 404, "Programa no encontrado");

        const mensaje = await validarPrograma({ nombre, nivel, facultad });
        if (mensaje) return error(res, 400, mensaje);

        const programa = await ProgramasService.actualizarPrograma(id, {
            nombre: nombre.trim(),
            nivel: nivel.toLowerCase(),
            facultad
        });
        return ok(res, 200, "Programa actualizado correctamente", programa);
    } catch (e) {
        console.error(e);
        if (e.code === 11000) return error(res, 409, "Ya existe un programa con ese nombre en esa facultad");
        return error(res, 500, "Error al actualizar el programa");
    }
}

export async function eliminarPrograma(req, res) {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return error(res, 400, "ID de programa inválido");

        const programa = await ProgramasService.obtenerProgramaPorId(id);
        if (!programa) return error(res, 404, "Programa no encontrado");

        await ProgramasService.eliminarPrograma(id);
        return ok(res, 200, "Programa eliminado correctamente", programa);
    } catch (e) {
        console.error(e);
        return error(res, 500, "Error al eliminar el programa");
    }
}