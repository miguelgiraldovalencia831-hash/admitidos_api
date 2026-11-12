import { verificarToken } from "./autenticacion.js";

function leerToken(req) {
    const encabezado = req.headers.authorization || "";
    const token = encabezado.startsWith("Bearer ") ? encabezado.slice(7) : null;
    return token ? verificarToken(token) : null;
}

/* Crea un "portero" que solo deja pasar a quien tenga el rol indicado */
function exigirRol(rol) {
    return (req, res, next) => {
        const datos = leerToken(req);

        if (!datos) {
            return res.status(401).json({
                statusCode: 401,
                success: false,
                message: "Debes iniciar sesión"
            });
        }

        if (datos.rol !== rol) {
            return res.status(403).json({
                statusCode: 403,
                success: false,
                message: "No tienes permiso para esta acción"
            });
        }

        req.usuario = datos;
        next();
    };
}

export const soloAdmisor = exigirRol("admisor");
export const soloEstudiante = exigirRol("estudiante");