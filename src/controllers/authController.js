import { Seller, SellerInfo, SellerMembershipTrack, SellerShippingAddress } from '../models/Seller.js';
import bcrypt from 'bcryptjs';
import JWT from "jsonwebtoken";
import { createError } from '../../utils/error.js';
import generatePassword from '../../utils/constant/generatePassword.js';
import generateSalt from '../../utils/constant/generateSalt.js';
import generateUniqueAccountId from '../../utils/constant/generateAccountId.js';
import { Staff } from '../models/Staff.js';
import Query from '../../utils/db/rawQuery.js';
import DateTime from '../../utils/constant/getDate&Time.js';
import generatePin from '../../utils/constant/generatePin.js';
import axios from 'axios';
import dotenv from 'dotenv';
import { set_user_opt_in, sent_OTP_to_whatsapp, sent_welcome_message_whatsapp , sent_forget_password_whatsapp } from '../../utils/messages/whatsapp_messages.js';
import { ContactVerify } from '../models/ContactVerify.js';
import { forgotPasswordBySMS, OTPLogin, sendOTP, signupotp, welcomeMessage } from '../../utils/messages/sms_messages.js';
import { sendForgettingPasswordMail, sendOTPLoginMail, sendRegistrationMail } from '../../utils/mail/mail_message.js';
import { CouponCode } from '../models/Coupon.js';
import DeviceDetector from "device-detector-js";
import { SellerLoggingHistory } from '../models/Seller.js';
import { generateMemberShipId } from '../../utils/constant/generateMemberShipId.js';
import { Membership } from '../models/Membership.js';
import sequelize from '../../utils/db/dbConnection.js';
import { Transaction } from '../models/Transaction.js';
import generateTransactionId from '../../utils/constant/generateTransactionId.js';
import { PinCode } from '../models/Pincode.js';

dotenv.config();

