import path from "path";
import DateTime from "../../utils/constant/getDate&Time";
import { createError } from "../../utils/error";
import { DSProduct } from "../models/DSProduct";
import fs from 'fs';
import { Op } from "sequelize";
import { allPinCodeByP } from "./pincodeController";
import { Seller, SellerInfo, SellerShippingAddress } from "../models/Seller";
import { SellerProducts } from "../models/SellerProducts";
import crypto from 'crypto';
import { Transaction } from "../models/Transaction";
import { sent_ds_product_redeem_message_whatsapp } from "../../utils/messages/whatsapp_messages";
import { Order } from "../models/Order";
import { DSProductTag } from "../models/ProductTag";
import sequelize from "../../utils/db/dbConnection";
import Sequelize from "sequelize";
import { pointsUpdateInGracePeriodsPointRecord } from "./sellerController";
import dotenv from 'dotenv';

dotenv.config();

const TOTAL_REDEEM_POINTS = process.env.TOTAL_REDEEM_POINTS || 1200;

export const addDSProductImages = async(req, res, next)=>{
    try {
        if(!req.productImages){
            next(createError(403, 'There is no product Image for storing...!'));
        }
        res.status(200).json({
            error:false,
            message:'Ds Product Images saved successfully...!',
            data:{images:req.productImages}
        });
    } catch (error) {
        console.log("Add Ds Product Images Error ::>>",error);
        next(error);
    }
};

export const addDSProductThumbnails = async(req, res, next)=>{
    try {
        if(!req.thumbnailImages){
            return next(createError(403, 'There is no thumbnail Image for storing...!'));
        }
        res.status(200).json({
            error:false,
            message:'Thumbnail Images saved successfully...!',
            data:{thumbnails:req.thumbnailImages}
        });
    } catch (error) {
        console.log("thumbnails Images Error ::>>",error);
        next(error);
    }
};

export const addDsProduct = async(req, res, next)=>{
    try {
        const { productName, productSku, description, cost, totalQuantity, status, 
                availableQuantity, categoryId, rewardCoins, startDate, endDate, details, inStock, netWeight } = req.body;
        if(!productName || productName===""){
            return next(createError(403,"Please Enter the Product Name ...!"));
        }
        if(!productSku || productSku===""){
            return next(createError(403,"Please Enter the Product Sku ...!"));
        }
        if(!description || description===""){
            return next(createError(403,"Please Enter the Description ...!"));
        }
        // if(!cost || cost===""){
        //     return next(createError(403,"Please Enter the Cost ...!"));
        // }
        if(!inStock || (inStock!=='Yes' && inStock!=='No')){
            return next(createError(403, 'Please provide the stock'))
        }
        if(inStock==='Yes'){
            if(!totalQuantity || totalQuantity===""){
                return next(createError(403,"Please Enter the Total qunatity ...!"));
            }
            if(!availableQuantity || availableQuantity===""){
                return next(createError(403,"Please Enter the Available Quantity ...!"));
            }
        }
        if(!status || status==="" || (status!=='Active' && status!=='InActive')){
            return next(createError(403,"Please Enter the status ...!"));
        }
        // if(!categoryId || categoryId===""){
        //     return next(createError(403,"Please Enter the valid category Id ...!"));
        // }
        if(!rewardCoins || rewardCoins===""){
            return next(createError(403,"Please Enter the valid reward coins ...!"));
        }
        // if(!startDate || startDate===""){
        //     return next(createError(403,"Please Enter the valid start date ...!"));
        // }
        // if(!endDate || endDate===""){
        //     return next(createError(403,"Please Enter the valid end date ...!"));
        // }
        // const getDSProduct = await DSProduct.findAll({
        //     where:{
        //         [Op.or]:[
        //           {
        //             productName:productName
        //           },
        //           {
        //             productSku:productSku
        //           }
        //         ]
        //     },
        //     raw:true
        // });
        // // console.log("Get DS Product ::>>", getDSProduct);
        // if(!Array.isArray(getDSProduct) || getDSProduct.length!==0){
        //     return next(createError(403, "Product already exists with Product Name or SKU...!"));
        // }
        const dsProductObj = {
            productName:req.body.productName,
            productSku:req.body.productSku,
            description:req.body.description,
            cost:req.body.cost,
            totalQuantity:req.body.totalQuantity,
            availableQuantity:req.body.availableQuantity,
            categoryId:req.body?.categoryId,
            tagId:req.body?.tagId,
            status:req.body.status,
            rewardCoins:req.body.rewardCoins, 
            images:req.body.images,
            thumbnails:req.body.thumbnails,
            details:details,
            inStock:inStock,
            netWeight:netWeight,
            startDate:req.body.startDate,
            endDate:req.body.endDate,
            updateByStaff:req.user.data.name,
            createdIstAt:DateTime(),
            updatedIstAt:DateTime()
        };
        const newDSProduct = await DSProduct.create(dsProductObj);
        return res.status(200).json({
            error: false,
            message: "Add DSProduct Successfully...!",
            data: newDSProduct,
          });
    } catch (error) { 
        console.log("Add-DSProduct Error ::>>",error);
        next(error);
    }
};

