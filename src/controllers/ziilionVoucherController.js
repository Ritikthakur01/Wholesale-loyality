import { zillionDecryption, zillionEncryption } from "../../utils/constant/encrypt_decrypt";
import generatePin from "../../utils/constant/generatePin";
import DateTime from "../../utils/constant/getDate&Time";
import { createError } from "../../utils/error";
import { sendOTPForVoucherRedemption } from "../../utils/messages/sms_messages";
import { sent_otp_for_redemption_voucher_whatsapp } from "../../utils/messages/whatsapp_messages";
import { Seller, SellerInfo } from "../models/Seller";
import JWT from 'jsonwebtoken';
import { Transaction } from "../models/Transaction";
import generateTransactionId from "../../utils/constant/generateTransactionId";
import { getTransactionBetweenDates } from "./transactionController";
import { getAllTransaction, pointsUpdateInGracePeriodsPointRecord } from "./sellerController";
import { create } from "qrcode";
import { AuthorizationCode } from "../models/AuthorizationCode";
import crypto from 'crypto';
import dotenv from 'dotenv';
import { error } from "console";
import sequelize from "../../utils/db/dbConnection";
dotenv.config();

export const getRedirectionWithAuthCode = async(req, res, next)=>{
    try {
        if(!req.user){
            return next(createError(403, 'You are not a authorised user...!'));
        }
        //here we get sellerId from query params
        if(req.user.id!==Number(req.query.sellerId) || req.user.role!=='wholeseller'){
            return next(createError(403, "unauthorised user...!"))
        }
        const seller = await Seller.findOne({
            where:{
                id:req.query.sellerId
            },
            raw:true
        });
        if(!seller){
            return next(createError(403,'There is No Seller Found'));
        }
        const authorizationCode = crypto.randomBytes(16).toString("hex");
        const newAuthorization = await AuthorizationCode.create({
            authCode:authorizationCode,
            sellerId:req.query.sellerId,
            accountId:seller.accountId
        });
        // return res.status(200).redirect(``);
        return res.status(200).json({
            error:false,
            message:"Got the Redirection and auth code Successfully",
            // data:{ sellerId:seller.id, accountId:seller.accountId, firstName:seller.firstName, lastName:seller.lastName, 
            //     email:seller.email, contactNo:seller.contactNo },
            devRedirectUrl:`${process.env.DEV_ZILLION_SERVER_URL}/?code=${newAuthorization.authCode}`,
            qaRedirectUrl:`${process.env.QA_ZILLION_SERVER_URL}/?code=${newAuthorization.authCode}`,
            uatRedirectUrl:`${process.env.UAT_ZILLION_SERVER_URL}/?code=${newAuthorization.authCode}`,
            preProdRedirectUrl:`${process.env.PRE_PROD_ZILLION_SERVER_URL}/?code=${newAuthorization.authCode}`,
        });
    } catch (error) {
        console.log("Get Redirection with Authentication Code Error ::>>",error);
        next(error);
    }
}

