// ** Express
import express from "express";

// ** Controllers
import NotificationController from "../../controllers/notification.controller";

const router = express.Router();

router.get("/", NotificationController.getNotificationsOfUser);
router.patch("/", NotificationController.update)

export default router;