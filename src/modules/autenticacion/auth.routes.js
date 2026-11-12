import { Router } from "express";
import { registrar, iniciarSesion, miPerfil, elegirCarrera } from "./auth.controller.js";
import { soloEstudiante } from "../../utils/proteger.js";

const router = Router();

router.post("/register", registrar);
router.post("/login", iniciarSesion);

/* Solo para estudiantes con sesión iniciada */
router.get("/me", soloEstudiante, miPerfil);
router.put("/me/carrera", soloEstudiante, elegirCarrera);

export default router;