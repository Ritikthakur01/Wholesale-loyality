import dotenv from 'dotenv';
import { encryption, decryption } from "../../utils/constant/encrypt_decrypt";
import axios, { all } from 'axios';
import { VoucherBrands } from '../models/VoucherBrands';
import { SellerVouchers } from '../models/SellerVouchers';
import { createError } from '../../utils/error';
import DateTime from '../../utils/constant/getDate&Time';
import { Op, Sequelize, where } from 'sequelize';
import { Seller, SellerInfo } from '../models/Seller';
import crypto from "crypto";
import { Transaction } from '../models/Transaction';
import { sent_approve_voucher_request_whatsapp, sent_reject_voucher_request_whatsapp } from '../../utils/messages/whatsapp_messages';
import { truncate } from 'fs';
import { getPlaceOrderHelper , allCategoryHelper, getProductHelper} from './woohooController';
import { error } from 'console';
import VouchagramLog from '../../utils/vouchgramLogs';
import sequelize from '../../utils/db/dbConnection';
import { refundofRewardPoints } from '../../utils/messages/sms_messages';


dotenv.config();

function generateId() {
    return crypto.randomBytes(10).toString("hex");
}

export async function getToken() {

    try {
        const { data } = await axios({
            method: 'get',
            url: `${process.env.VOUCHAGRAM_SERVER_URL}/gettoken`,
            headers: {
                username: process.env.VOUCHAGRAM_USERNAME,
                password: process.env.VOUCHAGRAM_PASSWORD
            }
        });
        // console.log("getToken",data); 
        const decodedToken = decryption(data.data);
        return decodedToken;
    }
    catch (err) {
        console.log("ERROR TO GET TOKEN ::>>", err)
        return "ERROR TO GET TOKEN"
    }
}

//for cron task
//get all product through this...
export const getBrands = async (req, res, next) => {
    try {
        const { BrandProductCode } = req.body;
        const token = await getToken();
        let body = BrandProductCode ? { BrandProductCode } : {};
        // console.log("body ::>>", body);
        // console.log("token", token);
        const { data } = await axios({
            method: 'post',
            url: `${process.env.VOUCHAGRAM_SERVER_URL}/getbrands`,
            data: body,
            headers: {
                'token': token
            }
        });
        // console.log("Data ::>>",data);
        if (data.status === 'error') {
            await VouchagramLog(`${process.env.VOUCHAGRAM_SERVER_URL}/getbrands`, body, data.code, data.desc);
            return res.status(403).json({
                error: true,
                message: data.desc,
                code: data.code
            });
        }
        const decodedData = decryption(data.data);
        // console.log("response of get Brand", decodedData);

        if (decodedData.length == 0) {
            return next(createError(500, "No data found."))
        }

        // let allCategoryResponse = await allCategoryHelper();


        //for turncate voucherbrands
        // const truncateBrands = await VoucherBrands.destroy({
        //     where: {},
        //     truncate: true
        // });

        const storedBrands = await Promise.all(decodedData.map(async (item) => {
            const existingBrand = await VoucherBrands.findOne({
                where: { BrandProductCode: item.BrandProductCode }
            });
            if (existingBrand) {
                return await VoucherBrands.update({
                    BrandName: item.BrandName,
                    BrandImage: item.BrandImage,
                    BrandType: item.Brandtype,
                    OnlineRedemptionUrl: item.OnlineRedemptionUrl,
                    RedemptionType: item.RedemptionType,
                    minPrice:Math.min(...item.denominationList.split(',')),
                    DenominationList: item.denominationList,
                    StockAvailable: item.stockAvailable,
                    // Category: item.Category,
                    Descriptions: item.Descriptions,
                    TermsAndCondition: item.tnc,
                    ImportantInstruction: item.importantInstruction,
                    RedeemSteps: item.redeemSteps,
                    // updateByStaff: req.user.data.name,
                    vendor: "Vouchagram",
                    updatedIstAt: DateTime()
                }, {
                    where: { BrandProductCode: item.BrandProductCode }
                });
            } else {
                return await VoucherBrands.create({
                    BrandName: item.BrandName,
                    BrandProductCode: item.BrandProductCode,
                    BrandImage: item.BrandImage,
                    BrandType: item.Brandtype,
                    OnlineRedemptionUrl: item.OnlineRedemptionUrl,
                    RedemptionType: item.RedemptionType,
                    minPrice:Math.min(...item.denominationList.split(',')),
                    DenominationList: item.denominationList,
                    StockAvailable: item.stockAvailable,
                    Category: item.Category,
                    Descriptions: item.Descriptions,
                    TermsAndCondition: item.tnc,
                    ImportantInstruction: item.importantInstruction,
                    RedeemSteps: item.redeemSteps,
                    // updateByStaff: req.user.data.name,
                    vendor: "Vouchagram",
                    createdIstAt: DateTime(),
                    updatedIstAt: DateTime()
                });
            }
        }));



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

        // const products = allCategoryResponse?.data?._embedded?.product;
        // const allProducts = await Promise.all(
        //     products.map(async(product)=>{
        //         const voucherObj = {
        //             productId:product.id,
        //             BrandId:product.brand_id,
        //             BrandProductCode:product.sku,
        //             sku:product.sku,
        //             BrandName:product.name,
        //             images:product.images,
        //             priceType:product.price_type,
        //             navigationApiCall:product.navigation_apicall,
        //             navigationUrlPath:product.navigation_urlpath,
        //             minCustomPrice:product.min_custom_price,
        //             maxCustomPrice:product.max_custom_price,
        //             DenominationList:product.custom_denominations,
        //             StockAvailable:true,
        //             vendor:'Woohoo',
        //             updateByStaff:req.user.data.name,
        //             createdIstAt:DateTime(),
        //             updatedIstAt:DateTime(),
        //         };
        //         const voucher = await VoucherBrands.create(voucherObj);
        //         return voucher;
        //     })
        // );

        const allVouchers = await VoucherBrands.findAll();

        return res.status(200).json({
            error: false,
            message: "Vouchagram brands products fetched successfully!!!",
            totalBrands: allVouchers.length,
            data: allVouchers
        });
    } catch (error) {
        console.log("Error to get all Voucher's brand ::>> ", error);
        next(error);
    }
};

