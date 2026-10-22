import express from "express";
import facultadesRoutes from "./modules/facultades/facultades.routes.js";

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        success: true,
        message: "API functioning correctly",
        version: "1.0.0"
    });
});

app.use("/api/facultades", facultadesRoutes);

export default app;