import express from 'express';
import { adminDashboard , importCSVFile, setSellerPassword, setStaffPassword , createPage , getPage , deletePage , updatePage , getAllPages , getAllActivePages, getSellerById, getAdminDashboardData , getAnalyticsData, exportLogs, exportLogsPdf, updateSellerByIdAdmin} from '../controllers/adminController';
import { verfiyAdmin, verifyToken } from '../../utils/verifyToken';
import { addModule } from '../controllers/moduleController';
import { addRole, allRole, allRoleByP, deleteRoleById, getRoleById, updateRoleById } from '../controllers/roleController';
import { addStaff, adminResetPassword, allStaff, deleteStaffById, getStaffById, updateStaffById } from '../controllers/staffController';
import { getallPinCodes,allPinCodeByP, deletePinCodeById, deleteSelectedPincodes, findAreaBySCP, getAllState, getPinCodeById, makePinCodeActiveInactive, newPinCode, updatePinCodeById, listingOfStatesName, updateSelectedPincode} from '../controllers/pincodeController';
// import { upload } from '../../app';
import { addFAQ, getFAQ , getAllTitles , deleteFAQ , deleteQuestion, updateFAQ , getQA, swappingFaqSequence} from '../controllers/faqController';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { addImage, deleteImages, getAllImages, addLinkWithBanner , getAllActiveImages , getImageById , getImageFile, updateTVCDataInImage, updateSequenceOfImageBanner , addBanner , addTVCCoverImage} from '../controllers/imageController';
import { Images } from '../models/Images';
import DateTime from '../../utils/constant/getDate&Time';
import tvcRouter from './tvc';
import voucherRouter from './vouchers';
import crypto from 'crypto';
import { getAllTransactionByPandF, getSellerRecordData, updateSellerById } from '../controllers/sellerController';
import { controlMembershipSetting } from '../controllers/membershipController';
import membershipRouter from './membership';
import cardRouter from './card';
import tagRouter from './tag';
import { createError } from '../../utils/error';
import { allRedeemProducts } from '../controllers/dsProductController';
import queryStaffRouter from './queryStaff';
import analyticsRouter from './analytics';


// for csv files
const storage = multer.diskStorage({
    destination:(req,file,callback)=>{
        // callback(null,'../assests/files')
        callback(null,'./src/assests/files')
    },
    filename:(req,file,callback)=>{
        callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname))
    }
});

let upload = multer({
    storage: storage
})

