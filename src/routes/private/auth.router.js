// ** Express
import express from "express";

// ** Controllers
import AuthController from "../../controllers/auth.controller";

// ** Middlewares

const router = express.Router();

router.post("/refresh-token", AuthController.refreshAccessToken)

export default router;
