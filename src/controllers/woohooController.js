import OAuth from "oauth-1.0a";
import crypto from 'crypto';
import axios from "axios"
import { createError } from "../../utils/error";
import { error } from "console";
import { WoohooAuth } from "../models/WoohooAuth";
import DateTime from "../../utils/constant/getDate&Time";
import { VoucherBrands } from "../models/VoucherBrands";
import { raw } from "body-parser";
import { link } from "fs";
import Query from "../../utils/db/rawQuery";

const WOOHOO_URL = process.env.WOOHOO_ENIVIORNMENT === 'DEVELOPMENT' ? process.env.UAT_WOOHOO_URL: process.env.WOOHOO_URL;
const CONSUMER_KEY = process.env.WOOHOO_ENIVIORNMENT === 'DEVELOPMENT' ? process.env.UAT_CONSUMER_KEY : process.env.CONSUMER_KEY ;
const CONSUMER_SECRET_KEY = process.env.WOOHOO_ENIVIORNMENT === 'DEVELOPMENT' ? process.env.UAT_CONSUMER_SECRET_KEY : process.env.CONSUMER_SECRET_KEY;
const WOOHOO_USERNAME = process.env.WOOHOO_ENIVIORNMENT === 'DEVELOPMENT' ? process.env.UAT_WOOHOO_USERNAME : process.env.WOOHOO_USERNAME;
const WOOHOO_PASSWORD = process.env.WOOHOO_ENIVIORNMENT === 'DEVELOPMENT' ? process.env.UAT_WOOHOO_PASSWORD : process.env.WOOHOO_PASSWORD;

//Authentication
export const get_Access_oauthToken_And_oauthTokenSecret = async()=>{
    try {
        // console.log("Enviornment :>>>",{WOOHOO_URL, CONSUMER_KEY, CONSUMER_SECRET_KEY, WOOHOO_USERNAME, WOOHOO_PASSWORD})
        const initiateResponse = await axios({
            method:'GET',
            url:`${WOOHOO_URL}/oauth/initiate?oauth_consumer_key=${CONSUMER_KEY}&oauth_signature_method=PLAINTEXT&oauth_signature=${CONSUMER_SECRET_KEY}%26&oauth_timestamp=${Date.now()}&oauth_nonce=${Date.now()+"adfkjadkjfh"}&oauth_version=1.0&oauth_callback=oob`
        });
        const initiate = initiateResponse.data;
        // console.log("Response of Initiate ::>>", initiate);
        let unauthorised_token = initiate.split('&');
        let unauthorised_oauthToken = unauthorised_token[0].split('=')[1];
        let unauthorised_oauthTokenSecret = unauthorised_token[1].split('=')[1];
        // console.log("unauthorised_Oauth Token ::>>", unauthorised_oauthToken, "unauthorised_Oauth Token Secret ::>>", unauthorised_oauthTokenSecret);
        const authorizeAndVerifierResponse = await axios({
            method:'GET',
            url:`${WOOHOO_URL}/oauth/authorize/customerVerifier/?oauth_token=${unauthorised_oauthToken}&username=${WOOHOO_USERNAME}&password=${WOOHOO_PASSWORD}`
        });
        const verifierResponse = authorizeAndVerifierResponse.data;
        // console.log("verifierResponse ::>>", verifierResponse);
        if(!verifierResponse.success){
            return {success:false, error:'Something wrong on vendor side'};
        }
        let oauth_verifier = verifierResponse.verifier
        // console.log("Oauth verifier ::>>", oauth_verifier);
        const accessTokenRepsonse = await axios({
            method:'GET',
            url:`${WOOHOO_URL}/oauth/token?oauth_consumer_key=${CONSUMER_KEY}&oauth_signature_method=PLAINTEXT&oauth_token=${unauthorised_oauthToken}&oauth_signature=${CONSUMER_SECRET_KEY}%26${unauthorised_oauthTokenSecret}&oauth_verifier=${oauth_verifier}`
        });
        const data = accessTokenRepsonse.data;
        let token = data.split('&');
        let oauthToken = token[0].split('=')[1];
        let oauthTokenSecret = token[1].split('=')[1];
        // console.log("Access oauth token & oauth token secret ::>>", { oauthToken, oauthTokenSecret });
        
        const {saveOuath, created} = await WoohooAuth.findOrCreate({
            where: { for:process.env.WOOHOO_ENIVIORNMENT==='DEVELOPMENT' ? 'UAT' : "PROD" },
                defaults: {
                    accessOauthToken:oauthToken,
                    accessTokenSecret:oauthTokenSecret
                },
        });
        // console.log("Save ouath ::>>", created);
        if(!created){
            const updated = await WoohooAuth.update({
                accessOauthToken:oauthToken,
                accessTokenSecret:oauthTokenSecret,
                updatedIstAt:DateTime()
            },{
                where:{
                    for:process.env.WOOHOO_ENIVIORNMENT==='DEVELOPMENT' ? 'UAT' : "PROD"
                }
            });
        }
        return {success:true,data:{
            oauthToken,
            oauthTokenSecret
        }};
    } catch (error) {
        console.log("Woohoo Authentication Error ::>>",error);
        return {success:false,error};
    }
}