export const getDsProductforAdmin = async(req, res, next)=>{
    try {
        const { productId } = req.body;
        if(!productId || productId===""){
            return next(createError(403, "PLease give the Ds Product Id...!"));
        }
        const getDSProduct = await DSProduct.findOne({
            where:{
                id:productId
            },
            raw:true
        });
        if(!getDSProduct){
            return next(createError(404,'No DS Product Found...!'));
        }
        return res.status(200).json({
            error: false,
            message: "Get DSProduct-For-Admin Successfully...!",
            data: getDSProduct,
          });
    } catch (error) { 
        console.log("Get-DSProduct-For-Admin Error ::>>",error);
        next(error);
    }
};

export const getDsProductById = async(req, res, next)=>{
    try {
        const { productId } = req.body;
        if(!productId || productId===""){
            return next(createError(403, "PLease give the Ds Product Id...!"));
        }
        const getDSProduct = await DSProduct.findOne({
            attributes:['pId','id','productName','productSku','description','details','images','thumbnails','cost','inStock','netWeight','categoryId','rewardCoins','status','startDate','endDate','sequence','createdIstAt','updatedIstAt'],
            where:{
                id:productId
            },
            raw:true
        });
        if(!getDSProduct){
            return next(createError(404,'No DS Product Found...!'));
        }
        return res.status(200).json({
            error: false,
            message: "Get DSProduct Successfully...!",
            data: getDSProduct,
          });
    } catch (error) { 
        console.log("Get-DSProduct Error ::>>",error);
        next(error);
    }
};

