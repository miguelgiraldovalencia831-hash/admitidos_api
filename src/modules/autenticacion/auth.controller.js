import crypto from "crypto";
import mongoose from "mongoose";
import Estudiante from "../estudiantes/estudiantes.model.js";
import Programa from "../programas/programas.model.js";
import { cifrarPassword, verificarPassword, crearToken } from "../../utils/autenticacion.js";

/* Cambia los _id de facultad y programa por sus datos (nombre, código, nivel) */
const DETALLE = [
    { path: "facultad", select: "nombre" },
    { path: "programa", select: "nombre codigo nivel" }
];

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

/* El maestro (admisor) se define en el .env (ADMIN_EMAIL y ADMIN_PASSWORD), no se guarda en la base de datos */
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

/* ---------- Registro ---------- */
export async function registrar(req, res) {
    try {
        const { nombre, apellido, documento, email, password } = req.body ?? {};

        const textos = { nombre, apellido, documento, email, password };
        for (const [campo, valor] of Object.entries(textos)) {
            if (typeof valor !== "string" || !valor.trim()) {
                return error(res, 400, `El campo '${campo}' es obligatorio`);
            }
        }

        /* Todo se limpia una sola vez, para guardar y comparar siempre lo mismo */
        const datos = {
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            documento: documento.trim(),
            email: email.trim().toLowerCase()
        };

        if (datos.nombre.length < 2 || datos.apellido.length < 2) {
            return error(res, 400, "El nombre y el apellido deben tener al menos 2 caracteres");
        }
        if (datos.nombre.length > 100 || datos.apellido.length > 100) {
            return error(res, 400, "El nombre y el apellido pueden tener máximo 100 caracteres");
        }
        if (datos.documento.length < 5 || datos.documento.length > 20) {
            return error(res, 400, "El campo 'documento' debe tener entre 5 y 20 caracteres");
        }
        if (!/^\S+@\S+\.\S+$/.test(datos.email) || datos.email.length > 150) {
            return error(res, 400, "El campo 'email' no es válido");
        }
        if (password.length < 8) {
            return error(res, 400, "La contraseña debe tener al menos 8 caracteres");
        }

        if (datos.email === correoAdmisor()) {
            return error(res, 409, "Ya existe una cuenta con ese correo");
        }

        let estudiante = await Estudiante.findOne({ email: datos.email }).select("+password");

        if (estudiante) {
            /* El maestro pudo haber creado al estudiante antes: si aún no tiene contraseña, se activa su cuenta */
            if (estudiante.password) {
                return error(res, 409, "Ya existe una cuenta con ese correo");
            }
            if (estudiante.documento !== datos.documento) {
                return error(res, 400, "El documento no coincide con el registrado para ese correo");
            }
            estudiante.password = cifrarPassword(password);
            await estudiante.save();
        } else {
            const otroConDocumento = await Estudiante.exists({ documento: datos.documento });
            if (otroConDocumento) {
                return error(res, 409, "Ya existe una cuenta con ese documento");
            }
            estudiante = await Estudiante.create({ ...datos, password: cifrarPassword(password) });
        }

        return respuestaConToken(res, 201, "Cuenta creada correctamente", estudiante);
    } catch (e) {
        console.error(e);
        if (e.code === 11000) {
            return error(res, 409, "Ya existe un estudiante con ese documento o email");
        }
        if (e.name === "ValidationError") {
            return error(res, 400, "Revisa los datos: alguno no cumple el formato");
        }
        return error(res, 500, "Error al crear la cuenta");
    }
}

/* ---------- Inicio de sesión ---------- */
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
                message: "Bienvenido, Maestro",
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

/* ---------- Mi perfil (estudiante) ---------- */
export async function miPerfil(req, res) {
    try {
        const estudiante = await Estudiante.findById(req.usuario.id).populate(DETALLE);

        /* Si el maestro borró la cuenta, el token ya no sirve: 401 hace que el frontend cierre la sesión */
        if (!estudiante) return error(res, 401, "Tu cuenta ya no existe");

        return res.json({
            statusCode: 200,
            success: true,
            message: "Perfil obtenido correctamente",
            data: estudiante
        });
    } catch (e) {
        console.error(e);
        return error(res, 500, "Error al obtener tu perfil");
    }
}

/* ---------- Elegir carrera (estudiante) ---------- */
export async function elegirCarrera(req, res) {
    try {
        const { facultad, programa } = req.body ?? {};

        if (!mongoose.Types.ObjectId.isValid(facultad) || !mongoose.Types.ObjectId.isValid(programa)) {
            return error(res, 400, "Debes elegir una facultad y una carrera");
        }

        const elegido = await Programa.findById(programa);
        if (!elegido) {
            return error(res, 404, "La carrera elegida no existe");
        }
        if (String(elegido.facultad) !== String(facultad)) {
            return error(res, 400, "La carrera no pertenece a la facultad elegida");
        }

               /* Solo se guarda si el estudiante todavía no tiene carrera (programa: null incluye "campo vacío") */
        const estudiante = await Estudiante
            .findOneAndUpdate(
                { _id: req.usuario.id, programa: null },
                { facultad, programa },
                { returnDocument: "after" }
            )
            .populate(DETALLE);

        if (!estudiante) {
            if (await Estudiante.exists({ _id: req.usuario.id })) {
                return error(res, 409, "Tu carrera ya fue elegida y no se puede cambiar");
            }
            return error(res, 401, "Tu cuenta ya no existe");
        }

        return res.json({
            statusCode: 200,
            success: true,
            message: "Carrera guardada correctamente",
            data: estudiante
        });
    } catch (e) {
        console.error(e);
        return error(res, 500, "Error al guardar tu carrera");
    }
}