export const getBrandsForSellers = async (req, res, next) => {
    try {
        let { page, limit, minRange, maxRange, highToLow, lowToHigh, categories } = req.body;
        page = page || 1;
        limit = limit || 10;
        const offset = limit * (page-1);
        let whereClause = `WHERE vb.status = 'Active'`;
        if(minRange && maxRange){
            whereClause += ` AND vb.minPrice >= '${minRange}' AND vb.minPrice <= '${maxRange}'`;
        }
        if (categories && categories.length > 0) {
            const categoriesCondition = categories.map(category => `FIND_IN_SET('${category}', vb.Category)`).join(' OR ');
            if (whereClause) {
                whereClause += ` AND (${categoriesCondition})`;
            }
        }
        let orderClause = '';
        if(lowToHigh){
            orderClause = 'ORDER BY vb.minPrice ASC'
        }
        if(highToLow){
            orderClause = 'ORDER BY vb.minPrice DESC'
        }
        const query = `SELECT * FROM voucherBrands as vb ${whereClause} ${orderClause} LIMIT ${limit} OFFSET ${offset}`;
        let getVouchers = await sequelize.query(query, {
            replacements:[],
            type:Sequelize.QueryTypes.SELECT
        });
        const query1 = `SELECT count(vb.id) as count FROM voucherBrands as vb ${whereClause}`;
        let getVouchers1 = await sequelize.query(query1, {
            replacements:[],
            type:Sequelize.QueryTypes.SELECT
        });
        return res.status(200).json({
            error: false,
            message: getVouchers.length === 0 ? "Empty" : "All Vouchers Found Successfully...!",
            totalCount: getVouchers1[0].count,
            count: getVouchers.length,
            data: getVouchers,
        })
    } catch (error) {
        console.log("Get-All-Vouchers ::>>", error);
        next(error);
    }
};

export const getBrandsByPandF = async (req, res, next) => {
    try {
        let { page, limit, orderBy, brandName, category, status, search , startDate, endDate } = req.body;

        // console.log("Body ::>>",page, limit, orderBy, brandName, category, status, search); 
        let clause = {
            StockAvailable:true
        };

        if (brandName || status || search) {

            if (brandName && status) {
                clause.BrandName = brandName,
                clause.status = status
            } else if (search) {
                clause.BrandName = { [Op.substring]: search };
            }
            else {
                if (brandName && status == "") {
                    clause.BrandName = brandName
                };
                if (status && brandName == "") {
                    clause.status = status
                };
            }
        }
        if(category && category!==""){
            clause.Category = { [Op.substring]: category };
        }
        // console.log("WhereClause ::>>",clause);
        page = page || 1;
        limit = limit || 10;
        const offset = limit * (page - 1);
        orderBy = !orderBy ? 'asc' : orderBy == 'decending' ? 'desc' : 'asc';

        const sDate = startDate ? new Date(startDate) : new Date('2023-01-01');
        const eDate = endDate ? new Date(endDate) : new Date('2100-01-03');
        eDate.setDate(eDate.getDate()+1);

        clause.createdAt={
            [Op.gt] : sDate,
            [Op.lt] : eDate
        }

        const getVouchers = await VoucherBrands.findAll({
            where: clause,
            limit: limit,
            offset: offset,
            order: [
                ['id', orderBy]
            ],
            raw: true
        });

        const totalVouchers = await VoucherBrands.count({where: clause});

        return res.status(200).json({
            error: false,
            message: getVouchers.length === 0 ? "Empty" : "All Vouchers Found Successfully...!",
            totalCount: totalVouchers,
            count: getVouchers.length,
            data: getVouchers
        })
    } catch (error) {
        console.log("Get-All-Vouchers ::>>", error);
        next(error);
    }
};

