import { exec } from "child_process";
import { CouponBatch, CouponCode, CouponSetting, TempCouponCode } from "../models/Coupon";
import generateQR from "../../utils/constant/generateQr";
import { createError } from "../../utils/error";
import { Op, Sequelize } from "sequelize";
import getSerialNumber from "../../utils/constant/getSerialNumber";
import generatePin from "../../utils/constant/generatePin";
import DateTime from "../../utils/constant/getDate&Time";
import Query from "../../utils/db/rawQuery";
import dotenv from 'dotenv';
import { Seller, SellerGracePeriodPointRecord, SellerGracePeriodRecord, SellerInfo, SellerLoggingHistory } from "../models/Seller";
import { Transaction } from "../models/Transaction";
import generateTransactionId from "../../utils/constant/generateTransactionId";
import { RewardPointUpdateMail } from "../../utils/mail/mail_message";
import { sent_reward_points_update_whatsapp } from "../../utils/messages/whatsapp_messages";
import { rewardPointsEarn } from "../../utils/messages/sms_messages";
import { error } from "console";
import xlsx from 'node-xlsx';
import path from "path";
import sequelize from "../../utils/db/dbConnection";
import { unlink, unlinkSync } from "fs";

const voucher_codes = require("voucher-code-generator");
dotenv.config();
const viewUrl = process.env.VIEW_URL;
const COUPON_EARNED_LIMIT = process.env.COUPON_EARNED_LIMIT || 25;

//coupon setting Api**********************
export const firstCouponSetting = async (req, res, next) => {
  try {
    if (!req.body.charset || 
      req.body.charset !== "Numbers" &&
      req.body.charset !== "Alphabetic" &&
      req.body.charset !== "Alphanumeric"
    ) {
      return next(createError(403, "Enter the Valid Character Set"));
    } else if (!req.body.length || req.body.length <= 0) {
      return next(createError(403, "Enter the Valid Length of Coupon Code"));
    }
    req.body.updateByStaff = req.user.data.name;
    req.body.createdIstAt = DateTime();
    req.body.updatedIstAt = DateTime();
    const savedCouponSetting = await CouponSetting.create(req.body);
    res.status(200).json({
      error: false,
      message: "New Coupon Setting Saved Successfully...!",
      data: savedCouponSetting,
    });
  } catch (error) {
    console.error("New-Coupon-Setting-Saved Error:", error.message);
    next(error);
  }
};

export const saveCouponSetting = async (req, res, next) => {
  try {
    if (
      !req.body.charset || 
      req.body.charset !== "Numbers" &&
      req.body.charset !== "Alphabetic" &&
      req.body.charset !== "Alphanumeric"
    ) {
      return next(createError(403, "Enter the Valid Character Set"));
    } else if (!req.body.length || req.body.length <= 0) {
      return next(createError(403, "Enter the Valid Length of Coupon Code"));
    }
    req.body.updateByStaff = req.user.data.name;
    // req.body.createdIstAt = DateTime();
    req.body.updatedIstAt = DateTime();
    const savedCouponSetting = await CouponSetting.update(req.body, {
      where: {
        id: 1,
      },
    });
    res.status(200).json({
      error: false,
      message: "Coupon Setting Saved Successfully...!",
      data: savedCouponSetting,
    });
  } catch (error) {
    console.error("Coupon-Setting-Saved Error:", error.message);
    next(error);
  }
};

export const getCouponSetting = async (req, res, next) => {
  try {
    const getCouponSetting = await CouponSetting.findOne({
      where: {
        id: 1,
      },
    });
    res.status(200).json({
      error: false,
      message: "Getting-Coupon Setting Successfully...!",
      data: getCouponSetting,
    });
  } catch (error) {
    console.error("Get-Coupon-Setting Error:", error.message);
    next(error);
  }
};
//****************************************

//with coupon batch & make QR with redirection url with data in params
export const generateCoupons = async (req, res, next) => {
  try {
    if (!req.body.productName || req.body.productName === "") {
      return next(createError(403, "Enter the product Name"));
    } else if (!req.body.productSku || req.body.productSku === "") {
      return next(createError(403, "Enter the product sku"));
    // } else if (!req.body.description || req.body.description === "") {
    //   return next(createError(403, "Enter the Description Name"));
    } else if (!req.body.noOfCoupon || req.body.noOfCoupon <= 0) {
      return next(createError(403, "Enter the valid No. Of Coupon"));
    } else if (!req.body.rewardPoint || req.body.rewardPoint <= 0) {
      return next(createError(403, "Enter the valid reward Point"));
    }
    // let expiry = req.body.expiryDays;
    // if(req.body.timeline==="Days" && (isNaN(expiry) || expiry <= 0)){
    //   return next(createError(403, "Enter the Valid Expiry Days"));
    // }

    
    // if(req.body.timeline==="Date" && req.body.startDate===""){
    //   return next(createError(403, "Enter the Valid Start Date"));
    // }
    if (!req.body.startDate || req.body.startDate === "") {
      return next(createError(403, "Enter the Valid Start Date"));
    }
    else if (!req.body.endDate || req.body.endDate === "") {
      return next(createError(403, "Enter the Valid End Date"));
    }

    if (!req.body.startTime || req.body.startTime === "") {
      return next(createError(403, "Enter the Valid Start Time"));
    }
    else if (!req.body.endTime || req.body.endTime === "") {
      return next(createError(403, "Enter the Valid End Time"));
    }

    const couponCount = req.body.noOfCoupon

    if(couponCount > 100000){
      return next(createError(413,"The maximum limit of coupons is 1 lahks"))
    }
    
    let timeTaken = Math.floor(couponCount * 0.00013)+1;

    const couponSetting = await CouponSetting.findOne({
      where: {
        id: 1,
      },
      raw: true,
    });
    //console.log("Coupon-Setting ::>>",couponSetting);
    let charset =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const type = couponSetting.charset;
    if (type === "Numbers") {
      charset = "0123456789";
    } else if (type === "Alphabetic") {
      charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }
    res.status(200).json({
      error: false,
      message: `Request sent successfully. It will take approx ${timeTaken} minutes to generate all coupons.`,
    });
    const couponsCodesData = voucher_codes.generate({
      prefix: couponSetting.prefix,
      postfix: couponSetting.postfix,
      pattern: couponSetting.pattern,
      length: couponSetting.length,
      count: couponCount,
      charset: charset,
    });
    // console.log("couponsCodesData ::>>", couponsCodesData);
    //   testing coupon Codes
    //   res.status(200).json({
    //         error:false,
    //         message:"Coupons generated Successfully...!",
    //         data:{coupon:couponsCodesData}
    //     });

    let getSerialNo = await getSerialNumber();
    // console.log("Last Serail No ::>>", getSerialNo);
    let srNo = Number(getSerialNo);
    // console.log("Last Serail No ::>>", srNo);
    let zero = "000000000";
    srNo += 1;
    //coupn batch
    let sn = srNo + "";
    //make startDate and endDate
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    startDate.setHours(req.body?.startTime.split(':')[0]);
    startDate.setMinutes(req.body?.startTime.split(':')[1]);
    endDate.setHours(req.body?.endTime.split(':')[0]);
    endDate.setMinutes(req.body?.endTime.split(':')[1]);
    const couponBatchObj = {
      productName: req.body.productName.trim(),
      productSku: req.body.productSku.trim(),
      description: req.body.description.trim(),
      rewardPoint: req.body.rewardPoint,
      noOfCoupon: req.body.noOfCoupon,
      serialNo: zero.substring(0, zero.length - sn.length) + sn,
      startDate,
      endDate,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      createdIstAt: DateTime(),
      updatedIstAt: DateTime(),
      updateByStaff: req.user.data.name
    };
    const couponBatch = await CouponBatch.create(couponBatchObj);
    const batchSize = 10000;

    for (let i = 0; i < couponsCodesData.length; i += batchSize) {
      const batchData = couponsCodesData.slice(i, i + batchSize);
      const batchCouponCodesObj = [];
      for (let j = 0; j < batchData.length; j++) {
        let data = batchData[j];
        let sr = srNo + "";
        let couponCodeObj = {
          couponBatchId: couponBatch.id,
          productName: req.body.productName.trim(),
          productSku: req.body.productSku.trim(),
          description: req.body.description.trim(),
          rewardPoint: req.body.rewardPoint,
          noOfCoupon: req.body.noOfCoupon,
          serialNo: zero.substring(0, zero.length - sr.length) + sr,
          code: data,
          pin: generatePin(),
          qrCode: "",
          isActive: "Active",
          startTime: req.body.startTime,
          endTime: req.body.endTime,
          startDate,
          endDate,
          createdIstAt: DateTime(),
          updatedIstAt: DateTime(),
          updateByStaff: req.user.data.name,
        };

        srNo = srNo + 1;

        // const text = `${viewUrl}/${couponCodeObj.code}/${couponCodeObj.serialNo}/${couponCodeObj.pin}`;
        const text = `${viewUrl}/${couponCodeObj.code}/${couponCodeObj.serialNo}`;
        couponCodeObj.qrCode = await generateQR(text);

        batchCouponCodesObj.push(couponCodeObj);
      }

      // Perform bulk insert for the current batch
      await CouponCode.bulkCreate(batchCouponCodesObj);
    }


  } catch (error) {
    console.error("Generate-Coupons Error:", error.message);
    next(error);
  }
};

