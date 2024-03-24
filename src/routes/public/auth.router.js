// ** Express
import express from "express";

// ** Controllers
import AuthController from "../../controllers/auth.controller";

// ** Middlewares
import { authValidation } from "../../middlewares/validate-data/auth";

const router = express.Router();

router.post("/register", authValidation.register(), AuthController.register);
router.post("/login", authValidation.login(), AuthController.login);

export default router;
