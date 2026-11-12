import express from "express";
import facultadesRoutes from "./modules/facultades/facultades.routes.js";
import programasRoutes from "./modules/programas/programas.routes.js";
import estudiantesRoutes from "./modules/estudiantes/estudiantes.routes.js";
import authRoutes from "./modules/autenticacion/auth.routes.js";

const app = express();

app.use(express.json()); /* Middleware para parsear el cuerpo de las solicitudes */
app.use(express.static("public"));
app.use("/api/auth", authRoutes);
app.use("/api/facultades", facultadesRoutes);
app.use("/api/programas", programasRoutes);
app.use("/api/estudiantes", estudiantesRoutes);

app.get("/api/health", (req, res) => {

    res.json({
        status: "ok",
        success: true,
        message: "API functioning correctly",
        version: "1.0.0"
    });

});

/* Si el JSON llega mal escrito, respondemos en JSON y no con una página de error */
app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ statusCode: 400, success: false, message: "El cuerpo de la solicitud no es un JSON válido" });
    }
    console.error(err);
    res.status(500).json({ statusCode: 500, success: false, message: "Error interno del servidor" });
});

export default app;