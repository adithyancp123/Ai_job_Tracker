import { Router } from "express";
import aiController from "../controllers/ai.controller";

const router = Router();

router.post("/parse-job", aiController.parseJob);
router.post("/resume-suggestions", aiController.resumeSuggestions);
router.post("/match-score", aiController.matchScore);

export default router;