export const getBrandsByRangeFilter = async (req, res, next) => {
    try {
        let { page, limit, lowToHigh, highToLow, minRange, maxRange } = req.body;

        // console.log("WhereClause ::>>",clause);
        page = page || 1;
        limit = limit || 10;
        const offset = limit * (page - 1);

        const getVouchers = await VoucherBrands.findAll({
            where:{
                DenominationList:{
                    [Op.ne]:null
                },
                StockAvailable:true
            },
            raw: true
        });

        if (!getVouchers.length) {
            return next(createError(400, 'No Data Available In This Range'));
        }

        const totalVouchers = await VoucherBrands.count();

        if (minRange && maxRange){
            let filterData = getVouchers.filter(voucher => {
                const denominationList = voucher.DenominationList.split(',');
                const filterValue = parseInt(denominationList[0]);
                return filterValue >= minRange && filterValue <= maxRange;
            });

            filterData.sort((a, b) => {
                let firstDenominationlist = a.DenominationList.split(',');
                let secondDenominationlist = b.DenominationList.split(',');
    
                return firstDenominationlist[0] - secondDenominationlist[0];
            })
            filterData = filterData.splice(Number(offset), Number(offset)+Number(limit));
            return res.status(200).json({
                error: false,
                message: filterData.length === 0 ? "Empty" : "All Vouchers Found Successfully...!",
                totalCount: totalVouchers,
                count: filterData.length,
                data: filterData
            });
        }

        let sortedDataOnTheBasesOfInitialValueOfDenominationList = getVouchers.sort((a, b) => {
            let firstDenominationlist = a.DenominationList.split(',');
            let secondDenominationlist = b.DenominationList.split(',');

            if (lowToHigh) {
                return firstDenominationlist[0] - secondDenominationlist[0];
            } else if (highToLow) {
                return secondDenominationlist[0] - firstDenominationlist[0];
            } else {
                return 0;
            }
        });
        sortedDataOnTheBasesOfInitialValueOfDenominationList = sortedDataOnTheBasesOfInitialValueOfDenominationList.splice(Number(offset), Number(offset)+Number(limit));
        return res.status(200).json({
            error: false,
            message: sortedDataOnTheBasesOfInitialValueOfDenominationList.length === 0 ? "Empty" : "All Vouchers Found Successfully...!",
            totalCount: totalVouchers,
            count: sortedDataOnTheBasesOfInitialValueOfDenominationList.length,
            data: sortedDataOnTheBasesOfInitialValueOfDenominationList
        });
    } catch (error) {
        console.log("Get-All-Vouchers ::>>", error);
        next(error);
    }
};


export const updateBrandStatus = async (req, res, next) => {
    try {

        const { voucherBrandId, ...rest } = req.body;

        if (!voucherBrandId || voucherBrandId == "") {
            return next(createError(400, "Please provide valid voucher brand id"));
        }

        const updateVoucher = await VoucherBrands.update({
            ...rest,
            updateByStaff: req.user.data.name,
            updatedIstAt: DateTime()
        }, {
            where: {
                id: voucherBrandId
            }
        })

        if (updateVoucher[0] === 0) {
            return next(createError(400, "Failed to Update Brand Status"))
        }

        return res.status(200).json({
            error: false,
            message: "Vouchagram brands status updated successfully!!!"
        });
    } catch (error) {
        console.log("Error to update status vouchers brand ::>> ", error);
        next(error);
    }
};

export const getAllActiveBrands = async (req, res, next) => {

    try {

        let allData = await VoucherBrands.findAndCountAll({ where: { status: "Active" } })

        if (allData.length == 0) {
            return next(createError(404, "No Vouchers Brands Found"))
        }

        return res.status(200).json({
            error: false,
            message: "All Active Vouchagram brands fetched successfully!!!",
            totalBrands: allData.length,
            data: allData
        });
    } catch (error) {
        console.log("Error to get all Active Voucher's brand ::>> ", error);
        next(error);
    }
};

export const getAllCategoryOfBrands = async (req, res, next) => {

    try {
        const  allData = await VoucherBrands.findAll({
            attributes:['Category'],
            raw:true
        });
        if (allData.length == 0) {
            return next(createError(404, "No Vouchers Brands Found"))
        }
        let set = new Set([]);
        for(let i=0;i<allData.length;i++){
            if(allData[i].Category!==null){
                let cts = allData[i].Category.split(',');
                for(let j=0;j<cts.length;j++){
                    set.add(cts[j].substring(0,1).toUpperCase()+cts[j].substring(1));
                }
            }                      
        }
        let cList = [...set];
        cList.sort();
        return res.status(200).json({
            error: false,
            message: "Get all Category of Voucher's brand found successfully!!!",
            data: cList
        });
    } catch (error) {
        console.log("Get all Category of Voucher's brand ::>> ", error);
        next(error);
    }
};
 
//for pull vouchers
//     "data": {
//         "BrandProductCode":"Bata4xfRrUnT46Uv4iol",
//         "Denomination":"100"
//         // "Quantity":2,
//         // "ExternalOrderId":"demo-id1"

//     }


// for get stocks
//     "data": {
//         "BrandProductCode":"Bata4xfRrUnT46Uv4iol",
//         "Denomination":"100"
//     }

