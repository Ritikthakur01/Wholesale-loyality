import express from 'express';
import { verfiyWholeSeller , verifyToken } from '../../utils/verifyToken.js';
import { createWishlist, getWishlistById , removeWishlistById , getAllSellerWishlists} from '../controllers/wishlistController.js';

const router = express.Router();

//wishlist routes
router.post('/createWishlist', verifyToken, verfiyWholeSeller, createWishlist)
router.post('/getWishlistById', verifyToken, verfiyWholeSeller, getWishlistById);
router.delete('/removeWishlistById', verifyToken, verfiyWholeSeller, removeWishlistById );
router.post('/getAllSellerWishlists', verifyToken, verfiyWholeSeller, getAllSellerWishlists);

export default router;