const REGISTER_POINT = process.env.REGISTER_POINT || 500;
const REGISTER_POINT_TILL_DATE = process.env.REGISTER_POINT_TILL_DATE || '2024-11-01';
//register seller
export const register = async(req, res, next) => {
    const transaction = await sequelize.transaction();
    try{
        // coupon verify
        if(!req.body.code || req.body.code===""){
            return next(createError(403,"Please Enter Valid Coupon Code!"));
        }
        if(!req.body.serialNo || req.body.serialNo===""){
            return next(createError(403,"Please Enter Valid Serial Code!"));
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
        return next(createError(404, "Invalid Coupon !"));
        }
        if (getCoupon.isActive === 'Inactive') {
        return next(createError(404, "Your Coupon code is not valid!"));
        }
        if (getCoupon.status === 'Used') {
            return next(createError(404, "Coupon Code Already Used!"));
        }
        if (getCoupon.status === 'Expired' || new Date(formattedToday) > getCoupon.endDate) {
            return next(createError(404, "Expired Coupon Code!"));
        }
        //coupon verified yet
        //encrypt password
        if(!req.body.firstName || req.body.firstName===""){
            return next(createError(403,"Incorrect Details, Enter Valid First Name"));
        }
        // if(!req.body.lastName || req.body.lastName===""){
        //     return next(createError(403,"Incorrect Details, Enter Valid Last Name"));
        // }
        // if(!req.body.email || req.body.email===""){
        //     return next(createError(403,"Incorrect Details, Enter Valid E-mail ID"));
        // }
        if(!req.body.contactNo || String(req.body.contactNo).length>10 || String(req.body.contactNo).length<10){
            return next(createError(403,"Incorrect Details, Enter Valid Contact No."));
        }
        // if(!req.body.password || req.body.password===""){
        //     return next(createError(403,"Enter Correct Password "));
        // }
        // if(!req.body.confirmPassword || req.body.confirmPassword===""){
        //     return next(createError(403,"Enter Correct Password"));
        // }
        // if(req.body.password!==req.body.confirmPassword){
        //     return next(createError(403,`Password Mismatch, Enter Correct Password`));
        // }
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

        // const password = req.body.password;
        const password = Math.random().toString(36).slice(2,10);
        const number = generateSalt();
        const salt = bcrypt.genSaltSync(number);
        const hash = bcrypt.hashSync(password, salt);
        // const id = generateUniqueAccountId();
    
        const sellerObj = {
            // accountId:id,
            firstName : req.body.firstName,
            lastName: req.body.lastName,
            // email : req.body.email,
            contactNo : req.body.contactNo,
            password : hash,
            bizomId:req.body?.bizomId,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        };
        const getPinCode = await PinCode.findOne({
            where: {
              pinCode: req.body?.billingAddress?.pinCode,
              status: 'Active'
            },
            raw: true
        });
        if (!getPinCode) {
          return next(createError(404, "Pincode not found...!"))
        }
        if(req.body?.email){
            sellerObj.email = req.body?.email;
            const getSeller = await Seller.findOne({
                where:{
                    email:req.body?.email
                },
                raw:true
            });
            if(getSeller){
                return next(createError(403,`E-mail ID already registered : ${sellerObj.email}`));
            }
        }
        const getContactNo = await ContactVerify.findOne({
            where:{
                contactNo:req.body.contactNo
            },
            raw:true
        })
        // console.log("GetSeller ::>>",getSeller)
        if(!getContactNo){
            return next(createError(403,`Please registered with this Contact Number : ${sellerObj.contactNo}`));
        }
        if(getContactNo && getContactNo.verified==='unverified'){
            return next(createError(403,`Please registered with this Contact Number : ${sellerObj.contactNo}`));
        }
        if(getContactNo && getContactNo.sellerId!==null){
            return next(createError(403,`Mobile Number already registered : ${sellerObj.contactNo}`));
        }
        const seller = await Seller.create(sellerObj, {transaction});

        const membershipSettings = await Membership.findOne({where:{id:1}, raw:true});
        if(!membershipSettings){
            return next(createError(403,"Membership Details Not Found!"));
        }
        const registerPointTillDate = new Date(REGISTER_POINT_TILL_DATE);
        const now = new Date();
        let registerPoint = REGISTER_POINT;
        let welcomePoints = REGISTER_POINT;
        if(now>registerPointTillDate){
            registerPoint = 0;
        }
        registerPoint = Number(registerPoint) + Number(getCoupon.rewardPoint);
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
            sellerId:seller.id,
            memberShipId:generateMemberShipId(),
            totalPoints:registerPoint,
            availablePoints:registerPoint,
            finacialPoints : registerPoint,
            tierEntryDate:now,
            contactNo:req.body.contactNo,
            billingAddress:req.body.billingAddress,
            agreedToTerms:req.body.agreedToTerms,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        };
        const sellerInfo = await SellerInfo.create(sellerInfoObject,{transaction});
        const createTrack = await SellerMembershipTrack.create({...track, sellerId:seller.id, memberShipId:sellerInfoObject.memberShipId},{transaction});
        const sellerShippingAddressObj = {
            sellerId:seller.id,
            shippingAddress:{},
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        };
        const sellerShippingAddress = await SellerShippingAddress.create(sellerShippingAddressObj, {transaction});
        await ContactVerify.update({sellerId:seller.id},{
            where:{
                contactNo:req.body.contactNo
            },
            transaction
        });
        const pointTransactionObj = {
            transactionId: generateTransactionId(),
            sellerId: seller.id,
            transactionCategory:'RegisterCoupon',
            couponId:getCoupon.id,
            code: getCoupon.code,
            serialNo: getCoupon.serialNo,
            status: 'Earn',
            points: getCoupon.rewardPoint,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
          };
        const pointTransaction = await Transaction.create(pointTransactionObj,{transaction});
        if(now<registerPointTillDate){
            const transactionObj = {
                transactionId: generateTransactionId(),
                sellerId: seller.id,
                transactionCategory:'WelcomeBonus',
                status: 'Earn',
                points: welcomePoints,
                createdIstAt: DateTime(),
                updatedIstAt: DateTime()
              };
            const profileTransaction = await Transaction.create(transactionObj, {transaction});
        }
        const userAgent = req.get('User-Agent');
        const deviceDetector = new DeviceDetector();
        const deviceInfo = deviceDetector.parse(userAgent);

        const deviceDetails = {
            browserName : deviceInfo.client?.name,
            operatingSystem : deviceInfo.os?.name,
            device : deviceInfo.device?.type
        }
        const updateCoupon = await CouponCode.update({
            status: "Used",
            device:deviceDetails,
            sellerId:seller.id,
            email:seller.email,
            accountId:seller.accountId,
            contactNo:seller.contactNo,
            transactionTime: DateTime()
          }, {
            where: {
                code:req.body.code,
                serialNo:req.body.serialNo
            },
            transaction
          });
        await transaction.commit();
        //send Registtration Mail
        //registrationMail(sellerObj.firstName+" "+sellerObj.lastName, sellerObj.email, password);
        if(req.body?.email){
            sendRegistrationMail(sellerObj.firstName+" "+sellerObj.lastName, sellerObj.email, seller.accountId, password)
        }
        sent_welcome_message_whatsapp(sellerObj.firstName , sellerObj.contactNo, seller.accountId , password)
        welcomeMessage(seller.accountId , password, sellerObj.contactNo)
        set_user_opt_in(sellerObj.contactNo)

        console.log("Email :: Password ::>>",req.body.email, password);

        res.status(200).json({
            error : false,
            message : "User Registered Successfully!",
            data : seller
        });
    } catch (error) {
        await transaction.rollback();
        console.log("Register WholeSeller Error ::>> ",error);
        next(error);
    }
};

