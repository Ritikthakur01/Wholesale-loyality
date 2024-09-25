import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();

const username = process.env.SMS_USERNAME;
const password = process.env.SMS_PASSWORD;

export const sendOTP = async(contactNo, otp) => {

    try{
        const response = await axios({
            method: 'get',
            url: `https://api2.growwsaas.com/fe/api/v1/send?username=dsgroup.api&password=dsgroup@$123&unicode=true&from=DSGCRM&text=One Time Password for registry authentication to DS APP is ${otp}.Please use the password to complete the registration and don't share this with anyone.&dltContentId=1207161804010361768&to=${contactNo}`
        });
        // console.log("Response ::>>",response.data);
        return response.data;
    }catch(err){
        console.error('Error in sending OTP through sms::>> ', err);
        return
    }
};

export const sendOTPForVoucherRedemption = async(contactNo, otp) => {
    const response = await axios({
        method: 'get',
        url: `https://api2.growwsaas.com/fe/api/v1/send?username=dsgroup.api&password=dsgroup@$123&unicode=true&from=ReShop&text=${otp}  is the OTP for completing the redemption process. This OTP is valid for 5 minutes from the request. DS Group&dltContentId=1207162884680038743&to=${contactNo}`
    });
    // console.log("Response ::>>",response.data);
    return response.data;
}

export const forgotPasswordBySMS = async(contactNo, password) => {
    try{
        const response = await axios({
            method: 'get',
            url: `https://api2.growwsaas.com/fe/api/v1/send?username=dsgroup.api&password=dsgroup@$123&unicode=true&from=ReShop&text=Your Password is ${password} DS Group.&dltContentId=1207165943954245489&to=${contactNo}`
        });
        
        // console.log("Response ::>>",response.data);
        return response.data;
    }catch(err){
        console.error('Error in Forogt Password through sms::>> ', err);
        return
    }
};

// 1007015823484210214
export const signupotp = async(contactNo, login_password) => {
    try{
        const response = await axios({
            method: 'get',
            url: `https://api2.growwsaas.com/fe/api/v1/send?username=${username}&password=${password}&unicode=true&from=DRLSRB&text=Dear Member, Your password to login to Rajnigandha Business Club is:${login_password}- DS Group&dltContentId=1007015823484210214&to=${contactNo}`
        });
        
        // console.log("Response ::>>",response.data);
        return response.data;
    }catch(err){
        console.error('Error in Sign Otp through sms::>> ', err);
        return
    }
};

// 1007050504056261409
export const rewardPointsEarn = async(name, earn_points, total_points, contactNo) => {
    try{
        const response = await axios({
            method: 'get',
            url: `https://api2.growwsaas.com/fe/api/v1/send?username=${username}&password=${password}&unicode=true&from=DRLSRB&text=Dear ${name}, Thank you for choosing Rajnigandha Business Club! Your recent purchase with us has earned you ${earn_points} points, bringing your total reward points to ${total_points} - DS Group&dltContentId=1007050504056261409&to=${contactNo}`
        });
        
        // console.log("Response ::>>",response.data);
        return response.data;
    }catch(err){
        console.error('Error in Reward points Earn through sms::>> ', err);
        return
    }
};

// 1007063731622928903
export const businessClubEvoucher = async(days, contactNo) => {
    try{
        const response = await axios({
            method: 'get',
            url: `https://api2.growwsaas.com/fe/api/v1/send?username=${username}&password=${password}&unicode=true&from=DRLSRB&text=Thank you for your redemption request. Your request has been accepted and is being processed. You will receive your e-vouchers within ${days} - DS Group&dltContentId=1007063731622928903&to=${contactNo}`
        });
        
        // console.log("Response ::>>",response.data);
        return response.data;
    }catch(err){
        console.error('Error in Business Club Evoucher through sms::>> ', err);
        return
    }
};

// 1007069100478671256
export const OTPRedemption = async(otp, contactNo) => {
    try{
        const response = await axios({
            method: 'get',
            url: `https://api2.growwsaas.com/fe/api/v1/send?username=${username}&password=${password}&unicode=true&from=DRLSRB&text=Dear Member, ${otp} is the OTP for completing the redemption process. This OTP is valid for 5 minutes from the request. DS Group&dltContentId=1007069100478671256&to=${contactNo}`
        });
        
        // console.log("Response ::>>",response.data);
        return response.data;
    }catch(err){
        console.error('Error in OTP Redemption through sms::>> ', err);
        return
    }
};

