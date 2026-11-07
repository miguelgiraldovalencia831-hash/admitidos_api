import mongoose from "mongoose";
import * as EstudiantesService from "./estudiantes.service.js";

/* Revisa los 4 campos. Devuelve el mensaje de error, o null si todo está bien */
function validarEstudiante({ nombre, apellido, documento, email }) {
    if (typeof nombre !== "string" || !nombre.trim()) {
        return "El campo 'nombre' es obligatorio";
    }
    if (nombre.trim().length < 2 || nombre.trim().length > 100) {
        return "El campo 'nombre' debe tener entre 2 y 100 caracteres";
    }

    if (typeof apellido !== "string" || !apellido.trim()) {
        return "El campo 'apellido' es obligatorio";
    }
    if (apellido.trim().length < 2 || apellido.trim().length > 100) {
        return "El campo 'apellido' debe tener entre 2 y 100 caracteres";
    }

    if (typeof documento !== "string" || !documento.trim()) {
        return "El campo 'documento' es obligatorio";
    }
    if (documento.trim().length < 5 || documento.trim().length > 20) {
        return "El campo 'documento' debe tener entre 5 y 20 caracteres";
    }

    if (typeof email !== "string" || !email.trim()) {
        return "El campo 'email' es obligatorio";
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim()) || email.trim().length > 150) {
        return "El campo 'email' no es válido";
    }

    return null;
}

export async function listarEstudiantes(req, res) {
    try {
        const estudiantes = await EstudiantesService.listarEstudiantes();
        res.json({
            statusCode: 200,
            success: true,
            message: 'Estudiantes listados correctamente',
            data: estudiantes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            success: false,
            message: 'Error al listar los estudiantes',
        });
    }
}

export async function obtenerEstudiantePorId(req, res) {
    const id = req.params.id;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) { /* revisa que el id tenga formato de Mongo */
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: 'ID de estudiante inválido'
            });
        }

        const estudiante = await EstudiantesService.obtenerEstudiantePorId(id);
        if (!estudiante) {
            return res.status(404).json({
                statusCode: 404,
                success: false,
                message: 'Estudiante no encontrado'
            });
        }
        res.json({
            statusCode: 200,
            success: true,
            message: 'Estudiante obtenido correctamente',
            data: estudiante
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            success: false,
            message: 'Error al obtener el estudiante'
        });
    }
}

export async function crearEstudiante(req, res) {
    try {
        const { nombre, apellido, documento, email } = req.body ?? {};

        const mensaje = validarEstudiante({ nombre, apellido, documento, email });
        if (mensaje) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: mensaje
            });
        }

        const estudiante = await EstudiantesService.crearEstudiante({ nombre, apellido, documento, email });
        res.status(201).json({
            statusCode: 201,
            success: true,
            message: 'Estudiante creado correctamente',
            data: estudiante
        });
    } catch (error) {
        console.error(error);

        if (error.code === 11000) { /* 11000 = valor repetido en un campo unique */
            return res.status(409).json({
                statusCode: 409,
                success: false,
                message: 'Ya existe un estudiante con ese documento o email'
            });
        }

        res.status(500).json({
            statusCode: 500,
            success: false,
            message: 'Error al crear el estudiante'
        });
    }
}

export async function actualizarEstudiante(req, res) {
    try {
        const id = req.params.id;
        const { nombre, apellido, documento, email } = req.body ?? {};

        /* Validaciones ID */
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: 'ID de estudiante inválido'
            });
        }

        const estudianteActual = await EstudiantesService.obtenerEstudiantePorId(id);
        if (!estudianteActual) {
            return res.status(404).json({
                statusCode: 404,
                success: false,
                message: 'Estudiante no encontrado'
            });
        }

        /* Validaciones de los campos */
        const mensaje = validarEstudiante({ nombre, apellido, documento, email });
        if (mensaje) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: mensaje
            });
        }

        const estudiante = await EstudiantesService.actualizarEstudiante(id, { nombre, apellido, documento, email });
        res.json({
            statusCode: 200,
            success: true,
            message: 'Estudiante actualizado correctamente',
            data: estudiante
        });
    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            return res.status(409).json({
                statusCode: 409,
                success: false,
                message: 'Ya existe un estudiante con ese documento o email'
            });
        }

        res.status(500).json({
            statusCode: 500,
            success: false,
            message: 'Error al actualizar el estudiante'
        });
    }
}

export async function eliminarEstudiante(req, res) {
    try {
        const id = req.params.id;

        /* Validaciones ID */
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: 'ID de estudiante inválido'
            });
        }

        const estudianteActual = await EstudiantesService.obtenerEstudiantePorId(id);
        if (!estudianteActual) {
            return res.status(404).json({
                statusCode: 404,
                success: false,
                message: 'Estudiante no encontrado'
            });
        }

        const eliminado = await EstudiantesService.eliminarEstudiante(id);
        if (!eliminado) {
            return res.status(500).json({
                statusCode: 500,
                success: false,
                message: 'Error al eliminar el estudiante'
            });
        }

        res.json({
            statusCode: 200,
            success: true,
            message: 'Estudiante eliminado correctamente',
            data: estudianteActual
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            success: false,
            message: 'Error al eliminar el estudiante'
        });
    }
}