export const getCouponByCode = async (req, res, next) => {
  try {
    if (!req.body.code || req.body.code === "") {
      return next(createError(403, "Enter the valid Code"));
    }
    const getCouponCode = await CouponCode.findOne({
      where: {
        code: req.body.code,
      },
      raw: true,
    });
    res.status(200).json({
      error: false,
      message: "Coupons Code found Successfully...!",
      data: { couponCode: getCouponCode },
    });
  } catch (error) {
    console.error("Get-Coupon-BY-Code-Error ::>>", error.message);
    next(error);
  }
};



export const getAllCouponCodesByP = async (req, res, next) => {
  try {
    if (!req.body.page || req.body.page === "") {
      return next(createError(403, "Please Give the page Number...!"))
    }
    const page = req.body.page;
    const limit = req.body.limit || 10;
    let offset = limit * (page - 1);
    const allCouponCodes = await CouponCode.findAll({
      where: {
        isActive: "Active",
        status: "Inuse"
      },
      limit: limit,
      offset: offset,
      order: [
        ['id', 'DESC'],
      ],
    });
    const totalCoupons = await CouponCode.count();
    res.status(200).json({
      error: false,
      message: "All-Coupon-Codes found Successfully...!",
      couponsInAPage: allCouponCodes.length,
      totalCoupons,
      data: { allCouponCodes: allCouponCodes },
    });
  } catch (error) {
    console.error("Get-All-Coupon-Codes Error:", error.message);
    next(error);
  }
};

export const getAllCouponBatches = async (req, res, next) => {
  try {
    const allCouponCodes = await CouponBatch.findAll({
      // where:{
      //   isActive:"Active"
      // },
      order: [
        ['id', 'DESC'],
      ],
    });
    res.status(200).json({
      error: false,
      message: "All-Coupon-Batches found Successfully...!",
      count: allCouponCodes.length,
      data: { allCouponBatches: allCouponCodes },
    });
  } catch (error) {
    console.error("Get-All-Coupon-Batches Error:", error.message);
    next(error);
  }
};

export const getAllCouponCodeInBatches = async (req, res, next) => {
  try {
    if (!req.body.couponBatchId || req.body.couponBatchId === "") {
      return next(createError(403, "Enter the Valid Coupon Batch Id"));
    }
    const allCouponCodes = await CouponCode.findAll({
      where: {
        couponBatchId: req.body.couponBatchId
      },
      order: [
        ['id', 'DESC'],
      ],
    });
    res.status(200).json({
      error: false,
      message: "All-Coupon-Codes-In-Batch found Successfully...!",
      count: allCouponCodes.length,
      data: { allCouponCodeInBatch: allCouponCodes },
    });
  } catch (error) {
    console.error("Get-All-Coupon-Code-In-Batches Error:", error.message);
    next(error);
  }
};

export const getAllCouponCodes = async (req, res, next) => {
  try {
    const allCouponCodes = await CouponCode.findAll({
      where: {
        isActive: "Active",
        status: 'Inuse'
      },
      order: [
        ['id', 'DESC'],
      ],
    });
    res.status(200).json({
      error: false,
      message: "All-Coupon-Codes found Successfully...!",
      count: allCouponCodes.length,
      data: { allCouponCodes: allCouponCodes },
    });
  } catch (error) {
    console.error("Get-All-Coupon-Codes Error:", error.message);
    next(error);
  }
};

export const getAllActiveCouponCodes = async (req, res, next) => {
  try {
    const allCouponCodes = await CouponCode.findAll({
      where: {
        isActive: "Active",
      },
    });
    res.status(200).json({
      error: false,
      message: "All-Active-Coupon-Codes found Successfully...!",
      count: allCouponCodes.length,
      data: { activeCouponCodes: allCouponCodes },
    });
  } catch (error) {
    console.error("Get-All-Active-Coupon-Codes Error:", error.message);
    next(error);
  }
};

export const getAllDeactiveCouponCodes = async (req, res, next) => {
  try {

    if (!req.body.page || req.body.page === "") {
      return next(createError(403, "Please Give the page Number...!"))
    }
    const page = req.body.page;
    const limit = req.body.limit || 10;
    let offset = limit * (page - 1);

    let sort = !req.body?.sortBy ? "DESC" : req.body?.sortBy == "ascending" ? "ASC" : "DESC"

    const allCouponCodes = await CouponCode.findAll({
      where: {
        isActive: "Inactive"
      },
      limit: limit,
      offset: offset,
      order: [
        ['id', sort],
      ],
    });
    const totalInactiveCoupons = await CouponCode.count();

    res.status(200).json({
      error: false,
      message: "All-Inactive-Coupon-Codes found Successfully...!",
      count: allCouponCodes.length,
      totalInactiveCoupons:totalInactiveCoupons, 
      data: { deactiveCouponCodes: allCouponCodes },
    });
  } catch (error) {
    console.error("Get-All-Inactive-Coupon-Codes Error:", error.message);
    next(error);
  }
};

export const getCouponCodeById = async (req, res) => {
  try {
    if (!req.body.id || req.body.id === "") {
      return next(createError(403, "Enter the Valid Id"));
    }
    const getCouponCode = await CouponCode.findOne({
      where: {
        id: req.body.id,
      },
      raw: true,
    });
    res.status(200).json({
      error: false,
      message: "Coupon Code found Successfully...!",
      data: { coupon: getCouponCode },
    });
  } catch (error) {
    console.error("Get-Coupon-Code Error:", error.message);
    next(error);
  }
};

