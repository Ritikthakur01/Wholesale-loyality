import { createError } from "../../utils/error";
import { PreviousSeller, Seller, SellerGracePeriodPointRecord, SellerGracePeriodRecord, SellerInfo, SellerMembershipTrack, SellerShippingAddress } from "../models/Seller";
import bcrypt from "bcryptjs";
import generateSalt from "../../utils/constant/generateSalt";
import sequelize from "../../utils/db/dbConnection";
import Query from "../../utils/db/rawQuery";
import { Transaction } from "../models/Transaction";
import DateTime from "../../utils/constant/getDate&Time";
import { sent_birthday_wishes_whatsapp, sent_otp_for_redemption_voucher_whatsapp, sent_pending_request_voucher_whatsapp, sent_welcome_message_whatsapp, set_user_opt_in , sent_marriage_wishes_whatsapp, set_user_opt_out, expiry_points_whatsapp_message } from "../../utils/messages/whatsapp_messages.js";
import { Op, Sequelize, where } from "sequelize";
import { ContactVerify } from "../models/ContactVerify.js";
import { CouponCode } from "../models/Coupon.js";
import { SendingNotificationForPendingVoucherRequestMail, sendBirthDayWishesMail, sendRegistrationMail , sendMarriageWishesMail } from "../../utils/mail/mail_message.js";
import generatePin from "../../utils/constant/generatePin.js";
import { SellerVouchers } from "../models/SellerVouchers.js";
import { getToken } from "./voucherController.js";
import axios from "axios";
import crypto from 'crypto';
import { decryption, encryption } from "../../utils/constant/encrypt_decrypt.js";
import { birthdayWish, businessClubEvoucher, lapseRewardPoints, marraigeAnniversary, OTPRedemption, redemptionAcknowledgement, sendOTPForVoucherRedemption } from "../../utils/messages/sms_messages.js";
import { generateMemberShipId } from "../../utils/constant/generateMemberShipId.js";
import dotenv from 'dotenv';
import { Membership } from "../models/Membership.js";
import { Notification } from "../models/Notification.js";
import { VoucherBrands } from "../models/VoucherBrands.js";
import { membershipUpgrade } from "./membershipController.js";
import { DSProduct } from "../models/DSProduct.js";
import { SellerProducts } from "../models/SellerProducts.js";
import generateTransactionId from "../../utils/constant/generateTransactionId.js";
import { error } from "console";
import path from 'path';
import xlsx from 'node-xlsx';
import fs, { unlinkSync } from 'fs';
import VouchagramLog from "../../utils/vouchgramLogs.js";

dotenv.config();

const dv = process.env.DENOMINATION_VALUE;
const REGISTER_POINT = process.env.REGISTER_POINT || 500;
const REGISTER_POINT_TILL_DATE = process.env.REGISTER_POINT_TILL_DATE || '2024-11-01';

export const getSellerById = async(req, res, next)=>{
    try {
        const { sellerId } = req.body;
        if( !sellerId || sellerId===""){
            return next(createError(403, "Enter the valid Id"));
        }
        const getSeller = await Seller.findOne({
            where:{
                id:sellerId
            },
            raw:true
        });
        if(!getSeller){
            return next(createError(404,"Seller Not Found :: Give the valid Id"))
        }
        const getSellerInfo = await SellerInfo.findOne({
            where:{
                sellerId:sellerId
            },
            raw:true
        });
        const getSellerShippingAddress = await SellerShippingAddress.findOne({
            where:{
                sellerId:sellerId
            },
            raw:true
        });
        let getSellerTrack = await SellerMembershipTrack.findAll({
            where:{
                sellerId:req.body.sellerId,
            },
            raw:true
        });
        let {firstName,lastName,accountId,email,contactNo,roles, ...sellerinfo} = getSeller;
        const {sellerId:id,updateByStaff,createdIstAt,updatedIstAt,createdAt,updatedAt, ...seller} = getSellerInfo;
        const {shippingAddress, ...sellerShippingInfo} = getSellerShippingAddress;
        let data = {sellerId,accountId,firstName,lastName,email,contactNo,roles, ...seller, shippingAddress, membershipTrack:getSellerTrack};
        return res.status(200).json({
            error:false,
            message:"WholeSeller Found Successfully...!",
            data:data
        })
    } catch (error) {
        console.log("Get-WholeSeller-By-Id Error ::>>", error);
        next(error);
    } 
};

// update user
export const updateSellerById = async(req, res, next)=>{
    try {
        if(!req.body.sellerId || req.body.sellerId===""){
            return next(createError(403,"Please Enter Valid User ID!"));
        }
        if(!req.body.gender || req.body.gender==="" || (req.body.gender !== "male" && req.body.gender !== "female")){
            return next(createError(403,"Please Enter Gender!"));
        }
        // if(!req.body.firstName || req.body.firstName===""){
        //     return next(createError(403,"Enter the Valid firstname"));
        // }
        // if(!req.body.lastName || req.body.lastName===""){
        //     return next(createError(403,"Enter the Valid lastname"));
        // }
        if(!req.body.email || req.body.email===""){
            return next(createError(403,"Enter the Valid Email"));
        }
        // if(!req.body.contactNo || req.body.contactNo===""){
        //     return next(createError(403,"Enter the Valid contact number"));
        // }
        if(!req.body.dob || req.body.dob===""){
            return next(createError(403,"Please Enter Valid Date Of Birth!"));
        }
       
        if(!req.body.agreedToTerms || req.body.agreedToTerms===""){
            return next(createError(403,"Please Confirm on Terms & Condtions!"));
        }
        if(!req.body.billingAddress || !req.body.billingAddress.pinCode || 
            !req.body.billingAddress.city || !req.body.billingAddress.state || !req.body.billingAddress.addressLine1 || 
            req.body.billingAddress.pinCode==="" || req.body.billingAddress.city==="" || req.body.billingAddress.state==="" || req.body.billingAddress.addressLine1===""){
            return next(createError(403,"Please Enter A Valid Billing Address!"));
        }
        if(!req.body.shippingAddress || !req.body.shippingAddress.pinCode || 
            !req.body.shippingAddress.city || !req.body.shippingAddress.state ||  !req.body.shippingAddress.addressLine1 || 
            req.body.shippingAddress.pinCode==="" || req.body.shippingAddress.city==="" || req.body.shippingAddress.addressLine1==="" || 
            req.body.shippingAddress.state===""){
            return next(createError(403,"Please Enter A Valid Shipping Address!"));
        }

        const sellerEmail = await Seller.findOne({
            where :{
                id:req.body.sellerId
            },
            raw : true
        })

        const emailExists = await Seller.findOne({
            where :{
                email:req.body.email
            },
            raw : true
        })

        if(emailExists && sellerEmail.email !== req.body.email)
        {
            return next(createError(403,"Email Already Exist!"));
        }

        const sellerInfo = await SellerInfo.findOne({
            where :{
                sellerId:req.body.sellerId
            },
            raw : true
        })

        let sellerMembershipTrack = sellerInfo.track;

        const membershipSettings = await Membership.findOne({
            where:{
                id : 1
            },
            raw: true
        }) 

        let current_membership = sellerInfo.membershipLevel

        let sellerAvailablePoints;
        let sellerTotalPoints;
        let sellerFinacialPoints;

        let profileUpdatePoints = current_membership == "Welcome" ? membershipSettings.profilePoints.welcome : current_membership == "Blue" ? membershipSettings.profilePoints.blue : current_membership == "Silver" ? membershipSettings.profilePoints.silver : current_membership == "Gold" ? membershipSettings.profilePoints.gold : 0
        // let hasUpdate = sellerMembershipTrack[sellerMembershipTrack.length - 1].isProfileUpdate === false;
        let getSellerTrack = await SellerMembershipTrack.findOne({
            where:{
                sellerId:req.body.sellerId,
            },
            raw:true
        });
        let hasUpdate = getSellerTrack.isProfileUpdate;
        if(getSellerTrack.isProfileUpdate == false){
            await SellerMembershipTrack.update({
                isProfileUpdate:true,
                profilePoints:profileUpdatePoints
            },{
                where:{
                    id:getSellerTrack.id
                }
            });
            sellerAvailablePoints =   Number(sellerInfo.availablePoints) + Number(profileUpdatePoints);
            sellerTotalPoints = Number(sellerInfo.totalPoints) + Number(profileUpdatePoints);
            sellerFinacialPoints = Number(sellerInfo.finacialPoints) + Number(profileUpdatePoints);
        }

        const sellerInfoObject={
            sellerId:req.body.sellerId,
            // contactNo:req.body.contactNo,
            alternativeContactNo:req.body.alternativeContactNo,
            preferredContactTime:req.body.preferredContactTime,
            dob:req.body.dob,
            track: sellerMembershipTrack,
            availablePoints: sellerAvailablePoints,
            totalPoints: sellerTotalPoints,
            finacialPoints:sellerFinacialPoints,
            gender: req.body.gender,
            marriageDate:req.body?.marriageDate,
            gstNo:req.body.gstNo,
            billingAddress:req.body.billingAddress,
            agreedToTerms:req.body.agreedToTerms,
            updatedIstAt: DateTime()
        };

        // Update seller data
        const updatedSeller = await Seller.update({
            email: req.body.email,
            updatedIstAt: DateTime()
        },
        {
            where :{
                id:req.body.sellerId
            }
        });

        // Update seller info data
        const updatedSellerInfo = await SellerInfo.update(sellerInfoObject,
        {
            where :{
                sellerId:req.body.sellerId
            }
        });

        const sellerShippingAddressObj = {
            sellerId:req.body.sellerId,
            shippingAddress:req.body.shippingAddress,
            updatedIstAt: DateTime()
        };
        const updatedSellerShippingAddress = await SellerShippingAddress.update(sellerShippingAddressObj,
        {
            where :{
                sellerId:req.body.sellerId
            }
        });
        if(updatedSellerInfo[0]+updatedSellerShippingAddress[0]!==2){
            // return next(createError(400,"WholeSeller Details not updated...!"))
        }
        if(!hasUpdate){
            const transactionObj = {
                transactionId: generateTransactionId(),
                sellerId: req.body.sellerId,
                transactionCategory:'ProfileUpdate',
                status: 'Earn',
                points: profileUpdatePoints,
                createdIstAt: DateTime(),
                updatedIstAt: DateTime()
              };
            const profileTransaction = await Transaction.create(transactionObj);
        }
        return res.status(200).json({
            error:false,
            message:hasUpdate ? `Your Profile Update Successfully and You have earned ${profileUpdatePoints} Coins...!` : "WholeSeller updated Successfully...!",
            data:updatedSellerInfo[0]+updatedSellerShippingAddress[0]+updatedSeller[0]
        })
        
    } catch (error) {
        console.log("Update-WholeSeller-By-Id Error ::>>", error);
        next(error);
    } 
};

