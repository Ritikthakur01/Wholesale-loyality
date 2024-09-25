import express from 'express';
import { controlMembershipSetting, getMembershipSetting } from '../controllers/membershipController';

const router = express.Router();

router.post('/controlMembershipSetting', controlMembershipSetting);
router.post('/getMembershipSetting', getMembershipSetting);

export default router;