export const updateCouponCodeById = async (req, res, next) => {
  try {
    if (!req.body.id || req.body.id === "") {
      return next(createError(403, "Enter the Valid Id"));
    } else if (!req.body.productName || req.body.productName === "") {
      return next(createError(403, "Enter the product Name"));
    } else if (!req.body.productSku || req.body.productSku === "") {
      return next(createError(403, "Enter the product sku"));
    } else if (!req.body.description || req.body.description === "") {
      return next(createError(403, "Enter the Valid Description"));
    } else if (!req.body.noOfCoupon || req.body.noOfCoupon <= 0) {
      return next(createError(403, "Enter the valid No. Of Coupon"));
    } else if (!req.body.rewardPoint || req.body.rewardPoint <= 0) {
      return next(createError(403, "Enter the valid reward Point"));
    }
    // let expiry = req.body.expiryDays;
    // if(req.body.timeline==="Days" && (isNaN(expiry) || expiry <= 0)){
    //   return next(createError(403, "Enter the Valid Expiry Days"));
    // }
    // if(req.body.timeline==="Date" && req.body.startDate===""){
    //   return next(createError(403, "Enter the Valid Start Date"));
    // }
    if (!req.body.startDate || req.body.startDate === "") {
      return next(createError(403, "Enter the Valid Start Date"));
    }
    else if (!req.body.endDate || req.body.endDate === "") {
      return next(createError(403, "Enter the Valid End Date"));
    }
    let couponCodeObj = {
      productName: req.body.productName,
      productSku: req.body.productSku,
      description: req.body.description,
      rewardPoint: req.body.rewardPoint,
      isActive: req.body.isActive,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      updatedIstAt: DateTime(),
      updateByStaff: req.user.data.name
      //timeline:req.body.timeline,
      // code: req.body.code,
      // qrCode: "",
    };
    // if(req.body.timeline==="Date"){
    //   couponCodeObj.startDate= new Date(req.body.startDate);
    // }
    // else couponCodeObj.expiryDays = req.body.expiryDays;
    // couponCodeObj.qrCode = await generateQR(couponCodeObj.code); 
    const updatedCouponCode = await CouponCode.update(couponCodeObj, {
      where: {
        id: req.body.id,
      },
    });
    res.status(200).json({
      error: false,
      message: "Coupon Code Updated Successfully...!",
      data: updatedCouponCode,
    });
  } catch (error) {
    console.error("Coupon-Code-Update Error:", error.message);
    next(error);
  }
};

export const deleteCouponCodeById = async (req, res, next) => {
  try {
    if (!req.body.id || req.body.id === "") {
      return next(createError(403, "Enter the Valid Id"));
    }
    const deleteCouponCode = await CouponCode.destroy({
      where: { id: req.body.id },
    });
    return res.status(200).json({
      error: false,
      message: "Coupon Code Deleted  Successfully...!",
      data: deleteCouponCode,
    });
  } catch (error) {
    console.log("Coupon-Code-delete Error ::>>", error);
    next(error);
  }
};

export const makeCouponCodeActiveDeactive = async (req, res, next) => {
  try {
    if (!req.body.id || req.body.id === "") {
      return next(createError(403, "Enter the Valid Id"));
    }
    else if ((!req.body.isActive) || (req.body.isActive === "") || (req.body.isActive !== "Active" && req.body.isActive !== "Inactive")) {
      return next(createError(403, "Enter the Valid isActive"));
    }
    let couponCodeObj = {
      isActive: req.body.isActive,
      updatedIstAt: DateTime(),
      updateByStaff: req.user.data.name
    };
    const makeCouponActive = await CouponCode.update(couponCodeObj, {
      where: {
        id: req.body.id,
      },
    });
    res.status(200).json({
      error: false,
      message: "Coupon Code Active Inactive Successfully...!",
      data: makeCouponActive,
    });
  } catch (error) {
    console.error("Coupon-Code-Active-Inactive Error:", error.message);
    next(error);
  }
};

// export const  filterCouponCodes = async (req, res, next) => {
//   try {
//     // let productName = '%'+req.body.productName+'%';
//     // let productSku = '%'+req.body.productSku+'%';
//     // const startDate = req.body.startDate!=="" ? new Date(req.body.startDate) : new Date("2022-01-01");
//     // let makeEndDate = new Date(req.body.endDate);
//     // makeEndDate.setDate(makeEndDate.getDate()+1);
//     // const endDate = req.body.endDate!=="" 
//     //                 ? makeEndDate
//     //                 : new Date();

//     const productName = '%'+req.body.productName+'%';
//     const productSku = '%'+req.body.productSku+'%';
//     const startDate = req.body.startDate === "" ? "2022-01-01" : req.body.startDate;
//     const endDate = req.body.endDate === "" ? new Date().toISOString().slice(0, 10)  : req.body.endDate;;
//     console.log("Start Date ::>>",startDate);
//     console.log("End Date ::>>",endDate);
//     let isActive = req.body.isActive;
//     // if(isActive==='Active'){
//     //   isActive = "('Active')";
//     // }
//     // else if(isActive==='Inactive'){
//     //   isActive = "('Inactive')";
//     // }
//     // else{
//     //   isActive = "('Active' , 'Inactive')";
//     // }
//     isActive = isActive === 'Active' ? "('Active')" : isActive === 'Inactive' ? "('Inactive')" : "('Active', 'Inactive')";
//     console.log("isActive ::>>",isActive);

//     console.log("IsActive::>>",`SELECT * FROM couponcodes where isActive in ${isActive} AND startDate>='${startDate}' AND endDate<='${endDate}' AND  productName like'${productName}' AND productSku like'${productSku}'`);
//     const getCouponCodes = await Query(`SELECT * FROM couponcodes where isActive in ${isActive} AND startDate>='${startDate}' AND endDate<='${endDate}' AND  productName like'${productName}' OR productSku like'${productSku}'`);
//     // const getCouponCodes = await Query(`SELECT * FROM couponcodes where isActive in ${isActive} AND startDate>='2022-01-01T00:00:00.000Z' AND endDate<='2023-12-31T11:40:58.410Z' AND  productName like'${productName}' AND productSku like'${productSku}';`);
//     res.status(200).json({
//       error: false,
//       message: "Filter Coupon Code Successfully...!",
//       count : getCouponCodes.length,
//       data: getCouponCodes,
//     });
//   } catch (error) {
//     console.error("Filter-Coupon-Code Error:", error.message);
//     next(error);
//   }
// };

// export const filterCouponCodes = async (req, res, next) => {
//   try {
//     const productName = req.body.productName;
//     let productSku = req.body.productSku;
//     const startDate = req.body.startDate === "" ? "2022-01-01" : req.body.startDate;
//     const endDate = req.body.endDate === "" ? "2100-12-01" : req.body.endDate;
//     let isActive = req.body.isActive;
//     isActive = isActive === 'Active' ? "('Active')" : isActive === 'Inactive' ? "('Inactive')" : "('Active', 'Inactive')";
//     let subQuery = productName && productSku ?
//       `AND productName='${productName}' OR productSku='${productSku}'` :
//       productName ? `AND productName='${productName}'` : productSku ? `AND productSku='${productSku}'` : ``;
//     console.log(">>", `SELECT * FROM couponcodes where isActive in ${isActive} AND startDate>='${startDate}' AND endDate<='${endDate}' ${subQuery};`);
//     const getCouponCodes = await Query(`SELECT * FROM couponcodes where isActive in ${isActive} AND startDate>='${startDate}' AND endDate<='${endDate}' ${subQuery};`);
//     res.status(200).json({
//       error: false,
//       message: "Filter Coupon Code Successfully...!",
//       count: getCouponCodes.length,
//       data: getCouponCodes,
//     });
//   } catch (error) {
//     console.error("Filter-Coupon-Code Error:", error.message);
//     next(error);
//   }
// };

