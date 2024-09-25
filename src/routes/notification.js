import express from 'express';
import { getAllNotifications, clearNotification } from '../controllers/notificationController';
import { verfiyAdmin, verfiyWholeSeller, verifyToken } from '../../utils/verifyToken.js';

const router = express.Router();

//product routes
router.post('/getAllNotifications', verifyToken , verfiyAdmin ,  getAllNotifications)
router.post('/clearNotification', verifyToken , verfiyAdmin ,  clearNotification)


export default router;