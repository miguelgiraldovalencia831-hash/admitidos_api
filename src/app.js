import express from "express";
import facultadesRoutes from "./modules/facultades/facultades.routes.js";
import estudiantesRoutes from "./modules/estudiantes/estudiantes.routes.js";
//import programasRoutes from "./modules/programas/programas.routes.js";

const app = express();

app.use(express.json()); /* Middleware para parsear el cuerpo de las solicitudes */
app.use(express.static("public"));
app.use("/api/facultades", facultadesRoutes);
app.use("/api/estudiantes", estudiantesRoutes);

//app.use("/api/programas", programasRoutes);

app.get("/api/health", (req, res) => {

    res.json({
        status: "ok",
        success: true,
        message: "API functioning correctly",
        version: "1.0.0"
    });

});

export default app;