export const deleteSellerById = async(req, res, next)=>{
    try {
        if( !req.body.id || req.body.id===""){
            return next(createError(403,"Enter the Valid Id"));
        }
        //Seller Products
        //Seller Vouchers
        //Contact verification
        const getSellers = await Seller.destroy({
            where:{id:req.body.id}
        });
        return res.status(200).json({
            error:false,
            message: "Seller Deleted  Successfully...!",
            data:getSellers
        }) 
    } catch (error) {
        console.log("Delete-Seller ::>>",error);
        next(error);
    }
};

//get all seller
export const getAllSellerByP = async(req, res, next)=>{
    try {
        let { page, limit, orderBy, search } = req.body;
        if (!page || page === "") {
            return next(createError(403, "Please provide page no!"));
        }
        page = page || 1;
        limit = limit || 10;
        const offset = limit * (page - 1);
        orderBy = !orderBy ? 'DESC' : orderBy === 'Ascending' ? 'ASC' : 'DESC';
        let whereClause = '';
        let replacements = {}; 
        if (search) {
            whereClause = `
                WHERE sd.accountId LIKE :search
                OR sd.contactNo LIKE :search
                OR sd.email LIKE :search
            `;
            replacements.search = `%${search}%`;
        }
        const getSellersQuery = `
            SELECT sd.id, sd.accountId, sd.bizomId, sd.firstName, sd.lastName, sd.email, sd.contactNo, sd.status, sd.createdAt, sd.createdIstAt, sd.notificationPreference,  
            si.memberShipId, si.membershipLevel, si.gender, si.totalPoints, si.availablePoints, si.earnedPoints, si.finacialPoints, si.billingAddress, si.agreedToTerms 
            FROM sellers AS sd 
            INNER JOIN sellerinfos AS si ON sd.id = si.sellerId
            ${whereClause}
            ORDER BY sd.id ${orderBy}
            LIMIT :limit
            OFFSET :offset;
        `;
        const getSellers = await sequelize.query(getSellersQuery, {
            replacements: {
                ...replacements,
                limit: limit,
                offset: offset,
            },
            type: sequelize.QueryTypes.SELECT,
            raw: true
        });
        const getAllSellersQuery = `
            SELECT count(sd.id) as countSeller
            FROM sellers AS sd 
            INNER JOIN sellerinfos AS si ON sd.id = si.sellerId
            ${whereClause}
            ORDER BY sd.id ${orderBy};
        `;
        const getAllSellers = await sequelize.query(getAllSellersQuery, {
            replacements: {
                ...replacements
            },
            type: sequelize.QueryTypes.SELECT,
            raw: true
        });
        return res.status(200).json({
            error: false,
            message: getSellers.length === 0 ? "Empty" : "All WholeSellers Found Successfully...!",
            count: getSellers.length,
            totalSellerCount: getAllSellers[0].countSeller,
            data: getSellers
        });
    } catch (error) {
        console.log("Get-All-Seller ::>>", error);
        next(error);
    } 
};

export const getAllTransaction = async(req, res, next) => {
    try {

        const { sellerId } = req.body;

        if( !sellerId || sellerId===""){
            return next(createError(403, "Enter the valid Id"));
        }
        
        const Transactions = await Transaction.findAll({
            where:{
                sellerId:sellerId
            }
        });

        if(Transactions.length == 0){
            return res.status(404).json({message:"No Transactions found!"})
        }

        return res.status(200).json({
            error: false,
            message: "Transitions fetched Successfully...!",
            data: Transactions,
          });
    } catch (error) { 
        console.log("Transaction Error ::>>",error);
        next(error);
    }
};

export const getAllSeller = async(req, res, next)=>{
    try {
        const getSellersQuery = `
            SELECT sd.id, sd.bizomId, sd.accountId, sd.firstName, sd.lastName, sd.email, sd.contactNo, sd.status, sd.createdAt, sd.createdIstAt, sd.notificationPreference,  
            si.memberShipId, si.membershipLevel, si.gender, si.totalPoints, si.availablePoints, si.earnedPoints, si.finacialPoints, si.billingAddress, si.agreedToTerms 
            FROM sellers AS sd 
            INNER JOIN sellerinfos AS si ON sd.id = si.sellerId
            ORDER BY sd.id desc
        `;
        const getSellers = await sequelize.query(getSellersQuery, {
            replacements: {},
            type: sequelize.QueryTypes.SELECT,
            raw: true
        });
        return res.status(200).json({
            error:false,
            count:getSellers.length,
            data:getSellers
        }) 
    } catch (error) {
        console.log("Get-All-Seller ::>>",error);
        next(error);
    }
};

//reset seller password
export const sellerResetPassword = async(req, res, next)=>{
    try {
        if(!req.body.email || req.body.email==="" || !req.body.newPassword || req.body.newPassword==="" || !req.body.confirmPassword || req.body.confirmPassword===""){
            return next(createError(403,"Please Fill All the Details!"));
        }
        const seller = await Seller.findOne({
            where :{
                email: req.body.email
            }
        });
        if(!seller){
            return next(createError(403,"Invalid Seller!"));
        }
        if(req.body.newPassword!==req.body.confirmPassword){
            return next(createError(403, "Incorrect Password! Try Again after sometime!"));
        }
        const number = generateSalt();
        const salt = bcrypt.genSaltSync(number);
        const hash = bcrypt.hashSync(req.body.newPassword, salt);
        await Seller.update({
            password: hash,
            updateByStaff : req.user.data.name,
            updatedIstAt : DateTime()
        },{
            where : {
                id:seller.id
            }
        });
        return res.status(200).json({
            error:false,
            message: "Password Changed Successfully!",
        }) 
    } catch (error) {
        console.log("Seller-Reset-Password ::>>",error);
        next(error);
    }
};

//seller transactions
export const getSellerTransactions = async(req, res, next)=>{
    try {
        let { sellerId, page, limit, status, startDate, endDate } = req.body;
        if( !sellerId || sellerId===""){
            return next(createError(403, "Enter the valid Id"));
        }
        const getSeller = await Seller.findOne({
            where:{
                id:sellerId
            },
            raw:true
        });
        if(!getSeller){
            return next(createError(404,"Seller Not Found :: Give the valid Id"))
        }
        let whereClause = {
            sellerId:sellerId
        };
        if(status){
            whereClause.status = status;
        }
        const sDate = startDate ? new Date(startDate) : new Date('2023-01-01');
        const eDate = endDate ? new Date(endDate) : new Date('2100-01-03');
        eDate.setDate(eDate.getDate()+1);
        whereClause.createdAt={
          [Op.gt] : sDate,
          [Op.lt] : eDate
        }
        limit = limit || 10;
        const offset = limit * (page-1);
        const getTransactions = await Transaction.findAll({
            where:whereClause,
            order:[
                ['id','desc'],
            ],
            limit,
            offset,
            raw:true
        });
        const totalTransactions = await Transaction.count({
            where:whereClause
        });
        return res.status(200).json({
            error:false,
            message:"WholeSeller Transactions Found Successfully...!",
            count:getTransactions.length,
            total:totalTransactions,
            data:getTransactions
        })
    } catch (error) {
        console.log("Get-WholeSeller-By-Id Error ::>>", error);
        next(error);
    } 
};

