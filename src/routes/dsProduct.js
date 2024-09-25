import express from 'express';
import { verfiyAdmin, verfiyWholeSeller, verifyToken } from '../../utils/verifyToken';
import * as ds from '../controllers/dsProductController';
import multer from 'multer';
import path from 'path';
import { createError } from '../../utils/error';
import { DSProduct } from '../models/DSProduct';
import { Op } from 'sequelize';
const Router = express.Router();

const storageProductImages = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '../assests/images/dsProduct/product')
      // cb(null, './src/assests/images/dsProduct/product')
    },
    filename: function (req, file, cb) {
      const fArr = file.originalname.split('.');
      const productName = fArr[0]+"-"+Date.now()+path.extname(file.originalname);
      const productImagePath = `/dsProduct/product/${productName}`;
    //   console.log("Product Image Path ::>>", productImagePath);
      req.productImages = req.productImages ? req.productImages : [];
      let productImages = req.productImages
      productImages.push({name:productName, path:productImagePath});
      // console.log(productImages);
      cb(null, productName);
    }
  });

const storageThumbnailImages = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '../assests/images/dsProduct/thumbnail')
      // cb(null, './src/assests/images/dsProduct/thumbnail')
    },
    filename: function (req, file, cb){
      const fArr = file.originalname.split('.');
      const thumbnailName = fArr[0]+"-"+Date.now()+path.extname(file.originalname);
      const thumbnailImagePath = `/dsProduct/thumbnail/${thumbnailName}`;

    //   console.log("Thumbnail Image Path ::>>", thumbnailImagePath);
      req.thumbnailImages = req.thumbnailImages ? req.thumbnailImages : [];
      let thumbnailImages = req.thumbnailImages;
      thumbnailImages.push({name:thumbnailName, path:thumbnailImagePath});
    //   console.log(thumbnailImages);
      cb(null, thumbnailName);
    }
  });
  
const uploadProductImages = multer({ storage: storageProductImages });
const uploadThumbnailImages = multer({ storage: storageThumbnailImages });

const helperCheck = async(req, res, next)=>{
    const { productName, productSku } = req.query;
    if(!productName || productName===""){
      return next(createError(403,"Please Enter the Product Name ...!"));
    }
    if(!productSku || productSku===""){
        return next(createError(403,"Please Enter the Product Sku ...!"));
    }
    // const getDSProduct = await DSProduct.findAll({
    //   where:{
    //       [Op.or]:[
    //         {
    //           productName:productName
    //         },
    //         {
    //           productSku:productSku
    //         }
    //       ]
    //   },
    //   raw:true
    // });
    // // console.log("Get DS Product ::>>", getDSProduct);
    // if(!Array.isArray(getDSProduct) || getDSProduct.length!==0){
    //     return next(createError(403, "Product already exists with Product Name or SKU...!"));
    // }
    const {count} = req.query;
    // console.log("quey :>>",count); 
    if(count && Number(count)>6){
        return next(createError(403, "You have to select 6 thumbnails Images...!"));
    }
    next();
};

const validationHelperCheck = async(req, res, next)=>{
  try {
    const { productId } = req.query;
        const getDSProduct = await DSProduct.findOne({
            where:{
                id:productId
            },
            raw:true
        });
        // console.log("Get DS Product ::>>", getDSProduct);
        if(!getDSProduct){
            return next(createError(403, "There is no product found...!"));
        }
        const thumbnailsCount = getDSProduct.thumbnails.length;
        // console.log("Thumbnail length :>>", thumbnailsCount);
        if(thumbnailsCount>=6){
          return next(createError(403,'You have already 6 Thumbnails Images in This Ds Product'))
        }
        next();
  } catch (error) {
      console.log("valdation check on add thumbnails of ds product Error ::>>",error);
    next(error);
  }
};

Router.post('/addDSProductImages', verifyToken, verfiyAdmin, helperCheck, uploadProductImages.single('product'), ds.addDSProductImages);
Router.post('/addDSProductThumbnails', verifyToken, verfiyAdmin, helperCheck, uploadThumbnailImages.array('thumbnail'), ds.addDSProductThumbnails);
Router.post('/addDsProduct', verifyToken, verfiyAdmin, ds.addDsProduct);
Router.post('/getDsProductForAdmin', verifyToken, verfiyAdmin, ds.getDsProductforAdmin);
Router.post('/getDsProduct', ds.getDsProductById);
Router.put('/updateDsProduct', verifyToken, verfiyAdmin, ds.updateDsProductById);
Router.delete('/deleteDsProduct', verifyToken, verfiyAdmin, ds.deleteDsProductById);
Router.post('/getAllDsProduct', ds.getAllDSProductByP);
Router.post('/getAllDsProductForAdmin', verifyToken, verfiyAdmin, ds.getAllDSProductByPForAdmin);
Router.post('/getAllDsProductByCategory', ds.getAllDSProductByCategory);
Router.post('/addThumbnailImage', verifyToken, verfiyAdmin, validationHelperCheck, uploadThumbnailImages.single('thumbnail'), ds.addThumbnailImage);
Router.delete('/deleteThumbnailImage', verifyToken, verfiyAdmin, ds.deleteThumbnailImages);
Router.post('/changeDsProductImage', verifyToken, verfiyAdmin, uploadProductImages.single('product'), ds.changeDsProductImage);
Router.post('/getOverallMinMax',ds.getOverallMinMax);
Router.post('/updateProductSequence',verifyToken, verfiyAdmin, ds.swappingDsProductSequence);
Router.post('/productRedeemptionRequest',verifyToken, verfiyWholeSeller, ds.dsProductRedeemptionRequest);
Router.post('/updateStatusDsProduct',verifyToken, verfiyAdmin, ds.updateDsProductStatus);


export default Router;