// ** Express
import express from "express";

// ** Controllers
import ReportController from "../../controllers/report.controller";

// ** Middleware
import { upload } from "../../configs/multer";
import { reportValidation } from "../../middlewares/validate-data/report";

const router = express.Router();

router.post("/newReport/:targetId", reportValidation.newReport(), ReportController.newReport);
router.get("/allReport", ReportController.allReport);
router.get("/reportDetail/:reportId", ReportController.reportDetail);

export default router;