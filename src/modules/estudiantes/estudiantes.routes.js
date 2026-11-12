import { Router } from "express";

import {
    listarEstudiantes,
    obtenerEstudiantePorId,
    crearEstudiante,
    actualizarEstudiante,
    eliminarEstudiante
} from "./estudiantes.controller.js";
import { soloAdmisor } from "../../utils/proteger.js";

const router = Router();

router.get("/show/", soloAdmisor, listarEstudiantes);
router.get("/info/:id", soloAdmisor, obtenerEstudiantePorId);
router.post("/create/", soloAdmisor, crearEstudiante);
router.put("/update/:id", soloAdmisor, actualizarEstudiante);
router.delete("/delete/:id", soloAdmisor, eliminarEstudiante);

export default router;