export const filterCouponCodes = async (req, res, next) => {
  try {
    const productName = req.body.productName;
    const productSku = req.body.productSku;
    const sDate = req.body.startDate === "" ? "2022-01-01" : req.body.startDate;
    const eDate = req.body.endDate === "" ? "3100-12-01" : req.body.endDate;
    const isActive = req.body.isActive;
    if(new Date(startDate)>new Date(endDate)){
      return next(createError(403, "Please enter the correct Date :: start date cannot exceed the end date  "));
    }
    const page = req.body.page || 1;
    const limit = req.body.limit || 20;
    const offset = limit * (page - 1);
    const startDate = new Date(sDate);
    const endDate = new Date(eDate);
    endDate.setDate(endDate.getDate()+1);
    let sort = !req.body?.sortBy ? "DESC" : req.body?.sortBy == "ascending" ? "ASC" : "DESC"
    let conditions = {
      isActive: isActive === 'Active' ? 'Active' : isActive === 'Inactive' ? 'Inactive' : ['Active', 'Inactive'],
      startDate: { [Op.gte]: startDate },
      endDate: { [Op.lte]: endDate },
      status: "Inuse"
    };
    if (productName) {
      conditions.productName = productName;
    }

    if (productSku) {
      conditions.productSku = productSku;
    }

    // console.log(">>", `SELECT * FROM couponcodes where isActive in ${isActive} AND startDate>='${startDate}' AND endDate<='${endDate}' ${subQuery};`);
    const search = req.body?.search;
    if(req.body?.search){
      conditions = {...conditions, [Op.or]:[
      {
        productName:{
          [Op.substring]:search
        }
      },
      {
        serialNo:{
          [Op.substring]:search
        }
      },
      {
        code:{
          [Op.substring]:search
        }
      }
      ],}
    }
    const getCouponCodes = await CouponCode.findAll({
      where: conditions,
      offset: offset,
      limit: limit,
      order: [['id', sort ]]
    });
    
    const totalCoupons = await CouponCode.count({
      where: conditions
    });
    // const totalCoupons = await CouponCode.count();

    res.status(200).json({
      error: false,
      message: "Filter Coupon Code Successfully...!",
      // count: couponCodeCount,
      totalCoupons,
      data: getCouponCodes,
    });
  } catch (error) {
    console.error("Filter-Coupon-Code Error:", error.message);
    next(error);
  }
};

export const filterUsedCouponCodes = async (req, res, next) => {
  try {
    const productName = req.body.productName;
    const productSku = req.body.productSku;
    const sDate = req.body.startDate === "" ? "2022-01-01" : req.body.startDate;
    const eDate = req.body.endDate === "" ? "3100-12-01" : req.body.endDate;
    const isActive = req.body.isActive;
    if (new Date(startDate) > new Date(endDate)) {
        return next(createError(403, "Please enter the correct Date: start date cannot exceed the end date"));
    }
    const page = req.body.page || 1;
    const limit = req.body.limit || 20;
    const offset = limit * (page - 1);
    const sort = !req.body?.sortBy ? "DESC" : req.body?.sortBy === "ascending" ? "ASC" : "DESC";
    const startDate = new Date(sDate);
    const endDate = new Date(eDate);
    endDate.setDate(endDate.getDate()+1);
    let whereClause = `WHERE status = 'Used' AND STR_TO_DATE(transactionTime, '%c/%e/%Y, %r') >= :startDate AND STR_TO_DATE(transactionTime, '%c/%e/%Y, %r') <= :endDate `;
    if (productName) {
        whereClause += `AND productName = :productName `;
    }
    if (productSku) {
        whereClause += `AND productSku = :productSku `;
    }
    const getCouponCodesQuery = `
        SELECT * FROM couponcodes 
        ${whereClause}
        ORDER BY id ${sort}
        LIMIT :limit OFFSET :offset;
    `;
    const totalCouponsQuery = `
        SELECT COUNT(*) as total FROM couponcodes 
        ${whereClause};
    `;
    const getCouponCodes = await sequelize.query(getCouponCodesQuery, {
        replacements: { startDate, endDate, productName, productSku, limit, offset },
        type: sequelize.QueryTypes.SELECT
    });
    const totalCoupons = await sequelize.query(totalCouponsQuery, {
        replacements: { startDate, endDate, productName, productSku },
        type: sequelize.QueryTypes.SELECT
    });
    res.status(200).json({
        error: false,
        message: "Filter Coupon Code Successfully...!",
        totalCoupons: totalCoupons[0].total,
        data: getCouponCodes,
    });
  } catch (error) {
      console.error("Filter-Coupon-Code Error:", error.message);
      next(error);
  }
};

export const filterCouponCodesToExport = async (req, res, next) => {
  try {
    const productName = req.body.productName;
    const productSku = req.body.productSku;
    const startDate = req.body.startDate === "" ? "2022-01-01" : req.body.startDate;
    const endDate = req.body.endDate === "" ? "2100-12-01" : req.body.endDate;
    const isActive = req.body.isActive;
    // console.log("Start Date::>>",startDate);
    if(new Date(startDate)>new Date(endDate)){
      return next(createError(403, "Please enter the correct Date :: start date cannot exceed the end date  "));
    }

    let sort = !req.body?.sortBy ? "DESC" : req.body?.sortBy == "ascending" ? "ASC" : "DESC"
    
    const conditions = {
      isActive: isActive === 'Active' ? 'Active' : isActive === 'Inactive' ? 'Inactive' : ['Active', 'Inactive'],
      startDate: { [Op.gte]: new Date(startDate) },
      endDate: { [Op.lte]: new Date(endDate) },
      status: "Inuse"
    };

    if (productName) {
      conditions.productName = productName;
    }

    if (productSku) {
      conditions.productSku = productSku;
    }

    console.log("Conditions ::>>",conditions);
    const getCouponCodes = await CouponCode.findAll({
      where: conditions,
      order: [['id', sort ]],
      raw:true
    });
    // console.log("GetCouponCodes::>>", getCouponCodes);
    res.status(200).json({
      error: false,
      message: "Filter Coupon Code Successfully...!",
      count: getCouponCodes.length,
      data: getCouponCodes,
    });
  } catch (error) {
    console.error("Filter-Coupon-Code Error:", error.message);
    next(error);
  }
};

export const searchCouponCodes = async (req, res, next) => {
  try {
    const search = req.body.search.trim();
    if(!search || search===""){
      return next(createError(403, "Please given the valid search value...!"));
    }
    // console.log("search::>>",search)
    const page = req.body.page || 1;
    const limit = req.body.limit || 10;
    const offset = limit * (page-1);
    let getCouponCodes = await CouponCode.findAll({
      where: {
        [Op.or]:[
          {
            productName:{
              [Op.substring]:search
            }
          },
          {
            serialNo:{
              [Op.substring]:search
            }
          },
          {
            code:{
              [Op.substring]:search
            }
          }
      ],
        status: "Inuse"
      },
      limit,
      offset,
      raw: true
    });
    const totalCoupons = await CouponCode.count({
      where: {
        [Op.or]:[
          {
            productName:{
              [Op.substring]:search
            }
          },
          {
            serialNo:{
              [Op.substring]:search
            }
          },
          {
            code:{
              [Op.substring]:search
            }
          }
      ],
        status: "Inuse"
      },
    });
    res.status(200).json({
      error: false,
      message: "Search Coupon Code Successfully...!",
      count: getCouponCodes.length,
      totalCoupons,
      data: getCouponCodes,
    });
  } catch (error) {
    console.error("Search-Coupon-Code Error:", error.message);
    next(error);
  }
};

