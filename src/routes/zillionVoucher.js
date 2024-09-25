import express from 'express';
import { generateOTPForZ, getCoinBalance, getRedirectionWithAuthCode, getSellerInfo, holdCoin, redeemCoins, refundCoins, sendAuthorizeToken, zillionLogout } from '../controllers/ziilionVoucherController';
import { authorize } from 'passport';
import { verfiyWholeSeller, verifyToken, verifyZillionToken } from '../../utils/verifyToken';
// import { saveTransactionLogs } from '../../utils/middlewares.js/zillionVoucher/transaction';
import { zillionErrorResponse, zillionSuccessResponse } from '../../utils/middlewares';

const Router = express();

//authentication route
Router.get('/zVoucher/getRedirectionAndAuthCode', verifyToken, getRedirectionWithAuthCode);
Router.get('/authorize', sendAuthorizeToken);

//redemption services
Router.post('/zVoucher/generate-otp', verifyZillionToken, generateOTPForZ);
Router.post('/zVoucher/hold-coin', verifyZillionToken, holdCoin, zillionSuccessResponse, zillionErrorResponse);
Router.post('/zVoucher/redeem-coin', verifyZillionToken, redeemCoins, zillionSuccessResponse, zillionErrorResponse);
Router.post('/zVoucher/refund-reverse-coin', verifyZillionToken, refundCoins, zillionSuccessResponse, zillionErrorResponse);
Router.post('/zVoucher/get-coin-balance', verifyZillionToken, getCoinBalance);
Router.post('/zVoucher/getSellerInfo', verifyZillionToken, getSellerInfo);
Router.get('/zVoucher/logout', verifyZillionToken, zillionLogout);

export default Router;