export const sendAuthorizeToken = async(req, res, next)=>{
    try {
        const { client_id, client_secret, u_code, response_type } = req.query;
        if(!client_id){
            return next(createError(403,'unauthorised Access'));
        }
        if(!client_secret){
            return next(createError(403,'unauthorised Access'));
        }
        if(!u_code){
            return next(createError(403,'unauthorised Access'));
        }
        if(!response_type || req.query?.response_type!=='token'){
            return next(createError(403,'unauthorised Access'));
        }
        const ZILLION_CLIENT_ID = process.env.ZILLION_CLIENT_ID;
        const ZILLION_CLIENT_SECRET = process.env.ZILLION_CLIENT_SECRET;
        if(ZILLION_CLIENT_ID!==client_id){
            return next(createError(403,'unauthorised Access'));
        }
        if(ZILLION_CLIENT_SECRET!==client_secret){
            return next(createError(403,'unauthorised Access'));
        }
        const getAuthorizationCode = await AuthorizationCode.findOne({
            where:{
                authCode:u_code
            },
            raw:true
        });
        if(!getAuthorizationCode){
            return next(createError(403,'Invalid Auth'));
        }
        const seller = await Seller.findOne({
            where:{
                id:getAuthorizationCode.sellerId,
                accountId:getAuthorizationCode.accountId
            },
            raw:true
        });
        if(!seller){
            return next(createError(403,'Invalid Seller'));
        }   
        //delete authorization code
        if(u_code!=='5fa3b0134badc42482ca4c7dfe236672') await AuthorizationCode.destroy({where:{authCode:u_code}});
        //generate jwt token
        const token = JWT.sign({role:seller.roles, data:{ sId:seller.id, accountId:seller.accountId, firstName:seller.firstName, lastName:seller.lastName, 
                                 email:seller.email, contactNo:seller.contactNo }},            
            process.env.ZILLION_JWT_SECRET_KEY,{ expiresIn: '2h' });
        //encrypt the token
        const encryptToken = zillionEncryption(token);
        // const decryptToken = zillionDecryption(encryptToken);
        return res.status(200).json({
            status:true,
            error:false,
            message:"Success",
            data1:token,
            data:encryptToken,
            status_code:200
        });
    } catch (error) {
        console.log("Send Authorize Token Error ::>>",error);
        next(error);
    }
}

// export const generateOTPForZ = async(req, res, next)=>{
//     try {
//         const { mobile_number } = req.body;
//         if(!mobile_number || mobile_number.length!==10){
//             return next(createError(403,'Providing invalid mobile number'));
//         }
//         const sellerInfo = await SellerInfo.findOne({
//             where:{
//                 contactNo:mobile_number
//             },
//             raw:true
//         });
//         if(!sellerInfo){
//             return next(createError(403,'There is No Seller Found'));
//         }
//         const otp = generatePin();
//         const updateSeller = await SellerInfo.update({
//             otp,
//             otpTimeStampAt:new Date(),
//             verified:'unverified',
//             updatedIstAt:DateTime()
//         },{
//             where:{
//                 contactNo:mobile_number
//             }
//         });
//         // console.log("update seller ::>>",updateSeller);
//         if(updateSeller[0]===0){
//             return next(createError(403, "Something Went Wrong"));
//         }
//         const contactNo = sellerInfo.contactNo;
//         const response = await sendOTPForVoucherRedemption(contactNo, otp);
//         if(response.statusCode!=='200'){
//             return next(createError(401, "Something went wrong...!"))
//         }
//         //send otp to whatsapp
//         await sent_otp_for_redemption_voucher_whatsapp(sellerInfo.contactNo, '', otp);
//         return res.status(200).json({
//             error:false,
//             message:"OTP has been sent for Redemption of Voucher",
//             data:"Sent"
//         });
//     } catch (error) {
//         console.log("Z-Generate Otp Error ::>>",error);
//         next(error);
//     }
// }

export const generateOTPForZ = async(req, res, next)=>{
    try {
        const { mobile_number } = req.body;

        // Validate mobile number
        if (!mobile_number || mobile_number.length !== 10) {
            return next(createError(403, 'Providing invalid mobile number'));
        }

        // Find seller by mobile number
        const findSellerQuery = `SELECT * FROM sellerinfos WHERE contactNo = ?`;
        const sellerInfoResult = await sequelize.query(findSellerQuery, {
            replacements: [mobile_number],
            type: sequelize.QueryTypes.SELECT
        });

        if (!sellerInfoResult || sellerInfoResult.length === 0) {
            return next(createError(403, 'There is No Seller Found'));
        }

        const sellerInfo = sellerInfoResult[0];
        const otp = generatePin();

        // Update seller information with OTP and timestamp
        const updateSellerQuery = `
            UPDATE sellerinfos
            SET otp = ?, otpTimeStampAt = ?, verified = 'unverified', updatedIstAt = ?
            WHERE contactNo = ?
        `;
        const updateSellerResult = await sequelize.query(updateSellerQuery, {
            replacements: [otp, new Date(), DateTime(), mobile_number],
            type: sequelize.QueryTypes.UPDATE
        });

        // Check if update was successful
        if (updateSellerResult[0] === 0) {
            return next(createError(403, "Something Went Wrong"));
        }

        // Send OTP to the seller
        const contactNo = sellerInfo.contactNo;
        const response = await sendOTPForVoucherRedemption(contactNo, otp);

        if (response.statusCode !== '200') {
            return next(createError(401, "Something went wrong...!"));
        }

        // Send OTP to WhatsApp
        await sent_otp_for_redemption_voucher_whatsapp(sellerInfo.contactNo, '', otp);

        return res.status(200).json({
            error: false,
            message: "OTP has been sent for Redemption of Voucher",
            data: "Sent"
        });

    } catch (error) {
        console.log("Z-Generate Otp Error ::>>",error);
        next(error);
    }
}

