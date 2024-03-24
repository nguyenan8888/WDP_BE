// ** Express
import express from "express";

// ** Controllers
import ActivityController from "../../controllers/activity.controller";

// ** Middlewares

const router = express.Router();

router.get("/", ActivityController.getUserActivity)
router.delete("/:activityId", ActivityController.deleteUserActivity)

export default router;