export const getStocks = async (req, res, next) => {
    try {
        const { BrandProductCode } = req.body;
        const token = await getToken();
        let body = {
            BrandProductCode
        };

        const { data } = await axios({
            method: "POST",
            url: `${process.env.VOUCHAGRAM_SERVER_URL}/getbrands`,
            data: body,
            headers: {
                token: token
            }
        });
        if (data.status === 'error') {
            await VouchagramLog(`${process.env.VOUCHAGRAM_SERVER_URL}/getbrands`, body, data.code, 'In Get Stocks -> '+data.desc);
            return res.status(403).json({
                error: true,
                message: data.desc,
                code: data.code
            });
        }
        // console.log("Data ::>>",data);
        const decodedData = decryption(data.data);

        let denominationList = decodedData[0].denominationList.split(",");

        let result = {
            BrandName: decodedData[0].BrandName,
            BrandImage: decodedData[0].BrandImage,
            denominationCount: denominationList.length,
            denominationStock: []
        }

        await Promise.all(denominationList.map(async (denomination) => {
            let stockBody = {
                BrandProductCode,
                Denomination: denomination
            }

            const stockPayload = encryption(stockBody);
            const stockData = await axios({
                method: "POST",
                url: `${process.env.VOUCHAGRAM_SERVER_URL}/getstock`,
                data: { payload: stockPayload },
                headers: {
                    token: token
                }
            });
            if (stockData.data.status === 'error') {
                await VouchagramLog(`${process.env.VOUCHAGRAM_SERVER_URL}/getstock`, stockBody, stockData.data.code, 'In Get Stocks -> '+stockData.data.desc);
                return res.status(403).json({
                    error: true,
                    message: stockData.data.desc,
                    code: stockData.data.code
                });
            }

            const stockDecodedData = decryption(stockData.data.data);

            const denominationStockObject = {
                Denomination : denomination,
                AvailableQuantity : stockDecodedData.AvailableQuantity
            }

            result.denominationStock.push(denominationStockObject)

        }))

        // console.log("get stock ::>>",decodedData);
        res.status(200).json({
            error: false,
            message: "Your Brand Stock found Successfully...!",
            data: result
        })
    } catch (error) {
        console.log("Vouchagram Get-Stock Error ::>>", error);
        next(error);
    }
};

export const getStoreList = async (req, res, next) => {
    try {
        const { BrandProductCode, shop } = req.body;
        const token = await getToken();
        let body = {};
        if (BrandProductCode && BrandProductCode !== "") {
            body.status = BrandProductCode;
        }
        if (shop && shop !== "") {
            body.shop = shop;
        }
        
        const { data } = await axios({
            method: "POST",
            url: `${process.env.VOUCHAGRAM_SERVER_URL}/getstorelist`,
            data: body,
            headers: {
                token: token
            }
        });
        if (data.status === 'error') {
            await VouchagramLog(`${process.env.VOUCHAGRAM_SERVER_URL}/getstorelist`, body, data.code, data.desc);
            return res.status(403).json({
                error: true,
                message: data.desc,
                code: data.code
            });
        }

        res.status(200).json({
            error: false,
            message: "Your Brand Store List found Successfully...!",
            data: data
        })
    } catch (error) {
        console.log("Vouchagram Brand Store List Error ::>>", error);
        next(error);
    }
};

export const getAllBrandsName = async (req, res, next) => {
    try {

        const getAllBrandsName = await VoucherBrands.findAndCountAll({
            attributes: ["BrandName"]
        })

        if (getAllActiveBrands.length == 0) {
            return next(createError(403, "No Brand names found"))
        }

        res.status(200).json({
            error: false,
            message: "get All Brands name fetched Successfully...!",
            data: getAllBrandsName
        })
    } catch (error) {
        console.log("Vouchagram Brand Store List Error ::>>", error);
        next(error);
    }
};

export const getBrandById = async (req, res, next) => {
    try {

        const { brandId } = req.body;
        if (!brandId || brandId === "") {
            return next(createError(403, "Please Give the valid Brand Id"));
        }
        let getBrand = await VoucherBrands.findOne({
            where: {
                id: brandId
            },
            raw: true
        });
        if(getBrand.vendor==='Woohoo' && getBrand.success===null || getBrand.success===false){
            const getProduct = await getProductHelper(getBrand.productId);
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
                // updateByStaff:req.user.data.name,
            };
            const woohooProduct = await VoucherBrands.update(woohooObj,{
                where:{
                    productId:getBrand.productId
                }
            });
            getBrand = await VoucherBrands.findOne({
                where: {
                    id: brandId
                },
                raw: true
            });
        }

        res.status(200).json({
            error: false,
            message: "Get Brand found Successfully...!",
            data: getBrand
        })
    } catch (error) {
        console.log("Vouchagram Brand Store List Error ::>>", error);
        next(error);
    }
};