//send wishes
export const sendWishes = async() => {
    try {
        const sellers = await Query(`
        SELECT sd.id, sd.firstName, sd.lastName, sd.email, si.dob, si.marriageDate , sd.contactNo FROM sellers as sd inner join sellerinfos as si on sd.id=si.sellerId;
        `);

        let dobs = sellers.filter((seller) => {
        
            if (new Date(seller.dob).getDate() === new Date().getDate() && new Date(seller.dob).getMonth() === new Date().getMonth() && (new Date(seller.marriageDate).getDate() !== new Date().getDate() || new Date(seller.marriageDate).getMonth() !== new Date().getMonth())){
                seller.message = "Birthday";
                return seller;
            }
            else if (new Date(seller.marriageDate ? seller.marriageDate : null).getDate() === new Date().getDate() && new Date(seller.marriageDate ? seller.marriageDate : null).getMonth() === new Date().getMonth() && (new Date(seller.dob).getDate() !== new Date().getDate() || new Date(seller.dob).getMonth() !== new Date().getMonth())){
                seller.message = "Marriage Anniversary";
                return seller;
            }
            else if (seller.dob !== null && seller.marriageDate !== null && new Date(seller.dob).getDate() === new Date(seller.marriageDate).getDate() && new Date(seller.dob).getMonth() === new Date(seller.marriageDate).getMonth()) {
                seller.message = "Both";
                return seller;
            }
        });

        
        if(dobs.length===0){
        //     return res.status(200)
        //    .json({
        //     error:false,
        //     message: "No Birthday Sellers found Successfully...!",
        //     data:0
        //    });
        return "No Birthday Sellers found Successfully...!";
        }


        const membershipSettings = await Membership.findOne({where:{id:1}, raw:true})

        const { birthdayBenefits } = membershipSettings;

        // console.log("dobs ::>>",dobs, dobs.length);
        let birthdaySellers = dobs.map(async (seller) => {

            let isBirthday = false;
            const sellerInfo = await SellerInfo.findOne({
                where: {
                    sellerId: seller.id
                },
                raw: true
            });

            if(seller.message == "Birthday"){

            isBirthday = true;

            sendBirthDayWishesMail(seller.firstName+" "+seller.lastName, seller.email);
            
            sent_birthday_wishes_whatsapp(seller.firstName , seller.contactNo)
            
            birthdayWish(seller.contactNo, seller.firstName);

        }else if(seller.message == "Marriage Anniversary"){

            sendMarriageWishesMail(seller.firstName+" "+seller.lastName, seller.email);
            
            sent_marriage_wishes_whatsapp(seller.firstName , seller.contactNo)

            marraigeAnniversary(seller.contactNo, seller.firstName)

        }else if(seller.message == "Both"){

            isBirthday = true;
            sendBirthDayWishesMail(seller.firstName+" "+seller.lastName, seller.email);
            
            sent_birthday_wishes_whatsapp(seller.firstName , seller.contactNo)

            birthdayWish(seller.contactNo, seller.firstName);

            sendMarriageWishesMail(seller.firstName+" "+seller.lastName, seller.email);
            
            sent_marriage_wishes_whatsapp(seller.firstName , seller.contactNo)
            
            marraigeAnniversary(seller.contactNo, seller.firstName);

        }

        if(isBirthday)
        {
            const transactionId = generateId();
            let birthdayPoints = sellerInfo.membershipLevel === 'Welcome' ? birthdayBenefits.welcome : sellerInfo.membershipLevel === 'Blue' ? birthdayBenefits.blue : sellerInfo.membershipLevel === 'Silver' ? birthdayBenefits.silver : sellerInfo.membershipLevel === 'Gold' ? birthdayBenefits.gold : 0 ;

            await SellerInfo.update({
                totalPoints : Number(sellerInfo.totalPoints + birthdayPoints.points),
                availablePoints : Number(sellerInfo.availablePoints + birthdayPoints.points),
                finacialPoints : Number(sellerInfo.finacialPoints + birthdayPoints.points),
                dobPointStatus:'Give'
            },{
                where:{
                    sellerId: seller.id
                }
            })

            const createTransaction = await Transaction.create({
                transactionId,
                sellerId: seller.id,
                points: birthdayPoints.points,
                status: 'Earn',
                transactionCategory: "BirthdayPoint",
                createdIstAt : DateTime(),
                updatedIstAt : DateTime()
            })
        }

        return seller;
        
        });
        birthdaySellers = await Promise.all(birthdaySellers);
        // res.status(200)
        //    .json({
        //     error:false,
        //     message: `Today Sellers are ${dobs.length} found Successfully!`,
        //     data:birthdaySellers,
        //    });
        return birthdaySellers;
    } catch (error) { 
        console.log("Send-Wishes Error ::>>",error);
        // next(error);
        return error;
    }
};

export const deductionPointsOfBirthDay = async(req, res, next)=>{
    try {
        const { sellerId } = req.body;
        const seller = await Query(`
            SELECT sd.firstName, sd.lastName, sd.email, si.dob, sd.contactNo, si.membershipLevel, si.availablePoints, si.dobPointStatus FROM sellers as sd inner join sellerinfos as si on sd.id=si.sellerId where sd.id = ${sellerId};
        `);
        const getMembership = await Membership.findOne({
            where:{
                id:1
            },
            raw:true
        });
        const getSeller = seller[0];
        const haveDays = getMembership.birthdayBenefits[getSeller.membershipLevel.toLowerCase()]['expiryDays'];
        let dobPointStatus = getSeller.dobPointStatus;
        let checkPointStatus = dobPointStatus;
        const dobDate = getSeller.dob;
        const getDobDate = new Date(new Date().getFullYear()+"-"+new Date(dobDate).getMonth()+1+"-"+new Date(dobDate).getDate());
        const nowDate = new Date();
        nowDate.setDate(nowDate.getDate()-haveDays);
        console.log(dobPointStatus);
        console.log(nowDate, getDobDate, nowDate>getDobDate);
        if(nowDate>getDobDate && dobPointStatus && dobPointStatus==='Give'){
            let aheadDate = new Date(getDobDate);
            aheadDate.setDate(aheadDate.getDate()+haveDays);
            // console.log("g & a Date ::>>", getDobDate, aheadDate);
            const transactions = await Transaction.findAll({
                attributes:['points'],
                where:{
                    status:'Redeem',
                    createdAt:{
                        [Op.gte]:getDobDate,
                        [Op.lte]:aheadDate 
                    }
                },
                raw:true
            })
            // console.log("Transaction ::>>",transactions);
            let getPoints = 0;
            for(let i=0;i<transactions.length;i++){
                getPoints += transactions[i].points;
            }
            const havePoints = getMembership.birthdayBenefits[getSeller.membershipLevel.toLowerCase()]['points'];
            let ap = getSeller.availablePoints;
            if(getPoints===0 || getPoints<havePoints){
                //deduction points---
                ap -= havePoints;
                dobPointStatus = 'Deduct';
            }
            else{
                dobPointStatus = 'Used';
            }
            await SellerInfo.update({
                availablePoints:ap,
                dobPointStatus
            },{
                where:{
                    sellerId:sellerId
                }
            });
        }
        res.status(200).json({
            error:false,
            message: checkPointStatus!=='Deduct' && dobPointStatus==='Deduct' ? `Birthday points will be deduct due to no used in previous ${haveDays} Days`: `fine everything`,
            data:"true"
        })
    } catch (error) {
        console.log("Deduction Seller birthday gift points Error ::>>",error);
    }
}

// code starts by Ritik 

// dashboard data
export const getSellerData = async(req, res, next) => {
    try{
        const { sellerId } = req.body;
        if(!sellerId || sellerId === ""){
            return next(createError(400, "Please provide sellerID"));
        }
        const getSeller = await Seller.findOne({
            where:{
                id:sellerId
            },
            raw: true
        });
        if(!getSeller){
            return next(createError(401, "Invalid Seller Id"))
        }
        let getSellerInfo = await SellerInfo.findOne({
            where:{
                sellerId : sellerId
            },
            raw: true
        });
        // console.log("Get-Seller-Info ::>>",getSellerInfo);
        const address = getSellerInfo.billingAddress;
        const dataToSent = {
            pincode : address.pinCode,
            memberShipId:getSellerInfo.memberShipId,
            membershipLevel:getSellerInfo.membershipLevel,
            dob:getSellerInfo.dob,
            tierEntryDate:getSellerInfo.tierEntryDate,
            totalPoints : getSellerInfo.totalPoints,
            earnedPoints : getSellerInfo.earnedPoints,
            availablePoints : getSellerInfo.availablePoints,
            finacialPoints : getSellerInfo.finacialPoints,
            accountID : getSeller.accountId,
            agreedToTerms:getSellerInfo.agreedToTerms,
            registerationDate : getSeller.createdIstAt,
            membershipUpgradeDate: getSellerInfo.tierEntryDate
        };
        return res.status(200).json({
            error: false,
            message:"Dashbaord Data Fetched Succesfully.",
            data:dataToSent
        });
    }
    catch (error) { 
        console.log("Get-Seller-Data Error ::>>",error);
        next(error);
    }
};

export const getAllTransactionByPandF = async (req, res, next) => {
    try {
      let { page, limit, status, sortBy, sellerId ,startDate, endDate } = req.body;
  
      if(!page || page==="" ){
        return next(createError(403,"Please provide page no!"));
    }

      let pageNo = page || 1;
      const limitForShowTransactions = limit || 10;
  
      let offset = limitForShowTransactions * (pageNo - 1);
  
      let sort = !sortBy ? "DESC" : sortBy == "ascending" ? "ASC" : "DESC"
      
      let whereClause = {};
      if (status) {
        whereClause.status = status;
      }
      if (sellerId) {
        whereClause.sellerId = sellerId;
      }
      const sDate = startDate ? new Date(startDate) : new Date('2023-01-01');
      const eDate = endDate ? new Date(endDate) : new Date('2100-01-03');
      eDate.setDate(eDate.getDate()+1);
      whereClause.createdAt={
        [Op.gt] : sDate,
        [Op.lt] : eDate
      }
      const allTransaction = await Transaction.findAll({
        where: whereClause,
        limit: limitForShowTransactions,
        offset: offset,
        order: [['id', sort ]],
      });
  
      const totalTransaction = await Transaction.count({
          where: whereClause,
          order: [['id', sort ]],
        });
  
      res.status(200).json({
        error: false,
        message: "All-Transaction found Successfully...!",
        transactionsInaPage: allTransaction.length,
        totalTransactions: totalTransaction,
        data: { allTransaction: allTransaction },
      });
    } catch (error) {
      console.error("Get-All-Transaction Error:", error.message);
      next(error);
    }
};

