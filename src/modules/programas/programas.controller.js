import * as ProgramasService from './programas.service.js';

export async function listarProgramas(req, res) {
    try {
        const programas = await ProgramasService.listarProgramas();
        res.json({
            statusCode: 200,
            success: true,
            message: 'Programas listados correctamente',
            data: programas
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            success: false,
            message: 'Error al listar los programas',
        });
    }
}

export async function obtenerFacultadPorId(req, res) {
    const id = Number(req.params.id);
    try {
        if (!Number.isInteger(id) || id <= 0) {
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
        const id = Number(req.params.id);
        const { nombre } = req.body;
        /* Validaciones ID */

        if (!Number.isInteger(id) || id <= 0) {
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
        const id = Number(req.params.id);

        /* Validaciones ID */

        if (!Number.isInteger(id) || id <= 0) {
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