export const updateDsProductById = async(req, res, next)=>{
    try { 
        const { productId, productName, productSku, description, cost, totalQuantity, status, 
            availableQuantity, categoryId, rewardCoins, startDate, endDate, details, inStock, netWeight } = req.body;
        if(!productId || productId===""){
            return next(createError(403, "PLease give the Ds Product Id...!"));
        }
        if(!productName || productName===""){
            return next(createError(403,"Please Enter the Product Name ...!"));
        }
        if(!productSku || productSku===""){
            return next(createError(403,"Please Enter the Product Sku ...!"));
        }
        if(!description || description===""){
            return next(createError(403,"Please Enter the Description ...!"));
        }
        // if(!cost || cost===""){
        //     return next(createError(403,"Please Enter the Cost ...!"));
        // }
        // if(!totalQuantity || totalQuantity===""){
        //     return next(createError(403,"Please Enter the Total qunatity ...!"));
        // }
        // if(!availableQuantity || availableQuantity===""){
        //     return next(createError(403,"Please Enter the Available Quantity ...!"));
        // }
        if(!status || status==="" || (status!=='Active' && status!=='InActive')){
            return next(createError(403,"Please Enter the status ...!"));
        }
        // if(!categoryId || categoryId===""){
        //     return next(createError(403,"Please Enter the valid category Id ...!"));
        // }
        if(!rewardCoins || rewardCoins===""){
            return next(createError(403,"Please Enter the valid reward coins ...!"));
        }
        const findProduct = await DSProduct.findOne({
            where:{
                id:productId
            }
        })
        if(!findProduct){
            return next(createError(403,"There is no Ds Product Found ...!"));
        }
        // if(findProduct.productName!==productName || findProduct.productSku!==productSku){
        //     const getDSProduct = await DSProduct.findAll({
        //         where:{
        //             [Op.or]:[
        //             {
        //                 productName:productName
        //             },
        //             {
        //                 productSku:productSku
        //             }
        //             ]
        //         },
        //         raw:true
        //     });
        //     // console.log("Get DS Product ::>>", getDSProduct);
        //     if(!Array.isArray(getDSProduct) || getDSProduct.length!==0){
        //         return next(createError(403, "Product already exists with Product Name or SKU...!"));
        //     }
        // }
        const dsProductObj = {
            productName:req.body.productName,
            productSku:req.body.productSku,
            description:req.body.description,
            cost:req.body.cost,
            totalQuantity:req.body.totalQuantity,
            availableQuantity:req.body.availableQuantity,
            categoryId:req.body?.categoryId,
            tagId:req.body?.tagId,
            status:req.body.status,
            rewardCoins:req.body.rewardCoins, 
            details:details,
            inStock:inStock,
            netWeight:netWeight,
            // images:req.body.images,
            // thumbnails:req.body.thumbnails,
            startDate:req.body.startDate,
            endDate:req.body.endDate,
            updateByStaff:req.user.data.name, 
            updatedIstAt:DateTime()
        };
        const updateDSProduct = await DSProduct.update(dsProductObj,{
            where:{
                id:productId
            }
        });
        return res.status(200).json({
            error: false,
            message: "Update DSProduct Successfully...!",
            data: updateDSProduct,
          });
    } catch (error) { 
        console.log("Update-DSProduct Error ::>>",error);
        next(error);
    }
};

export const deleteDsProductById = async(req, res, next)=>{
    try {
        const { productId } = req.body;
        if(!productId || productId===""){
            return next(createError(403, "PLease give the Ds Product Id...!"));
        }
        const getProduct = await DSProduct.findOne({
            where:{
                id:productId
            },
            raw:true
        });
        if(!getProduct){
            return next(createError(403, "There is no product with given Ds Product Id...!"));
        }
        const __dirname = path.resolve();
        const getProductImage = getProduct.images;
        const p = path.join(__dirname,"../assests/images/dsProduct/product/", getProductImage[0].name);
        // const p = path.join(__dirname,"./src/assests/images/dsProduct/thumbnail/", getProductImage[0].name);
         console.log("Path ::>>", p);
        fs.access(p, fs.constants.F_OK, (err) => {
            if (err) {
            //   console.error('DS Product Image File does not exist or cannot be accessed.');
            } else {
            //   console.log('DS Product Image File exists.');
            fs.unlinkSync(p);
            }
        });
        const getThumbnailImages = getProduct.thumbnails;
        getThumbnailImages.map((item)=>{
            const p = path.join(__dirname,"../assests/images/dsProduct/thumbnail/", item.name);
            // const p = path.join(__dirname,"./src/assests/images/dsProduct/thumbnail/", item.name);
             console.log("Path ::>>", p);
            fs.access(p, fs.constants.F_OK, (err) => {
                if (err) {
                //   console.error('DS Product thumbnail  File does not exist or cannot be accessed.');
                } else {
                //   console.log('DS Product thumbnail File exists.');
                fs.unlinkSync(p);
                }
            });
        });
        const deleteDSProduct = await DSProduct.destroy({
            where:{
                id:productId
            }
        });
        return res.status(200).json({
            error: false,
            message: "Delete DSProduct Successfully...!",
            data: deleteDSProduct,
          });
    } catch (error) { 
        console.log("Delete-DSProduct Error ::>>",error);
        next(error);
    }
};