export const registerUpdateSeller = async(req, res, next) => { 
    const transaction = await sequelize.transaction();
    try{
        // coupon verify
        if(!req.body.code || req.body.code===""){
            return next(createError(403,"Enter Valid Coupon Code!"));
        }
        if(!req.body.serialNo || req.body.serialNo===""){
            return next(createError(403,"Enter A Valid Serial Number!"));
        }
        const today = new Date();
        let mm = today.getMonth() + 1;
        let dd = today.getDate();
        const yyyy = today.getFullYear();
        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;
        const formattedToday = yyyy + '-' + mm + '-' + dd;
        const getCoupon = await CouponCode.findOne({
            where:{
                code:req.body.code,
                serialNo:req.body.serialNo
            },
            raw:true
        });
        // console.log("getCoupon ::>>", getCoupon);
        if (!getCoupon) {
        return next(createError(404, "Invalid Coupon Code!"));
        }
        if (getCoupon.isActive === 'Inactive') {
        return next(createError(404, "Entered Coupon Code Not Valid!"));
        }
        if (getCoupon.status === 'Used') {
        return next(createError(404, "Coupon Code Already Used!"));
        }
        if (getCoupon.status === 'Expired' || new Date(formattedToday) > getCoupon.endDate  ) {
        return next(createError(404, "You coupon has been already expired...!"));
        }
        //coupon verified yet
        //encrypt password
        if(!req.body.firstName || req.body.firstName===""){
            return next(createError(403,"Please Enter Valid First Name!"));
        }
        if(!req.body.lastName || req.body.lastName===""){
            return next(createError(403,"Please Enter A Valid Last Name!"));
        }
        if(!req.body.email || req.body.email===""){
            return next(createError(403,"Please Enter Valid E-mail ID!"));
        }
        if(!req.body.contactNo || String(req.body.contactNo).length>10 || String(req.body.contactNo).length<10){
            return next(createError(403,"Please Enter the Correct E-mail ID!"));
        }
        if(!req.body.password || req.body.password===""){
            return next(createError(403,"Please Enter Correct Password!"));
        }
        if(!req.body.confirmPassword || req.body.confirmPassword===""){
            return next(createError(403,"Please Enter Valid Confirm Password!"));
        }
        if(req.body.password!==req.body.confirmPassword){
            return next(createError(403,`Password Mismatch!`));
        }

        // if(!req.body.city || req.body.city===""){
        //     return next(createError(403,"Enter the Valid city"));
        // }
        // if(!req.body.state || req.body.state===""){
        //     return next(createError(403,"Enter the Valid state"));
        // }
        // if(!req.body.pinCode || req.body.pinCode===""){
        //     return next(createError(403,"Enter the Valid pincode"));
        // }

        if(!req.body.agreedToTerms || req.body.agreedToTerms==="" || req.body.agreedToTerms===false){
            return next(createError(403,"Please Agree to Terms & Conditions"));
        }

        const password = req.body.password;
        const number = generateSalt();
        const salt = bcrypt.genSaltSync(number);
        const hash = bcrypt.hashSync(password, salt);
 
    
        const sellerObj = {
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            contactNo : req.body.contactNo,
            password : hash,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        };

        const getContactNo = await ContactVerify.findOne({
            where:{
                contactNo:req.body.contactNo
            },
            raw:true
        })
        if(!getContactNo){
            return next(createError(403,`Please register with the contact number  : ${sellerObj.contactNo}`));
        }
        if(getContactNo && getContactNo.verified==='unverified'){
            return next(createError(403,`Please registered with this Contact Number : ${sellerObj.contactNo}`));
        }
        if(getContactNo && getContactNo.sellerId!==null){
            return next(createError(403,`Please register with the contact number  : ${sellerObj.contactNo}`));
        }

    //    <---------------------- Welcome tier Expiry Date ------------------------------>

        const currentDate = new Date();
        const membershipSettings = await Membership.findOne({where:{id:1}, raw:true})
        if(!membershipSettings){
            return next(createError(403,"Membership Details Not Found!"));
        }
        const updateSeller = await Seller.update(
            sellerObj,
            {
                where:{
                    id: req.body.sellerId
                },
                transaction
            }
        );
        const registerPointTillDate = new Date(REGISTER_POINT_TILL_DATE);
        const now = new Date();
        let registerPoint = REGISTER_POINT;
        if(now>registerPointTillDate){
            registerPoint = 0;
        }
        let track = {
            membershipLevel:'Welcome',
            totalPoints:registerPoint,
            availablePoints:registerPoint,
            finacialPoints : registerPoint,
            tierEntryDate:now,
            isProfileUpdate : false,
            isFeedback : false,
            membershipStatus:"UPGRADE",
            feedbackPoints:0,
            profilePoints:0,
            tierBenefitsPoints: membershipSettings.milestoneAchievementTierBenefits.welcome,
            bonusPoints:membershipSettings.milestoneAchievementBonusCoinsBenefits.welcome
        };

        const sellerInfoObject={
            memberShipId:generateMemberShipId(),
            totalPoints:registerPoint,
            availablePoints:registerPoint,
            finacialPoints:registerPoint,
            tierEntryDate:now,
            contactNo:req.body.contactNo,
            billingAddress:req.body.billingAddress,
            agreedToTerms:req.body.agreedToTerms,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        };
        const sellerInfo = await SellerInfo.update(
            sellerInfoObject,
            {
                where:{
                   sellerId: req.body.sellerId
                },
                transaction
            }
        );
        const createTrack = await SellerMembershipTrack.create({...track, sellerId:req.body.sellerId, memberShipId:sellerInfoObject.memberShipId},{transaction});
        await ContactVerify.update({sellerId:req.body.sellerId},{
            where:{
                contactNo:req.body.contactNo
            },
            transaction
        });
        if(now<registerPointTillDate){
            const transactionObj = {
                transactionId: generateTransactionId(),
                sellerId: req.body.sellerId,
                transactionCategory:'WelcomeBonus',
                status: 'Earn',
                points: registerPoint,
                createdIstAt: DateTime(),
                updatedIstAt: DateTime()
              };
            const profileTransaction = await Transaction.create(transactionObj,{transaction});
        }
        await transaction.commit();
        // send Registtration Mail
        sendRegistrationMail(sellerObj.firstName+" "+sellerObj.lastName, sellerObj.email, req.user.data.accountId, password);
        
        //set user otp in
        set_user_opt_in(sellerObj.contactNo);
        // registration message on whatsapp
        sent_welcome_message_whatsapp(sellerObj.firstName , sellerObj.contactNo, req.user.data.accountId , password);


        console.log("Email :: Password ::>>",req.body.email, password);
        res.status(200).json({
            error : false,
            message : "WholeSeller Updation during Registeration Successfully...!",
            data : updateSeller[0]+sellerInfo[0]
        });
    } catch (error) {
        await transaction.rollback();
        console.log("Register updation WholeSeller Error ::>> ",error);
        next(error);
    }
};

function generateId() {
    return crypto.randomBytes(10).toString("hex");
}

export const checkAvailablePointsForVoucherRequest = async(req, res, next)=>{
    try {
        const { sellerId, BrandProductCode, Denomination, Quantity } = req.body;
        if(!Quantity || Quantity<1 || Quantity>100){
            return next(createError(403, "Please enter the valid Quantity"));
        }
        else if(!BrandProductCode || BrandProductCode===""){
            return next(createError(403, "Please enter the valid BrandProductCode"));
        }
        else if(!Denomination || Denomination===""){
            return next(createError(403, "Please enter the valid Denomination"));
        }
        const seller = await SellerInfo.findOne({
            where:{
                sellerId
            },
            raw:true
        });
        if(!seller){
            return next(createError(403,"Seller not found...!"));
        }
        // console.log("Seller ::>>",seller);
        // console.log("Seller ::>>",seller.availablePoints,Denomination*Quantity);
        if(seller.availablePoints < (Denomination*Quantity)){
            return res.status(200).json({
                error:false,
                message:"You have not enough points for Redemption of Voucher...!",
                data:{eligible:false}
            });
        }
        const token = await getToken();
        let body = {
            BrandProductCode,
            Denomination
        };
        const payload = encryption(body);
        const { data } = await axios({
            method: "POST",
            url: `https://send.bulkgv.net/API/v1/getstock`,
            data:{payload},
            headers:{
                token:token
            }
        });
        if(data.status==='error'){
            return res.status(403).json({
                error : true,
                message : data.desc,
                code:data.code
            });
        }
        // console.log("Data ::>>",data);
        const decodedData = decryption(data.data);
        // console.log("get stock ::>>",decodedData);
        if(Number(decodedData.AvailableQuantity)<Quantity){
            return res.status(200).json({
                error:true,
                message:"Insuffcient Quantity of Voucher",
                data:0
            });
        }
        return res.status(200).json({
            error:false,
            message:"You are Eligible for Redemption of Voucher",
            data:{eligible:true}
        });
    } catch (error) {
        console.log("check Availble Points Voucher Request Error ::>>",error);
        next(error);
    }
};

