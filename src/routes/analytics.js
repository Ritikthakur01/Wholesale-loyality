import express from 'express';
import { getEnrollementData, Top5ActiveMembers, Top5cities } from '../controllers/analyticsController.js';

const router = express.Router();

//Analytics routes
router.post('/getEnrollementData', getEnrollementData)
router.post('/top5cities', Top5cities)
router.post('/Top5ActiveMembers', Top5ActiveMembers)

export default router;