//register seller
// export const register = async(req, res, next) => {

//     //encrypt password
//     const password = generatePassword();
//     const number = generateSalt();
//     const salt = bcrypt.genSaltSync(number);
//     const hash = bcrypt.hashSync(password, salt);
//     const id = generateUniqueAccountId();
//     try {
//         const sellerObj = {
//             accountId:id,
//             firstName : req.body.firstName,
//             lastName: req.body.lastName,
//             email : req.body.email,
//             contactNo : req.body.contactNo,
//             password : hash,
//             createdIstAt: DateTime(),
//             updatedIstAt: DateTime()
//         };
//         const getSeller = await Seller.findOne({
//             where:{
//                 email:sellerObj.email
//             },
//             raw:true
//         });
//         // console.log("GetSeller ::>>",getSeller)
//         if(getSeller){
//             return next(createError(403,`Seller is already registered with this email : ${sellerObj.email}`));
//         }
//         const seller = await Seller.create(sellerObj);
//         const sellerInfoObject={
//             sellerId:seller.id,
//             contactNo:req.body.contactNo,
//             alternativeContactNo:req.body.alternativeContactNo,
//             preferredContactTime:req.body.preferredContactTime,
//             dob:req.body.dob,
//             marriageDate:req.body.marriageDate,
//             gstNo:req.body.gstNo,
//             billingAddress:req.body.billingAddress,
//             agreedToTerms:req.body.agreedToTerms,
//             createdIstAt: DateTime(),
//             updatedIstAt: DateTime()
//         };
//         const sellerShippingAddressObj = {
//             sellerId:seller.id,
//             shippingAddress:req.body.shippingAddress,
//             createdIstAt: DateTime(),
//             updatedIstAt: DateTime()
//         };
//         const sellerInfo = await SellerInfo.create(sellerInfoObject);
//         const sellerShippingAddress = await SellerShippingAddress.create(sellerShippingAddressObj);
//         //send Registtration Mail
//         registrationMail(sellerObj.firstName+" "+sellerObj.lastName, sellerObj.email, password);
//         console.log("Email :: Password ::>>",req.body.email, password);
//         res.status(200).json({
//             error : false,
//             message : "WholeSeller Registered Successfully...!",
//             data : seller
//         });
//     } catch (error) {
//         console.log("Register WholeSeller Error ::>> ",error);
//         next(error);
//     }
// };

//login user

