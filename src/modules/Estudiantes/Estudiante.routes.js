import { Router } from "express";

import {
    listarEstudiantes,
    obtenerEstudiantePorId,
    crearEstudiante,
    actualizarEstudiante,
    eliminarEstudiante
} from "./estudiantes.controller.js";

const router = Router();

router.get("/show/", listarEstudiantes);
router.get("/info/:id", obtenerEstudiantePorId);
router.post("/create/", crearEstudiante);
router.put("/update/:id", actualizarEstudiante);
router.delete("/delete/:id", eliminarEstudiante);

export default router;