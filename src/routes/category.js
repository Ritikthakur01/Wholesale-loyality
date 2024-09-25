import express from 'express';
import { verfiyAdmin, verifyToken } from '../../utils/verifyToken.js';
// import { createCategory, createSubCategory, deleteCategoryById, deleteSubCategoryById, getAllCategory, getAllSubCategory, getCategoryById, getSubCategoryById, updateCategoryById, updateSubCategoryById } from '../controllers/categoryController.js';
import { createCategory, getCategoryById , updateCategoryById, deleteCategoryById , getAllCategory, searchCategoryByName} from '../controllers/categoryController.js';

const router = express.Router();

//category routes
router.post('/createCategory', verifyToken, verfiyAdmin, createCategory)
router.post('/getCategoryById', verifyToken, verfiyAdmin, getCategoryById);
router.post('/updateCategoryById', verifyToken, verfiyAdmin, updateCategoryById);
router.delete('/deleteCategoryById', verifyToken, verfiyAdmin, deleteCategoryById );
router.post('/getAllCategory', getAllCategory);
router.post('/searchCategoryByName', searchCategoryByName);

// //subcategory routes
// router.post('/subcategory/createSubCategory', createSubCategory)
// router.post('/subcategory/getSubCategoryById', getSubCategoryById);
// router.put('/subcategory/updateSubCategoryById', updateSubCategoryById);
// router.delete('/subcategory/deleteSubCategoryById', deleteSubCategoryById );
// router.get('/subcategory/getAllSubCategory', getAllSubCategory);


export default router;