export const sendVoucherRequestOtp = async(req, res, next)=>{
    try {
        const { sellerId, BrandProductCode, Denomination, Quantity, type, productId } = req.body;
        if(!Quantity || Quantity<1 || Quantity>100){
            return next(createError(403, "Please enter the valid Quantity"));
        }
        else if(!type || (type!=='Vouchagram' && type!=='Woohoo')){
            return next(createError(403, "Please enter the valid Type of voucher"));
        }
        else if(type==='Vouchagram' && !BrandProductCode || BrandProductCode===""){
            return next(createError(403, "Please enter the valid BrandProductCode"));
        }
        else if(type==='Woohoo' && !productId || productId===""){
            return next(createError(403, "Please enter the valid ProductId"));
        }
        else if(!Denomination || Denomination===""){
            return next(createError(403, "Please enter the valid Denomination"));
        }
        const seller = await SellerInfo.findOne({
            where:{
                sellerId
            },
            raw:true
        });
        if(!seller){
            return next(createError(403,"Seller not found...!"));
        }
        const getSeller = await Seller.findOne({
            where:{
                id:sellerId
            },
            raw:true
        });
        // console.log("Seller ::>>",seller);
        // console.log("Seller ::>>",seller.availablePoints,Denomination*Quantity);
        //vouchgram
        let voucherBrandDetails;
        if(type==='Vouchagram'){
            voucherBrandDetails = await VoucherBrands.findOne({
                where:{
                    BrandProductCode:BrandProductCode
                },
                raw:true
            });
            const token = await getToken();
            let body = {
                BrandProductCode,
                Denomination
            };
            const payload = encryption(body);
            const { data } = await axios({
                method: "POST",
                url: `${process.env.VOUCHAGRAM_SERVER_URL}/getstock`,
                data:{payload},
                headers:{
                    token:token
                }
            });
            if(data.status==='error'){
                await VouchagramLog(`${process.env.VOUCHAGRAM_SERVER_URL}/getstock`, body, data.code, 'In Send Voucher Request OTP-> '+data.desc);
                return res.status(403).json({
                    error : true,
                    message : data.desc,
                    code:data.code
                });
            }
            // console.log("Data ::>>",data);
            const decodedData = decryption(data.data);
            // console.log("get stock ::>>",decodedData);
            if(Number(decodedData.AvailableQuantity)<Quantity){
                return res.status(403).json({
                    error:true,
                    message:"Insuffcient Quantity of Voucher",
                    data:0
                });
            }
        }
        //woohoo
        else{
            const voucher = await VoucherBrands.findOne({
                where:{
                    productId:productId
                },
                raw:true
            });
            if(!voucher){
                return next(createError(403, 'There is no Voucher...!'));
            }
        }
        let havePoints = Math.round(Number(Denomination)*Number(Quantity)*Number(dv)) + Number(voucherBrandDetails.platformFees);
        if(seller.availablePoints < havePoints){
            return next(createError(403,"You have not enough points for Redemption of Voucher...!"));
        }
        const otp = generatePin();
        const updateSeller = await SellerInfo.update({
            otp,
            otpTimeStampAt:new Date(),
            verified:'unverified',
            updatedIstAt:DateTime()
        },{
            where:{
                sellerId
            }
        });
        // console.log("update seller ::>>",updateSeller);
        if(updateSeller[0]===0){
            return next(createError(403, "Something Went Wrong"));
        }
        const contactNo = seller.contactNo;
        // const response = await sendOTPForVoucherRedemption(contactNo, otp);
        const response = await OTPRedemption(otp, contactNo);
        if(response.statusCode!=='200'){
            return next(createError(401, "Something went wrong...!"))
        }
        //send otp to whatsapp
        await sent_otp_for_redemption_voucher_whatsapp(seller.contactNo, getSeller.firstName, otp);
        return res.status(200).json({
            error:false,
            message:"OTP shared on registered mobile number for redemption of vouchers.",
            data:"Sent"
        });
    } catch (error) {
        console.log("Send Voucher Request Otp Error ::>>",error);
        next(error);
    }
};

export const verifyVoucherRequestOtp = async(req, res, next)=>{
    try {
        const { sellerId, otp } = req.body;
        if(!otp || otp===""){
            return next(createError(403, "Please enter the valid OTP"));
        }
        const seller = await SellerInfo.findOne({
            where:{
                sellerId
            },
            raw:true
        });
        if(!seller){
            return next(createError(403,"Seller not found...!"));
        }
        const getOtpTime = seller.otpTimeStampAt;
        // console.log("get Otp time ::>>",new Date(new Date(getContactNo.otpTimeStampAt).getTime()+5*60*1000));
        // console.log("get now time ::>>",new Date());
        if(new Date().getTime()>new Date(new Date(seller.otpTimeStampAt).getTime()+5*60*1000)){
            return next(createError(401, "Time expired of Otp verification...!"))
        }
        if(seller.otp!==otp){
            return res.status(403).json({
                error:true,
                message:"OTP Not Verified for redemption of Voucher!",
                data:{verified:false}
            });
        }
        const updateSeller = await SellerInfo.update({
            otp:"f^f^f^",
            verified:"",
            updatedIstAt:DateTime()
        },{
            where:{
                sellerId
            }
        });
        return res.status(200).json({
            error:false,
            message:"OTP Verification Succesfull",
            data:{verified:true}
        });
    } catch (error) {
        console.log("Send Voucher Request Otp Error ::>>",error);
        next(error);
    }
};

export const pullVoucherRequest = async(req, res, next)=>{
    const transaction = await sequelize.transaction();
    try {
        const { sellerId, BrandProductCode, Denomination, Quantity, type, productId } = req.body;
        if(!Quantity || Quantity<1 || Quantity>100){
            return next(createError(403, "Please enter the valid Quantity"));
        }
        else if(!type || (type!=='Vouchagram' && type!=='Woohoo')){
            return next(createError(403, "Please enter the valid Type of voucher"));
        }
        else if(type==='Vouchagram' && !BrandProductCode || BrandProductCode===""){
            return next(createError(403, "Please enter the valid BrandProductCode"));
        }
        else if(type==='Woohoo' && !productId || productId===""){
            return next(createError(403, "Please enter the valid product Id"));
        }
        else if(!Denomination || Denomination===""){
            return next(createError(403, "Please enter the valid Denomination"));
        }

        const seller = await Seller.findOne({
            where:{
                id:sellerId
            },
            raw:true
        });
        if(!seller){
            return next(createError(403,"User details not found!"));
        }
        //vouchagram
        let voucherBrandDetails;
        let decodedBrand;
        if(type==='Vouchagram'){
            voucherBrandDetails = await VoucherBrands.findOne({
                where:{
                    BrandProductCode:BrandProductCode
                },
                raw:true
            });
    
            const token = await getToken();
    
            const { data:brand } = await axios({
                method: 'post',
                url: `${process.env.VOUCHAGRAM_SERVER_URL}/getbrands`,
                data:{BrandProductCode},
                headers: {
                    'token' : token
                }
            });
            // console.log("Brand ::>>",brand);
            if(brand.status==='error'){
                await VouchagramLog(`${process.env.VOUCHAGRAM_SERVER_URL}/getbrands`, {BrandProductCode}, brand.code, 'In pull Voucher Request-> '+brand.desc);
                return res.status(403).json({
                    error : true,
                    message : brand.desc,
                    code:brand.code
                });
            }
            decodedBrand = decryption(brand.data);
            // console.log("Brand ::>>",decodedBrand);
            if(decodedBrand.length === 0){
                return next(createError(500,"Brand Products not found in the system!"))
            }
            let body = {
                BrandProductCode,
                Denomination
            };
            const payload = encryption(body);
            const { data } = await axios({
                method: "POST",
                url: `${process.env.VOUCHAGRAM_SERVER_URL}/getstock`,
                data:{payload},
                headers:{
                    token:token
                }
            });
            if(data.status==='error'){
                await VouchagramLog(`${process.env.VOUCHAGRAM_SERVER_URL}/getstock`, body, data.code, 'In Pull Voucher Request-> '+data.desc);
                return res.status(403).json({
                    error : true,
                    message : data.desc,
                    code:data.code
                });
            }
            // console.log("Data ::>>",data);
            const decodedData = decryption(data.data);
            // console.log("get stock ::>>",decodedData);
            if(Number(decodedData.AvailableQuantity)<Quantity){
                return res.status(403).json({
                    error:true,
                    message:"Insufficient Quantity of Selected Voucher!"
                });
            }
        }
        //woohoo
        else{
            voucherBrandDetails = await VoucherBrands.findOne({
                where:{
                    productId
                },
                raw:true
            });
            if(!voucherBrandDetails){
                return next(createError(403,"Voucher not found"));
            }
        }        
        //points deduction---> from seller account
        const getTotalPoints = await SellerInfo.findOne({
            where: {
                sellerId:sellerId
            },
            attributes: ["availablePoints"]
        });
        if (!getTotalPoints) {
            return next(createError(403, "No User Details Found in the system!"))
        }
        let havePoints = Math.round(Number(Denomination)*Number(Quantity)*Number(dv)) + Number(voucherBrandDetails.platformFees);
        if (Number(getTotalPoints.availablePoints) < havePoints) {
            return next(createError(400, "Not enough points in seller's account"))
        }
        let totalDeductPoints = Number(getTotalPoints.availablePoints) - Number(havePoints);
        const updateTotalPoints = await SellerInfo.update(
            {
                availablePoints: totalDeductPoints,
                updateByStaff: req.user.data.name,
                updatedIstAt: DateTime()
            }, {
            where: {
                sellerId: sellerId
            },
            transaction
        }
        );
        if (updateTotalPoints[0] == 0) {
            return next(createError(500, "Failed to update points in the system!"));
        }

        // --------------------Generate transaction id------------------
        const transactionId = generateId();
        //----->
        const voucherObj = {
            sellerId,
            accountId:seller.accountId,
            sellerName:seller.firstName+" "+seller.lastName,
            email:seller.email,
            contactNo:seller.contactNo,
            requiredPoints:havePoints,
            ExternalOrderId:generateId(),
            brandImageUrl: type==='Vouchagram' ? decodedBrand[0].BrandImage : voucherBrandDetails?.images.small_image,
            BrandName: type==='Vouchagram' ? decodedBrand[0].BrandName : voucherBrandDetails.BrandName,
            BrandProductCode,
            transactionId: transactionId,
            woohooProductId:productId,
            Denomination,
            Quantity,
            status:'Pending',
            voucherType:type,
            createdIstAt:DateTime(),
            updatedIstAt:DateTime()
        };

        const getSellerVoucher = await SellerVouchers.create(voucherObj,{transaction});

        let voucherTransactionDetail = {
            sellerVoucherId: getSellerVoucher.id,
            ExternalOrderId: getSellerVoucher.ExternalOrderId,
            BrandProductCode: getSellerVoucher.voucherType==='Vouchagram' ? getSellerVoucher.BrandProductCode : getSellerVoucher.BrandName,
            BrandName:getSellerVoucher.BrandName,
            Denomination: getSellerVoucher.Denomination,
            Quantity: getSellerVoucher.Quantity
        }

        const createTransaction = await Transaction.create({
            transactionId: transactionId,
            sellerId: getSellerVoucher.sellerId,
            ExternalOrderId:getSellerVoucher.ExternalOrderId,
            transactionCategory: 'VoucherRedeem',
            voucherTransaction: voucherTransactionDetail,
            points: getSellerVoucher.requiredPoints,
            status: 'Redeem',
            brandImageUrl:getSellerVoucher.brandImageUrl,
            updateByStaff: req.user.data.name,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        },{transaction});
        await pointsUpdateInGracePeriodsPointRecord(sellerId, havePoints, transaction);
        //pending voucher requestwhatsapp message
        sent_pending_request_voucher_whatsapp(seller.contactNo, getSellerVoucher.BrandName, getSellerVoucher.Denomination);
        redemptionAcknowledgement(seller.contactNo, voucherObj.BrandName, 5);
        // businessClubEvoucher(5, seller.contactNo);
        await transaction.commit();
        return res.status(201).json({
            error:false,
            message:"Voucher request has been successful!",
            data:getSellerVoucher
        });
    } catch (error) {
        await transaction.rollback();
        console.log("Pull Voucher Request Error ::>>",error);
        next(error);
    }
};