// export const holdCoin = async(req, res, next)=>{
//     const transaction = await sequelize.transaction();
//     try {
//         const { otp, mobile_number, point_used, order_id } = req.body;
//         if(!mobile_number || mobile_number.length!==10){
//             return next(createError(403,'Please providing the valid mobile number'));
//         }
//         if(!otp){
//             return next(createError(403,'Please providing the providing invalid otp'));
//         }
//         if(!point_used){
//             return next(createError(403,'Please providing the providing invalid points'));
//         }
//         if(!order_id){
//             return next(createError(403,'Please providing the providing order id'));
//         }
//         const findTransaction = await Transaction.findOne({
//             where:{
//                 ExternalOrderId:order_id
//             },
//             raw:true
//         });
//         if(findTransaction){
//             return next(createError(403, 'Invalid request due to duplicate order Id'));
//         }
//         const seller = await SellerInfo.findOne({
//             where:{
//                 contactNo:mobile_number
//             },
//             raw:true
//         });
//         if(!seller){
//             return next(createError(403,"Seller not found...!"));
//         }
//         const getOtpTime = seller.otpTimeStampAt;
//         // console.log("get Otp time ::>>",new Date(new Date(getContactNo.otpTimeStampAt).getTime()+5*60*1000));
//         // console.log("get now time ::>>",new Date());
//         if(new Date().getTime()>new Date(new Date(seller.otpTimeStampAt).getTime()+5*60*1000)){
//             return next(createError(401, "Time expired of Otp verification...!"))
//         }
//         if(Number(seller.otp)!==Number(otp)){
//             return res.status(403).json({
//                 error:true,
//                 message:"OTP has not verified for Redemption of Voucher",
//                 data:{verified:false}
//             });
//         }
//         if(Number(seller.availablePoints)<Number(point_used)){
//             return next(createError(403,'Seller does not have enough points balance'));
//         }
//         //deduction of available points below ----->>
//         let upgradeAvailablePoints = Number(seller.availablePoints) - Number(point_used);
//         const updateSeller = await SellerInfo.update({
//             availablePoints:upgradeAvailablePoints,
//             otp:"f^f^f^",
//             verified:"",
//             updatedIstAt:DateTime()
//         },{
//             where:{
//                 contactNo:mobile_number
//             },
//             transaction
//         });
//         //create transaction of redeem Coins
//         const createTransaction = await Transaction.create({
//             transactionId:generateTransactionId(),
//             ExternalOrderId:order_id,
//             sellerId:seller.sellerId,
//             transactionCategory:'VoucherRedeem',
//             points:point_used,
//             status:'Hold',
//             createdIstAt:DateTime(),
//             updatedIstAt:DateTime(),
//         },{
//             transaction
//         });
//         await transaction.commit();
//         res.res_data = {
//             error:false,
//             message:"OTP hash been verified for Redemption of Voucher",
//             data:{otpVerified:true}
//         }
//         next();
//     } catch (error) {
//         await transaction.rollback();
//         console.log("Z-Otp Verification for hold coins Error ::>>",error);
//         next(error);
//     }
// }