export const getAllDSProductByP = async(req, res, next)=>{
    try {
        const { highToLow, lowToHigh } = req.body;
        const { minRange, maxRange } = req.body;
        const { categoryIds } = req.body;
        const page = req.body.page || 1;
        const limit = req.body.limit || 10;
        const offset = limit * (page - 1);

        let whereClause = "WHERE dsp.inStock = 'Yes' AND dsp.status = 'Active' AND c.status='Active'";
        let orderByClause = "ORDER BY CASE WHEN dspt.sequence IS NULL THEN 1 ELSE 0 END, dspt.sequence ASC";

        if (minRange && maxRange) {
            whereClause += ` AND dsp.rewardCoins >= ${minRange} AND dsp.rewardCoins <= ${maxRange}`;
        }
        if(categoryIds && categoryIds?.length>0){
            whereClause += `AND categoryId in (${categoryIds.join(',')})`
        }

        if (highToLow && highToLow === true) {
            orderByClause = "ORDER BY dsp.rewardCoins DESC";
        }

        if (lowToHigh && lowToHigh === true) {
            orderByClause = "ORDER BY dsp.rewardCoins ASC";
        }

        const query = `
            SELECT 
                dsp.pId, dsp.id, dsp.productName, dsp.productSku, dsp.description, dsp.details, dsp.images, dsp.thumbnails, 
                dsp.cost, dsp.inStock, dsp.netWeight, dsp.categoryId, dsp.rewardCoins, dsp.status, dsp.startDate, 
                dsp.endDate, dsp.sequence, dsp.createdIstAt, dsp.updatedIstAt,
                c.categoryName,
                dspt.id as tagId, dspt.tagName, dspt.sequence
            FROM 
                dsproducts as dsp
            INNER JOIN categories as c on c.id=dsp.categoryId
            LEFT JOIN dsproducttags as dspt on dspt.id=dsp.tagId
            ${whereClause}
            ${orderByClause}
            LIMIT ${limit}
            OFFSET ${offset}
        `;
        const allDsProduct = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT });       
        const query1 = `
            SELECT 
                COUNT(dsp.id) as count
            FROM 
                dsproducts as dsp
            INNER JOIN categories as c on c.id=dsp.categoryId
            LEFT JOIN dsproducttags as dspt on dspt.id=dsp.tagId
            ${whereClause}
        `;
        const totalDsProduct = await sequelize.query(query1, { type: Sequelize.QueryTypes.SELECT });       
        // const totalDsProduct = await DSProduct.count();
        return res.status(200).json({
            error: false,
            message: "Get All DSProduct Successfully...!",
            totalInAPage:allDsProduct.length,
            totalDsProduct:totalDsProduct[0].count,
            data: allDsProduct,
          });
    } catch (error) { 
        console.log("Get-All-DSProduct Error ::>>",error);
        next(error);
    }
};

export const getAllDSProductByPForAdmin = async(req, res, next)=>{
    try {
        const { search } = req.body;
        const page = req.body.page || 1;
        const limit = req.body.limit || 10;
        const offset = limit * (page - 1);

        let whereClause = `WHERE dsp.status in ('Active','Inactive')`;
        if(search){
            whereClause +=  ` AND dsp.productName LIKE '%${search}%' OR dsp.productSku LIKE '%${search}%' OR c.categoryName LIKE '%${search}%' OR dspt.tagName LIKE '%${search}%'`;
        }
        let orderByClause = "ORDER BY CASE WHEN dspt.sequence IS NULL THEN 1 ELSE 0 END, dspt.sequence ASC";
        const query = `
            SELECT 
                dsp.pId, dsp.id, dsp.productName, dsp.productSku, dsp.description, dsp.details, dsp.images, dsp.thumbnails, 
                dsp.cost, dsp.inStock, dsp.netWeight, dsp.categoryId, dsp.rewardCoins, dsp.status, dsp.startDate, dsp.availableQuantity, 
                dsp.totalQuantity,dsp.endDate, dsp.sequence, dsp.createdIstAt, dsp.updatedIstAt, dsp.updateByStaff,
                c.categoryName,
                dspt.id as tagId, dspt.tagName, dspt.sequence
            FROM 
                dsproducts as dsp
            INNER JOIN categories as c on c.id=dsp.categoryId
            LEFT JOIN dsproducttags as dspt on dspt.id=dsp.tagId
            ${whereClause}
            ${orderByClause}
            LIMIT ${limit}
            OFFSET ${offset}
        `;
        const allDsProduct = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT });       
        const query1 = `
            SELECT 
                COUNT(dsp.id) as count
            FROM 
                dsproducts as dsp
            INNER JOIN categories as c on c.id=dsp.categoryId
            LEFT JOIN dsproducttags as dspt on dspt.id=dsp.tagId
            ${whereClause}
        `;
        const totalDsProduct = await sequelize.query(query1, { type: Sequelize.QueryTypes.SELECT });       
        // const totalDsProduct = await DSProduct.count();
        return res.status(200).json({
            error: false,
            message: "Get All DSProduct Successfully...!",
            totalInAPage:allDsProduct.length,
            totalDsProduct:totalDsProduct[0].count,
            data: allDsProduct,
          });
    }  catch (error) { 
        console.log("Get-All-DSProduct Error ::>>",error);
        next(error);
    }
};