class Oauth1Helper {
    static getAuthHeaderForRequest(request, TOKENKEY, TOKENSECRET){
        // console.log("consumer ::>>",{ key: CONSUMER_KEY, secret: CONSUMER_SECRET_KEY });
        const oauth = OAuth({
            consumer: { key: CONSUMER_KEY, secret: CONSUMER_SECRET_KEY },
            signature_method: 'HMAC-SHA1',
            hash_function(base_string, key) {
                return crypto
                    .createHmac('sha1', key)
                    .update(base_string)
                    .digest('base64')
            },
        })
        const authorization = oauth.authorize(request, {
            key: TOKENKEY,
            secret: TOKENSECRET,
        });
        // console.log('token ::>>',TOKENKEY,TOKENSECRET);
        // console.log("Aothorization ::>>", authorization);
        return oauth.toHeader(authorization);
    }
}

export const getWoohooSetting = async(req, res, next)=>{
    try {
        const AccessKeys = await get_Access_oauthToken_And_oauthTokenSecret();
        let OAuth = await WoohooAuth.findOne({
            where:{
                for:process.env.WOOHOO_ENIVIORNMENT==='DEVELOPMENT' ? 'UAT' : "PROD"
            },
            raw:true
        });
        // console.log("Oauth ::>>",OAuth);
        const request = {
            url: WOOHOO_URL+"/rest/settings",
            method: 'GET',
            body: {}
        }
        const authHeader = Oauth1Helper.getAuthHeaderForRequest(request, OAuth.accessOauthToken, OAuth.accessTokenSecret);
        // console.log("Auth Header ::>>", authHeader);
        const settingResponse = await axios.get(
                                                request.url, 
                                                {params:request.data, headers:{...authHeader}}
                                            );
        // console.log("Setting Response ::>>", settingResponse.data);
        if(!settingResponse.data.success){
            return next(createError(403,"Something went on server"));
        }
        const request1 = {
            url: WOOHOO_URL+"/rest/category",
            method: 'GET',
            body: {}
        }
        const authHeader1 = Oauth1Helper.getAuthHeaderForRequest(request1, OAuth.accessOauthToken, OAuth.accessTokenSecret);
        // console.log("Auth Header ::>>", authHeader1);
        const categoryResponse = await axios.get(
            request1.url, 
            {params:request1.data, headers:{...authHeader1}}
        );
        // console.log("Category Response ::>>", categoryResponse.data);
        const updated = await WoohooAuth.update({
            categoryId:categoryResponse.data.root_category.category_id
        },{
            where:{
                for:process.env.WOOHOO_ENIVIORNMENT==='DEVELOPMENT' ? 'UAT' : "PROD"
            }
        });
        return res.status(200).json({
            error:false,
            message:"Your woohoo account Setting for One Time only...!",
            data:{setting:settingResponse.data, category:categoryResponse.data, refno: await getRefno()}
        })
    } catch (error) {
        console.log("Get-Woohoo-Setting Error ::>>",error);
        next(error);
    }
};

const getRefno = async()=>{
    let OAuth = await WoohooAuth.findOne({
        where:{
            for:process.env.WOOHOO_ENIVIORNMENT==='DEVELOPMENT' ? 'UAT' : "PROD"
        },
        raw:true
    });
    const request = {
        url: WOOHOO_URL+"/rest/refno",
        method: 'GET',
        body: {}
    }
    // console.log("Request ::>>", request);
    const authHeader = Oauth1Helper.getAuthHeaderForRequest(request, OAuth.accessOauthToken, OAuth.accessTokenSecret);
    // console.log("Auth Header ::>>", authHeader);
    let refno = await axios.get(
        request.url, 
        {params:request.data, headers:{...authHeader}}
    );
    // console.log('Refno ::>>',refno?.data);
    return refno?.data;
};