export const holdCoin = async(req, res, next)=>{ 
    const transaction = await sequelize.transaction();
    try {
        const { otp, mobile_number, point_used, order_id } = req.body;
        if (!mobile_number || mobile_number.length !== 10) {
            return next(createError(403, 'Please provide a valid mobile number'));
        }

        if (!otp) {
            return next(createError(403, 'Please provide a valid OTP'));
        }

        if (!point_used) {
            return next(createError(403, 'Please provide valid points'));
        }

        if (!order_id) {
            return next(createError(403, 'Please provide a valid order ID'));
        }

        const findTransactionQuery = `SELECT * FROM transactions WHERE ExternalOrderId = ?`;
        const findTransaction = await sequelize.query(findTransactionQuery, {
            replacements: [order_id],
            type: sequelize.QueryTypes.SELECT
        });

        if (findTransaction.length > 0) {
            return next(createError(403, 'Invalid request due to duplicate order ID'));
        }

        const findSellerQuery = `SELECT * FROM sellerinfos WHERE contactNo = ?`;
        const seller = await sequelize.query(findSellerQuery, {
            replacements: [mobile_number],
            type: sequelize.QueryTypes.SELECT,
            raw: true
        });

        if (!seller || seller.length === 0) {
            return next(createError(403, "Seller not found...!"));
        }

        const sellerData = seller[0];
        const getOtpTime = sellerData.otpTimeStampAt;

        if (new Date().getTime() > new Date(new Date(sellerData.otpTimeStampAt).getTime() + 5 * 60 * 1000)) {
            return next(createError(401, "Time expired for OTP verification...!"));
        }


        if (Number(sellerData.otp) !== Number(otp)) {
            return res.status(403).json({
                error: true,
                message: "Invalid OTP",
                data: { verified: false }
            });
        }

        if (Number(sellerData.availablePoints) < Number(point_used)) {
            return next(createError(403, 'Seller does not have enough points balance'));
        }

        let upgradeAvailablePoints = Number(sellerData.availablePoints) - Number(point_used);
        const updateSellerQuery = `
            UPDATE sellerinfos
            SET availablePoints = ?, otp = 'f^f^f^', verified = '', updatedIstAt = ?
            WHERE contactNo = ?
        `;
        await sequelize.query(updateSellerQuery, {
            replacements: [upgradeAvailablePoints, DateTime(), mobile_number],
            type: sequelize.QueryTypes.UPDATE,
            transaction
        });

        const createTransactionQuery = `
            INSERT INTO transactions (transactionId, ExternalOrderId, sellerId, transactionCategory, points, status, createdIstAt, updatedIstAt, createdAt, updatedAt)
            VALUES (?, ?, ?, 'VoucherRedeem', ?, 'Hold', ?, ?, NOW(), NOW())
        `;
        await sequelize.query(createTransactionQuery, {
            replacements: [
                generateTransactionId(),
                order_id,
                sellerData.sellerId,
                point_used,
                DateTime(),
                DateTime(),
            ],
            type: sequelize.QueryTypes.INSERT,
            transaction
        });
        await pointsUpdateInGracePeriodsPointRecord(sellerData.sellerId, point_used, transaction);
        await transaction.commit();
        res.res_data = {
            error:false,
            message:"OTP hash been verified for Redemption of Voucher",
            data:{otpVerified:true}
        }
        next();
    } catch (error) {
        await transaction.rollback();
        console.log("Z-Otp Verification for hold coins Error ::>>",error);
        next(error);
    }
}

export const redeemCoins = async(req, res, next)=>{
    try {
        const { order_id } = req.body;
        if(!order_id){
            return next(createError(403,'Please providing the valid Order_id'));
        }
        //track the exterOrderId -> order_id
        const getTransaction = await Transaction.findOne({
            attributes:['transactionId','externalOrderId','points','createdIstAt','status'],
            where:{
                ExternalOrderId:order_id,
                status:'Hold'
            },
            raw:true
        });
        //update the status Redeem points
        await Transaction.update({
            status:'Redeem'
        },{
            where:{
                ExternalOrderId:order_id,
                status:'Hold'
            }
        });

        res.res_data = {
            error:false,
            message:"Z-Redeem Coins found Successfully",
            data:{...getTransaction,status:'Redeem'}
        };
        next();
    } catch (error) {
        console.log("Z-Redeem Coins found Error ::>>",error);
        next(error);
    }
}