export const approvePullRequest = async (req, res, next) => {
    try {
        const { requestId } = req.body;
        if (!requestId || requestId == "") {
            return next(createError(403, "Please Provide requestId"))
        }
        const getRequest = await SellerVouchers.findOne({
            where: {
                id: requestId,
                status: "Pending"
            },
            raw: true
        });
        if (!getRequest) {
            return next(createError(403, "No request found"))
        }
        let decodedData;
        let woohoData
        //vouchagram
        if(getRequest.voucherType==='Vouchagram'){
            const token = await getToken();
            const { data: brand } = await axios({
                method: 'post',
                url: `${process.env.VOUCHAGRAM_SERVER_URL}/getbrands`,
                data: { BrandProductCode: getRequest.BrandProductCode },
                headers: {
                    'token': token
                }
            });
            // console.log("Brand ::>>",brand);
            if (brand.status === 'error') {
                await VouchagramLog(`${process.env.VOUCHAGRAM_SERVER_URL}/getbrands`, { BrandProductCode: getRequest.BrandProductCode }, brand.code, 'In Approve Request -> '+brand.desc);
                return res.status(403).json({
                    error: true,
                    message: brand.desc,
                    code: brand.code
                });
            }
            const decodedBrand = decryption(brand.data);
            if (decodedBrand.length === 0) {
                return next(createError(500, "Brand Product Not Found."))
            }
            let stockBody = {
                BrandProductCode: getRequest.BrandProductCode,
                Denomination: getRequest.Denomination
            };
            const stockPayload = encryption(stockBody);
            const stockData = await axios({
                method: "POST",
                url: `${process.env.VOUCHAGRAM_SERVER_URL}/getstock`,
                data: { payload: stockPayload },
                headers: {
                    token: token
                }
            });
            if (stockData.data.status === 'error') {
                await VouchagramLog(`${process.env.VOUCHAGRAM_SERVER_URL}/getstock`, stockBody, stockData.data.code, 'In Approve Pull Request -> '+stockData.data.desc);
                return res.status(403).json({
                    error: true,
                    message: stockData.data.desc,
                    code: stockData.data.code
                });
            }
            // console.log("Data ::>>",data);
            const stockDecodedData = decryption(stockData.data.data);
            // console.log("get stock ::>>",stockDecodedData);
            if (Number(stockDecodedData.AvailableQuantity) < getRequest.Quantity) {
                return res.status(200).json({
                    error: true,
                    message: "Insuffcient Quantity for Voucher"
                });
            }

            let body = {
                BrandProductCode: getRequest.BrandProductCode,
                Denomination: getRequest.Denomination,
                Quantity: getRequest.Quantity,
                ExternalOrderId: getRequest.ExternalOrderId
            };

            // console.log("Body ::>>",body);
            const payload = encryption(body);
            const { data } = await axios({
                method: "POST",
                url: `${process.env.VOUCHAGRAM_SERVER_URL}/pullvoucher`,
                data: { payload },
                headers: {
                    token: token
                }
            });
            if (data.status === 'error') {
                await VouchagramLog(`${process.env.VOUCHAGRAM_SERVER_URL}/pullvoucher`, body, data.code, 'In Approve Pull Request -> '+data.desc);
                return res.status(403).json({
                    error: true,
                    message: data.desc,
                    code: data.code
                });
            }
            decodedData = decryption(data.data);
        }
        else{
            woohoData = await getPlaceOrderHelper(getRequest.woohooProductId, getRequest.sellerId, getRequest.Denomination*getRequest.Quantity, 'thanku', getRequest.Quantity, getRequest.Denomination);
            // console.log("order woohoo ::>>", woohoData);
        }
        
        let endDateOfVouchers = decodedData?.PullVouchers[0].Vouchers[0].EndDate;

        const updateSellerVoucher = await SellerVouchers.update({
            PullVouchers: getRequest.voucherType==='Vouchagram' ? decodedData?.PullVouchers : woohoData.carddetails,
            status: "Completed",
            ErrorCode: decodedData?.ErrorCode,
            ErrorMessage: decodedData?.ErrorMessage,
            Message: getRequest.voucherType==='Vouchagram' ? decodedData?.Message : woohoData.message,
            woohooOrderId:woohoData?.order_id,
            ResultType: decodedData?.ResultType,
            endDateOfApprovedVouchers: endDateOfVouchers,
            updateByStaff: req.user.data.name,
            updatedIstAt: DateTime()
        }, {
            where: {
                id: requestId,
                status: "Pending"
            }
        })
        if (updateSellerVoucher[0] == 0) {
            return next(createError(403, "No request found to update."))
        }
        //transaction work are here if have you want any changes
        const getSeller = await Seller.findOne({
            where:{
                id:getRequest.sellerId
            },
            raw:true
        });
        const vouchersData = decodedData?.PullVouchers[0].Vouchers;
        vouchersData.map(async(vData)=>{
            console.log("vDATa ::>>",vData);
            await sent_approve_voucher_request_whatsapp(getRequest.contactNo, getRequest.sellerName, getRequest.BrandName, vData.VoucherGCcode, vData.Value, vData.Voucherpin, vData.EndDate);
        })

        res.status(200).json({
            error: false,
            message: "Pull request approved and Points deducts successfully"
        })
    } catch (error) {
        console.log("Approve Pull Voucher Request Error ::>>", error);
        next(error);
    }
};