export const addThumbnailImage = async(req, res, next)=>{
    try {
        const { productId } = req.query;
        if(!req.thumbnailImages){
            return next(createError(403,'there is no thumbnail image...!'));
        }
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
        let thumbnails = getDSProduct.thumbnails;
        thumbnails.push(req.thumbnailImages[0]);
        const updateDsProduct = await DSProduct.update({ thumbnails },{
            where:{
                id:productId
            }
        });
        res.status(200).json({
            error:false,
            message:`Add thumbnail image succesfully...!`,
            data:updateDsProduct
        })
     } catch (error) {
        console.log("Add thumbnail Images error ::>>", error);
        next(error);
    }
};

export const deleteThumbnailImages = async(req, res, next)=>{
    try {
        const { thumbnailName, productId } = req.body;

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

        let thumbnails = getDSProduct.thumbnails;
        const remainingThumbnailImage = thumbnails.filter(thumbnail=>(thumbnail.name!==thumbnailName));
        const getThumbnailImage = thumbnails.filter(thumbnail=>(thumbnail.name===thumbnailName));
        if(thumbnails.length===0 || getThumbnailImage.length===0){
            return next(createError(403, 'There is no thumbnail images...!'));
        }
        // console.log("getThumbnailImage ::>>", getThumbnailImage);
        // console.log("remainingThumbnailImage ::>>", remainingThumbnailImage);
        const __dirname = path.resolve();
        // console.log("Image ::>>", getThumbnailImage[0].name);
        const p = path.join(__dirname,"../assests/images/dsProduct/thumbnail/", getThumbnailImage[0].name);
        // const p = path.join(__dirname,"./src/assests/images/dsProduct/thumbnail/", getThumbnailImage[0].name);
        // console.log("Path ::>>", p);
        fs.access(p, fs.constants.F_OK, (err) => {
            if (err) {
            //   console.error('File does not exist or cannot be accessed.');
            } else {
            //   console.log('File exists.');
            fs.unlinkSync(p);
            }
        });
        thumbnails = remainingThumbnailImage;
        const updateDsProduct = await DSProduct.update({ thumbnails },{
            where:{
                id:productId
            }
        });
        res.status(200).json({
            error:false,
            message:`Delete thumbnail image succesfully...!`,
            data:updateDsProduct
        })
     } catch (error) {
        console.log("Delete thumbnail Images error ::>>", error);
        next(error);
    }
};

export const changeDsProductImage = async(req, res, next)=>{
    try {
        const { productId } = req.query;
        if(!req.productImages){
            return next(createError(403,'there is no product image...!'));
        }
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
        if(getDSProduct.images.length!==0){
            const p = path.join(__dirname,"../../../assests/images/dsProduct/product/", getDSProduct.images[0].name);
            // const p = path.join(__dirname,"../../src/assests/images/dsProduct/product/", getDSProduct.images[0].name);
            // console.log("Path ::>>", p);
            fs.access(p, fs.constants.F_OK, (err) => {
                if (err) {
                //   console.error('File does not exist or cannot be accessed.');
                } else {
                //   console.log('File exists.');
                fs.unlinkSync(p);
                }
            });
        }
        const updateDsProduct = await DSProduct.update({ images:req.productImages },{
            where:{
                id:productId
            }
        });
        res.status(200).json({
            error:false,
            message:`Change Ds-Product image succesfully...!`,
            data:updateDsProduct
        })
     } catch (error) {
        console.log("Change Ds-Product Image error ::>>", error);
        next(error);
    }
};

