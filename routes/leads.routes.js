import { Router } from 'express';
import { createLeads, updateLeads, deleteLeads } from '../controllers/leads.controllers.js';

const router = Router();

router.post("/createLeads", createLeads);
router.put("/updateLeads", updateLeads);
router.delete("/deleteLeads", deleteLeads);

export default router;