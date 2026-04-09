import { Router } from "express";

import jobApplicationController from "../controllers/jobApplication.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/", jobApplicationController.createApplication);
router.get("/", jobApplicationController.getMyApplications);
router.put("/:id", jobApplicationController.updateApplication);
router.patch("/:id", jobApplicationController.updateApplication);
router.delete("/:id", jobApplicationController.deleteApplication);

export default router;