export const login = async(req, res, next) => {
    const email = req.body.email;
    if(!email || req.body.email===""){
        return next(createError(403,"Please Enter a Valid Email ID"));
    }
    else if(!req.body.password || req.body.password===""){
        return  next(createError(403,"Please Enter Correct Password "));
    }
    
    let lb = email.substring(0,3)==="DSG" ? {sellerId : email} : /^\d+$/.test(email) && email.length===10 ? {contactNo : email} : {email : email};
    lb.roles='wholeseller';
    lb.status='Active';
    try {
        const seller = await Seller.findOne({
            where:lb,
            raw:true
        });
        // console.log("Seller ::>>",seller)
        if(!seller){
            return next(createError(404,`Mobile no. doesn't exist, please sign up`));
        }
        //login attempt
        let attempt = seller.loginAttempts;
        // console.log("attemptattemptattempt",attempt);
        if((seller.loginAttempts.attemptAt!=="") && 
           (new Date().getDate()>new Date(seller.loginAttempts.attemptAt).getDate() ||
            new Date().getMonth()>new Date(seller.loginAttempts.attemptAt).getMonth() ||
            new Date().getYear()>new Date(seller.loginAttempts.attemptAt).getYear()
           )){
            
            attempt.count=0;
            attempt.attemptAt="";
            await Seller.update({
                loginAttempts : attempt
            },{
                where :{
                    id:seller.id
                }
            });
        }
        if(seller.loginAttempts.count===5){
            return next(createError(401,`Your recent attempts to log in to your account have exceeded the daily limit, try to log in after 24 hours.`));
        }
        //if user exist then check password is matched or not
        const isPasswordMatched = await bcrypt.compare(req.body.password, seller.password); 
        if(!isPasswordMatched){
            attempt.count+=1;
            attempt.attemptAt = new Date();
            await Seller.update({
                loginAttempts : attempt
            },{
                where :{
                    id:seller.id
                }
            });
            // console.log("Attempt ::>>", req.body.email, attempt);
            return next(createError(401,`Invalid Credentials`));
        }
        attempt.count=0;
        attempt.attemptAt="";
        await Seller.update({
            loginAttempts : attempt
        },{
            where :{
                id:seller.id
            }
        });
        const { password, role, ...rest } = seller;
        //generate jwt token
        const token = JWT.sign({ id:seller.id, role:seller.roles, data:{...rest} }, 
                            process.env.JWT_SECRET_KEY,{ expiresIn: '24h' });

        
        const userAgent = req.get('User-Agent');
        const deviceDetector = new DeviceDetector();
        const deviceInfo = deviceDetector.parse(userAgent);

        const deviceDetails = {
            sellerId : seller.id,
            browserName : deviceInfo.client?.name,
            operatingSystem : deviceInfo.os?.name,
            device : deviceInfo.device?.type,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        }

        const device = await SellerLoggingHistory.create(deviceDetails);

        if(!device){
            return next(createError(500,"Failed to log the user device information"));
        }
        
        return  res.cookie('accessToken', token, {httpOnly : true, expires : token.expiresIn})
                   .status(200)
                   .json({
                        error : false,
                        message : "Login Successfully!",
                        token,
                        // data: {...rest},
                        role,
                    })
    } catch (error) {
        console.log("Login Seller ::>> ",error);
        next(error);
    }
};

//increase token data in seller login
// export const login = async(req, res, next) => {
//     const email = req.body.email;
//     if(req.body.email===""){
//         return next(createError(403,"Enter the Valid Email"));
//     }
//     else if(req.body.password===""){
//         return  next(createError(403,"Enter the Valid Password"));
//     }
    
