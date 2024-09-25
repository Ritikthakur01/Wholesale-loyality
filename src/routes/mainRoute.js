import express from 'express';
import { verfiyAdmin, verifyToken } from '../../utils/verifyToken.js';
import homeRouter from './home';
import authRouter from './auth.js';
import sellerRouter from './seller.js';
import categoryRouter from './category.js';
import couponRouter from './coupon.js'
import adminRouter from './admin.js';
import productRouter from './product.js';
import transactionRouter from './transaction.js';
import notificationRouter from './notification.js';
import dsProductRouter from './dsProduct.js';
import wishlistRouter from './wishlist.js';
import subscriberRouter from './subscriber.js';
import contactUsQueryRouter from './contactQuery.js';
import zillionVoucherRouter from './zillionVoucher.js';


const Router = express();

Router.use(homeRouter);
Router.use('/auth', authRouter);
Router.use('/admin', adminRouter);
Router.use('/seller', sellerRouter);
Router.use('/product', verifyToken, verfiyAdmin, productRouter);
Router.use('/ds/product', dsProductRouter)
Router.use('/category', categoryRouter);
Router.use('/wishlist',wishlistRouter);
Router.use('/coupon', couponRouter);
Router.use('/transaction', transactionRouter);
Router.use('/notification', notificationRouter);
Router.use('/subscribe', subscriberRouter);
Router.use('/contactUs', contactUsQueryRouter);
Router.use(zillionVoucherRouter);

export default Router;