export const checkAvailablePointsForProductRequest = async(req, res, next)=>{
    try {
        const { sellerId , Quantity , productId } = req.body;
        if(!Quantity || Quantity<1 || Quantity>100){
            return next(createError(403, "Please enter the valid Quantity"));
        }
        else if(!productId || productId===""){
            return next(createError(403, "Please enter the valid ProductId"));
        }

        const seller = await SellerInfo.findOne({
            where:{
                sellerId
            },
            raw:true
        });
        if(!seller){
            return next(createError(403,"Seller not found...!"));
        }

        const getDSProduct = await DSProduct.findOne({
            where:{
                id : productId
            },
            raw:true
        });

        if(!getDSProduct){
            return next(createError(403,"Product not found...!"));
        }

        if(seller.availablePoints < (getDSProduct.cost*Quantity)){
            return res.status(200).json({
                error:false,
                message:"You have not enough points for Redemption of Product...!",
                data:{eligible:false}
            });
        }
      
        if(Number(getDSProduct.availableQuantity)< Quantity ){
            return res.status(200).json({
                error:true,
                message:"Insuffcient Quantity of Product",
                data:0
            });
        }z
        return res.status(200).json({
            error:false,
            message:"You are Eligible for Redemption of Product",
            data:{eligible:true}
        });
    } catch (error) {
        console.log("check Availble Points Product Request Error ::>>",error);
        next(error);
    }
};

