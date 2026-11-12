import { Router } from "express";

import {
    listarFacultades,
    obtenerFacultadPorId,
    crearFacultad,
    actualizarFacultad,
    eliminarFacultad
} from "./facultades.controller.js";
import { soloAdmisor } from "../../utils/proteger.js";

const router = Router();

/* Consultar facultades es público; crear, editar y borrar es solo del admisor */
router.get("/show/", listarFacultades);
router.get("/info/:id", obtenerFacultadPorId);
router.post("/create/", soloAdmisor, crearFacultad);
router.put("/update/:id", soloAdmisor, actualizarFacultad);
router.delete("/delete/:id", soloAdmisor, eliminarFacultad);

export default router;