export const getAllDSProductByCategory = async(req, res, next)=>{
    try {
        const { categoryIds } = req.body;
        const page = req.body.page || 1;
        const limit = req.body.limit || 10;
        const offset = limit * (page-1);
        let count = 0;
        let allproduct = await Promise.all(categoryIds.map(async(categoryId)=>{
            const allDsProduct = await DSProduct.findAll({
                where:{
                    categoryId
                },
                raw:true
            });
            count+=allDsProduct.length;
            return allDsProduct;
        }));
        allproduct = allproduct.flat();
        return res.status(200).json({
            error: false,
            message: "Get All DSProduct By Category Successfully...!",
            totalInAPage:allproduct.length,
            totalDsProduct:count,
            data: allproduct,
          });
    } catch (error) { 
        console.log("Get-All-DSProduct-By-Category Error ::>>",error);
        next(error);
    }
};

export const getOverallMinMax = async(req, res, next)=>{
    try {
        const allDsProduct = await DSProduct.findAll({
            attributes:['cost'],
            raw:true
        });
        let minimum = 0;
        let maximum = 0;
        allDsProduct.map(item=>{
            minimum = Math.min(item.cost);
            maximum = Math.max(item.cost);
        });
        return res.status(200).json({
            error: false,
            message: "Maximum & Minimum found Successfully...!",
            data: {
                minimum,
                maximum
            },
          });
    } catch (error) { 
        console.log("Maximum & Minimum founding Error ::>>",error);
        next(error);
    }
};

export const swappingDsProductSequence = async(req, res, next)=>{
    try {
        const { productId, sequenceNo } = req.body;
        if(!productId){
            return next(createError(403, "Enter the valid Product Id ...!"));
        }
        if(!sequenceNo || sequenceNo<=0){
            return next(createError(403, "Enter the valid Sequence No ...!"));
        }
        const getProduct = await DSProduct.findOne({
            where:{
                id:productId
            },
            raw:true
        });
        if(!getProduct){
            return next(createError(403, 'DS-Product not found...!'));
        }
        const lastSequence = await DSProduct.findOne({
            attributes:['sequence'],
            order:[['sequence','desc']],
            limit:1,
            raw:true
        });
        if(lastSequence.sequence===1){
            return next(createError(403,'There is only one DS-Product so it has to only be a sequence 1'));
        }
        if(lastSequence.sequence<sequenceNo){
            return next(createError(403, 'Sequence out of range for DS-Product...!'));
        }
        if(lastSequence.sequence===sequenceNo){
            return next(createError(403, 'Sequence will be same for this DS-Product...!'));
        }
        const findProductWithSequence = await DSProduct.findOne({
            where:{
                sequence:sequenceNo
            },
            raw:true
        });
        const updateProduct = await DSProduct.update(
            { sequence: sequenceNo },
            { where: { id: productId } }
        );
        const updateProductWithSequence = await DSProduct.update(
            { sequence: getProduct.sequence },
            { where: { id: findProductWithSequence.id } }
        );
        if (updateProduct[0] === 0 || updateProductWithSequence[0] === 0) {
            return next(createError(500, 'Failed to update product.'));
        }
        return res.status(200).json({
            error:false,
            message:"Sequence will be updated for your requested sequence for DS-Product",
            data:updateProduct[0] + updateProductWithSequence[0]
        });
    } catch (error) {
        console.log("Swapping DS Product error ::>>",error);
        next(error);
    }
};

function generateId() {
    return crypto.randomBytes(10).toString("hex");
}