//     let lb = email.substring(0,3)==="DSG" ? `so.accountId = '${email}'` : /^\d+$/.test(email) && email.length===10 ? `so.contactNo = '${email}'` : `so.email = '${email}'`;
//     try {
//         let seller = await Query(`Select * from sellers as so Inner Join sellerinfos as si on so.id=si.sellerId where ${lb}`);
//         seller = seller[0]; 
//         // console.log("Seller ::>>",seller)
//         if(!seller){
//             return next(createError(404,`Invalid Credentials`));
//         }
//         //login attempt
//         let attempt = seller.loginAttempts;
//         if((seller.loginAttempts.attemptAt!=="") && 
//            (new Date().getDate()>new Date(seller.loginAttempts.attemptAt).getDate() ||
//             new Date().getMonth()>new Date(seller.loginAttempts.attemptAt).getMonth() ||
//             new Date().getYear()>new Date(seller.loginAttempts.attemptAt).getYear()
//            )){
//             attempt.count=0;
//             attempt.attemptAt="";
//             await Seller.update({
//                 loginAttempts : attempt
//             },{
//                 where :{
//                     id:seller.sellerId
//                 }
//             });
//         }
//         if(seller.loginAttempts.count===5){
//             return next(createError(401,`your today limit will be exceed for logins try after 12:00 AM`));
//         }
//         //if user exist then check password is matched or not
//         const isPasswordMatched = await bcrypt.compare(req.body.password, seller.password); 
//         if(!isPasswordMatched){
//             attempt.count+=1;
//             attempt.attemptAt = new Date();
//             await Seller.update({
//                 loginAttempts : attempt
//             },{
//                 where :{
//                     id:seller.sellerId
//                 }
//             });
//             return next(createError(401,`Invalid Credentials`));
//         }
//         attempt.count=0;
//         attempt.attemptAt="";
//         await Seller.update({
//             loginAttempts : attempt
//         },{
//             where :{
//                 id:seller.sellerId
//             }
//         });
//         const { id, password, role, ...rest } = seller;
//         //generate jwt token
//         const token = JWT.sign({ id:seller.sellerId, role:seller.roles, data:{id:seller.sellerId, ...rest} }, 
//                             process.env.JWT_SECRET_KEY,
//                             { expiresIn: '2h' });
//         return  res.cookie('accessToken', token, {httpOnly : true, expires : token.expiresIn})
//                    .status(200)
//                    .json({
//                         error : false,
//                         message : "Login Successfully...!",
//                         token,
//                         // data: {...rest},
//                         role,
//                     })
//     } catch (error) {
//         console.log("Login Seller ::>> ",error);
//         next(error);
//     }
// };

//admin login
// export const adminLogin = async(req, res, next) => {
//     const email = req.body.email;
//     if(req.body.email===""){
//         next(createError(403,"Enter the Valid Email"));
//     }
//     else if(req.body.password===""){
//         next(createError(403,"Enter the Valid Password"));
//     }
//     console.log("email::>>",email)
//     try {
//         const seller = await Seller.findOne({
//             where:{
//                 email:email,
//                 roles:'superadmin'
//             },
//             raw:true
//         });
//         // console.log("Seller ::>>",seller)
//         if(!seller){
//             return next(createError(404,`Invalid Credentials with email : ${email}`));
//         }
//         //if user exist then check password is matched or not
//         const isPasswordMatched = await bcrypt.compare(req.body.password, seller.password); 
//         if(!isPasswordMatched){
//             return next(createError(401,`Invalid Credentials Email or Password...!`));
//         }
//         const { password, role, ...rest } = seller;
//         //generate jwt token
//         const token = JWT.sign({ id:seller.id, role:seller.roles }, 
//                             process.env.JWT_SECRET_KEY,
//                             { expiresIn: '2h' });
//         return  res.cookie('accessToken', token, {httpOnly : true, expires : token.expiresIn})
//                    .status(200)
//                    .json({
//                         error : false,
//                         message : "Admin Login Successfully...!",
//                         token,
//                         data: {...rest},
//                         role,
//                     })
//     } catch (error) {
//         console.log("Admin Login ::>> ",error);
//         next(error);
//     }
// };

