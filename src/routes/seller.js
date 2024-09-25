import express from 'express';
import { deleteSellerById, getAllSellerByP,getAllSeller, getSellerById, getSellerTransactions, sellerResetPassword, sendWishes, getSellerData, updateSellerById, getAllTransactionByPandF, getAllTransaction, registerUpdateSeller, sendVoucherRequestOtp, verifyVoucherRequestOtp, pullVoucherRequest, getAllSellerVouchers, checkAvailablePointsForVoucherRequest, getSellerApprovedVoucher, deductionPointsOfBirthDay, setSellerFeedback, sendNotificationForPendingRequest, setSellerShippingAddress, sendProductRequestOtp, verifyProductRequestOtp, getSellerShippingAddress, getSellerRedeemProductByOrderId, getAllRedeemProductOfSeller, changeNotificationPreference, getNotificationPreference, importSellerFromExcel, autoFetchPreviousSellerData, expirySellerPoints, show1MonthsBeforeExpiredPointsOfSeller, checkfunction, giveWelcomePointsOfSeller, updateCreatedAtofSeller } from '../controllers/sellerController.js';
import { verfiyAdmin, verfiyWholeSeller, verifyCronToken, verifyToken } from '../../utils/verifyToken.js';
import { getAllActiveBrands } from '../controllers/voucherController.js';
import { checkAndUpdateSellerMembership, membershipUpgrade, tierUpgradation } from '../controllers/membershipController.js';
import cartRouter from './cart.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

router.post('/getSellerById',verifyToken, verfiyWholeSeller, getSellerById);
router.put('/updateSellerById',verifyToken, verfiyWholeSeller, updateSellerById);
router.post('/getNotificationPreference',verifyToken, verfiyWholeSeller, getNotificationPreference);
router.post('/updateNotificationPreference',verifyToken, verfiyWholeSeller, changeNotificationPreference);
router.delete('/deleteSellerById',verifyToken, verfiyAdmin, deleteSellerById);
router.post('/getAllSellerByP',verifyToken, verfiyAdmin, getAllSellerByP);
router.get('/getAllSeller',verifyToken, verfiyAdmin, getAllSeller);

router.put('/resetPassword',verifyToken, verfiyWholeSeller, sellerResetPassword);
router.get("/sendWishes", verifyCronToken, sendWishes);

router.post("/get-dashboard-data", verifyToken,verfiyWholeSeller, getSellerData);

router.post("/getSellerTransactions", verifyToken, verfiyWholeSeller, getSellerTransactions);

router.post("/getAllTransaction", verifyToken , verfiyWholeSeller ,getAllTransaction);
router.post("/get-transaction-PandF", verifyToken , verfiyWholeSeller, getAllTransactionByPandF)

router.post('/update-registered-sellerModel',verifyToken , verfiyWholeSeller ,registerUpdateSeller);
router.post('/checkEligbleForVoucherRequest',verifyToken , verfiyWholeSeller ,checkAvailablePointsForVoucherRequest);
router.post('/sendVoucherRequestOtp',verifyToken , verfiyWholeSeller ,sendVoucherRequestOtp);
router.post('/verifyVoucherRequestOtp',verifyToken , verfiyWholeSeller ,verifyVoucherRequestOtp);
router.post('/makePullVoucherRequest',verifyToken , verfiyWholeSeller ,pullVoucherRequest);
router.post('/getAllSellerVouchers',verifyToken , verfiyWholeSeller ,getAllSellerVouchers);
router.post('/getSellerAppVoucherById',verifyToken , verfiyWholeSeller ,getSellerApprovedVoucher);
router.post('/deductionBirthdayPoints', verifyToken, verfiyWholeSeller, deductionPointsOfBirthDay);
router.post('/setSellerFeedback', verifyToken, verfiyWholeSeller, setSellerFeedback);
router.post('/sendNotificationForPendingRequest', verifyToken, verfiyWholeSeller, sendNotificationForPendingRequest);
//productRedeemption
router.post('/sendProductRequestOtp', verifyToken, verfiyWholeSeller, sendProductRequestOtp);
router.post('/verifyProductRequestOtp', verifyToken, verfiyWholeSeller, verifyProductRequestOtp);
router.post('/sellerRedeemProductsByOrderId', verifyToken, verfiyWholeSeller, getSellerRedeemProductByOrderId);
router.post('/getAllRedeemProductOfSeller', verifyToken, verfiyWholeSeller, getAllRedeemProductOfSeller);




router.post('/vouchers/getAllActiveBrands', verifyToken, verfiyWholeSeller, getAllActiveBrands);

// router.post('/membership/checkAndUpdateSellerMembership', verifyToken, verfiyWholeSeller, checkAndUpdateSellerMembership);
// router.post('/membership/checkAndUpdateSellerMembership', verifyToken, verfiyWholeSeller, membershipUpgrade);
router.post('/membership/checkAndUpdateSellerMembership', verifyToken, verfiyWholeSeller, tierUpgradation);

router.post('/setSellerShippingAddress', verifyToken, verfiyWholeSeller, setSellerShippingAddress);
router.post('/getSellerShippingAddress',verifyToken, verfiyWholeSeller, getSellerShippingAddress)

router.use('/cart', cartRouter);

//Previous Seller 
const sellerFileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      // cb(null, './src/assests/files/sellers')
      cb(null, '../assests/files/sellers')
    },
    filename: function (req, file, cb) {
      const fileArr = file.originalname.split('.');
      const fileName = fileArr[0]+"-"+Date.now()+path.extname(file.originalname);
      const filePath = `/files/sellers/${fileName}`;
      req.sellerFile = {
        fileName,
        filePath
      },
      cb(null, fileName)
    }
  })
  
const uploadSellerFie = multer({ storage: sellerFileStorage })

router.post('/importSellerFromExcel', uploadSellerFie.single('file'), importSellerFromExcel);
router.post('/autoFetchSeller', verifyToken, verfiyAdmin, autoFetchPreviousSellerData);
// router.post('/expiredSellerPoints', expirySellerPoints); //for cron jon
router.post('/expiredPointsOfSeller', show1MonthsBeforeExpiredPointsOfSeller);
// router.post('/checkFunction', checkfunction); //for points manage in redeem process
router.post('/giveWelcomePointsOfSeller', verifyToken, verfiyAdmin, giveWelcomePointsOfSeller);
router.post('/updateCreatedAtofSeller', verifyToken, verfiyAdmin, updateCreatedAtofSeller);


export default router;