export const getPendingVoucherRequests = async (req, res, next) => {
    try {
        let { page, limit, search, status , startDate , endDate } = req.body;
        page = page || 1;
        limit = limit || 20;
        const offset = limit * (page - 1);
        let whereClause = search && search !== "" ? {
            status: status || 'Pending',
            [Op.or]: [
                {
                    BrandProductCode: {
                        [Op.substring]: search
                    }
                },
                {
                    sellerName: {
                        [Op.substring]: search
                    }
                },
                {
                    contactNo: {
                        [Op.substring]: search
                    }
                },
                {
                    ExternalOrderId: {
                        [Op.substring]: search
                    }
                },
                {
                    accountId: {
                        [Op.substring]: search
                    }
                },
                {
                    email: {
                        [Op.substring]: search
                    }
                }
            ]
        } : { status: status || 'Pending' };
        // console.log("Where-Clause ::>>",whereClause);

        const sDate = startDate ? new Date(startDate) : new Date('2023-01-01');
        const eDate = endDate ? new Date(endDate) : new Date('2100-01-03');
        eDate.setDate(eDate.getDate()+1);
        whereClause.createdAt={
        [Op.gt] : sDate,
        [Op.lt] : eDate
        }

        const sellerVouchersRequest = await SellerVouchers.findAll({
            where: whereClause,
            limit,
            offset,
            order: [
                ['id', 'DESC']
            ]
        });
        const totalRequest = await SellerVouchers.count({
            where: whereClause,
        });
        res.status(200).json({
            error: false,
            message: "Get All Pending Pull Voucher Request found Successfully...!",
            totalRequestInAPage: sellerVouchersRequest.length,
            totalRequest,
            data: sellerVouchersRequest
        })
    } catch (error) {
        console.log("Get Pending Voucher Request Error ::>>", error);
        next(error);
    }
};

export const getSinglePendingVoucherRequests = async (req, res, next) => {
    try {
        let { voucherId } = req.body;
        if(!voucherId){
            return next(createError(403, "Please provide voucher Id!"));
        }
        const sellerVouchersRequest = await SellerVouchers.findAll({
            where: {
                id:voucherId
            },
            raw:true
        });
        res.status(200).json({
            error: false,
            message: "Get Single Pending Pull Voucher Request found Successfully...!",
            totalRequestInAPage: sellerVouchersRequest.length,
            totalRequest:sellerVouchersRequest.length,
            data: sellerVouchersRequest
        })
    } catch (error) {
        console.log("Get Single Pending Voucher Request Error ::>>", error);
        next(error);
    }
};

export const deleteVoucherRequest = async (req, res, next) => {
    try {
        let { requestId } = req.body;
        const deleteVoucherRequest = await SellerVouchers.destroy({
            where: {
                id: requestId
            }
        });
        res.status(200).json({
            error: false,
            message: "Delete Voucher Request  Successfully...!",
            data: deleteVoucherRequest
        })
    } catch (error) {
        console.log("Delete Voucher Request Error ::>>", error);
        next(error);
    }
};

export const rejectRequest = async (req, res, next) => {
    try {

        const { requestId , message } = req.body

        if (!requestId || requestId == "") {
            return next(createError(403, "Please Provide requestId"))
        }
        const getRequest = await SellerVouchers.findOne({
            where: {
                id: requestId,
                status: "Pending"
            },
            raw: true
        });
        if (!getRequest) {
            return next(createError(403, "No request found"))
        }

        const amountSellerHas = await SellerInfo.findOne({
            where: {
                sellerId: getRequest.sellerId
            },
            attributes: ['availablePoints'],
            raw: true
        })

        let amountWithRefund = amountSellerHas.availablePoints + getRequest.requiredPoints

        const refundSellerAmount = await SellerInfo.update({
            availablePoints: amountWithRefund
        },
            {
                where: {
                    sellerId: getRequest.sellerId
                }
            });

        if (refundSellerAmount[0] == 0) {
            return next(createError(403, "Fail to refund amount."))
        }

        // Refund Transaction
        const transactionId = generateId();
        const refundTransaction = await Transaction.create({
            transactionId: transactionId,
            sellerId: getRequest.sellerId,
            ExternalOrderId:getRequest.ExternalOrderId,
            transactionCategory: 'VoucherRedeem',
            points: getRequest.requiredPoints,
            status: 'Refund',
            brandImageUrl:getRequest.brandImageUrl,
            updateByStaff: req.user.data.name,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        });

        const updateStatusOfRequest = await SellerVouchers.update({
            status: "Rejected",
            Message: message ? message : "Due to technical reasons your request could not proceed further. Your points has been added back to your account.",
            updateByStaff: req.user.data.name,
            updatedIstAt: DateTime()
        }, {
            where: {
                id: requestId,
                status: "Pending"
            }
        })

        if (updateStatusOfRequest[0] == 0) {
            return next(createError(500, "Failed to Reject the request"));
        }
        refundofRewardPoints(getRequest.contactNo, getRequest.sellerName, getRequest.requiredPoints, getRequest.ExternalOrderId, getRequest.createdIstAt.split(' ')[0]);
        await sent_reject_voucher_request_whatsapp(getRequest.contactNo, getRequest.BrandName, getRequest.ExternalOrderId, getRequest.Denomination , getRequest.requiredPoints);
        res.status(200).json({
            error: false,
            message: "Request has been rejected successfully and refund transfered done.",
        })
    } catch (error) {
        console.log("Request rejected  Error ::>>", error);
        next(error);
    }
};