export const refundCoins = async(req, res, next)=>{
    const transaction = await sequelize.transaction();
    try {
        const { mobile_number, order_id, point_used, status } = req.body;
        //status -->> Refund, Release
        if(!order_id){
            return next(createError(403,'Please providing the valid Order_id'));
        }
        if(!point_used){
            return next(createError(403,'Please providing the providing points'));
        }
        // in case of any issue or failure then status change to hold to release
        //if seller cancel the transaction then status change redeem to refund
        let whereClause = {
            ExternalOrderId:order_id
        };
        if(status==='Release') whereClause.status = 'Hold'
        else whereClause.status = 'Redeem'
        const getTransaction = await Transaction.findOne({
            where:whereClause,
            raw:true
        });
        if(!getTransaction){
            return next(createError(403,'Transaction Not found with the given order id'));
        }
        if(Number(getTransaction.points)!==Number(point_used)){
            return next(createError(403,'Transaction not valid with the points mismatch'));
        }
        //update the status
        await Transaction.update({
            status:status
        },{
            where:{
                ExternalOrderId:order_id
            },
            transaction
        })
        const seller = await SellerInfo.findOne({
            where:{
                contactNo:mobile_number
            },
            raw:true
        });
        if(!seller){
            return next(createError(403,"Seller not found...!"));
        }
        let upgradeAvailablePoints = Number(seller.availablePoints) + Number(point_used);
        //change with transaction data points instead of amount
        const updateSeller = await SellerInfo.update({
            availablePoints:upgradeAvailablePoints
        },{
            where:{
                sellerId:getTransaction.sellerId
            },
            transaction
        });
        await transaction.commit();
        res.res_data = {
            error:false,
            message:"Refund Coins to the Seller Successfully",
            data:{message:true}
        };
        next();
    } catch (error) {
        await transaction.rollback();
        console.log("Refund Coins to seller Error ::>>",error);
        next(error);
    }
}

export const getCoinBalance = async(req, res, next)=>{
    try {
        const { mobile_number } = req.body;
        if(!mobile_number || mobile_number.length!==10){
            return next(createError(403,'Please providing the valid mobile number'));
        }
        const seller = await SellerInfo.findOne({
            where:{
                contactNo:mobile_number
            },
            raw:true
        });
        if(!seller){
            return next(createError(403,"Seller not found...!"));
        }
        return res.status(200).json({
            error:false,
            message:"Coins Balance of Seller",
            data:{pointBalance:seller.availablePoints}
        });
    } catch (error) {
        console.log("Z-Coins Balance Error ::>>",error);
        next(error);
    }
}

export const getSellerInfo = async(req, res, next)=>{
    try {
        if(!req.zUser){
            return next(createError(403,'unauthorised Access'));
        }
        const seller = await Seller.findOne({
            where:{accountId:req.zUser.data.accountId},
            raw:true
        });
        const sellerInfo = await SellerInfo.findOne({
            where:{
                sellerId:seller.id
            },
            raw:true
        });
        if(!seller){
            return next(createError(403,"Seller not found...!"));
        }
        return res.status(200).json({
            error:false,
            message:"Seller Info",
            data:{
                accountId:seller.accountId,
                name:seller.firstName+" "+seller.lastName,
                email:seller.email,
                mobile_number:seller.contactNo,
                pointBalance:sellerInfo.availablePoints
        }});
    } catch (error) {
        console.log("Get-Seller-Info Error ::>>",error);
        next(error);
    }
}

//logout from ziilion

export const zillionLogout = async(req, res, next)=>{
    try {
        if(!req.zUser){
            return next(createError(403,'unauthorised Access'));
        }
        req.logout((err) => {
            if (err) {
                return next(createError(500, "Error in ,logging out"))
            }});
        req.session.regenerate((err) => {
            if (err) {
                return next(createError(500, "Error in ,logging out"))
            } 
        });
        return res.clearCookie('connect.sid').status(200).json({
            error:false,
            message:'Logout SuccessFully',
            redirectUrl:`${process.env.UI_REDIRECT_URL}/logout`
        })
        
    } catch (error) {
        console.log("Zillion Logout Error ::>>",error);
        next(error);
    }
}