//for images
// const storage1 = multer.diskStorage({
//     destination:(req,file,callback)=>{
//         callback(null,'../assests/images/image')
//         // callback(null,'./src/assests/images/image')
//     },
//     filename:async(req,file,callback)=>{
//         const imageName = file.originalname.split('.')[0] + "-" + Date.now() + path.extname(file.originalname);
//         if(req.query.imageId){
//             const getImage = await Images.findOne({
//                 where:{
//                     id:req.query.imageId
//                 }
//             });
//             const __dirname = path.resolve();
//             const p = path.join(__dirname,"../assests/images/image/",getImage.imageName);
//             // const p = path.join(__dirname,"./src/assests/images/image/",getImage.imageName);
//             console.log("Path ::>>", p);
//             fs.access(p, fs.constants.F_OK, (err) => {
//                 if (err) {
//                 //   console.error('File does not exist or cannot be accessed.');
//                 } else {
//                 //   console.log('File exists.');
//                 fs.unlinkSync(p);
//                 }
//             });
//             const startDate = new Date(req.query?.sDate);
//             const endDate = new Date(req.query?.eDate);
//             if(req.query.startTime===undefined){
//                 startDate.setHours(req.query?.startTime?.split(':')[0]);
//                 startDate.setMinutes(req.query?.startTime?.split(':')[1]);
//             }
//             if(req.query.endTime===undefined){
//                 endDate.setHours(req.query?.endTime?.split(':')[0]);
//                 endDate.setMinutes(req.query?.endTime?.split(':')[1]);
//             }
//             const updateImageObj = req.query?.sDate ? 
//                             {
//                                 imageName:imageName,
//                                 imagePath:`/image/${imageName}`,
//                                 usage:req.query?.usage,
//                                 show_TVC:req.query?.show_TVC,
//                                 TVC_Link:req.query?.TVC_Link,
//                                 sDate:req.query?.sDate,
//                                 eDate:req.query?.eDate,
//                                 startTime:req.query?.startTime,
//                                 endTime:req.query?.endTime,
//                                 startDate,
//                                 endDate,
//                                 bannerType:req.query?.bannerType,
//                                 status:req.query?.status,
//                                 updatedIstAt: DateTime(),
//                                 updateByStaff:req.user.data.name
//                             } : {
//                                 imageName:imageName,
//                                 imagePath:`/image/${imageName}`,
//                                 usage:req.query?.usage,
//                                 show_TVC:req.query?.show_TVC,
//                                 TVC_Link:req.query?.TVC_Link,
//                                 bannerType:req.query?.bannerType,
//                                 status:req.query?.status,
//                                 updatedIstAt: DateTime(),
//                                 updateByStaff:req.user.data.name
//                             };
//             const updateImage = await Images.update(updateImageObj,{
//                 where:{
//                     id:req.query.imageId
//                 }
//             });
//             req.newImage = updateImage;
//         }
//         else{
//             const startDate = new Date(req.query?.sDate);
//             const endDate = new Date(req.query?.eDate);
//             if(req.query.startTime===undefined){
//                 startDate.setHours(req.query?.startTime?.split(':')[0]);
//                 startDate.setMinutes(req.query?.startTime?.split(':')[1]);
//             }
//             if(req.query.endTime===undefined){
//                 endDate.setHours(req.query?.endTime?.split(':')[0]);
//                 endDate.setMinutes(req.query?.endTime?.split(':')[1]);
//             }
//             const addImageObj = req.query?.sDate ? 
//                             {
//                                 imageName:imageName,
//                                 imagePath:`/image/${imageName}`,
//                                 usage:req.query?.usage,
//                                 show_TVC:req.query?.show_TVC,
//                                 TVC_Link:req.query?.TVC_Link,
//                                 sDate:req.query?.sDate,
//                                 eDate:req.query?.eDate,
//                                 startTime:req.query?.startTime,
//                                 endTime:req.query?.endTime,
//                                 startDate,
//                                 endDate,
//                                 bannerType:req.query?.bannerType,
//                                 status:req.query?.status,
//                                 createdIstAt: DateTime(),
//                                 updatedIstAt: DateTime(),
//                                 updateByStaff:req.user.data.name
//                             } : {
//                                 imageName:imageName,
//                                 imagePath:`/image/${imageName}`,
//                                 usage:req.query?.usage,
//                                 show_TVC:req.query?.show_TVC,
//                                 TVC_Link:req.query?.TVC_Link,
//                                 bannerType:req.query?.bannerType,
//                                 status:req.query?.status,
//                                 createdIstAt: DateTime(),
//                                 updatedIstAt: DateTime(),
//                                 updateByStaff:req.user.data.name
//                             };
//             const addImage = await Images.create(addImageObj);
//             req.newImage = addImage;
//         }
//         // console.log("Add Image", addImage);
//         callback(null, imageName)
//     }
// });

const storage1 = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '../assests/images/image')
      // cb(null, './src/assests/images/image')
    },
    filename: async function (req, file, cb) {
      const fArr = file.originalname.split('.');
      // const imageName = fArr[0]+"-"+Date.now()+path.extname(file.originalname);
      const imageName = file.originalname;
      const bannerImagePath = `/image/${imageName}`;


    if(req.query.imageId){
            const getImage = await Images.findOne({
                where:{
                    id:req.query.imageId
                }
            });

            const __dirname = path.resolve();
            const p = path.join(__dirname,"../assests/images/image/",getImage.imageName);

            // const p = path.join(__dirname,"./src/assests/images/image/",getImage.imageName);
            fs.access(p, fs.constants.F_OK, (err) => {
                if (err) {
                //   console.error('File does not exist or cannot be accessed.');
                } else {
                //   console.log('File exists.');
                fs.unlinkSync(p);
                }
            });
        }
        
        req.bannerImage = {name:imageName, path:bannerImagePath}
        cb(null, imageName);
    }
  });


const storageTvcCoverImages = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '../assests/images/image/tvcCoverImage')
      // cb(null, './src/assests/images/dsProduct/thumbnail')
    },
    filename: async function (req, file, cb){
      const fArr = file.originalname.split('.');
      const tvcCoverName = fArr[0]+"-"+Date.now()+path.extname(file.originalname);
      const tvcCoverImagePath = `/image/tvcCoverImage/${tvcCoverName}`;


      if(req.query.imageId){
        const getImage = await Images.findOne({
            where:{
                id:req.query.imageId
            }
        });

        const __dirname = path.resolve();
        if(getImage.tvcCoverImage){
            const p = path.join(__dirname,"../assests/images/image/tvcCoverImage/",getImage?.tvc_Cover_Image?.name);

        // const p = path.join(__dirname,"./src/assests/images/image/",getImage.imageName);
        fs.access(p, fs.constants.F_OK, (err) => {
            if (err) {
            //   console.error('File does not exist or cannot be accessed.');
            } else {
            //   console.log('File exists.');
            fs.unlinkSync(p);
            }
        });
        }
       }  
        req.tvcCoverImage = {name:tvcCoverName, path:tvcCoverImagePath}
        cb(null, tvcCoverName);
    }
  });

  const fileFilter = (req, file, cb) => {
    // Allowed extensions
    const filetypes = /jpeg|jpg|png|gif/;
    // Check file extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check MIME type
    const mimetype = filetypes.test(file.mimetype);
  
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  };