export const dsProductRedeemptionRequest = async(req, res, next)=>{
    const transaction = await sequelize.transaction();
    try {
        const { sellerId, quantity, redeemProducts , totalUsedCoins } = req.body;
        if(!quantity || quantity<1 || quantity>5){
            return next(createError(403, "Please enter the valid Quantity"));
        }
        if(!redeemProducts || redeemProducts.length===0){
            return next(createError(403, "Please select the product for redeemption"));
        }
        if(quantity!==redeemProducts.length){
            return next(createError(403, "Selected quantity does not matched with Product quantity."));
        }
        else if(!totalUsedCoins || totalUsedCoins===""){
            return next(createError(403, "Please provide the total used coins"));
        }
        const seller = await Seller.findOne({
            where:{
                id:sellerId 
            },
            raw:true
        });
        const sellerInfo = await SellerInfo.findOne({
            where:{
                sellerId:sellerId 
            },
            raw:true
        });
        if(!seller){
            return next(createError(403,'Seller not found'));
        }
        // console.log("Seller ::>>",seller); 

        //usedCoinsPerProduct
        //chooose default address
        const sellerAddress = await SellerShippingAddress.findOne({
            where:{
                sellerId:sellerId,
                isDefault:true
            },
            raw:true
        });
        // console.log("Seller shipping Address ::>>", sellerAddress);
        if(!sellerAddress){
            return next(createError(403, 'You have to select the shipping address from the addresses'))
        }
        const products = redeemProducts;
        let requiredPoints = 0;
        const rp = await Promise.all(products.map(async (product)=>{
            const findProduct = await DSProduct.findOne({
                where:{
                    id:product.productId
                },
                raw:true
            });
            if(!findProduct){
                throw createError(403,`There is No Product Found with ${product.productName} and sku ${product.sku}`);
            }
            if(Number(findProduct.availableQuantity)<product.quantity){
                throw createError(403,`There is unsufficient quantity of Product Found with ${product.productName} and sku ${product.sku}`);
            }
            if(Number(findProduct.rewardCoins)!==Number(product.coins)){
                throw createError(403,`Coins are mismatched with given and Product with ${product.productName} and sku ${product.sku}`);
            }
            if(Number(product.usedCoinsPerProduct)!==Number(findProduct.rewardCoins)*Number(product.quantity)){
                throw createError(403,`Wrong Calculation regarding with ${product.productName} and sku ${product.sku}`);
            }
            requiredPoints += Number(product.quantity)*Number(findProduct.rewardCoins);
            return requiredPoints;
        }));
        requiredPoints = await rp[quantity-1];
        if(requiredPoints!==totalUsedCoins){
            return next(createError(403,`Wrong Calculation`));
        }
        if(totalUsedCoins<TOTAL_REDEEM_POINTS){
            return next(createError(403, 'You can only redeem products if your total points exceed 1200'));
        }
        if(Number(sellerInfo.availablePoints)<requiredPoints){
            return next(createError(403, 'You have not enough Points for Redeem products'));
        }
        const orderId = generateId();
        const findOrder = await Order.findOne({
            where:{
                oId:orderId
            },
            raw:true
        })
        if(findOrder){
            return next(createError(403, 'Please retry to make order'));
        }
        const redeemptionProducts = await Promise.all(redeemProducts.map(async(product)=>{
            const sellerProductObj = {
            sellerId,
            accountId:seller.accountId,
            sellerName:seller.firstName+" "+seller.lastName,
            email:seller.email,
            contactNo:seller.contactNo,
            orderId,
            pId:product.pId,
            productId:product.productId,
            productName: product.productName,
            sku:product.sku,
            quantity:product.quantity,
            productImageURL:product.productImage,
            requiredPoints:product.usedCoinsPerProduct,
            status:'Completed',
            productType:'DSProduct',
            billingAddress:sellerAddress.shippingAddress,
            createdIstAt:DateTime(),
            updatedIstAt:DateTime()
            };
            const sellerproduct = await SellerProducts.create(sellerProductObj,{transaction});
            return sellerproduct;
        }));
        const transactionId = generateId();
        const createTransaction = await Transaction.create({
            transactionId: transactionId,
            sellerId: sellerId,
            transactionCategory: 'DSProductRedeem',
            dsProductTransaction: {orderId,redeemProducts},
            points: totalUsedCoins,
            status: 'Redeem',
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        },{transaction});

        const createOrders = await Order.create({
            sellerId,
            oId:orderId,
            productType:'DSProduct',
            products:redeemProducts,
            quantity:quantity,
            points:totalUsedCoins,
            status:'Complete',
            payBy:'POINTS',
            transactionId,
        },{transaction});
        let availablePoints = Number(sellerInfo.availablePoints)-Number(requiredPoints);
        const updateAvailablePoints = await SellerInfo.update({
            availablePoints,
            updatedIstAt:DateTime()
        },{
            where:{
                sellerId
            },
            transaction
        });
        await pointsUpdateInGracePeriodsPointRecord(sellerId, totalUsedCoins, transaction);
        await transaction.commit();
        sent_ds_product_redeem_message_whatsapp(seller.contactNo, seller.firstName+" "+seller.lastName, totalUsedCoins, redeemProducts.length, redeemProducts[0].productName, availablePoints);
        return res.status(200).json({
            error:false,
            message:"Redeemption for DS Product has been successfully Complete.",
            data:{transactionId, redeemProducts}
        })

    } catch (error) {
        await transaction.rollback();
        console.log("DS-Product Redeemption Error ::>>",error);
        next(error);
    }
}