const checkBalanceHelper = async()=>{
    let OAuth = await WoohooAuth.findOne({
        where:{
            for:process.env.WOOHOO_ENIVIORNMENT==='DEVELOPMENT' ? 'UAT' : "PROD"
        },
        raw:true
    });
    const request = {
        url: WOOHOO_URL+"/rest/checkbalance",
        method: 'POST',
        body: {
            card:"99999988820887",
            storeid:"35",
            pin:"458747"
        }
    }
    console.log("Request ::>>", request);
    const authHeader = Oauth1Helper.getAuthHeaderForRequest(request, OAuth.accessOauthToken, OAuth.accessTokenSecret);
    console.log("Auth Header ::>>", authHeader);
    let balance = await axios.post(
        request.url, 
        {params:request.data, headers:{...authHeader}}
    );
    return balance;
};

export const checkBalance = async(req, res, next)=>{
    try {
        let checkBalanceResponse = await checkBalanceHelper();
        if(Array.isArray(checkBalanceResponse) && checkBalanceResponse.length===1 && checkBalanceResponse[0].status===401){
            await get_Access_oauthToken_And_oauthTokenSecret();
            checkBalanceResponse = await checkBalanceHelper();
        }
        return res.status(200).json({
            error:false,
            message:"Get Category Successfully...!",
            data:checkBalanceResponse.data
        })
    } catch (error) {
        console.log('Check Balance Error ::>>',error);
        next(error);
    }
}

export const allCategoryHelper = async()=>{
    let OAuth = await WoohooAuth.findOne({
        where:{
            for:process.env.WOOHOO_ENIVIORNMENT==='DEVELOPMENT' ? 'UAT' : "PROD"
        },
        raw:true
    });
    const request = {
        url: WOOHOO_URL+"/rest/category/"+OAuth.categoryId,
        method: 'GET',
        body: {}
    }
    const authHeader = Oauth1Helper.getAuthHeaderForRequest(request, OAuth.accessOauthToken, OAuth.accessTokenSecret);
    let allCategoryResponse = await axios.get(
        request.url, 
        {params:request.data, headers:{...authHeader}}
    );
    // console.log("All Category Response ::>>",allCategoryResponse);
    return allCategoryResponse;
};

//for cron task
//get all product through this....
export const getCategory = async(req, res, next)=>{
    try {
        let allCategoryResponse = await allCategoryHelper();
        // console.log("All Category Response ::>>", allCategoryResponse);
        // if(Array.isArray(allCategoryResponse) && allCategoryResponse.length===1 && allCategoryResponse[0].status===401){
        //     await get_Access_oauthToken_And_oauthTokenSecret();
        //     allCategoryResponse = await allCategoryHelper();
        // }
        // const truncateBrands = await VoucherBrands.destroy({
        //     where: {
        //         vendor:'Woohoo'
        //     },
        //     truncate: true
        // });

        const products = allCategoryResponse?.data?._embedded?.product;
        const allProducts = await Promise.all(
            products.map(async(product)=>{
                const voucherObj = {
                    productId:product.id,
                    BrandId:product.brand_id,
                    sku:product.sku,
                    BrandName:product.name,
                    images:product.images,
                    priceType:product.price_type,
                    navigationApiCall:product.navigation_apicall,
                    navigationUrlPath:product.navigation_urlpath,
                    minCustomPrice:product.min_custom_price,
                    maxCustomPrice:product.max_custom_price,
                    DenominationList:product.custom_denominations,
                    vendor:'Woohoo',
                    updateByStaff:req.user.data.name,
                    createdIstAt:DateTime(),
                    updatedIstAt:DateTime(),
                };
                const voucher = await VoucherBrands.create(voucherObj);
                return voucher;
            })
        );
        return res.status(200).json({
            error:false,
            message:"Get Category Successfully...!",
            count:products.length,
            data:allProducts,
            in:allProducts.length
        })
    } catch (error) {
        console.log('Get Category Error ::>>',error);
        next(error);
    }
};

//server
export const getProductHelper = async(productId)=>{
    try {
        let OAuth = await WoohooAuth.findOne({
            where:{
                for:process.env.WOOHOO_ENIVIORNMENT==='DEVELOPMENT' ? 'UAT' : "PROD"
            },
            raw:true
        });
        const request = {
            url: WOOHOO_URL+"/rest/product/"+productId,
            method: 'GET',
            body: {}
        }
        const authHeader = Oauth1Helper.getAuthHeaderForRequest(request, OAuth.accessOauthToken, OAuth.accessTokenSecret);
        let productResponse = await axios.get(
            request.url, 
            {params:request.data, headers:{...authHeader}}
        );
        return productResponse.data;
    } catch (error) {
        console.log("Get Product Helper Error::>>",error);
        throw new Error(error.message);
    }
};

export const getProduct = async(req, res, next)=>{
    try {
        const { productId } = req.body;
        const product = await getProductHelper(productId);
        return res.status(200).json({
            error:false,
            message:"Get Product Successfully...!",
            data:product
        });
    } catch (error) {
        console.log("Get Product Error ::>>",error);
        next(error);
    }
};

