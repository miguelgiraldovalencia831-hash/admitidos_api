import { Router } from "express";
import { listarFacultades, crearFacultad } from "./facultades.controller.js";

const router = Router();

router.get("/", listarFacultades);
router.post("/", crearFacultad);

export default router;