export const allRedeemProducts = async(req, res, next)=>{
    try {
        let { page, limit, orderBy, search } = req.body;

        if(!page || page==="" ){
            return next(createError(403,"Please provide page no!"));
        }

        let clause = 
                !search ? 
                {} : 
        {
            [Op.or]:[
                {
                    accountId:{
                        [Op.substring]:search
                    }
                },
                {
                    contactNo:{
                        [Op.substring]:search
                    }
                },
                {
                    email:{
                        [Op.substring]:search
                    }
                },
                {
                    orderId:{
                        [Op.substring]:search
                    }
                },
                {
                    productName:{
                        [Op.substring]:search
                    }
                },
                {
                    status:{
                        [Op.substring]:search
                    }
                },
                {
                    createdIstAt:{
                        [Op.substring]:search
                    }
                },
            ]
        };
        // console.log("clause",clause);
        page = page || 1;
        limit = limit || 10;
        const offset = limit * (page-1);
        orderBy = !orderBy ? 'desc' : orderBy =='Ascending' ?'asc' : 'desc';

        const getSellersProduts = await SellerProducts.findAll({
            where:clause,
            limit:limit,
            offset:offset,
            order:[
                ['id', orderBy]
            ],
            raw:true
        });

        const totalSellersProduts = await SellerProducts.count({where:clause});
        res.status(200).json({
            error: false,
            message: "All Redeem Products found Successfully...!",
            productInAPage:getSellersProduts.length,
            totalProducts:totalSellersProduts,
            data: getSellersProduts,
        });
    } catch (error) {
        console.log("Get All Redeem Products Error ::>>",error);
        next(error);
    }
}

export const updateDsProductStatus = async(req, res, next)=>{
    try {
        let { productId, status } = req.body;
        if(!status) return next(createError(403, 'Please provide the status'));
        if(!productId) return next(createError(403, 'Please provide the status'));
        const updateDSProduct = await DSProduct.update({status},{
            where:{
                id:productId
            }
        });
        return res.status(200).json({
            error: false,
            message: "Dsproduct status updated Sucessfully",
            data: updateDSProduct,
          });
    } catch (error) {
        console.log("Get All Redeem Products Error ::>>",error);
        next(error);
    }
}

export const getProductTag = async(req, res, next)=>{
    try {
        // let { productId, status } = req.body;
        // if(!status) return next(createError(403, 'Please provide the status'));
        // if(!productId) return next(createError(403, 'Please provide the status'));
        const updateDSProduct = await DSProductTag.findAll({
            attributes:['id','tagName'],
            where:{
                status: "Active"
            },
            raw:true
        });
        return res.status(200).json({
            error: false,
            message: "Dsproduct status updated Sucessfully",
            data: updateDSProduct,
          });
    } catch (error) {
        console.log("Get All Redeem Products Error ::>>",error);
        next(error);
    }
}