export const adminLogin = async(req, res, next) => {
    const email = req.body.email;
    if(!req.body.email || req.body.email===""){
        next(createError(403,"Enter the Valid Email"));
    }
    else if(!req.body.password || req.body.password===""){
        next(createError(403,"Enter the Valid Password"));
    }
    // console.log("email::>>",email)
    try {
        const seller = await Staff.findOne({
            where:{
                email:email,
                status:'Active'
                // roles:'superadmin'
            },
            raw:true
        });
        // console.log("Seller ::>>",seller)
        if(!seller){
            return next(createError(404,`Invalid Credentials with email : ${email}`));
        }
        //if user exist then check password is matched or not
        const isPasswordMatched = await bcrypt.compare(req.body.password, seller.password); 
        if(!isPasswordMatched){
            return next(createError(401,`Invalid Credentials Email or Password...!`));
        }
        const { password, role, ...rest } = seller;
        //generate jwt token

        //get permission
        const permission = await Query(`
            Select r.roleName, r.status, p.moduleName, p.access from roles as r inner join permissions as p on r.id=p.roleId where r.id=${seller.roleId}
        `);
        const token = JWT.sign({ id:seller.id, role:seller.roles, data:{...rest}, permission:permission }, 
                            process.env.JWT_SECRET_KEY,
                            { expiresIn: '24h' });
        
        return  res.cookie('accessToken', token, {httpOnly : true, expires : token.expiresIn})
                   .status(200)
                   .json({
                        error : false,
                        message : "Admin Login Successfully...!",
                        token,
                    })
    } catch (error) {
        console.log("Admin Login ::>> ",error);
        next(error);
    }
};

//forgot password
export const forgorPassword = async(req, res, next) => {
    if(!req.body.email || req.body.email===""){
        return next(createError(403,"Enter Valid E-mail ID!"));
    }
    
    const email = req.body.email.trim();
    let isNum = /^\d+$/.test(email);
    // console.log("email::>>",email, isNum);
    let whereClause = !isNum ? {email:email} : {contactNo:email};
    try {
        const seller = await Seller.findOne({
            where:whereClause,
            raw:true
        });
        // console.log("Seller ::>>",seller)
        if(!seller){
            return next(createError(404,`Password sent on registered Email-ID!`));
        }
        const password = generatePassword();
        const number = generateSalt();
        const salt = bcrypt.genSaltSync(number);
        const hash = bcrypt.hashSync(password, salt);

        await Seller.update({
            password:hash
        },{
            where : {
                id:seller.id
            }
        });
        if(isNum){
            // forgotPasswordBySMS(seller.contactNo , password)
            signupotp(seller.contactNo , password);  
        }
        else sendForgettingPasswordMail(seller.firstName+" "+seller.lastName, seller.email, password);

        return  res.status(200)
                   .json({
                        error : false,
                        message : "Password Has been sent Successfully...!",
                    });
    } catch (error) {
        console.log("Forgot-password Error ::>> ",error);
        next(error);
    }
};


export const getOTP = async(req, res, next)=>{
    if(!req.body.email || req.body.email===""){
        return next(createError(403,"Please Enter Valid Details!"));
    }
    const email = req.body.email.trim();
    
    let lb = email.substring(0,3)==="DSG" ? {sellerId : email} : /^\d+$/.test(email) && email.length===10 ? {contactNo : email} : {email : email};
    lb.roles='wholeseller';
    lb.status='Active';
    try {
        const seller = await Seller.findOne({
            where:lb,
            raw:true
        });
        // console.log("Seller ::>>",seller)
        if(!seller){
            // return next(createError(404,`Mobile no. doesn't exist, please sign up`));
            return next(createError(404,`Invalid Credential`));
        }
        let loginAttempt =  seller.otpLoginAttempts;
        let updateOtp = false;
        if(loginAttempt && loginAttempt?.attemptAt!=="" && new Date()>new Date(new Date(loginAttempt.attemptAt).getTime() + 60*60*1000)){
            updateOtp = true;
        }
        if(!updateOtp && loginAttempt?.count>=5){
            return next(createError(403, `You will exceed your limit for login Attempt`))
        }
        // console.log("Seller ::>>",seller)
        const otp = Math.floor(100000 + Math.random() * 900000);;
        // console.log("Pin ::>>",otp);
        let clause = {
                otp:otp,
                otpTimeStampAt:new Date()
        };
        if(updateOtp){
            clause.otpLoginAttempts = {count:0,attemptAt:""};
        }
        await Seller.update(clause,{
            where : {
                id:seller.id
            }
        });
        // sendOTPThroughMail(seller.firstName+" "+seller.lastName, seller.email, otp);
        if(seller.email){
            sendOTPLoginMail(seller.firstName+" "+seller.lastName, seller.email, otp);
        }
        // OTP Send through gmail & mobile SMS
        if(seller.contactNo){
            const responseSMS = await OTPLogin(seller.firstName+" "+seller.lastName, otp, seller.contactNo);

            if(responseSMS.statusCode!=='200'){
                return next(createError(404,`System issue, try after sometime`));
            }
            sent_OTP_to_whatsapp(seller.firstName,seller.contactNo ,otp);
        }
        return  res.status(200)
                   .json({
                        error : false,
                        message : "Otp Has been sent Successfully...!",
                    });
    } catch (error) {
        console.log("Get-Otp Error ::>> ",error);
        next(error);
    }
};