// 1007127011394717245
export const dispatchconfirmation = async(contactNo, name, var1, var2, var3, var4 ,var5, var6) => {
    try{
        const response = await axios({
            method: 'get',
            url: `https://api2.growwsaas.com/fe/api/v1/send?username=${username}&password=${password}&unicode=true&from=DRLSRB&text=Dear ${name}, we have dispatched ${var1},${var2} items vide courier cons. no. ${var3} dated ${var4} against your request on ${var5}. In case of non-receipt within 7 days, please inform at ${var6} - DS Group&dltContentId=1007127011394717245&to=${contactNo}`
        });
        
        // console.log("Response ::>>",response.data);
        return response.data;
    }catch(err){
        console.error('Error in Dispatch Information through sms::>> ', err);
        return
    }
};

// 1007148808043807947
export const rewardPointsInformation = async(contactNo, name, points, date) => {
    try{
        const response = await axios({
            method: 'get',
            url: `https://api2.growwsaas.com/fe/api/v1/send?username=${username}&password=${password}&unicode=true&from=DRLSRB&text=Dear ${name}, You have ${points} reward Points in your Rajnigandha Business Club account as on ${date}. To unlock maximum benefits, make sure to regularly update your reward points - DS Group&dltContentId=1007148808043807947&to=${contactNo}`
        });
        
        // console.log("Response ::>>",response.data);
        return response.data;
    }catch(err){
        console.error('Error in Reward Point Information through sms::>> ', err);
        return
    }
};

// 1007170700798900970
export const inActiveAccount = async(contactNo, name) => {
    try{
        const response = await axios({
            method: 'get',
            url: `https://api2.growwsaas.com/fe/api/v1/send?username=${username}&password=${password}&unicode=true&from=DRLSRB&text=Dear ${name}, There hasn’t been any activity in your account in the last 24 months. Your account will become inactive in the next 30 days. To keep your account active and avail the benefits please update your reward points regularly - DS Group&dltContentId=1007170700798900970&to=${contactNo}`
        });
        
        // console.log("Response ::>>",response.data);
        return response.data;
    }catch(err){
        console.error('Error in InActive Account through sms::>> ', err);
        return
    }
};

// 1007256860183347517
export const redemptionAcknowledgement = async(contactNo, var1, var2) => {
    try{
        const response = await axios({
            method: 'get',
            // url: `https://api2.growwsaas.com/fe/api/v1/send?username=${username}&password=${password}&unicode=true&from=DRLSRB&text=Thank you for your redemption request. Your request has been accepted and is being processed. You will receive your ${var1} within ${var2} working days - DS Group&dltContentId=1007256860183347517&to=${contactNo}`
            url: `https://api2.growwsaas.com/fe/api/v1/send?username=dsgroup.api&password=dsgroup@$123&unicode=true&from=DRLSRB&to=${contactNo}&text=Thank you for your redemption request. Your request has been accepted and is being processed. You will receive your ${var1} within ${var2} working days - DS Group&dltContentId=1007256860183347517`
        });
        
        // console.log("Response ::>>",response.data);
        return response.data;
    }catch(err){
        console.error('Error in Redemption Acknowledgement through sms::>> ', err);
        return
    }
};

// 1007264777920588339
export const welcomeMessage = async(user_id, user_password, contactNo) => {
    try{
        const response = await axios({
            method: 'get',
            // url: `https://api2.growwsaas.com/fe/api/v1/send?username=${username}&password=${password}&unicode=true&from=DRLSRB&text=Dear Member, Welcome to our Rajnigandha Business Club. Your User Id is ${user_id} and Password is ${user_password} -DS Group&dltContentId=1007264777920588339&to=${contactNo}`
            url: `https://api2.growwsaas.com/fe/api/v1/send?username=${username}&password=${password}&unicode=false&from=DRLSRB&to=${contactNo}&text=Dear%20Member%2C%20Welcome%20to%20Rajnigandha%20Business%20Club.%20Log%20in%20now%20to%20start%20earning%20reward%20points%20and%20avail%20benefits%20of%20the%20program%20-%20DS%20Group&dltContentId=1007783355759105025`
        });
        
        // console.log("Response ::>>",response.data);
        return response.data;
    }catch(err){
        console.error('Error in Welcome Message through sms::>> ', err);
        return
    }
};

// 1007268565138780068
export const OTPLogin = async(name, otp, contactNo) => {
    try{
        const response = await axios({
            method: 'get',
            url: `https://api2.growwsaas.com/fe/api/v1/send?username=${username}&password=${password}&unicode=true&from=DRLSRB&text=Dear ${name}, Your OTP for logging to the Rajniganda Business Account is ${otp}. The OTP will remain valid for 5 minutes - DS Group&dltContentId=1007268565138780068&to=${contactNo}`
        });
        
        // console.log("Response ::>>",response.data);
        return response.data;
    }catch(err){
        console.error('Error in OTP Login through sms::>> ', err);
        return
    }
};

