import { Router } from "express";

import {
    listarProgramas,
    obtenerProgramaPorId,
    crearPrograma,
    actualizarPrograma,
    eliminarPrograma
} from "./programas.controller.js";
import { soloAdmisor } from "../../utils/proteger.js";

const router = Router();

/* Consultar programas es público (los estudiantes eligen carrera); crear, editar y borrar es solo del maestro */
router.get("/show/", listarProgramas);
router.get("/info/:id", obtenerProgramaPorId);
router.post("/create/", soloAdmisor, crearPrograma);
router.put("/update/:id", soloAdmisor, actualizarPrograma);
router.delete("/delete/:id", soloAdmisor, eliminarPrograma);

export default router;