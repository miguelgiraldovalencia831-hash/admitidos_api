import { Router } from "express";

import {
    listarProgramas
} from "./programas.controller.js";

const router = Router();


router.get("/show/", listarProgramas);



/* router.get("/info/:id", obtenerFacultadPorId);
router.post("/create/", crearFacultad);
router.put("/update/:id", actualizarFacultad);
router.delete("/delete/:id", eliminarFacultad);
 */
export default router;