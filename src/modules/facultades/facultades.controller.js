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
            message: "Error al listar facultades",
        });
    }
}