export const searchUsedCouponCodes = async (req, res, next) => {
  try {
    const search = req.body.search.trim();
    if(!search || search===""){
      return next(createError(403, "Please given the valid search value...!"));
    }
    // console.log("search::>>",search)
    const page = req.body.page || 1;
    const limit = req.body.limit || 10;
    const offset = limit * (page-1);
    let getCouponCodes = await CouponCode.findAll({
      where: {
        [Op.or]:[
          {
            productName:{
              [Op.substring]:search
            }
          },
          {
            serialNo:{
              [Op.substring]:search
            }
          },
          {
            code:{
              [Op.substring]:search
            }
          },
          {
            contactNo : {
              [Op.substring]:search
            }
          },
          {
            email : {
              [Op.substring]:search
            }
          },
          {
            pin : {
              [Op.substring]:search
            }
          },
          {
            productSku : {
              [Op.substring]:search
            }
          },
          {
            accountId : {
              [Op.substring]:search
            }
          }
      ],
        status : "Used"
      },
      limit,
      offset,
      raw: true
    });
    const totalCoupons = await CouponCode.count({
      where: {
        [Op.or]:[
        {
          productName:{
            [Op.substring]:search
          }
        },
        {
          serialNo:{
            [Op.substring]:search
          }
        },
        {
          code:{
            [Op.substring]:search
          }
        },
        {
          contactNo : {
            [Op.substring]:search
          }
        },
        {
          email : {
            [Op.substring]:search
          }
        },
        {
          pin : {
            [Op.substring]:search
          }
        },
        {
          productSku : {
            [Op.substring]:search
          }
        },
        {
          accountId : {
            [Op.substring]:search
          }
        }
        ],
        status : "Used"
      }
  });
    res.status(200).json({
      error: false,
      message: "Search Coupon Code Successfully...!",
      count: getCouponCodes.length,
      totalCoupons,
      data: getCouponCodes,
    });
  } catch (error) {
    console.error("Search-Coupon-Code Error:", error.message);
    next(error);
  }
};

export const searchByproductNameproductSKu = async (req, res, next) => {
  try {
    let search = '%' + req.body.search + '%';
    // console.log("search::>>",search)
    let getCouponCodes;
    getCouponCodes = await CouponCode.findAll({
      where: {
        productName: {
          [Op.like]: search
        }
      },
      raw: true
    });
    if (getCouponCodes.length === 0) {
      getCouponCodes = await CouponCode.findAll({
        where: {
          productSku: {
            [Op.like]: search
          }
        },
        raw: true
      });
    }
    res.status(200).json({
      error: false,
      message: "Search Coupon Code Successfully...!",
      count: getCouponCodes.length,
      data: getCouponCodes,
    });
  } catch (error) {
    console.error("Search-Coupon-Code Error:", error.message);
    next(error);
  }
};

export const deleteSelectedCouponCodes = async (req, res, next) => {
  try {
    if(!req.body.ids || !Array.isArray(req.body.ids) || req.body.ids.length<=0){
      return next(createError(403, "Please given the Ids...!"));
    }
    const ids = req.body.ids;
    // console.log("Ids::>>",ids);
    const deleteRows = ids.map(async (id) => {
      return await CouponCode.destroy({
        where: {
          id: id.id
        }
      });
    })
    const getCouponCodes = await Promise.all(deleteRows);
    res.status(200).json({
      error: false,
      message: "Delete Coupon Codes Successfully...!",
      data: getCouponCodes,
    });
  } catch (error) {
    console.error("Delete--Coupon-Code Error:", error.message);
    next(error);
  }
};

export const getLastSerialNumber = async (req, res, next) => {
  try {
    let getSerialNo = await getSerialNumber();
    res.status(200).json({
      error: false,
      message: "Get Serial Number of Coupon Codes Successfully...!",
      data: getSerialNo,
    });
  } catch (error) {
    console.error("Get-Last-Serial-No-of-Coupon-Code Error:", error.message);
    next(error);
  }
}


export const redeemPoints = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { sellerId, code, serialNo, pin } = req.body;
    if(!serialNo || serialNo===""){
      return next(createError(403, "Please Enter a Valid Serial Number!"));
    }
    else if(!code || code===""){
      return next(createError(403, "Please Enter a Valid Coupon Code!"));
    }
    const today = new Date();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();
    const yyyy = today.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    const formattedToday = yyyy + '-' + mm + '-' + dd;
    const getCoupon = await CouponCode.findOne({
      where: {
        code: code,
        serialNo: serialNo
      },
      raw: true
    });
    //console.log("getCoupon ::>>", getCoupon);
    if (!getCoupon) {
      return next(createError(404, "Invalid QR code, please re-enter the Coupon Code/Serial No."));
    }
    if (getCoupon.isActive === 'Inactive') {
      return next(createError(404, "Invalid QR code, please re-enter the Coupon Code/Serial No."));
    }
    if (getCoupon.status === 'Used') {
      return next(createError(404, "Already scanned"));
    }
    if (getCoupon.status === 'Expired' || new Date(formattedToday) > getCoupon.endDate) {
      return next(createError(404, "Invalid QR code, please re-enter the Coupon Code/Serial No."));
    }
    if (pin && getCoupon.pin !== pin) {
      return next(createError(403, "Incorrect Serial Number or Code or Pin, Please re-try."))
    }
    const sellerQuery = `SELECT * FROM sellers AS sd INNER JOIN sellerinfos AS si ON sd.id=si.sellerId WHERE sd.id='${sellerId}'`;
    let seller = await sequelize.query(sellerQuery,{
      replacements:[],
      type:Sequelize.QueryTypes.SELECT
    });
    seller = seller[0];
    if (!seller) {
      return next(createError(404, "Goes wrong for earn points...!"));
    }
    //check for coupon limit of coupon earn
    const query = `SELECT COUNT(*) AS count FROM transactions AS t WHERE t.status='Earn' AND t.transactionCategory='CouponRedeem' AND t.createdAt>CURDATE() AND t.sellerId='${sellerId}'`
    const getTodayTransaction = await sequelize.query(query,{
      replacements:[],
      type:Sequelize.QueryTypes.SELECT  
    });
    if(Number(COUPON_EARNED_LIMIT)<=Number(getTodayTransaction[0].count)){
      return next(createError(403, "Today's limit for coupons earned has been exceeded."));
    }
    // console.log("Get Seller ::>>",getSeller);
    let totalPoints = seller.totalPoints;
    totalPoints += getCoupon.rewardPoint;
    let availablePoints = seller.availablePoints;
    availablePoints += getCoupon.rewardPoint;
    let earnedPoints = seller.earnedPoints;
    earnedPoints += getCoupon.rewardPoint;
    let finacialPoints = seller.finacialPoints;
    finacialPoints += getCoupon.rewardPoint;
    //console.log(seller.points, points, getCoupon.rewardPoint);
    const transactionObj = {
      transactionId: generateTransactionId(),
      sellerId: sellerId,
      transactionCategory:'CouponRedeem',
      couponId:getCoupon.id,
      code: getCoupon.code,
      serialNo: getCoupon.serialNo,
      status: 'Earn',
      points: getCoupon.rewardPoint,
      createdIstAt: DateTime(),
      updatedIstAt: DateTime()
    };
    const newTransaction = await Transaction.create(transactionObj,{transaction});
    const sellerInfoUpdateObj = {
      totalPoints,
      availablePoints,
      earnedPoints,
      finacialPoints
    };
    if(seller.activityStatus==='NotFullfilled'){
      sellerInfoUpdateObj.activityStatus = 'Fullfilled';
      await SellerGracePeriodRecord.update({
        activityStatus:'Fullfilled'
      },{
        where:{
          sellerId:sellerId,  
          activityStatus:'NotFullfilled'
        },
        transaction
      });
    }
    const updatePoints = await SellerInfo.update(sellerInfoUpdateObj, {
      where: {
        sellerId: sellerId
      },
      transaction
    });
    const lastDeviceUsed = await SellerLoggingHistory.findOne({
      attributes:['browserName','operatingSystem','device'],
      where:{
        sellerId
      },
      sort:[
        ['id','DESC']
      ],
      raw:true
    });
    const updateCoupon = await CouponCode.update({
      status: "Used",
      device:lastDeviceUsed,
      sellerId:sellerId,
      email:seller.email,
      accountId:seller.accountId,
      contactNo:seller.contactNo,
      transactionTime: DateTime()
    }, {
      where: {
        code: code
      },
      transaction
    });
    const dateAfter18Months = new Date();
    dateAfter18Months.setMonth(dateAfter18Months.getMonth()+19);
    const entryForGracePeriod = await SellerGracePeriodPointRecord.create({
      sellerId,
      accountId:seller.accountId,
      contactNo:seller.contactNo,
      transactionId:newTransaction.transactionId,
      membershipLevel:seller.membershipLevel,
      points:getCoupon.rewardPoint,
      deductPoints:getCoupon.rewardPoint,
      actionOnDate:dateAfter18Months,
      activityStatus:'NotFullfilled',
      gracePeriodFor:'Points',
      createdIstAt:DateTime(),
      updatedIstAt:DateTime()
    },{transaction});
    await transaction.commit();
    // console.log("Update Seller ::>>", updatePoints);
    // console.log("Update Coupon ::>>", updateCoupon);
    // console.log("Request ::>>", req.user);
    
    // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>",req.user.data); 
    if(req?.user?.data?.email){
      RewardPointUpdateMail(req.user.data.firstName+" "+req.user.data.lastName, req.user.data.email, getCoupon.rewardPoint, totalPoints);
    }
    sent_reward_points_update_whatsapp(req.user.data.contactNo, req.user.data.firstName+" "+req.user.data.lastName, totalPoints, getCoupon.rewardPoint )
    rewardPointsEarn(req.user.data.firstName+" "+req.user.data.lastName, getCoupon.rewardPoint, totalPoints, req.user.data.contactNo )

    res.status(200).json({
      error: false,
      message: `Congratulations! You have earned ${getCoupon.rewardPoint} points`,
      data: updatePoints[0] + updateCoupon[0],
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Coupon-Code-Redeem Error:", error.message);
    next(error);
  }
};