export const  sendProductRequestOtp = async(req, res, next)=>{
    try {
        const { sellerId, quantity, redeemProducts , totalUsedCoins } = req.body;
        if(!quantity || quantity<1 || quantity>100){
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
        const seller = await SellerInfo.findOne({
            where:{
                sellerId
            },
            raw:true
        });
        if(!seller){
            return next(createError(403,"Seller not found...!"));
        }
        const sellerAddress = await SellerShippingAddress.findOne({
            where:{
                sellerId:sellerId,
                isDefault:true
            },
            raw:true
        });
        // console.log("Seller shipping Address ::>>", sellerAddress);
        if(!sellerAddress){
            return next(createError(403, 'Please Select Shipping Address!'))
        }
        const getSeller = await Seller.findOne({
            where:{
                id:sellerId
            },
            raw:true
        });
        // console.log("Seller ::>>",seller);       
        
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
        if(Number(seller.availablePoints)<requiredPoints){
            return next(createError(403, `You Don't have Enough Points to redeem the product/vouchers!`));
        }
        const otp = generatePin();
        const updateSeller = await SellerInfo.update({
            otp,
            otpTimeStampAt:new Date(),
            verified:'unverified',
            updatedIstAt:DateTime()
        },{
            where:{
                sellerId
            }
        });
        // console.log("update seller ::>>",updateSeller);
        if(updateSeller[0]===0){
            return next(createError(403, "Something Went Wrong"));
        }
        const contactNo = seller.contactNo;
        // const response = await sendOTPForVoucherRedemption(contactNo, otp);
        const response = await OTPRedemption(otp, contactNo);
        if(response.statusCode!=='200'){
            return next(createError(401, "Something went wrong...!"))
        }
        //send otp to whatsapp
        await sent_otp_for_redemption_voucher_whatsapp(seller.contactNo, getSeller.firstName, otp);
        return res.status(200).json({
            error:false,
            message:"OTP shared on registered mobile number for the redemption of product!",
            data:"Sent"
        });
    } catch (error) {
        console.log("Send Product Request Otp Error ::>>",error);
        next(error);
    }
};

export const verifyProductRequestOtp = async(req, res, next)=>{
    try {
        const { sellerId, otp } = req.body;
        if(!otp || otp===""){
            return next(createError(403, "Please enter the valid OTP"));
        }
        const seller = await SellerInfo.findOne({
            where:{
                sellerId
            },
            raw:true
        });
        if(!seller){
            return next(createError(403,"Seller not found...!"));
        }
        const getOtpTime = seller.otpTimeStampAt;
        // console.log("get Otp time ::>>",new Date(new Date(getContactNo.otpTimeStampAt).getTime()+5*60*1000));
        // console.log("get now time ::>>",new Date());
        if(new Date().getTime()>new Date(new Date(seller.otpTimeStampAt).getTime()+5*60*1000)){
            return next(createError(401, "Time expired of Otp verification...!"))
        }
        if(seller.otp!==otp){
            return res.status(403).json({
                error:true,
                message:"OTP Not verified for redemption of product!",
                data:{verified:false}
            });
        }
        const updateSeller = await SellerInfo.update({
            otp:"f^f^f^",
            verified:"",
            updatedIstAt:DateTime()
        },{
            where:{
                sellerId
            }
        });
        return res.status(200).json({
            error:false,
            message:"OTP verification succesfully for redemption of product!",
            data:{verified:true}
        });
    } catch (error) {
        console.log("Send Product Request Otp Error ::>>",error);
        next(error);
    }
};


export const getAllSellerVouchers = async(req, res, next)=>{
    try {
        let { sellerId, page, limit, startDate, endDate, status } = req.body;
        page = page || 1;
        limit = limit || 20;
        const offset = limit * (page-1);
        const seller = await Seller.findOne({
            where:{
                id:sellerId
            },
            raw:true
        });
        if(!seller){
            return next(createError(403,"Seller not found"));
        }
        let whereClause = {
            sellerId:sellerId
        };
        const sDate = startDate ? new Date(startDate) : new Date('2023-01-01');
        const eDate = endDate ? new Date(endDate) : new Date('2100-01-03');
        eDate.setDate(eDate.getDate()+1);
        whereClause.createdAt={
            [Op.gt] : sDate,
            [Op.lt] : eDate
        }
        if(status){
            whereClause.status = status;
        }
        const sellerVouchers = await SellerVouchers.findAll({
            where:whereClause,
            limit,
            offset,
            order:[
                ['id','DESC']
            ]
        });
        const totalVouchers = await SellerVouchers.count({where:whereClause});
        return res.status(201).json({
            error:false,
            message:"Get All Seller-Voucher found Successfully",
            totalVouchersInAPage:sellerVouchers.length,
            totalVouchers,
            data:sellerVouchers
        });
    } catch (error) {
        console.log("Get All Seller-Voucher Error ::>>",error);
        next(error);
    }
};

export const getSellerApprovedVoucher = async(req, res, next)=>{
    try {
        let { sellerId, requestedId } = req.body;
        const seller = await Seller.findOne({
            where:{
                id:sellerId
            },
            raw:true
        });
        if(!seller){
            return next(createError(403,"Seller not found"));
        }
        const sellerVouchers = await SellerVouchers.findOne({
            where:{
                id:requestedId,
                sellerId,
                status:'Completed'
            },
            raw:true
        });
        if(!sellerVouchers){
            return next(createError(403,"Voucher not found"));
        }
        return res.status(201).json({
            error:false,
            message:"Get Seller-Approved-Voucher found Successfully",
            data:sellerVouchers
        });
    } catch (error) {
        console.log("Get Seller-Approved-Voucher Error ::>>",error);
        next(error);
    }
};

export const getSellerRecordData = async(req, res, next)=>{
    try {
        let { sellerId } = req.body;
        const seller = await Query(`Select * from sellers as s Inner Join sellerinfos as si on s.id=si.sellerId where s.id='${sellerId}';`);
        const membershipTrack = await SellerMembershipTrack.findAll({
            where:{
                sellerId:sellerId
            },
            raw:true
        });
        const transaction = await Transaction.findAll({
            where:{
                sellerId
            },
            limit:5,
            raw:true
        })
        const shippingAddress = await SellerShippingAddress.findAll({
            attributes:['shippingAddress'],
            where:{
                sellerId:sellerId
            },
            raw:true
        });
        return res.status(201).json({
            error:false,
            message:"Get Seller-Record-Data found Successfully",
            data:{seller:seller[0], membershipTrack, transaction, shippingAddress}
        });
    } catch (error) {
        console.log("Get Seller-Record-Data Error ::>>",error);
        next(error);
    }
};

export const setSellerFeedback = async(req, res, next)=>{
    try {
        let { sellerId } = req.body;
        
        const sellerInfo = await SellerInfo.findOne({
            where :{
                sellerId: sellerId
            },
            raw : true
        })

        let sellerMembershipTrack = sellerInfo.track;

        const membershipSettings = await Membership.findOne({
            where:{
                id : 1
            },
            raw: true
        }) 

        let current_membership = sellerInfo.membershipLevel

        let sellerAvailablePoints;
        let sellerTotalPoints;


        let feedbackPoints = current_membership == "Welcome" ? membershipSettings.feedbackPoints.welcome : current_membership == "Blue" ? membershipSettings.feedbackPoints.blue : current_membership == "Silver" ? membershipSettings.profilePoints.silver : current_membership == "Gold" ? membershipSettings.profilePoints.gold : 0


        if(sellerMembershipTrack[sellerMembershipTrack.length - 1].isFeedback == false){
            sellerMembershipTrack[sellerMembershipTrack.length - 1].isFeedback = true;
            sellerMembershipTrack[sellerMembershipTrack.length - 1].feedbackPoints = feedbackPoints;
            sellerAvailablePoints =   sellerInfo.availablePoints + feedbackPoints
            sellerTotalPoints = sellerInfo.totalPoints + feedbackPoints
        }

        const sellerInfoObject = {
            track: sellerMembershipTrack,
            updatedIstAt: DateTime()
        }

        const updatedSellerInfo = await SellerInfo.update(sellerInfoObject,
            {
                where :{
                    sellerId:req.body.sellerId
                }
            });

        return res.status(201).json({
            error:false,
            message:"Seller feedback has been set successfully",
            updateFeedbackStatus : updatedSellerInfo
        });

    } catch (error) {
        console.log("Get Seller-Record-Data Error ::>>",error);
        next(error);
    }
};

export const sendNotificationForPendingRequest = async(req, res, next)=>{
    try {
        let { sellerId, requestedId } = req.body;
        const sellerInfo = await SellerInfo.findOne({
            where:{
                sellerId:sellerId
            },
            raw:true
        });
        if(!sellerInfo){
            return next(createError(403,'Seller not Found...!'));
        }
        // console.log("SellerInfo ::>>", sellerInfo);
        const voucherRequest = await SellerVouchers.findOne({
            where:{
                id:requestedId,
                sellerId:sellerId
            },
            raw:true
        });
        if(!voucherRequest){
            return next(createError(403,'Voucher Request not found...!'));
        }
        // console.log("Voucher Request ::>>", voucherRequest);
        const notify = voucherRequest.resendNotification;
        let notifyObj = {};
        if(!notify){
            notifyObj.count = 1;
            notifyObj.attemptAt = new Date(`${new Date().getFullYear()}-${new Date().getMonth()+1}-${new Date().getDate()}`);
        }
        else{
            const previousAttemptAt = new Date(notify.attemptAt);
            previousAttemptAt.setDate(previousAttemptAt.getDate()+1);
            if(new Date()<=previousAttemptAt){
                return next(createError(200, 'You already send Notification for this pending request try after 24 hours...!'));
            }
            const count = notify.count + 1;
            notifyObj.count = count;
            notifyObj.attemptAt = new Date(`${new Date().getFullYear()}-${new Date().getMonth()+1}-${new Date().getDate()}`);
        }
        // console.log("Notification ::>>", notifyObj);
        const updateVoucherRequest = await SellerVouchers.update({
            resendNotification:notifyObj
        },{
            where:{
                id:requestedId
            }
        });
        const notificationObj = {
            sellerId,
            itemId:requestedId,
            message:`Dear Admin, You have a notification for voucher pending request from seller ${voucherRequest.sellerName} and accountId ${voucherRequest.accountId} with order id ${voucherRequest.ExternalOrderId} for approving.`,
            category:'Voucher',
            createdIstAt:DateTime(),
            updatedIstAt:DateTime()
        };
        const newNotification = await Notification.create(notificationObj);
        //Send Mail to SuperAdmin
        // console.log("---",voucherRequest.sellerName, voucherRequest.email, "notificationObj.message", voucherRequest.accountId, voucherRequest.contactNo);
        SendingNotificationForPendingVoucherRequestMail(voucherRequest.sellerName, voucherRequest.email, notificationObj.message, voucherRequest.accountId, voucherRequest.contactNo);
        //----------------------
        return res.status(201).json({
            error:false,
            message:"Send Notification For Pending Request Successfully",
            data:updateVoucherRequest
        });
    } catch (error) {
        console.log("Send Notification For Pending Request Error ::>>",error);
        next(error);
    }
};

export const setSellerShippingAddress = async(req, res, next)=>{
    try {
        let { sellerId , makeDefault , sellerAddressId , shippingAddress } = req.body;
        if(sellerAddressId){
            const  addressExistCheck = await SellerShippingAddress.findOne({
                where : {
                    id : sellerAddressId
                }
            });
            if(!addressExistCheck){
                return createError(404, "No Shipping Address Found")
            }
            let updateDefaultAddress;
            if(!addressExistCheck.isDefault){
                await SellerShippingAddress.update({
                    isDefault : false
                },{
                    where:{
                        sellerId : sellerId,
                        isDefault : true
                    }
                })
                updateDefaultAddress = await SellerShippingAddress.update({isDefault : true},{where:{id : sellerAddressId}})
            }
            return res.status(200).json({
                error: false,
                message: 'Set Default Address Successfully',
                data: updateDefaultAddress
            })
        }
        const sellerData = await SellerShippingAddress.findOne({
            where:{
                sellerId: sellerId
            },
            raw: true
        })

        if(!sellerData){
            return  res.status(403).json({
                error:true,
                message:"No Shipping Address Found"
            })
        }

        if(makeDefault){ 
            await SellerShippingAddress.update({
                isDefault : false
            },{
                where:{
                    sellerId : sellerId,
                    isDefault : true
                }
            });
            const  newAddr = await SellerShippingAddress.create({
                shippingAddress: shippingAddress,
                isDefault : makeDefault,
                sellerId   : sellerId,
                createdIstAt:DateTime(),
                updatedIstAt:DateTime()
            });

            return res.status(201).json({
                error:false,
                message:"Save selller address successfully and make it on default.",
                data: newAddr
            });   
        }
        else{
            const  newAddr = await SellerShippingAddress.create({
                shippingAddress: shippingAddress,
                isDefault : makeDefault,
                sellerId : sellerId,
                createdIstAt:DateTime(),
                updatedIstAt:DateTime()
            });

            return res.status(201).json({
                error:false,
                message:"Save selller address successfully.",
                data: newAddr
            });
        }
    
    } catch (error) {
        console.log("Send Notification For Pending Request Error ::>>",error);
        next(error);
    }
};

export const getSellerShippingAddress = async(req, res, next)=>{
    try {
        let { sellerId } = req.body;
        // console.log("Get SellerId ::>>",sellerId);
        const sellerShippingAddress = await SellerShippingAddress.findAll({
            where:{
                sellerId: sellerId
            },
            raw: true
        });
        return res.status(200).json({
            error:false,
            message:"",
            data:sellerShippingAddress
        })
    
    } catch (error) {
        console.log("Get Seller Shipping Address Error ::>>",error);
        next(error);
    }
};

export const getSellerRedeemProductByOrderId = async(req, res, next)=>{
    try {
        let { sellerId, orderId } = req.body;
        const sellerRedeemProducts = await SellerProducts.findAll({
            where:{
                sellerId: sellerId,
                orderId
            },
            raw: true
        });
        return res.status(200).json({
            error:false,
            message:`Your Redeem Products with Order Id ${orderId}`,
            data:sellerRedeemProducts
        })
    } catch (error) {
        console.log("Get Seller Redeem Product By Order Id Error ::>>",error);
        next(error);
    }
}; 

export const getAllRedeemProductOfSeller = async(req, res, next)=>{
    try {
        let { sellerId, limit, page } = req.body;
        page = page || 1;
        limit = limit || 10;
        const offset = limit * (page-1);
        const sellerRedeemProducts = await SellerProducts.findAll({
            where:{sellerId},
            order:[
                ['id', 'desc']
            ],
            limit,
            offset,
            raw: true
        });
        const totalProducts = await SellerProducts.count({where:{sellerId}});
        return res.status(200).json({
            error:false,
            message:`Seller All Redeem Products`,
            totalProductInAPage:sellerRedeemProducts.length,
            totalProducts,
            data:sellerRedeemProducts
        })
    } catch (error) {
        console.log("Seller All Redeem Products Error ::>>",error);
        next(error);
    }
}; 

export const getNotificationPreference = async(req, res, next)=>{
    try {
        const {sellerId} = req.body;
        const getSeller = await Seller.findOne({
            attributes:['notificationPreference'],
            where:{
                id:sellerId
            },
            raw:true
        });
        if(!getSeller){
            return next(createError(403, "Seller Not found"))
        }
        return res.status(200).json({
            error:false,
            message:`Your Notification Preference`,
            data:getSeller
        })
    } catch (error) {
        console.log("Seller Notification Preference ::>>",error);
        next(error);
    }
}; 

export const changeNotificationPreference = async(req, res, next)=>{
    try {
        const {sellerId , mail, sms, whatsapp} = req.body;
        const seller = await Seller.findOne({
            where:{
                id:sellerId
            },
            raw:true
        });
        const updatePreference = await Seller.update({
            notificationPreference:{mail:mail, sms:sms, whatsapp:whatsapp}
        },{
            where:{
                id:sellerId
            }
        });
        // if(whatsapp){
        //     set_user_opt_in(seller.contactNo);
        // }
        // else set_user_opt_out(seller.contactNo);
        return res.status(200).json({
            error:false,
            message:`Notification Preference Updated Successfully!`,
            data:updatePreference
        })
    } catch (error) {
        console.log("Update Notification Preference Error ::>>",error);
        next(error);
    }
}; 

// [
//     "Number",
//     "Name",
//     "Shop Name",
//     "Mobile number",
//     "Location",
//     "State",
//     "Pincode",
//     "Email Id",
//     "Address",
//     "DOB",
//     "Marriage Anniversary"
// ]

export const importSellerFromExcel = async(req, res, next)=>{
    try {
        const filePath = path.join(__dirname, '../../../assests/', req.sellerFile['filePath']);
        const workSheetsFromFile = xlsx.parse(filePath);
        const sheet = workSheetsFromFile[0].data;
        const data = [];
        for(let i=0;i<sheet.length;i++){
            const obj = {
                name:sheet[i][3],
                shopName:sheet[i][3],
                bizomId:sheet[i][2],
                mobileNumber:sheet[i][1],
                location:sheet[i][4],
                state:sheet[i][5],
                pinCode:sheet[i][6],
                address:sheet[i][7],
                dob:sheet[i][8],
                marriageDate:sheet[i][9]
            };
            data.push(obj);
        };
        const sellers = await PreviousSeller.bulkCreate(data);
        unlinkSync(filePath);
        return res.status(200).json({
            error:false,
            message:'Import file Successfully',
            data:sellers,
            // sheet
        })
    } catch (error) {
        console.log("Import Seller From Excel Error ::>>",error);
        next(error);
    }
}

export const autoFetchPreviousSellerData = async(req, res, next)=>{
    try {
        let whereClause = {};
        if(req.body.email){
            whereClause.email = req.body.email
        }
        if(req.body.contactNo){
            whereClause.mobileNumber = req.body.contactNo
        }
        const seller = await PreviousSeller.findOne({
            where:whereClause,
            raw:true
        });
        return res.status(200).json({
            error:false,
            message:'Seller previous Data Fetched Successfully',
            data:seller
        })
    } catch (error) {
        console.log("Seller previous Data Fetched Error ::>>",error);
        next(error);
    }
}

export const show1MonthsBeforeExpiredPointsOfSeller = async(req, res, next)=>{
    try {
        const expiredPointQuery = `SELECT * FROM sellergraceperiodpointrecords AS sgpr WHERE sgpr.activityStatus='NotFullfilled' AND DATEDIFF(CURDATE(), DATE(sgpr.actionOnDate))<=30 AND sgpr.sellerId='${req.body.sellerId}'`;
        const expiredPointsData = await sequelize.query(expiredPointQuery,{
            replacements:[],
            type:Sequelize.QueryTypes.SELECT
        });
        return res.status(200).json({
            error:false,
            message:"These point are Expired with in 1 Months!",
            data:expiredPointsData
        })
    } catch (error) {
        console.log('Show 1 Month before expired points of seller Error ::>>', error);
        next(error);
    }
}

//for cron jobsh
export const expirySellerPoints = async()=>{
    try {
        const expiredPointQuery = `SELECT * FROM sellergraceperiodpointrecords AS sgpr WHERE sgpr.activityStatus='NotFullfilled' AND Date(sgpr.actionOnDate)=CURDATE()`;
        const getData = await sequelize.query(expiredPointQuery,{
            replacements:[],
            type:Sequelize.QueryTypes.SELECT
        });
        getData.map(async(data)=>{
            let deductPoints = data.deductPoints;
            const sellerQuery = `SELECT * FROM sellerinfos AS si WHERE si.contactNo='${data.contactNo}'`;
            const seller = await sequelize.query(sellerQuery,{
                replacements:[],
                type:Sequelize.QueryTypes.SELECT
            });
            if(seller.length){
                let newPoints = Number(seller[0].availablePoints)-Number(deductPoints)<0 ? 0 : Number(seller[0].availablePoints)-Number(deductPoints);
                const sellerUpdateQuery = `UPDATE sellerinfos SET availablePoints='${newPoints}' WHERE id='${seller[0].id}'`;
                await sequelize.query(sellerUpdateQuery,{
                    replacements:[],
                    type:Sequelize.QueryTypes.UPDATE
                });
                const updateExpiredPointQuery = `UPDATE sellergraceperiodpointrecords SET activityStatus='Expired' WHERE id='${data.id}'`;
                await sequelize.query(updateExpiredPointQuery,{
                    replacements:[],
                    type:Sequelize.QueryTypes.UPDATE
                });
            }
        });
    } catch (error) {
        console.log("Expiry of seller points error ::>>", error);
    }
}

export const checkfunction = async(req, res, next)=>{
    try {
        const {sellerId, usedPoints} = req.body;
        const data = await sellersPointsExpiryNotify();
        return res.status(200).json({
            error:false,
            data
        })
    } catch (error) {
        console.log("check function error ::>>", error);
        next(error);
    }
}

export const pointsUpdateInGracePeriodsPointRecord = async(sellerId, usedPoints, transaction)=>{
    try {
        let calculatePoints = 0;
        let updateIds = [];
        const expiredPointQuery = `SELECT * FROM sellergraceperiodpointrecords AS sgpr WHERE sgpr.activityStatus='NotFullfilled' AND sgpr.sellerId='${ sellerId}'`;
        const expiredPointsData = await sequelize.query(expiredPointQuery,{
            replacements:[],
            type:Sequelize.QueryTypes.SELECT
        });
        if(expiredPointsData.length){
            for(let i=0;i<expiredPointsData.length;i++){
                calculatePoints += Number(expiredPointsData[i].deductPoints);
                if(Number(calculatePoints)<Number(usedPoints)){
                    updateIds.push(expiredPointsData[i].id);
                }
                else if(Number(calculatePoints)===Number(usedPoints)){
                    updateIds.push(expiredPointsData[i].id);
                    break;
                }
                else if(Number(calculatePoints)>Number(usedPoints)){
                    let leftPoints = Number(calculatePoints) - Number(usedPoints);
                    const updateExpiredPointQuery = `UPDATE sellergraceperiodpointrecords SET deductPoints='${leftPoints}' WHERE id = '${expiredPointsData[i].id}'`;
                    await sequelize.query(updateExpiredPointQuery,{
                        replacements:[],
                        type:Sequelize.QueryTypes.UPDATE,
                        transaction
                    });
                    break;
                }
            }
            if(updateIds.length){
                const updateExpiredPointQuery = `UPDATE sellergraceperiodpointrecords SET activityStatus='Fullfilled' WHERE id in (${updateIds.join(',')})`;
                await sequelize.query(updateExpiredPointQuery,{
                    replacements:[],
                    type:Sequelize.QueryTypes.UPDATE,
                    transaction
                });
            }
        }
    } catch (error) {
        console.log("Error ::>>", error);
        throw error;
    }
}

export const sellersPointsExpiryNotify = async()=>{
    try {
        const query =  `SELECT sgpr.*, sd.firstName, DATEDIFF(sgpr.actionOnDate, CURDATE()) as remainingDays FROM sellergraceperiodpointrecords AS sgpr INNER JOIN sellers as sd ON sd.id=sgpr.sellerId WHERE sgpr.activityStatus='NotFullfilled' AND DATEDIFF(sgpr.actionOnDate, CURDATE()) in (7, 30, 90);`;
        const sellerData = await sequelize.query(query, {
                replacements: [],
                type: Sequelize.QueryTypes.SELECT
        });
        sellerData.map((seller)=>{
            expiry_points_whatsapp_message(seller.contactNo, seller.firstName, seller.deductPoints, seller.actionOnDate.toDateString());
            lapseRewardPoints(seller.contactNo, seller.firstName, seller.deductPoints, seller.actionOnDate.toDateString());
        })
        return sellerData;
    } catch (error) {
        console.log("Seller Points Expiry Notify Error ::>>", error);
    }
}

export const giveWelcomePointsOfSeller = async(req, res)=>{
    try {
        const { sellerId } = req.body;
        const registerPoint = process.env.REGISTER_POINT || 500;
        sellerId.map(async(item, index) => {
            // console.log(item, "item.sellerId")
            const sellerDataQuery = `SELECT * FROM sellerinfos WHERE sellerId = :sellerId`;
            const sellerData = await sequelize.query(sellerDataQuery, {
                replacements: { sellerId: item },
                type: Sequelize.QueryTypes.SELECT
            });

            if(sellerData.length !== 0)
            {
                const transactionObj = {
                    transactionId: generateTransactionId(),
                    sellerId: item,
                    transactionCategory:'WelcomeBonus',
                    status: 'Earn',
                    points: registerPoint,
                    createdIstAt: DateTime(),
                    updatedIstAt: DateTime()
                };
                const profileTransaction = await Transaction.create(transactionObj);

                const newTotalPoints = Number(sellerData[0].totalPoints)+Number(registerPoint);

                const updateSellerInfosPointQuery = `UPDATE sellerinfos SET totalPoints=:totalPoints, availablePoints=:availablePoints, finacialPoints=:finacialPoints WHERE sellerId = :sellerId`;
                const updateSellerData = await sequelize.query(updateSellerInfosPointQuery,{
                    replacements:{ sellerId: item, totalPoints: newTotalPoints, availablePoints: Number(sellerData[0].availablePoints)+Number(registerPoint), finacialPoints: Number(sellerData[0].finacialPoints)+Number(registerPoint)},
                    type:Sequelize.QueryTypes.UPDATE,
                    // transaction
                });
        }
        })
        return res.status(200).json({
            error:false,
            message:'Give Welcome point Successfully',
            data:sellerId
        })
    } catch (error) {
        console.log("Error ::>>", error);
        throw error;
    }
}


export const updateCreatedAtofSeller = async(req, res)=>{
    try {
        const { sellerId } = req.body;
        sellerId.map(async(item, index) => {
            console.log(item, "item.sellerId")
            const sellerDataQuery0 = `SELECT * FROM sellers WHERE id = :sellerId`;
            const sellerData0 = await sequelize.query(sellerDataQuery0, {
                replacements: { sellerId: item },
                type: Sequelize.QueryTypes.SELECT
            });

            const transactionDataQuery = `SELECT * FROM transactions WHERE sellerId = :sellerId AND transactionCategory="WelcomeBonus"`;
            const sellerData = await sequelize.query(transactionDataQuery, {
                replacements: { sellerId: item },
                type: Sequelize.QueryTypes.SELECT
            });

            if(sellerData.length !== 0)
            {
                const updateSellerInfosPointQuery = `UPDATE transactions SET createdIstAt=:createdIstAt, createdAt=:createdAt WHERE sellerId = :sellerId AND transactionCategory="WelcomeBonus"`;
                const updateSellerData = await sequelize.query(updateSellerInfosPointQuery,{
                    replacements:{ 
                        createdIstAt: sellerData0[0].createdIstAt,
                        createdAt: sellerData0[0].createdAt,
                        sellerId: sellerId
                    },
                    type:Sequelize.QueryTypes.UPDATE,
                    // transaction
                });
        }
        })
        return res.status(200).json({
            error:false,
            message:'Created date updated Successfully',
            data:sellerId
        })
    } catch (error) {
        console.log("Error ::>>", error);
        throw error;
    }
}