// 1007498660157783060
export const tierUpgrade = async(tier, contactNo) => {
    try{
        const response = await axios({
            method: 'get',
            url: `https://api2.growwsaas.com/fe/api/v1/send?username=${username}&password=${password}&unicode=true&from=DRLSRB&text=Congratulations! You've been upgraded to ${tier} Tier in our Rajnigandha Business Club program. Enjoy the additional benefits outlined in our rewards program guide- DS Group&dltContentId=1007498660157783060&to=${contactNo}`
        });
        
        // console.log("Response ::>>",response.data);
        return response.data;
    }catch(err){
        console.error('Error in Tier Upgrade through sms::>> ', err);
        return
    }
};



export const accountTermination = async(contactNo, name) => {
    try{
        const response = await axios({
            method: 'get',
            url: `https://api2.growwsaas.com/fe/api/v1/send?username=${username}&password=${password}&unicode=true&from=DRLSRB&text=Dear ${name}, There has been no activity in your Rajnigandha Business Club account in the last 24 months. We are sorry to inform you that as per policy, your account has been discontinued - DS Group&dltContentId=1007507126699530636&to=${contactNo}`
        });
        
        // console.log("Response ::>>",response.data);
        return response.data;
    }catch(err){
        console.error('Error in Account Termination through sms::>> ', err);
        return
    }
};

export const lapseRewardPoints = async(contactNo, name, points, date) => {
    try{
        const response = await axios({
            method: 'get',
            url: `https://api2.growwsaas.com/fe/api/v1/send?username=${username}&password=${password}&unicode=true&from=DRLSRB&text=Dear ${name}, As per Rajnigandha Business Club policy you ${points}rewards points will get lapsed on ${date}. Hurry! Redeem your points today - DS Group&dltContentId=1007627486541173959&to=${contactNo}`
        });
        
        // console.log("Response ::>>",response.data);
        return response.data;
    }catch(err){
        console.error('Error in Lapse Reward Point through sms::>> ', err);
        return
    }
};

export const birthdayWish = async(contactNo, name) => {
    try{
        const response = await axios({
            method: 'get',
            url: `https://api2.growwsaas.com/fe/api/v1/send?username=${username}&password=${password}&unicode=true&from=DRLSRB&text=Dear ${name}, Wish you many happy returns of the day. May God bless you with health, wealth %26 prosperity in your life - DS Group&dltContentId=1007642225782158833&to=${contactNo}`
        });
        
        // console.log("Response ::>>",response.data);
        return response.data;
    }catch(err){
        console.error('Error in birthday wish through sms::>> ', err);
        return
    }
};

export const refundofRewardPoints = async(contactNo, name, points, orderId, date) => {
    try{
        const response = await axios({
            method: 'get',
            url: `https://api2.growwsaas.com/fe/api/v1/send?username=${username}&password=${password}&unicode=true&from=DRLSRB&to=${contactNo}&text=Dear ${name}, Refund of reward points ${points} has been processed for your order number ${orderId} on ${date} and you will receive it in your account in 3-5 working days - DS Group&dltContentId=1007046938389602424`
        });
        
        // console.log("Response ::>>",response.data);
        return response.data;
    }catch(err){
        console.error('Error in refund of Reward Points through sms::>> ', err);
        return
    }
};

export const otpRegistration = async(contactNo, otp) => {
    try{
        const response = await axios({
            method: 'get',
            url: `https://api2.growwsaas.com/fe/api/v1/send?username=${username}&password=${password}&unicode=true&from=DRLSRB&text=Dear Member, ${otp} is the OTP for completing the registration process. This OTP is valid for 5 minutes from the request. DS Group&dltContentId=1007776451859042117&to=${contactNo}`
        });
        
        // console.log("Response ::>>",response.data);
        return response.data;
    }catch(err){
        console.error('Error in OTP Registration through sms::>> ', err);
        return
    }
};

export const marraigeAnniversary = async(contactNo, name) => {
    try{
        const response = await axios({
            method: 'get',
            url: `https://api2.growwsaas.com/fe/api/v1/send?username=${username}&password=${password}&unicode=true&from=DRLSRB&text=Dear ${name}, Team Rajnigandha Business Club wishes you Happy Marriage Anniversary. - DS Group&dltContentId=1007811799781741377&to=${contactNo}`
        });
        
        // console.log("Response ::>>",response.data);
        return response.data;
    }catch(err){
        console.error('Error in marraige Anniversary through sms::>> ', err);
        return
    }
};

export const profileUpdateRequest = async(contactNo, name, _var_) => {
    try{
        const response = await axios({
            method: 'get',
            url: `https://api2.growwsaas.com/fe/api/v1/send?username=${username}&password=${password}&unicode=true&from=DRLSRB&text=Dear ${name}, As requested we have updated your ${_var_} in our records. To check login into your account. - DS Group&dltContentId=1007825907887500096&to=${contactNo}`
        });
        
        // console.log("Response ::>>",response.data);
        return response.data;
    }catch(err){
        console.error('Error in profile Update Request through sms::>> ', err);
        return
    }
};