export const couponVerify = async (req, res, next) => {
  try {
    const { code, serialNo, pin } = req.body;
    if(!serialNo || serialNo===""){
      return next(createError(403, "Please given the valid serail number...!"));
    }
    else if(!code || code===""){
      return next(createError(403, "Please given the valid code...!"));
    }
    // const getCoupon = await CouponCode.findOne({
    //   where:{
    //     code:code
    //   },
    //   raw:true
    // });
    const getCoupon = await Query(`Select * from couponcodes where code='${code}' AND serialNo='${serialNo}'`);
    console.log("getCoupon ::>>", getCoupon);
    if (getCoupon.length === 0) {
      return next(createError(404, "Invalid Coupon...!"));
    }
    if (getCoupon[0].isActive === 'Inactive') {
      return next(createError(404, "You coupon is not valid...!"));
    }
    if (getCoupon[0].status === 'Expired') {
      return next(createError(404, "You coupon has been already used...!"));
    }
    // if (getCoupon[0].pin !== pin) {
    //   return next(createError(404, "You coupon not verified...!"));
    // }
    res.status(200).json({
      error: false,
      message: "Coupon Code Verify Successfully...!",
      data: 1,
    });
  } catch (error) {
    console.error("Coupon-Code-Verify Error:", error.message);
    next(error);
  }
};

export const changeStatusOfCouponBatch = async (req, res, next) => {
  try {
    const { couponBatchId, isActive } = req.body;
    if(!couponBatchId || couponBatchId===""){
      return next(createError(403, "Please given the valid Coupon Batch Id...!"));
    }
    else if(!isActive || isActive==="" || (isActive!=='Active' && isActive!=='Inactive')){
      return next(createError(403, "Please given the valid Coupon Batch Id...!"));
    }
    const updateCoupons = await CouponCode.update({
      isActive: isActive,
      updatedIstAt: DateTime(),
      updateByStaff: req.user.data.name
    }, {
      where: {
        couponBatchId: couponBatchId
      }
    })
    res.status(200).json({
      error: false,
      message: "Coupon Batch update Successfully...!",
      data: updateCoupons,
    });
  } catch (error) {
    console.error("Coupon-Batch-update-status Error:", error.message);
    next(error);
  }
};

export const getAllUsedCouponByP = async (req, res, next) => {
  try {
    if (!req.body.page || req.body.page === "" || req.body.page < 0) {
        return next(createError(403, "Please give a valid page number...!"));
    }
    const sDate = req.body.startDate === "" ? "2022-01-01" : req.body.startDate;
    const eDate = req.body.endDate === "" ? "3100-12-01" : req.body.endDate;
    const page = req.body.page || 1;
    const limit = req.body.limit || 10;
    const offset = limit * (page - 1);
    const search = req.body?.search;
    const startDate = new Date(sDate);
    const endDate = new Date(eDate);
    endDate.setDate(endDate.getDate()+1);
    let whereClause = "WHERE status = 'Used' AND STR_TO_DATE(transactionTime, '%c/%e/%Y, %r') >= :startDate AND STR_TO_DATE(transactionTime, '%c/%e/%Y, %r') <= :endDate";
    if (search) {
        whereClause += ` AND (
            productName LIKE '%${search}%' OR
            serialNo LIKE '%${search}%' OR
            code LIKE '%${search}%' OR
            contactNo LIKE '%${search}%' OR
            email LIKE '%${search}%' OR
            pin LIKE '%${search}%' OR
            productSku LIKE '%${search}%' OR
            accountId LIKE '%${search}%'
        )`;
    }
    const query = `
        SELECT * 
        FROM couponcodes 
        ${whereClause}
        ORDER BY id DESC
        LIMIT :limit OFFSET :offset
    `;
    const countQuery = `
        SELECT COUNT(*) as totalCoupons 
        FROM couponcodes 
        ${whereClause}
    `;
    const getAllUsedCoupon = await sequelize.query(query, {
        replacements: { limit, offset,startDate, endDate },
        type: Sequelize.QueryTypes.SELECT
    });
    const countResult = await sequelize.query(countQuery, {
        replacements: { startDate, endDate },
        type: Sequelize.QueryTypes.SELECT
    });
    const totalUsedCoupons = countResult[0].totalCoupons;
    res.status(200).json({
        error: false,
        message: "Get All Used Coupons found Successfully...!",
        count: getAllUsedCoupon.length,
        totalCoupons: totalUsedCoupons,
        data: getAllUsedCoupon,
    });
} catch (error) {
    console.error("Get-All-Used-Coupons Error:", error.message);
    next(error);
}

};

export const getAllExpiredCouponByP = async (req, res, next) => {
  try {
    if(!req.body.page || req.body.page==="" || req.body.page<0){
      return next(createError(403, "Please given the valid page number...!"));
    }
    const page = req.body.page || 1;
    const limit = req.body.limit || 10;
    const offset = limit * (page - 1);
    const getAllExpiredCoupon = await CouponCode.findAll({
      where: {
        status: 'Expired'
      },
      offset: offset,
      limit: limit,
      order: [
        ['id', 'DESC'],
      ]
    });
    const totalExpiredCoupons = await CouponCode.count({
      where: {
        status: 'Expired',
      }
    });
    res.status(200).json({
      error: false,
      message: "Get All Expired Coupons found Successfully...!",
      count: getAllExpiredCoupon.length,
      totalExpiredCoupons,
      data: getAllExpiredCoupon,
    });
  } catch (error) {
    console.error("Get-All-Expired-Coupons Error:", error.message);
    next(error);
  }
};

