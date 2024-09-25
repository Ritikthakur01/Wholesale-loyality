import express from 'express';
import { findPinCode } from '../controllers/pincodeController';
import { contactVerification, newContactRegistered } from '../controllers/contactVerfiyController';
import { getPage } from '../controllers/adminController';
import { getFAQonLandingPage } from '../controllers/faqController'; 
import { getAllImages, getBannerImages } from '../controllers/imageController';
import { getAllTVC ,getAllTVCWithoutP  } from '../controllers/tvcController';
import { getOverallMinAndMaxDenominationPoint, getAllCategoryOfBrands, getBrandsByRangeFilter , getBrandById, getBrandsByPandF, getStoreList, getBrandsByCategory, getBrandsByMultiCategory, getBrandsForSellers } from '../controllers/voucherController';
import { autoFetchPreviousSellerData } from '../controllers/sellerController';

const router = express.Router();

//pincode routes

router.post('/findPincode/:pinCode', findPinCode);
router.post('/autoFetched', autoFetchPreviousSellerData);
router.post('/registerContact', newContactRegistered);
router.post('/verifyContact', contactVerification)
router.post('/get-page', getPage);
router.get('/get-all-faq', getFAQonLandingPage);
router.post('/getBannerImages', getBannerImages);
router.post('/getAllTvc', getAllTVC)
router.post('/get-all-tvc-noP', getAllTVCWithoutP);
router.post('/brand/getStorelist', getStoreList);
router.post('/vouchers/getBrandForSellers' , getBrandsForSellers);
router.post('/vouchers/getBrand' , getBrandsByPandF);
router.post('/vouchers/getBrandById' , getBrandById);
router.post('/vouchers/getCategory', getAllCategoryOfBrands);
router.post('/vouchers/getBrandsByCategory', getBrandsByCategory);
router.post('/vouchers/getBrandsByMultiCategory', getBrandsByMultiCategory);
router.post('/vouchers/getBrandsByRangeFilter', getBrandsByRangeFilter);
router.get('/vouchers/getOverallMinAndMaxDenominationPoint', getOverallMinAndMaxDenominationPoint);




export default router;