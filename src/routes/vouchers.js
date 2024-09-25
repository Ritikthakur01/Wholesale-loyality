import express from 'express';
import { verfiyAdmin, verifyToken, verfiyWholeSeller, verifyCronToken } from '../../utils/verifyToken';
import { getBrands, getStocks , getStoreList, updateBrandStatus, getBrandsByPandF, getPendingVoucherRequests , approvePullRequest , getAllBrandsName, deleteVoucherRequest, rejectRequest, getSellerVoucherByExternalOrderId, getAllRejectRequests,getAllApprovedRequests , deleteAllSelectedRequest, updateVoucherBrandById , getBrandById , updateAllPlatformFees, truncateVoucherTable, getSinglePendingVoucherRequests} from '../controllers/voucherController';
import { checkBalance, getAllDetailDataOfProduct, getCategory, getProduct, getWoohooProductById, getWoohooSetting, } from '../controllers/woohooController';

const router = express.Router();

router.post('/destroyVoucher', verifyToken, verfiyAdmin, truncateVoucherTable);
//vouchagram --->>>

router.post('/getBrand', verifyCronToken, getBrands);
router.post('/getStock', verifyToken, verfiyAdmin, getStocks);
router.post('/getStorelist', verifyToken, verfiyAdmin, getStoreList);
router.post('/updateBrandStatus', verifyToken, verfiyAdmin, updateBrandStatus);
router.post('/getBrandsByPandF', verifyToken, verfiyAdmin, getBrandsByPandF);
router.get('/getAllBrandsName', verifyToken, verfiyAdmin, getAllBrandsName);
router.post('/approvePullRequest', verifyToken, verfiyAdmin, approvePullRequest);
router.post('/deleteVoucherRequest', verifyToken, verfiyAdmin, deleteVoucherRequest);
router.post('/rejectRequest', verifyToken, verfiyAdmin, rejectRequest);
router.post('/getPendingVoucherRequest',verifyToken, verfiyAdmin ,getPendingVoucherRequests);
router.post('/getSinglePendingVoucherRequest',verifyToken, verfiyAdmin ,getSinglePendingVoucherRequests);
router.post('/getSellerVoucherByExternalOrderId', verifyToken, verfiyAdmin, getSellerVoucherByExternalOrderId);
router.post('/getAllRejectRequests', verifyToken, verfiyAdmin, getAllRejectRequests);
router.post('/getAllApprovedRequests',verifyToken, verfiyAdmin ,getAllApprovedRequests);

router.post('/deleteAllSelectedRequest', verifyToken, verfiyAdmin, deleteAllSelectedRequest);
router.post('/updateVoucherBrandById', verifyToken, verfiyAdmin, updateVoucherBrandById);
router.post('/getBrandById', verifyToken, verfiyAdmin, getBrandById);
router.post('/updateAllPlatformFees', verifyToken, verfiyAdmin, updateAllPlatformFees);

//woohoo --->>>

router.post('/checkBalance', verifyToken, verfiyAdmin, checkBalance);
router.post('/getWoohooSetting', verifyToken, verfiyAdmin, getWoohooSetting);
router.post('/getWoohooCategory', verifyToken, verfiyAdmin, getCategory);
router.post('/getWoohooAllCategory', verifyToken, verfiyAdmin, getCategory);
router.post('/getWoohooProduct', verifyToken, verfiyAdmin, getProduct);
router.post('/getAllDetailOfProducts', verifyToken, verfiyAdmin, getAllDetailDataOfProduct);
router.post('/getWoohooProductById', verifyToken, verfiyAdmin, getWoohooProductById);



export default router;