let uploadImages = multer({ storage: storage1, fileFilter: fileFilter })

const uploadsTvcCoverImages = multer({ storage: storageTvcCoverImages, fileFilter: fileFilter });


const helperCheck = (req, res, next)=>{
    const {showTvc} = req.query;

    if(!showTvc || showTvc == ""){
        return next(createError(403, "Provide show TVC"));
    }

    if(showTvc == "No"){
        return next(createError(403, "TVC is off, please turn on TVC to access this feature"));
    }
    next();
};


const router = express.Router();

router.get('/dashboard',verifyToken, verfiyAdmin, adminDashboard);
router.post('/setSellerPassworddddd',verifyToken, verfiyAdmin, setSellerPassword);
router.post('/setStaffPassworddddd',verifyToken, verfiyAdmin, setStaffPassword);
router.post('/getSeller',verifyToken, verfiyAdmin, getSellerById);
router.post('/updateSellerByIdAdmin',verifyToken, verfiyAdmin, updateSellerByIdAdmin);

//module
router.post('/module/addModule', verifyToken, verfiyAdmin, addModule);

//role
router.post('/role/addRole', verifyToken, verfiyAdmin, addRole);
router.post('/role/getRoleById', verifyToken, verfiyAdmin, getRoleById);
router.put('/role/updateRoleById', verifyToken, verfiyAdmin, updateRoleById);
router.delete('/role/deleteRoleById', verifyToken, verfiyAdmin, deleteRoleById);
router.post('/role/allRoleByP', verifyToken, verfiyAdmin, allRoleByP);
router.get('/role/allRole', verifyToken, verfiyAdmin, allRole);

//staff
router.post('/staff/addStaff', verifyToken, verfiyAdmin, addStaff);
router.post('/staff/getStaffById', verifyToken, verfiyAdmin, getStaffById);
router.put('/staff/updateStaffById', verifyToken, verfiyAdmin, updateStaffById);
router.delete('/staff/deleteStaffById', verifyToken, verfiyAdmin, deleteStaffById);
router.post('/staff/allStaffByP', verifyToken, verfiyAdmin, allStaff);
router.post('/staff/reset-password', verifyToken, verfiyAdmin, adminResetPassword);


//New pages routes
router.post('/create-new-page', verifyToken, verfiyAdmin, createPage);
router.post('/get-page', verifyToken, verfiyAdmin, getPage);
router.get('/get-all-pages', verifyToken,verfiyAdmin, getAllPages);
router.get('/get-all-active-pages', verifyToken,verfiyAdmin, getAllActivePages);
router.delete('/delete-page', verifyToken, verfiyAdmin, deletePage);
router.post('/update-page', verifyToken, verfiyAdmin, updatePage);



//pincode routes
router.post('/pincode/addPincode', verifyToken, verfiyAdmin, newPinCode)
router.post('/pincode/getPincodeById', getPinCodeById);
router.put('/pincode/updatePincodeById', verifyToken, verfiyAdmin, updatePinCodeById);
router.delete('/pincode/deletePincodeById', verifyToken, verfiyAdmin, deletePinCodeById);
router.post('/pincode/getAllPincode',verifyToken, verfiyAdmin, allPinCodeByP);
router.get('/pincode/allPinCodes',verifyToken, verfiyAdmin, getallPinCodes);
router.post('/pincode/makePinCodeActiveInactive', verifyToken, verfiyAdmin, makePinCodeActiveInactive);
router.delete('/pincode/deletedSelectedPincodes', verifyToken, verfiyAdmin, deleteSelectedPincodes);//import pincodes
router.get('/pincode/getListOfState', verifyToken, verfiyAdmin, listingOfStatesName )
router.get('/pincode/getAllState', verifyToken, verfiyAdmin, getAllState);
router.post('/pincode/findArea', verifyToken, verfiyAdmin, findAreaBySCP);
router.post('/pincode/updateSelectedPincode', verifyToken, verfiyAdmin, updateSelectedPincode);