export const getSellerVoucherByExternalOrderId = async (req, res, next) => {
    try {

        const { externalOrderId } = req.body

        if (!externalOrderId || externalOrderId === "") {
            return next(createError(403, "Please Provide externalOrderId"))
        }
        const getVoucher = await SellerVouchers.findOne({
            where: {
                ExternalOrderId: externalOrderId,
            },
            raw: true
        });
        if (!getVoucher) {
            return next(createError(403, "No request found"))
        }

        res.status(200).json({
            error: false,
            message: "Get Seller Voucher By External Order Id found Successfully",
            data:getVoucher
        })
    } catch (error) {
        console.log("Get Seller Voucher By External Order Id Error ::>>", error);
        next(error);
    }
};

export const getBrandsByCategory = async (req, res, next) => {
    try {
        let { page, limit, orderBy, category} = req.body;

        // console.log("Body ::>>",page, limit, orderBy, brandName, category, status, search); 
        let clause = {};

        if(category && category!==""){
            clause.Category = { [Op.substring]: category };
        }
        // console.log("WhereClause ::>>",clause);
        page = page || 1;
        limit = limit || 10;
        const offset = limit * (page - 1);
        orderBy = !orderBy ? 'asc' : orderBy == 'decending' ? 'desc' : 'asc';

        const getVouchers = await VoucherBrands.findAll({
            where: clause,
            limit: limit,
            offset: offset,
            order: [
                ['id', orderBy]
            ],
            raw: true
        });

        const totalVouchers = await VoucherBrands.count({
            where: clause
        });

        return res.status(200).json({
            error: false,
            message: getVouchers.length === 0 ? "Empty" : "All Vouchers Found Successfully...!",
            totalCount: totalVouchers,
            count: getVouchers.length,
            data: getVouchers
        })
    } catch (error) {
        console.log("Get-All-Vouchers ::>>", error);
        next(error);
    }
};

export const getBrandsByMultiCategory = async (req, res, next) => {
    try {
        let { page, limit, orderBy, categories } = req.body;

        if (!categories) {
            return next(createError(404, "Please provide at least one Category"));
        }

        let resultArray = [];

        if(categories.length >= 1){{
            await Promise.all(categories.map(async(category) => {
                const getVouchers = await VoucherBrands.findAll({
                    where: {
                        Category: { [Op.substring]: category }
                    },
                    raw: true
                });
    
                resultArray.push(...getVouchers);
            }));
        }}
        else if(categories.length == 0){
            // console.log("Ritikkkkkkkkkkkkkkkkkkkkkkk");
                const getVouchers = await VoucherBrands.findAll({
                    raw: true
                });
                resultArray.push(...getVouchers);
        }

        // console.log("resultArrayresultArrayresultArray",resultArray);

        const uniqueSet = new Set(resultArray.map(obj => obj.id));

        const uniqueArray = [...uniqueSet].map(id => resultArray.find(obj => obj.id === id));
        const totalVouchers = await VoucherBrands.count();
        return res.status(200).json({
            error: false,
            message: uniqueArray.length === 0 ? "Empty" : "All Vouchers Found Successfully...!",
            totalCount: uniqueArray.length,
            count: totalVouchers,
            data: uniqueArray
        });
    } catch (error) {
        console.log("Get-All-Vouchers by multi Category ::>>", error);
        next(error);
    }
};

export const getOverallMinAndMaxDenominationPoint = async (req, res, next) => {
    try {

        let getVouchers = await VoucherBrands.findAll({
            raw:true
        });

        // console.log("ritikkkkkkkkkkkkkkk",getVouchers);

        let allInitialValues = [];


        await Promise.all(getVouchers.map(async(voucher)=>{
            let value = voucher.DenominationList!==null ? voucher.DenominationList.split(',')[0] : voucher.minCustomPrice;
            let initialValue = Number(value);
            allInitialValues.push(initialValue)
        }))

        const minValue = Math.min(...allInitialValues);
        const maxValue = Math.max(...allInitialValues);

        let maxValueForList = Math.ceil(maxValue/1000);
        let valueList = []

        let oneValue = maxValueForList / 5;

        let secondValue = Math.ceil(oneValue)

        for (let i=1 ; i<=5 ; i++){
            valueList.push(secondValue * i * 1000)
        }
        
        return res.status(200).json({
            error: false,
            message: "Minimum , Maximum and ValueList for dropdown fetched successfully",
            minValue : minValue,
            maxValue: maxValue,
            valueList: valueList
        });
    } catch (error) {
        console.log("Minimum and Maximum value from Denomination List::>> ", error);
        next(error);
    }
};

