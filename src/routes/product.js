import express from 'express';
import { addProduct, deleteProductById, getAllProduct, getAllProductByP, getProductById, updateProductById } from '../controllers/productController';

const router = express.Router();

//product routes
router.post('/addProduct', addProduct)
router.post('/getProductById', getProductById);
router.put('/updateProductById', updateProductById);
router.delete('/deleteProductById', deleteProductById);
router.post('/getAllProductByP', getAllProductByP);
router.get('/getAllProduct', getAllProduct);

export default router;