export const loginThroughOTP = async(req, res, next)=>{
    if(!req.body.email || req.body.email===""){
        return next(createError(403,"Please Enter Valid Email ID!"));
    }
    if(!req.body.otp || req.body.otp===""){
        return next(createError(403,"Please Enter Correct OTP!"));
    }
    
    const email = req.body.email.trim();
    // console.log("email::>>",email)
    try {
        let lb = email.substring(0,3)==="DSG" ? {sellerId : email} : /^\d+$/.test(email) && email.length===10 ? {contactNo : email} : {email : email};
        lb.roles='wholeseller';
        const seller = await Seller.findOne({
            where:lb,
            raw:true
        });
        // console.log("Seller ::>>",seller)
        if(!seller){
            return next(createError(404,`Mobile no. doesn't exist, please sign up`));
        }
        const getOtpTime = seller.otpTimeStampAt;
        let loginAttempt =  seller.otpLoginAttempts;
        let updateOtp = false;
        if(loginAttempt && loginAttempt?.attemptAt!=="" && new Date()>new Date(new Date(loginAttempt.attemptAt).getTime() + 60*60*1000)){
            updateOtp = true;
        }
        if(!updateOtp && loginAttempt?.count>=5){
            return next(createError(403, `You will exceed your limit for login Attempt`))
        }
        if(new Date().getTime()>new Date(new Date(getOtpTime).getTime()+5*60*1000)){
            return next(createError(401, "Time-out for OTP Verification."))
        }
        let otpCount = loginAttempt ? Number(loginAttempt.count) + 1 : 1;
        if(seller.otp!==req.body.otp){
            await Seller.update({
                otpLoginAttempts:{count:otpCount, attemptAt:new Date()}
            },{
                where : {
                    id:seller.id
                }
            });
            return next(createError(404,`Please enter valid OTP received on your registered mobile no`));
        }
        await Seller.update({
            otp:'f^f^f',
            otpLoginAttempts:{count:0,attemptAt:""}
        },{
            where : {
                id:seller.id
            }
        });
        const { password, role, ...rest } = seller;
        //generate jwt token
        const token = JWT.sign({ id:seller.id, role:seller.roles, data:{...rest} }, 
                            process.env.JWT_SECRET_KEY,
                            { expiresIn: '24h' });


        const userAgent = req.get('User-Agent');
        const deviceDetector = new DeviceDetector();
        const deviceInfo = deviceDetector.parse(userAgent);

        const deviceDetails = {
            sellerId : seller.id,
            browserName : deviceInfo.client?.name,
            operatingSystem : deviceInfo.os?.name,
            device : deviceInfo.device?.type,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        }

        const device = await SellerLoggingHistory.create(deviceDetails);

        if(!device){
            return next(createError(500,"Failed to log in the user device information."));
        }
                            
        return  res.cookie('accessToken', token, {httpOnly : true, expires : token.expiresIn})
                   .status(200)
                   .json({
                        error : false,
                        message : "Login Successfully!",
                        token,
                        // data: {...rest},
                        role,
                    })
    } catch (error) {
        console.log("Login-through-Otp Error ::>> ",error);
        next(error);
    }
};

