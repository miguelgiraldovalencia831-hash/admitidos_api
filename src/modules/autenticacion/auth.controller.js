import crypto from "crypto";
import Estudiante from "../estudiantes/estudiantes.model.js";
import { cifrarPassword, verificarPassword, crearToken } from "../../utils/autenticacion.js";

function datosPublicos(estudiante) {
    return {
        _id: estudiante._id,
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        documento: estudiante.documento,
        email: estudiante.email
    };
}

function respuestaConToken(res, codigo, mensaje, estudiante) {
    const token = crearToken({ id: estudiante._id, email: estudiante.email, rol: "estudiante" });
    return res.status(codigo).json({
        statusCode: codigo,
        success: true,
        message: mensaje,
        data: { token, estudiante: datosPublicos(estudiante) }
    });
}

/* El admisor se define en el .env (ADMIN_EMAIL y ADMIN_PASSWORD), no se guarda en la base de datos */
function correoAdmisor() {
    return process.env.ADMIN_EMAIL?.trim().toLowerCase() || null;
}

function esAdmisor(correo, password) {
    const adminCorreo = correoAdmisor();
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminCorreo || !adminPassword || correo !== adminCorreo) return false;

    const a = crypto.createHash("sha256").update(password).digest();
    const b = crypto.createHash("sha256").update(adminPassword).digest();
    return crypto.timingSafeEqual(a, b);
}

function error(res, codigo, mensaje) {
    return res.status(codigo).json({ statusCode: codigo, success: false, message: mensaje });
}

export async function registrar(req, res) {
    try {
        const { nombre, apellido, documento, email, password } = req.body ?? {};

        const textos = { nombre, apellido, documento, email, password };
        for (const [campo, valor] of Object.entries(textos)) {
            if (typeof valor !== "string" || !valor.trim()) {
                return error(res, 400, `El campo '${campo}' es obligatorio`);
            }
        }
        if (nombre.trim().length < 2 || apellido.trim().length < 2) {
            return error(res, 400, "El nombre y el apellido deben tener al menos 2 caracteres");
        }
        if (documento.trim().length < 5 || documento.trim().length > 20) {
            return error(res, 400, "El campo 'documento' debe tener entre 5 y 20 caracteres");
        }
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            return error(res, 400, "El campo 'email' no es válido");
        }
        if (password.length < 8) {
            return error(res, 400, "La contraseña debe tener al menos 8 caracteres");
        }

        const correo = email.trim().toLowerCase();
        if (correo === correoAdmisor()) {
            return error(res, 409, "Ya existe una cuenta con ese correo");
        }
        let estudiante = await Estudiante.findOne({ email: correo }).select("+password");

        if (estudiante) {
            if (estudiante.password) {
                return error(res, 409, "Ya existe una cuenta con ese correo");
            }
            if (estudiante.documento !== documento.trim()) {
                return error(res, 400, "El documento no coincide con el registrado para ese correo");
            }
            estudiante.password = cifrarPassword(password);
            await estudiante.save();
        } else {
            estudiante = await Estudiante.create({
                nombre,
                apellido,
                documento,
                email: correo,
                password: cifrarPassword(password)
            });
        }

        return respuestaConToken(res, 201, "Cuenta creada correctamente", estudiante);
    } catch (e) {
        console.error(e);
        if (e.code === 11000) {
            return error(res, 409, "Ya existe un estudiante con ese documento o email");
        }
        return error(res, 500, "Error al crear la cuenta");
    }
}

export async function iniciarSesion(req, res) {
    try {
        const { email, password } = req.body ?? {};

        if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
            return error(res, 400, "El correo y la contraseña son obligatorios");
        }

        const correo = email.trim().toLowerCase();

        if (esAdmisor(correo, password)) {
            const token = crearToken({ email: correo, rol: "admisor" });
            return res.status(200).json({
                statusCode: 200,
                success: true,
                message: "Sesión de admisor iniciada correctamente",
                data: { token, rol: "admisor" }
            });
        }

        const estudiante = await Estudiante
            .findOne({ email: correo })
            .select("+password");

        if (!estudiante || !estudiante.password || !verificarPassword(password, estudiante.password)) {
            return error(res, 401, "Correo o contraseña incorrectos");
        }

        return respuestaConToken(res, 200, "Sesión iniciada correctamente", estudiante);
    } catch (e) {
        console.error(e);
        return error(res, 500, "Error al iniciar sesión");
    }
}