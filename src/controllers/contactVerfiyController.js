import generatePin from "../../utils/constant/generatePin";
import DateTime from "../../utils/constant/getDate&Time";
import { createError } from "../../utils/error";
import { otpRegistration } from "../../utils/messages/sms_messages";
import { ContactVerify } from "../models/ContactVerify";
import axios from "axios";
const sendOTP = async(contactNo, otp) => {
    const response = await axios({
        method: 'get',
        url: `https://api2.growwsaas.com/fe/api/v1/send?username=dsgroup.api&password=dsgroup@$123&unicode=true&from=DSGCRM&text=One Time Password for registry authentication to DS APP is ${otp}.Please use the password to complete the registration and don't share this with anyone.&dltContentId=1207161804010361768&to=${contactNo}`
    });
    // console.log("Response ::>>",response.data);
    return response.data;
}
//made by ritik 
export const newContactRegistered = async(req, res, next) => {
    try{
        const { contactNo } = req.body
        if(!contactNo || contactNo.length!==10){
            return next(createError(400, "Please provide Contact Number"))
        }
        const getContactNo = await ContactVerify.findOne({
            where:{
                contactNo:contactNo
            },
            raw: true
        });
        // console.log("Get Contact No ::>>",getContactNo);
        if(getContactNo && getContactNo.verified==='verified' && getContactNo.sellerId!==null){
            return next(createError(401, "Contact Number already Exist...!"))
        }
        //send otp through this block
        //static OTP
        // let otp = '1234';
        const otp = generatePin();
        // const response = await sendOTP(contactNo,otp);  
        const response = await otpRegistration(contactNo,otp);  
        if(response.statusCode!=='200'){
            return next(createError(401, "Something went wrong...!"))
        }
        if(getContactNo && (getContactNo.verified==='unverified' || getContactNo.sellerId===null)){
            const otpUpdatedOnContact = await ContactVerify.update({
                otp:otp,
                updatedIstAt:DateTime(),
                otpTimeStampAt:new Date()

            },{
                where:{
                    contactNo:contactNo
                }
            });
            return res.status(200).json({
                error: false,
                message:"Otp sent to Contact Number Succesfully.",
                data:otpUpdatedOnContact[0]===1 ? 'Sent' : 'Not Send'
            })
        }
        // verify the number its is correct or not the third party api
        // {

        // }
        const contactInfoObj = {
            contactNo:contactNo,
            otp:otp,
            otpTimeStampAt:new Date(),
            createdIstAt:DateTime(),
            updatedIstAt:DateTime()
        };
        const newContact = await ContactVerify.create(contactInfoObj);
        return res.status(200).json({
            error: false,
            message:"Otp sent to Contact Number Successfully.",
            data: newContact ? 'Sent' : 'Not Sent'
        })
    }
    catch (error) { 
        console.log("Otp-sent-to-Contact-Number-Error ::>>",error);
        next(error);
    }
};

export const contactVerification = async(req, res, next) => {
    try{
        const { contactNo, otp } = req.body

        if(!contactNo){
            return next(createError(400, "Please provide Contact Number"))
        }
        if(!otp){
            return next(createError(400, "Please provide otp"))
        }

        const getContactNo = await ContactVerify.findOne({
            where:{
                contactNo:contactNo
            },
            raw: true
        });

        if(!getContactNo){
            return next(createError(401, "Contact Number Found...!"))
        }
        const getOtpTime = getContactNo.otpTimeStampAt;
        // console.log("get Otp time ::>>",new Date(new Date(getContactNo.otpTimeStampAt).getTime()+5*60*1000));
        // console.log("get now time ::>>",new Date());
        if(new Date().getTime()>new Date(new Date(getContactNo.otpTimeStampAt).getTime()+5*60*1000)){
            return next(createError(401, "Time expired of Otp verification...!"))
        }
        if(getContactNo.otp!==otp){
            return next(createError(401, "OTP Not verified...!"))
        }
        const otpUpdatedOnContact = await ContactVerify.update({
            otpTimeStampAt:new Date(),
            verified:'verified', 
            updatedIstAt:DateTime()
        },{
            where:{
                contactNo:contactNo
            }
        });

        return res.status(200).json({
            error: false,
            message:"Contact Verified Successfully.",
            data:otpUpdatedOnContact[0]===1 ? 'Verified' : 'Not verified'
        })
    }
    catch (error) { 
        console.log("Contact-Verification-Error ::>>",error);
        next(error);
    }
};



