import express from 'express';
import { TestingWoohooApi } from '../controllers/woohooController.js';
import { verfiyAdmin, verfiyWholeSeller, verifyToken } from '../../utils/verifyToken.js';

const router = express.Router();


// router.get('/TestingWoohooApi', verifyToken , verfiyAdmin , TestingWoohooApi)


export default router;