export const getAllRejectRequests = async (req, res, next) => {
    try {
        let { page, limit, orderBy } = req.body;

        page = page || 1;
        limit = limit || 10;
        const offset = limit * (page - 1);
        orderBy = !orderBy ? 'desc' : orderBy == 'decending' ? 'desc' : 'asc';

        const getRejectedSellerVouchers = await SellerVouchers.findAll({
            where: {
                status : 'Rejected'
            },
            limit: limit,
            offset: offset,
            order: [
                ['id', orderBy]
            ],
            raw: true
        });

        const totalRejectedSellerVouchers = await SellerVouchers.count({
            where:{
                status : 'Rejected'
            }
        });

        return res.status(200).json({
            error: false,
            message: getRejectedSellerVouchers.length === 0 ? "Empty" : "All Rejected seller Vouchers Found Successfully...!",
            totalCount: totalRejectedSellerVouchers,
            count: getRejectedSellerVouchers.length,
            data: getRejectedSellerVouchers
        })
    } catch (error) {
        console.log("Get-All-Rejected-seller-Vouchers ::>>", error);
        next(error);
    }
};

export const getAllApprovedRequests = async (req, res, next) => {
    try {
        let { page, limit, search, status , startDate , endDate } = req.body;
        page = page || 1;
        limit = limit || 20;
        const offset = limit * (page - 1);
        let whereClause = search && search !== "" ? {
            status: status || 'Completed',
            [Op.or]: [
                {
                    sellerName: {
                        [Op.substring]: search
                    }
                },
                {
                    contactNo: {
                        [Op.substring]: search
                    }
                },
                {
                    accountId: {
                        [Op.substring]: search
                    }
                },
                {
                    email: {
                        [Op.substring]: search
                    }
                }
            ]
        } : { status: status || 'Completed' };
        // console.log("Where-Clause ::>>",whereClause);

        const sDate = startDate ? new Date(startDate) : new Date('2023-01-01');
        const eDate = endDate ? new Date(endDate) : new Date('2100-01-03');
        eDate.setDate(eDate.getDate()+1);
        whereClause.createdAt={
        [Op.gt] : sDate,
        [Op.lt] : eDate
        }

        const sellerVouchersRequest = await SellerVouchers.findAll({
            where: whereClause,
            limit,
            offset,
            order: [
                ['id', 'DESC']
            ]
        });
        const totalRequest = await SellerVouchers.count({
            where: whereClause,
        });

        res.status(200).json({
            error: false,
            message: "Get All Approved Pull Voucher Request found Successfully...!",
            totalRequestInAPage: sellerVouchersRequest.length,
            totalRequest,
            data: sellerVouchersRequest
        })
    } catch (error) {
        console.log("Get-All-Approved-seller-Vouchers ::>>", error);
        next(error);
    }
};

export const deleteAllSelectedRequest = async (req, res, next) => {
    try {
       
    const requestIds = req.body.requestIds;

    if(!requestIds || requestIds.length === 0 || !Array.isArray(requestIds)){
      return next(createError(403,"Please enter a valid request Ids."));
    }

    const deleteRows = requestIds.map(async (id) => {
      return await SellerVouchers.destroy({
        where: {
          id: id
        }
      });
    })
    const deleteSelectedRequests = await Promise.all(deleteRows);
    res.status(200).json({
      error: false,
      message: "Delete Selected Request Successfully...!",
      data: deleteSelectedRequests,
    });

    } catch (error) {
        console.log("Deleted All selected requests ::>>", error);
        next(error);
    }
};

export const updateVoucherBrandById = async (req, res, next) => {
    try {

        const { voucherId , ...rest } = req.body;
        
        const updateVoucherDetails = await VoucherBrands.update({
            ...rest,
            updatedAt : DateTime()
        },{
            where:{
                id : voucherId
            }
        });
        
        if(updateVoucherDetails[0] === 0){
            return res.status(400).json({
              error: true,
              message:"No Voucher Found with this ID"
           });
        }

        return res.status(200).json({
            error: false,
            message: "Vouchagram brands updated successfully!!!",
            data: updateVoucherDetails
        });
    } catch (error) {
        console.log("Error to get all Voucher's brand ::>> ", error);
        next(error);
    }
};

export const updateAllPlatformFees = async (req, res, next) => {
    try {
        const { platformFees } = req.body

        if(!platformFees || platformFees == ""){
            return next(createError(400, "Please provide a valid platform fees"))
        }
        
        const updateVoucherDetails = await VoucherBrands.update(
            {
              platformFees: platformFees,
              updatedAt: DateTime()
            },{
                where:{}
            }
          );

        if(updateVoucherDetails[0] === 0){
            return res.status(400).json({
              error: true,
              message:"No Voucher Found to update plateform fees"
           });
        }

        return res.status(200).json({
            error: false,
            message: "Vouchagram brands plateform fees updated successfully!!!",
            data: updateVoucherDetails
        });
    } catch (error) {
        console.log("Error to update platform fees of all vouchers ::>> ", error);
        next(error);
    }
};

export const truncateVoucherTable = async (req, res, next) => {
    try {
        const turncateVoucher = await VoucherBrands.destroy({
            truncate:true
        });

        return res.status(200).json({
            error: false,
            message: "Delete(Turncate) All Vouchers successfully!!!",
            data: turncateVoucher
        });
    } catch (error) {
        console.log("Delete(Turncate) All Vouchers Error ::>> ", error);
        next(error);
    }
};