//for cron task
//get all detail product data
export const getAllDetailDataOfProduct = async(req, res, next)=>{
    try {
        const vouchers = await VoucherBrands.findAll({
            attributes:['productId'],
            where:{
                vendor:'Woohoo'
            },
            raw:true
        });
        const allProducts = await Promise.all(
            vouchers.map(async(product)=>{
                const getProduct = await getProductHelper(product.productId);
                const woohooObj={
                    Descriptions:getProduct.description,
                    shortDescription:getProduct.short_description,
                    priceType:getProduct.price_type,
                    minCustomPrice:getProduct.min_custom_price,
                    maxCustomPrice:getProduct.max_custom_price,
                    customDenomination:getProduct.custom_denominations,
                    productType:getProduct.product_type,
                    payWithAmazonDisable:getProduct.paywithamazon_disable,
                    thumbnailImage:getProduct.images,
                    tncMobile:getProduct.tnc_mobile,
                    tncMail:getProduct.tnc_mail,
                    tncWeb:getProduct.tnc_web,
                    themes:getProduct.themes,
                    orderHandlingCharge:getProduct.order_handling_charge,
                    success:getProduct.success,
                    updateByStaff:req.user.data.name,
                };
                const woohooProduct = await VoucherBrands.update(woohooObj,{
                    where:{
                        productId:product.productId
                    }
                });
                return woohooProduct;
            })
        );
        return res.status(200).json({
            error:false,
            message:"Get All Detail Data Product SuccessFully...!",
            data:allProducts
        });
    } catch (error) {
        console.log("Get All Detail Data of Product Error ::>>",error);
        next(error);
    }
};

export const getWoohooProductById = async(req, res,next)=>{
    try {
        const { productId } = req.body;
        const product = await VoucherBrands.findOne({
            where:{
                productId:productId
            },
            raw:true
        });
        return res.status(200).json({
            error:false,
            message:"Get Woohoo Product Id Successfully...!",
            data:product
        })
    } catch (error) {
        console.log("Get Woohoo Product By Id Error ::>>",error);
        next(error);
    }
};

function generateId() {
    return crypto.randomBytes(10).toString("hex");
}

//spend 
export const getPlaceOrderHelper = async(productId, sellerId, amount, theme, qty, price)=>{
    try {
        let OAuth = await WoohooAuth.findOne({
            where:{
                for:process.env.WOOHOO_ENIVIORNMENT==='DEVELOPMENT' ? 'UAT' : "PROD"
            },
            raw:true
        });
        let seller = await Query(`Select * from sellers as sd Inner Join sellerinfos as si on sd.id=si.sellerId where sd.id='${sellerId}'`);
        seller = seller[0];
        let order = {};
        order.billing = {
            firstname: seller.firstName,
            lastname: seller.lastName,
            email: seller.email,
            telephone: seller.contactNo,
            line_1: seller?.billingAddress?.addressLine1,
            line_2: seller?.billingAddress?.addressLine1,
            city: seller?.billingAddress?.city,
            region: seller?.billingAddress?.state,
            country_id: "IN",
            postcode: seller?.billingAddress?.pinCode
        };
        order.shipping = {
            firstname: seller.firstName,
            lastname: seller.lastName,
            email: seller.email,
            telephone: seller.contactNo,
            line_1: seller?.billingAddress?.addressLine1,
            line_2: seller?.billingAddress?.addressLine1,
            city: seller?.billingAddress?.city,
            region: seller?.billingAddress?.state,
            country_id: "IN",
            postcode: seller?.billingAddress?.pinCode
        };
        order.payment_method = [];
        let payment = {
            method:"purchaseorder",
            amount_to_redem: qty*price,
            po_number:generateId()
        };
        order.payment_method.push(payment);
        order.refno = generateId();
        order.products = [];
        let voucher = {
            product_id:productId,
            price:price,
            theme:theme,
            qty:qty,
            gift_message: "Here's a special card for a special friend.",
        };
        order.products.push(voucher);
        // console.log("Spend Body ::>>",order);
        const request = {
            url: WOOHOO_URL+"/rest/spend",
            method: 'POST',
            body: order
        }
        const authHeader = Oauth1Helper.getAuthHeaderForRequest(request, OAuth.accessOauthToken, OAuth.accessTokenSecret);
        // console.log("rquest url ::>>",request.url);
        // console.log("rquest data ::>>",request.data);
        let productResponse = await axios.post(
            request.url, 
            order,
            {params:request.data, headers:{...authHeader}}
        );
        // console.log("Product Response ::>>", productResponse.data);
        return productResponse.data;
    } catch (error) {
        console.log("Get place Order Error ::>>", error);
        throw new Error(error.message);
    }
}






