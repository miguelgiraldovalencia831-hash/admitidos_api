import mongoose from 'mongoose';
import Facultad from './facultades.model.js';

import * as FacultadesService from './facultades.service.js';

export async function listarFacultades(req, res) {
    try {
        const facultades = await FacultadesService.listarFacultades();
        res.json({
            statusCode: 200,
            success: true,
            message: 'Facultades listadas correctamente',
            data: facultades
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            success: false,
            message: 'Error al listar las facultades',
        });
    }
}

export async function obtenerFacultadPorId(req, res) {
    const id = req.params.id;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) { /* revisa que el id tenga formato de Mongo */
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: 'ID de facultad inválido'
            });
        }

        const facultad = await FacultadesService.obtenerFacultadPorId(id);
        if (!facultad) {
            return res.status(404).json({
                statusCode: 404,
                success: false,
                message: 'Facultad no encontrada'
            });
        }
        res.json({
            statusCode: 200,
            success: true,
            message: 'Facultad obtenida correctamente',
            data: facultad
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            success: false,
            message: 'Error al obtener la facultad'
        });
    }
}


export async function crearFacultad(req, res) {

    try {
        const { nombre } = req.body;
        if (nombre === undefined) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: "El campo 'nombre' es obligatorio"
            });
        }


        if (nombre.length < 3 || nombre.length > 150) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: "El campo 'nombre' debe tener entre 3 y 150 caracteres"
            });
        }

        const facultad = await FacultadesService.crearFacultad(nombre);
        res.status(201).json({
            statusCode: 201,
            success: true,
            message: 'Facultad creada correctamente',
            data: facultad
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            success: false,
            message: 'Error al crear la facultad'
        });
    }
}



export async function actualizarFacultad(req, res) {

    try {
        const id = req.params.id; /* en Mongo el id es un texto, no un numero */
        const { nombre } = req.body;
        /* Validaciones ID */

        if (!mongoose.Types.ObjectId.isValid(id)) { /* revisa que el id tenga formato de Mongo */
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: 'ID de facultad inválido'
            });
        }

        const facultadActual = await FacultadesService.obtenerFacultadPorId(id);
        if (!facultadActual) {
            return res.status(404).json({
                statusCode: 404,
                success: false,
                message: 'Facultad no encontrada'
            });
        }

        /* Validaciones nombre*/
        if (nombre === undefined) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: "El campo 'nombre' es obligatorio"
            });
        }
        if (nombre.length < 3 || nombre.length > 150) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: "El campo 'nombre' debe tener entre 3 y 150 caracteres"
            });
        }
        const facultad = await FacultadesService.actualizarFacultad(id, nombre);
        res.status(201).json({
            statusCode: 201,
            success: true,
            message: 'Facultad actualizada correctamente',
            data: facultad
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            success: false,
            message: 'Error al actualizar la facultad'
        });
    }
}


export async function eliminarFacultad(req, res) {

    try {
        const id = req.params.id; /* en Mongo el id es un texto, no un numero */

        /* Validaciones ID */

        if (!mongoose.Types.ObjectId.isValid(id)) { /* revisa que el id tenga formato de Mongo */
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: 'ID de facultad inválido'
            });
        }

        const facultadActual = await FacultadesService.obtenerFacultadPorId(id);
        if (!facultadActual) {
            return res.status(404).json({
                statusCode: 404,
                success: false,
                message: 'Facultad no encontrada'
            });
        }

        const eliminada = await FacultadesService.eliminarFacultad(id);

        if (!eliminada) {
            return res.status(500).json({
                statusCode: 500,
                success: false,
                message: 'Error al eliminar la facultad  1'
            })
        }

        return res.json({
            statusCode: 201,
            success: true,
            message: 'Facultad eliminada correctamente',
            data: facultadActual
        })

    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            success: false,
            message: 'Facultad eliminada correctament'
        });
    }
}