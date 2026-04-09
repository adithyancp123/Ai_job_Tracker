import { Router } from "express";
import aiController from "../controllers/ai.controller";

const router = Router();

router.post("/parse-job", aiController.parseJob);
router.post("/parse-job/stream", aiController.parseJobStream);
router.post("/resume-suggestions", aiController.resumeSuggestions);
router.post("/resume-suggestions/stream", aiController.resumeSuggestionsStream);
router.post("/match-score", aiController.matchScore);

export default router;