//------| for cron task api |-----------
export const couponCodesGetExpired = async (req, res, next) => {
  try {
    const today = new Date();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();
    const yyyy = today.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    const formattedToday = yyyy + '-' + mm + '-' + dd;
    const date = new Date(formattedToday);
    const expiredCouponsIds = await CouponCode.findAll({
      attributes: ['id'],
      where: {
        status: 'Inuse',
        endDate: {
          [Op.lt]: date
        }
      }
    });
    const expired = expiredCouponsIds.map(async (id) => { 
      const updateCoupon = await CouponCode.update({
        status: 'Expired',
        isActive: 'Inactive',
        transactionTime: DateTime()
      }, {
        where: {
          id: id.id
        }
      });
      return updateCoupon;
    })
    const expiredCoupons = await Promise.all(expired);
    res.status(200).json({
      error: false,
      message: expiredCoupons.length === 0 ? "Empty" : "Coupon Code Has Expired Successfully...!",
      data: expiredCoupons.length
    });
  } catch (error) {
    console.error("Coupon-Codes-Expired-Error:", error.message);
    next(error);
  }
};

export const couponCodesGetExpiredFunc = async () => {
  try {
    const today = new Date();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();
    const yyyy = today.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    const formattedToday = yyyy + '-' + mm + '-' + dd;
    const date = new Date(formattedToday);
    const expiredCouponsIds = await CouponCode.findAll({
      attributes: ['id'],
      where: {
        status: 'Inuse',
        endDate: {
          [Op.lt]: date
        }
      }
    });
    const expired = expiredCouponsIds.map(async (id) => { 
      const updateCoupon = await CouponCode.update({
        status: 'Expired',
        isActive: 'Inactive',
        transactionTime: DateTime()
      }, {
        where: {
          id: id.id
        }
      });
      return updateCoupon;
    })
    const expiredCoupons = await Promise.all(expired);
    return {
      error: false,
      message: expiredCoupons.length === 0 ? "Empty! No coupan available for expire" : "Coupon Code Has Expired Successfully...!",
      data: expiredCoupons.length
    };
  } catch (error) {
    console.error("Coupon-Codes-Expired-Error:", error.message);
  }
};

export const deleteSelectedExpiredCoupons = async (req, res, next) => {
  try {
    if(!req.body.ids || !Array.isArray(req.body.ids) || req.body.ids.length<=0){
      return next(createError(403, "Please given the Ids...!"));
    }
    const { ids } = req.body;
    // console.log("Ids::>>",ids);
    const deleteRows = ids.map(async (id) => {
      return await CouponCode.destroy({
        where: {
          id: id.id,
          status: 'Expired'
        }
      });
    })
    const getCouponCodes = await Promise.all(deleteRows);
    res.status(200).json({
      error: false,
      message: "Delete Expired Coupon Codes Successfully...!",
      data: getCouponCodes,
    });
  } catch (error) {
    console.error("Delete--Expired Coupon-Code Error:", error.message);
    next(error);
  }
};



const outputCouponData = require("../assests/coupons/output.json");
export const getOutputCouponJson = (req, res) => {
  res.json({ count: outputCouponData.length, data: outputCouponData });
};

export const generateBulkCoupon = async (req, res) => {
  //generate coupon through commands
  //  const command = 'npm run generate-codes';
  // const command=`discount-code-gen -i ./src/assests/coupons/input.json -o ./src/assests/coupons/output.json -q ${req.body.noOfCoupon} -l 9 -p COUP`;
  //  const result = await exec(command, (error, stdout, stderr) => {
  //   if (error) {
  //     console.error(`Error: ${error.message}`);
  //     return;
  //   }
  //   if (stderr) {
  //     console.error(`stderr: ${stderr}`);
  //     return;
  //   }
  //   console.log(`Output: ${stdout}`);
  // });
  let charset = "0123456789";
  const couponsCodesData = voucher_codes.generate({
    prefix: '',
    postfix: '',
    pattern: '#########',
    length: 4,
    count: req.body.noOfCoupon,
    charset: charset,
  });
  res.status(200).json({
    error: false,
    message: "Coupons generated Successfully...!",
    count: couponsCodesData.length ? couponsCodesData.length : '',
    data: couponsCodesData ? couponsCodesData : ''
  });
};

export const generateCouponsbyN = async (req, res, next) => {
  try {
    if (req.body.productName === "") {
      return next(createError(403, "Enter the product Name"));
    } else if (req.body.productSku === "") {
      return next(createError(403, "Enter the product sku"));
    } else if (req.body.description === "") {
      return next(createError(403, "Enter the Description Name"));
    } else if (req.body.noOfCoupon <= 0) {
      return next(createError(403, "Enter the valid No. Of Coupon"));
    } else if (req.body.rewardPoint <= 0) {
      return next(createError(403, "Enter the valid reward Point"));
    }
    // let expiry = req.body.expiryDays;
    // if(req.body.timeline==="Days" && (isNaN(expiry) || expiry <= 0)){
    //   return next(createError(403, "Enter the Valid Expiry Days"));
    // }
    // if(req.body.timeline==="Date" && req.body.startDate===""){
    //   return next(createError(403, "Enter the Valid Start Date"));
    // }
    if (req.body.startDate === "") {
      return next(createError(403, "Enter the Valid Start Date"));
    }
    else if (req.body.endDate === "") {
      return next(createError(403, "Enter the Valid End Date"));
    }

    if (!req.body.startTime || req.body.startTime === "") {
      return next(createError(403, "Enter the Valid Start Time"));
    }
    else if (!req.body.endTime || req.body.endTime === "") {
      return next(createError(403, "Enter the Valid End Time"));
    }
    const couponSetting = await CouponSetting.findOne({
      where: {
        id: 1,
      },
      raw: true,
    });
    //console.log("Coupon-Setting ::>>",couponSetting);
    let charset =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const type = couponSetting.charset;
    if (type === "Numbers") {
      charset = "0123456789";
    } else if (type === "Alphabetic") {
      charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }

    const couponsCodesData = outputCouponData;
    console.log("couponsCodesData ::>>", couponsCodesData);
    //   testing coupon Codes
    //   res.status(200).json({
    //         error:false,
    //         message:"Coupons generated Successfully...!",
    //         data:{coupon:couponsCodesData}
    //     });

    let getSerialNo = await getSerialNumber();
    // console.log("Last Serail No ::>>", getSerialNo);
    let srNo = Number(getSerialNo);
    // console.log("Last Serail No ::>>", srNo);
    let zero = "000000000";
    srNo += 1;
    //coupn batch
    let sn = srNo + "";
    const couponBatchObj = {
      productName: req.body.productName.trim(),
      productSku: req.body.productSku.trim(),
      description: req.body.description.trim(),
      rewardPoint: req.body.rewardPoint,
      noOfCoupon: req.body.noOfCoupon,
      serialNo: zero.substring(0, zero.length - sn.length) + sn,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      createdIstAt: DateTime(),
      updatedIstAt: DateTime(),
      updateByStaff: req.user.data.name
    };
    const couponBatch = await CouponBatch.create(couponBatchObj);
    // console.log("Coupon Batch ::>>", couponBatch);
    //coupon codes
    const getCouponCodes = couponsCodesData.map(async (data) => {
      let sr = srNo + "";
      // console.log("sr::>>",sr); 
      let couponCodeObj = {
        couponBatchId: couponBatch.id,
        productName: req.body.productName.trim(),
        productSku: req.body.productSku.trim(),
        description: req.body.description.trim(),
        rewardPoint: req.body.rewardPoint,
        noOfCoupon: req.body.noOfCoupon,
        serialNo: zero.substring(0, zero.length - sr.length) + sr,
        code: data.code,
        pin: generatePin(),
        qrCode: "",
        isActive: "Active",
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        createdIstAt: DateTime(),
        updatedIstAt: DateTime(),
        updateByStaff: req.user.data.name

        // timeline:req.body.timeline,  
      };
      // if(req.body.timeline==="Date"){
      srNo = srNo + 1;
      //   couponCodeObj.startDate= new Date(req.body.startDate);
      // }
      // else couponCodeObj.expiryDays = req.body.expiryDays;
      // console.log("Serial No ::>>",couponCodeObj.serialNo);  
      const text = `${viewUrl}/${couponCodeObj.code}/${couponCodeObj.serialNo}/${couponCodeObj.pin}`;
      couponCodeObj.qrCode = await generateQR(text);
      const newCouponCode = await CouponCode.create(couponCodeObj);
      // console.log("srNO::>>",srNo);
      return newCouponCode;
    });

    const allCouponCodes = await Promise.all(getCouponCodes);
    res.status(200).json({
      error: false,
      message: "Coupons generated Successfully...!",
      data: { coupon: allCouponCodes },
    });
  }
  catch (error) {
    console.log("Generate-Coupons Error ::>> ", error.message);
    next(error);
  }
};

