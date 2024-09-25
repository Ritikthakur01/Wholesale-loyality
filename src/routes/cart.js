import express from 'express';
import { verfiyAdmin, verfiyWholeSeller, verifyToken } from '../../utils/verifyToken';
import { RemoveFromCart, addToCart, getAllCart, getSellerCart, quanityManageOfProductInCart } from '../controllers/cartController';

const Router = express();

Router.post('/addToCart', verifyToken, verfiyWholeSeller, addToCart);
Router.post('/getSellerCart', verifyToken, verfiyWholeSeller, getSellerCart);
Router.post('/quantityManageOfProduct', verifyToken, verfiyWholeSeller, quanityManageOfProductInCart);
Router.delete('/removeFromCart', verifyToken, verfiyWholeSeller, RemoveFromCart);
Router.post('/getAllCart', verifyToken, verfiyAdmin, getAllCart);

export default Router;