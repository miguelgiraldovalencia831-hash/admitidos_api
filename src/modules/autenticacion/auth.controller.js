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

        const estudiante = await Estudiante
            .findOne({ email: email.trim().toLowerCase() })
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