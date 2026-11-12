import express from "express";
import facultadesRoutes from "./modules/facultades/facultades.routes.js";
import estudiantesRoutes from "./modules/estudiantes/estudiantes.routes.js";
import authRoutes from "./modules/autenticacion/auth.routes.js";

const app = express();

app.use(express.json()); /* Middleware para parsear el cuerpo de las solicitudes */
app.use(express.static("public"));
app.use("/api/auth", authRoutes);
app.use("/api/facultades", facultadesRoutes);
app.use("/api/estudiantes", estudiantesRoutes);

app.get("/api/health", (req, res) => {

    res.json({
        status: "ok",
        success: true,
        message: "API functioning correctly",
        version: "1.0.0"
    });

});

export default app;