import { Router } from "express";
import { listarFacultades } from "./facultades.controller.js";

const router = Router();

router.get("/", listarFacultades);

export default router;