router.post('/importCSVFile', verifyToken, verfiyAdmin, upload.single('file'), importCSVFile);
router.get('/getAdminDashboardData', verifyToken, verfiyAdmin, getAdminDashboardData);


//FAQ 
router.post('/addFaq', verifyToken, verfiyAdmin, addFAQ);
router.get('/getFaq', verifyToken, verfiyAdmin, getFAQ);
router.post('/getQA', verifyToken, verfiyAdmin, getQA);
router.get('/getAllTitles', verifyToken, verfiyAdmin, getAllTitles);
router.delete('/deleteFaq', verifyToken, verfiyAdmin, deleteFAQ);
router.delete('/deleteQuestion', verifyToken, verfiyAdmin, deleteQuestion);
router.post('/updateFaq', verifyToken, verfiyAdmin, updateFAQ);
router.post('/swappingFaqSequence', verifyToken, verfiyAdmin, swappingFaqSequence);

//Images
router.post('/addImage', verifyToken, verfiyAdmin, uploadImages.single('images'), addImage);
router.post('/addTvcCoverImage', verifyToken, verfiyAdmin, helperCheck, uploadsTvcCoverImages.single('tvcCover'), addTVCCoverImage);
router.post('/addbanner', verifyToken, verfiyAdmin, addBanner);

router.delete('/deleteImage', verifyToken, verfiyAdmin, deleteImages);
router.post('/getAllImages', verifyToken, verfiyAdmin, getAllImages);
router.post('/addLinkWithBanner', verifyToken, verfiyAdmin, addLinkWithBanner);
router.get('/getAllActiveImages', verifyToken, verfiyAdmin, getAllActiveImages);
router.post('/getImageById', verifyToken, verfiyAdmin, getImageById);
router.post('/getImageFile', verifyToken, verfiyAdmin, getImageFile);
router.post('/updateTvcData', verifyToken, verfiyAdmin, updateTVCDataInImage);
router.get('/getAnalyticsData', verifyToken, verfiyAdmin, getAnalyticsData);
router.post('/updateBannerSequence', verifyToken, verfiyAdmin, updateSequenceOfImageBanner);


// export logs data
router.post('/exportLogs', verifyToken, verfiyAdmin, exportLogs);
router.post('/exportLogsPdf', verifyToken, verfiyAdmin, exportLogsPdf);



//TVC
router.use('/tvc', tvcRouter);

//vouchers
router.use('/vouchers', voucherRouter);
//membership
router.use('/membership',verifyToken, verfiyAdmin, membershipRouter);
//card
router.use('/card',verifyToken, verfiyAdmin, cardRouter);

//ds product tag
router.use('/tag', verifyToken, verfiyAdmin, tagRouter)

//seller
router.post('/seller/getSellerRecord', verifyToken, verfiyAdmin, getSellerRecordData)
router.post('/seller/transaction', verifyToken, verfiyAdmin, getAllTransactionByPandF)

//product Redeemption
router.post('/allRedeemProduct', verifyToken, verfiyAdmin, allRedeemProducts);

//contact Staff
router.use('/contactus', verifyToken, verfiyAdmin,  queryStaffRouter);

//analtyic data
router.use('/analytics', verifyToken, verfiyAdmin,  analyticsRouter);

// router.post('/encryptToken', (req,res)=>{
//     try{

//         let { data , key , iv } = req.body;


//         if(typeof data == "object"){ 
//             data = JSON.stringify(data);
//         }

//             const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
//             let encrypted = cipher.update(data);
//             encrypted = Buffer.concat([encrypted, cipher.final()]);const
//             encryptedStr = encrypted.toString('base64'); 
//             return res.status(200).json({
//                 error : false,
//                 message : "successfully encrypt token",
//                 encryptedToken : encryptedStr
//             });
//     }catch(err){
//         console.log("error to encrypt token", err);
//         return res.json({
//             error: true,
//             message: "fail to encrypt token"
//         })
//     }
// });

// router.post('/decryptToken', (req,res)=>{
//     try{

//         const { data , key , iv } = req.body;

//         const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
//         const decrypted = decipher.update(data, 'base64');
//         var decryptedData = Buffer.concat([decrypted, decipher.final()]).toString();

//         return res.status(200).json({
//             error : false,
//             message : "successfully encrypt token",
//             decryptedData : JSON.parse(decryptedData)
//         });
//     }catch(err){
//         console.log("error to decrypt token", err);
//         return res.json({
//             error: true,
//             message: "fail to decrypt token"
//         })
//     }

// });



export default router;
