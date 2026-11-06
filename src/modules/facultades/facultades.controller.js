import mongoose from "mongoose";    
import * as FacultadesService from "./facultades.service.js";

export async function listarFacultades(req, res) {
    try {
        const facultades = await FacultadesService.listarFacultades();
        res.json({
            statusCode: 200,
            success: true,
            message: "Facultades listadas correctamente",
            data: facultades
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            success: false,
            message: "Error al listar facultades"
        });
    }
}

export async function crearFacultad(req, res) {
    try {
        // En Express 5, req.body es undefined si no se envía body
        const { nombre } = req.body ?? {};

        if (typeof nombre !== "string" || !nombre.trim()) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: "El campo 'nombre' es obligatorio"
            });
        }

        const facultad = await FacultadesService.crearFacultad(nombre.trim());

        res.status(201).json({
            statusCode: 201,
            success: true,
            message: "Facultad creada correctamente",
            data: facultad
        });
    } catch (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                statusCode: 409,
                success: false,
                message: "Ya existe una facultad con ese nombre"
            });
        }

        res.status(500).json({
            statusCode: 500,
            success: false,
            message: "Error al crear facultad"
        });
    }
}

export async function actualizarFacultad(req, res) {
    try {
        const { id } = req.params;
        const { nombre } = req.body ?? {};

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: "id de facultad inválido    "
            });
        }
    
        
    
        } catch (error) {
            console.error(error);
            res.status(500).json({
                statusCode: 500,
                success: false,
                message: "Error al actualizar facultad"
            });
        }
    }