export const getCountOfAllCoupons = async (req, res, next) => {
  try{
 
     const allCount = await CouponCode.count({});
 
   
     res.status(200).json({
       error: false,
       message: "Coupons count successfully",
       data: { couponCount: allCount }
     });
   }
   catch (error) {
     console.log("Coupons count Error ::>> ", error.message);
     next(error);
   }
 };
//  const excelDateToJSDate = (serial,timeString) => {
//     const startDate = new Date(1899, 11, 30);
//     const millisecondsPerDay = 86400000; 
//     const days = Math.floor(serial);
//     const date = new Date(startDate.getTime() + (days * millisecondsPerDay));
//     if (timeString) {
//       const [hours, minutes] = timeString.split(':').map(Number);
//       date.setHours(hours, minutes, 0, 0);
//     } else {
//       date.setHours(0, 0, 0, 0);
//     }
//     return date;
//   };
const excelDateToJSDate = (serial, timeDecimal) => {
  const startDate = new Date(1899, 11, 30);
  const millisecondsPerDay = 86400000;
  const days = Math.floor(serial);
  const date = new Date(startDate.getTime() + (days * millisecondsPerDay));
  if (timeDecimal !== undefined) {
      const totalSeconds = timeDecimal * 86400;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);
      date.setHours(hours, minutes, seconds, 0);
  } else {
      date.setHours(0, 0, 0, 0);
  }
  return date;
};

function decimalToTimeString(decimal) {
  const totalSeconds = decimal * 86400;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');
  return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
}

 export const importCouponFile = async (req, res, next)=>{
  const transaction = await sequelize.transaction();
  try {
    const filePath = path.join(__dirname, '../../../assests/images/', req.couponFile['filePath']);
    const workSheetsFromFile = xlsx.parse(filePath);
    const sheet = workSheetsFromFile[0].data;
    const startDate = excelDateToJSDate(sheet[1][6], sheet[1][8]);
    const endDate = excelDateToJSDate(sheet[1][7], sheet[1][9]);
    const couponBatchObj = {
      productName: sheet[1][0],
      productSku: sheet[1][1],
      description: sheet[1][2],
      serialNo: sheet[1][3],
      noOfCoupon: sheet.length-1,
      rewardPoint: Number(sheet[1][5]),
      startDate,
      endDate,
      startTime: decimalToTimeString(sheet[1][8]),
      endTime: decimalToTimeString(sheet[1][9]),
      remarks:'Code by DS Group',
      createdIstAt: DateTime(),
      updatedIstAt: DateTime(),
      updateByStaff: req.user.data.name
    };
    const couponBatch = await CouponBatch.create(couponBatchObj,{transaction});
    const data = [];
    let countData = 0;

    // for checking dublicates data present or not
    const temp_data = [];
    for(let i=1;i<sheet.length;i++){
      if(sheet[i].length){
      let couponCodeObj = {
        serialNo: sheet[i][3],
        code: sheet[i][4],
        createdIstAt: DateTime(),
        updatedIstAt: DateTime()
      };
      temp_data.push(couponCodeObj);
      }
    }

    await TempCouponCode.bulkCreate(temp_data);

    const queryCoupon = `
        SELECT tcc.*
        FROM tempcouponcodes tcc
        JOIN couponcodes cc
        ON tcc.code = cc.code OR tcc.serialNo = cc.serialNo;
    `;

    const [results1, metadata1] = await sequelize.query(queryCoupon);

    if(results1.length !== 0)
    {
      await TempCouponCode.destroy({ truncate: true });
      await transaction.rollback();
      return res.status(403).json({
        error:false,
        message:`${results1.length} Duplicate Coupons found from coupon code!`,
        duplicateCount: results1.length
      });
    }

    const queryTransaction = `
        SELECT tcc.*
        FROM tempcouponcodes tcc
        JOIN transactions tran
        ON tcc.code = tran.code OR tcc.serialNo = tran.serialNo;
    `;

    const [results2, metadata2] = await sequelize.query(queryTransaction);

    if(results2.length !== 0)
    {
      await TempCouponCode.destroy({ truncate: true });
      await transaction.rollback();
      return res.status(403).json({
        error:false,
        message:`${results2.length} Duplicate Coupons found from transaction!`,
        duplicateCount: results2.length
      });
    }

    await TempCouponCode.destroy({ truncate: true });

    // for actual inserting data into table
    for(let i=1;i<sheet.length;i++){
      if(sheet[i].length){
      countData++;
      const startDate = excelDateToJSDate(sheet[i][6], sheet[i][8]);
      const endDate = excelDateToJSDate(sheet[i][7], sheet[i][9]);
      let couponCodeObj = {
        couponBatchId: couponBatch.id,
        productName: sheet[i][0],
        productSku: sheet[i][1],
        description: sheet[i][2],
        serialNo: sheet[i][3],
        code: sheet[i][4],
        rewardPoint: Number(sheet[i][5]),
        noOfCoupon: sheet.length-1,
        pin: generatePin(),
        qrCode: "",
        isActive: "Active",
        startTime: decimalToTimeString(sheet[i][8]),
        endTime: decimalToTimeString(sheet[i][9]),
        startDate,
        endDate,
        remarks:'Code by DS Group',
        createdIstAt: DateTime(),
        updatedIstAt: DateTime(),
        updateByStaff: req.user.data.name,
      };
      const text = `${viewUrl}/${sheet[i][4]}/${sheet[i][3]}`;
      couponCodeObj.qrCode = await generateQR(text);
      data.push(couponCodeObj);
      }
    }
    await CouponCode.bulkCreate(data,{transaction});
    await CouponBatch.update({
      noOfCoupon:countData
    },{
      where:{
        id:couponBatch.id
      },
      transaction
    });
    await CouponCode.update({
      noOfCoupon:countData
    },{
      where:{
        couponBatchId:couponBatch.id
      },
      transaction
    });
    await transaction.commit();
    unlinkSync(filePath);
    return res.status(200).json({
      error:false,
      message:'Coupons Imported Successfully!',
      data:req.couponFile,
      countData: countData,
      sheet
    });
  } catch (error) {
    await transaction.rollback();
    console.log("Import Coupon Error ::>>", error);
    next(error);
  }
 }
