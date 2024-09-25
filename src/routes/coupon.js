import express from 'express';
import { changeStatusOfCouponBatch, 
         couponCodesGetExpired, 
         couponVerify, 
         deleteCouponCodeById, 
         deleteSelectedCouponCodes, 
         filterCouponCodes,
         filterUsedCouponCodes, 
         firstCouponSetting, 
         generateCoupons, 
         getAllActiveCouponCodes, 
         getAllCouponBatches, 
         getAllCouponCodeInBatches, 
         getAllCouponCodes, 
         getAllCouponCodesByP, 
         getAllDeactiveCouponCodes, 
         getAllExpiredCouponByP, 
         getAllUsedCouponByP, 
         getCouponByCode, 
         getCouponCodeById, 
         getCouponSetting, 
         getLastSerialNumber, 
         getOutputCouponJson, 
         makeCouponCodeActiveDeactive, 
         redeemPoints, 
         saveCouponSetting, 
         searchByproductNameproductSKu, 
         searchCouponCodes, 
         updateCouponCodeById, 
         deleteSelectedExpiredCoupons, 
         generateCouponsbyN,
         generateBulkCoupon,
         getCountOfAllCoupons,
         filterCouponCodesToExport,
         searchUsedCouponCodes,
         importCouponFile
        } from '../controllers/couponController';
import { verfiyAdmin, verfiyWholeSeller, verifyCronToken, verifyToken } from '../../utils/verifyToken';
import multer from 'multer';
import path from 'path';

const router = express.Router();

router.post("/firstCouponSetting", verifyToken, verfiyAdmin, firstCouponSetting);
router.post("/setting", verifyToken, verfiyAdmin, saveCouponSetting);
router.get("/getCouponSetting", verifyToken, verfiyAdmin, getCouponSetting);
router.post("/generate", verifyToken, verfiyAdmin, generateCoupons);
router.post("/getCouponByCode", verifyToken, verfiyAdmin, getCouponByCode);
router.get("/getAllCouponCodes", verifyToken, verfiyAdmin, getAllCouponCodes);
router.get("/getAllCouponBatches", verifyToken, verfiyAdmin, getAllCouponBatches);
router.post("/getAllCouponCodeInBatch", verifyToken, verfiyAdmin, getAllCouponCodeInBatches);
router.post("/getAllCouponCodesByP", verifyToken, verfiyAdmin, getAllCouponCodesByP);
router.get("/getAllActiveCouponCodes", verifyToken, verfiyAdmin, getAllActiveCouponCodes);
router.post("/getAllDeactiveCouponCodes", verifyToken, verfiyAdmin, getAllDeactiveCouponCodes);
router.post("/getCouponCodeById", verifyToken, verfiyAdmin, getCouponCodeById);
router.put("/updateCouponCodeById", verifyToken, verfiyAdmin, updateCouponCodeById);
router.delete("/deleteCouponCodeById", verifyToken, verfiyAdmin, deleteCouponCodeById);
router.post("/makeActiveDeactive", verifyToken, verfiyAdmin, makeCouponCodeActiveDeactive);
router.post("/filterCouponCodes", verifyToken, verfiyAdmin, filterCouponCodes);
router.post("/filterUsedCouponCodes", verifyToken, verfiyAdmin, filterUsedCouponCodes);
router.post("/filterCouponCodesToExport", verifyToken, verfiyAdmin, filterCouponCodesToExport);
router.post("/searchCouponCodes", verifyToken, verfiyAdmin, searchCouponCodes);
router.post("/searchUsedCouponCodes", verifyToken, verfiyAdmin, searchUsedCouponCodes);
router.post("/searchByProductNameAndProductSku", verifyToken, verfiyAdmin, searchByproductNameproductSKu);
router.delete("/deleteCouponCodes", verifyToken, verfiyAdmin, deleteSelectedCouponCodes)
router.get("/getLastSerialNumber", verifyToken, verfiyAdmin, getLastSerialNumber)
router.post('/redeempoints', verifyToken, verfiyWholeSeller, redeemPoints);
router.post('/couponverify', couponVerify);
router.post('/changeStatusOfCouponBatch', verifyToken, verfiyAdmin, changeStatusOfCouponBatch);
router.post('/getAllExpiredCoupon', verifyToken, verfiyAdmin, getAllExpiredCouponByP);
router.post('/getAllUsedCoupon', verifyToken, verfiyAdmin, getAllUsedCouponByP);
router.get('/couponCodesGetExpired', verifyCronToken, couponCodesGetExpired);
router.delete('/deleteSelectedExpiredCoupons', verifyToken, verfiyAdmin, deleteSelectedExpiredCoupons);
router.get("/getCountOfAllCoupons",verifyToken, verfiyAdmin, getCountOfAllCoupons);

// router.get("/getOutputCouponJson", getOutputCouponJson);
// router.post("/newGenerate",verifyToken, verfiyAdmin, generateCouponsbyN);
// router.post("/bulkGenerate", generateBulkCoupon);

const couponStorageMulter = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, '../assests/images/coupons')
        },
        filename: function (req, file, cb) {
             const fileArr = file.originalname.split('.');
             const fileName = fileArr[0]+"-"+Date.now()+path.extname(file.originalname);
             const filePath = `/coupons/${fileName}`;
             req.couponFile = {
               fileName,
               filePath
             },
             cb(null, fileName)
        }
});

// File filter function to allow only Excel files
const fileFilter = (req, file, cb) => {
  // Allowed extensions for Excel files
  const filetypes = /xls|xlsx/;
  // Check file extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check MIME type
  const mimetype = file.mimetype === 'application/vnd.ms-excel' || 
                   file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only Excel files (.xls, .xlsx) are allowed!'));
  }
};
      
const uploadCoupons = multer({ storage: couponStorageMulter,fileFilter: fileFilter });

router.post('/importCouponsFile', verifyToken, verfiyAdmin, uploadCoupons.single('coupon'), importCouponFile);


             
export default router;
