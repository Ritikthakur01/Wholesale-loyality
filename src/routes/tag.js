import express from 'express';
import { verfiyAdmin, verifyToken } from '../../utils/verifyToken.js';
// import { createTag, createSubTag, deleteTagById, deleteSubTagById, getAllTag, getAllSubTag, getTagById, getSubTagById, updateTagById, updateSubTagById } from '../controllers/TagController.js';
import { createTag, getTagById , updateTagById, deleteTagById , getAllTag, searchTagByName, updateProductTagSequence} from '../controllers/tagController';

const router = express.Router();

//Tag routes
router.post('/createTag', createTag)
router.post('/getTagById', getTagById);
router.post('/updateTagById', updateTagById);
router.delete('/deleteTagById', deleteTagById );
router.post('/getAllTag', getAllTag);
router.post('/searchTagByName', searchTagByName);
router.post('/updateProductTagSequence', updateProductTagSequence);

export default router;