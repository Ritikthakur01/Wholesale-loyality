import { Seller } from "../models/Seller";
import { CouponBatch, CouponCode } from "../models/Coupon";
import { Product } from "../models/Produt";
import { Staff } from "../models/Staff";
import { PinCode } from "../models/Pincode";
import DateTime from "../../utils/constant/getDate&Time";
import path from "path";
import csv from 'csv-parser';
import fs from 'fs';
import generateSalt from "../../utils/constant/generateSalt";
import bcrypt from 'bcryptjs';
import { NewPage } from "../models/pages";
import { createError } from "../../utils/error";
import Query from "../../utils/db/rawQuery";
import { Role } from "../models/Role";
import { Transaction }  from "../models/Transaction";
import { SellerVouchers } from "../models/SellerVouchers";
import { Op } from "sequelize";
import { Logger } from "../models/Logger";
import sequelize from "../../utils/db/dbConnection";



export const adminDashboard = async (req, res, next) => {
    try {
        let sellerCount = 0;
        let couponBatchCount = 0;
        let couponCount = 0;
        let orderCount = 0;
        let productCount = 0;
        let pendingRequestCount = 0;
        let staffCount = 0;
        const seller = await Seller.count({});
        sellerCount = seller;
        const couponBatch = await CouponBatch.count({});
        couponBatchCount = couponBatch;
        const coupon = await CouponCode.count({});
        couponCount = coupon;
        const product = await Product.count({});
        productCount = product;
        const staff = await Staff.count({});
        staffCount = staff;
        const lastBatches =  await CouponBatch.findAll({
            attributes:['id','serialNo','noOfCoupon','startDate','endDate','updateByStaff','createdIstAt','generated'],
            limit:2,
            order:[
                ['id','desc']
            ],
            raw:true
        });

        for(let batch of lastBatches){
            if(batch.generated==='Success'){
                batch.percent = "100%";
                continue;
            }
            else{
                const getCoupons = await CouponCode.count({
                    where:{
                        couponBatchId:batch.id
                    },
                    raw:true
                });
                // console.log(batch.noOfCoupon,getCoupons);
                if(batch.noOfCoupon===getCoupons){
                    await CouponBatch.update({generated:'Success'},{
                        where:{
                            id:batch.id
                        }
                    });
                    batch.generated = 'Success';
                    batch.percent = "100%";
                }
                else{
                    const percent = (getCoupons/batch.noOfCoupon)*100;
                    batch.percent = percent+"%";
                }
            }
        }
        // console.log("last batches ::>>",lastBatches);
        return res.status(200)
            .json({
                error: false,
                message: "Admin Dashboard...!",
                data: {
                    seller,
                    couponBatch,
                    coupon,
                    product,
                    staff,
                    lastBatches
                }
            });
    } catch (error) {
        console.log("Admin Dashboard ::>> ", error);
        next(error);
    }
};

//for Admin
export const getSellerById = async(req, res, next)=>{
    try {
        const { id } = req.body;
        if(!id || id===""){
            return next(createError(403, "Enter the valid Id"));
        }
        const getSeller = await Query(`Select * from sellers as so Inner Join sellerinfos as si on so.id=si.sellerId where so.id='${id}'`);
        if(!getSeller[0]){
            return next(createError(404,"Seller Not Found :: Give the valid Id"))
        }
        return res.status(200).json({
            error:false,
            message:"WholeSeller Found Successfully...!",
            data:getSeller[0]
        })
    } catch (error) {
        console.log("Get-WholeSeller-By-Id Error ::>>", error);
        next(error);
    } 
};

export const setSellerPassword = async (req, res, next) => {
    if (!req.body.email || req.body.email === "" || !req.body.password || req.body.password === "") {
        return next(createError(403, "Enter the Valid Fields"));
    }

    const email = req.body.email.trim();
    try {
        const seller = await Seller.findOne({
            where: {
                email: email,
            },
            raw: true
        });
        // console.log("Seller ::>>",seller)
        if (!seller) {
            return next(createError(404, `Email not found Successfully...!`));
        }
        const password = req.body.password;
        const number = generateSalt();
        const salt = bcrypt.genSaltSync(number);
        const hash = bcrypt.hashSync(password, salt);

        await Seller.update({
            password: hash
        }, {
            where: {
                id: seller.id
            }
        });
        return res.status(200)
            .json({
                error: false,
                message: "Password Has been Changed Successfully...!",
            });
    } catch (error) {
        console.log("Change-password Seller Error ::>> ", error);
        next(error);
    }
};

export const setStaffPassword = async (req, res, next) => {
    if (!req.body.email || req.body.email === "" || !req.body.password || req.body.password === "") {
        return next(createError(403, "Enter the Valid Fields"));
    }

    const email = req.body.email.trim();
    try {
        const staff = await Staff.findOne({
            where: {
                email: email,
            },
            raw: true
        });
        // console.log("Seller ::>>",seller)
        if (!staff) {
            return next(createError(404, `Email not found Successfully...!`));
        }
        const password = req.body.password;
        const number = generateSalt();
        const salt = bcrypt.genSaltSync(number);
        const hash = bcrypt.hashSync(password, salt);

        await Staff.update({
            password: hash
        }, {
            where: {
                id: staff.id
            }
        });
        return res.status(200)
            .json({
                error: false,
                message: "Password Has been Changed Successfully...!",
            });
    } catch (error) {
        console.log("Change-password Staff Error ::>> ", error);
        next(error);
    }
};

// Code Starts By Ritik

export const createPage = async (req, res, next) => {
    try {

        const { pageName, ...rest } = req.body;

        if(!pageName || pageName == ""){
            return next(createError(400,"Please provide Page Name"));
        }

        let existingPage = await NewPage.findOne({
            where:{
                pageName : pageName
            }
        })
 
        if(existingPage){
            return next(createError(400, "This page already exists."))
        }

        let NP = await NewPage.create({
            updateByStaff: req.user.data.name,
            pageName: pageName,
            ...rest,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        })

        if (!NP) {
            return next(createError(403, "Error while creating New page"))
        }

        return res.status(200).json({
            error: false,
            status: 200,
            message: "Successfully create New Page Data",
            data: NP
        });

    } catch (error) {
        console.error("Get New Page Error:", error);
        return res.status(500).json(
            {
                error: true,
                message: "Internal Server Error",
                error: error.message
            }
        );
    }
}

export const getPage = async (req, res, next) => {
    try {
        const { pageName } = req.body

        if(!pageName || pageName == ""){
            return next(createError(400,"Please provide Page Name"));
        }

        // const data = await NewPage.findByPk(id);
        const data = await NewPage.findOne({
            where:{
                pageName: pageName
            }
        });


        if (!data) {
            return res.status(400).json({
                error: false,
                message: "No entry found"
            })
        }

        return res.status(200).json({
            error: false,
            message: "Successfully get New Page Data",
            data: data,
        });
    } catch (error) {
        console.error("Get New Page Error:", error);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

export const getAllPages = async (req, res, next) => {
    try {

        const data = await NewPage.findAll();

        if (data.length == 0) {
            return res.status(400).json({
                error: false,
                message: "No entry found"
            })
        }

        return res.status(200).json({
            error: false,
            message: "Successfully get all pages data",
            data: data,
        });
    } catch (error) {
        console.error("Get all Pages Error:", error);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

export const getAllActivePages = async (req, res, next) => {
    try {

        const data = await NewPage.findAll({
            where: { status: "active" }
        });

        if (data.length == 0) {
            return next(createError(403, "No Data found"))
        }

        return res.status(200).json({
            error: false,
            message: "Successfully get all Active pages data",
            data: data,
        });
    } catch (error) {
        console.error("Get all Active Pages Error:", error);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

export const deletePage = async (req, res, next) => {
    try {
        const { pageName } = req.body

        if(!pageName || pageName == ""){
            return next(createError(400,"Please provide Page Name"));
        }

        const data = await NewPage.destroy({
            where: { pageName: pageName }
        });

        if (!data || data == 0) {
            return next(createError(403, "No Data found"))
        }

        return res.status(200).json({
            error: false,
            message: "Successfully delete New Page Data",
            data: data,
        });
    } catch (error) {
        console.error("delete New Page Error:", error);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

export const updatePage = async (req, res, next) => {
    try {
        const { pageName, ...rest } = req.body;

        if(!pageName || pageName == ""){
            return next(createError(400,"Please provide Page Name"));
        }

        let NP = await NewPage.update({
            ...rest,
            updateByStaff: req.user.data.name,
            updatedIstAt: DateTime()
        }, {
            where: {
                pageName: pageName
            }
        })
        if (NP[0] == 0) {
            return next(createError(403, "No Data found"))
        }

        return res.status(200).json({
            error: false,
            status: 200,
            message: "Successfully update page data",
            data: NP,
        });
    } catch (error) {
        console.error("update page Error:", error);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
            error: error.message
        });
    }
};


// const uploadCSV = async (path) => {
//     try {
//         const stream = fs.createReadStream(path);
//         const csvDataColl = [];

//         const fileStream = csv().on('data', function (data) {
//             csvDataColl.push(data);
//         }).on('end', async function () {

//             await PinCode.destroy({
//                 where: {},
//                 truncate: true
//             });

//             for (const data of csvDataColl) {
//                 await PinCode.create({
//                     District: data.District,
//                     Pincode: data.Pincode,
//                     StateName: data.StateName,
//                     Status: data.Status,
//                     createdIstAt: new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }),
//                     updatedIstAt: new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' })
//                 });
//             } 

//             fs.unlinkSync(path);
//         });

//         stream.pipe(fileStream);

//     } catch (error) {
//         console.error('Error uploading CSV:', error);
//     }
// };


const uploadCSV = (path) => {
    return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(path);
        const csvDataColl = [];
        const fileStream = csv().on('data', function (data) {
            csvDataColl.push(data);
        }).on('end', async function () {
            try {
                await PinCode.destroy({
                    where: {},
                    truncate: true
                });
                for (const data of csvDataColl) {
                    
                    await PinCode.create({
                        district: data.District,
                        pinCode: data.Pincode,
                        stateName: data.StateName,
                        status: data.Status,
                        createdIstAt: new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }),
                        updatedIstAt: new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' })
                    });
                }

                fs.unlinkSync(path);
                resolve();
            } catch (error) {
                console.error('Error uploading CSV:', error);
                reject(error);
            }
        });
        stream.pipe(fileStream);
    });
};


export const importCSVFile = async (req, res, next) => {
    try {

        let filePath = path.join(__dirname, `../assests/files/${req.file?.filename}`);
        console.log("filePath :- ", filePath);

        await uploadCSV(filePath)

        return res.json({ success: true, message: "Successfully data inserted into database" })

    } catch (error) {
        console.error("Import CSV File Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};


export const getAdminDashboardData = async (req, res, next) => {
    try {
        
        const ProductCount = await Product.count()
        const SellerCount = await Seller.count()

        const transactionCount = await Transaction.count()
        const sellerVouchersCount = await SellerVouchers.count({where:{status:"Pending"}})
        // const RoleCount = await Role.count()
        // const staffCount = await Staff.count()

        const result = {
            product_count: ProductCount,
            seller_count: SellerCount,
            // coupon_count: CounponsCount,
            // role_count: RoleCount,
            // staff_count: staffCount
            sellerVouchersCount: sellerVouchersCount,
            transactionCount: transactionCount
        }
        
        return res.json({ success: true, message: "Successfully data fetched from database", data: result})

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

export const getAnalyticsData = async (req, res, next) => {
    try {
        // const { analyticsType , year } = req.body;

        // // console.log("Ritikkkkkkkkkkkkkkkkkkkkkkkkkk");

        // const transactions = await Transaction.findAll({ 
        //     where:{
        //         transactionCategory: analyticsType,
        //         createdAt: {
        //             [Op.between]: [`${year}-01-01`, `${year}-12-31`]
        //         }
        //     },
        //     raw: true
        // });

        // // console.log("transactionstransactionstransactions",transactions);

        // if (!transactions || transactions.length <= 0) {
        //     return res.status(404).json({ success: false, message: 'No Data Found' });
        // }

        // const monthWiseData = {
        //     January: 0,
        //     February: 0,
        //     March: 0,
        //     April: 0,
        //     May: 0,
        //     June: 0,
        //     July: 0,
        //     August: 0,
        //     September: 0,
        //     October: 0,
        //     November: 0,
        //     December: 0
        // };

        // transactions.forEach(transaction => {
        //     const createdDate = new Date(transaction.createdAt);
        //     const monthName = createdDate.toLocaleString('default', { month: 'long' });

        //     // console.log("monthNamemonthName",monthName);
        //     monthWiseData[monthName] += 1;
        // });
        

        // return res.status(200).json({
        //     error: false,
        //     message: "Analytics data fetched successfully.",
        //     data: monthWiseData
        // });


        const { year } = req.body;

        const transactions = await Transaction.findAll({ 
            where:{
                createdAt: {
                    [Op.between]: [`${year}-01-01`, `${year}-12-31`]
                }
            },
            raw: true
        });

        
        if (!transactions || transactions.length <= 0) {
            return res.status(404).json({ success: false, message: 'No Data Found' });
        }

        const monthWiseData = {
            January: {
                VoucherRedeem : 0,
                CouponRedeem : 0,
                MerchandiseRedeem : 0
            },
            February: {
                VoucherRedeem : 0,
                CouponRedeem : 0,
                MerchandiseRedeem : 0
            },
            March: {
                VoucherRedeem : 0,
                CouponRedeem : 0,
                MerchandiseRedeem : 0
            },
            April: {
                VoucherRedeem : 0,
                CouponRedeem : 0,
                MerchandiseRedeem : 0
            },
            May: {
                VoucherRedeem : 0,
                CouponRedeem : 0,
                MerchandiseRedeem : 0
            },
            June: {
                VoucherRedeem : 0,
                CouponRedeem : 0,
                MerchandiseRedeem : 0
            },
            July: {
                VoucherRedeem : 0,
                CouponRedeem : 0,
                MerchandiseRedeem : 0
            },
            August: {
                VoucherRedeem : 0,
                CouponRedeem : 0,
                MerchandiseRedeem : 0
            },
            September: {
                VoucherRedeem : 0,
                CouponRedeem : 0,
                MerchandiseRedeem : 0
            },
            October: {
                VoucherRedeem : 0,
                CouponRedeem : 0,
                MerchandiseRedeem : 0
            },
            November: {
                VoucherRedeem : 0,
                CouponRedeem : 0,
                MerchandiseRedeem : 0
            },
            December: {
                VoucherRedeem : 0,
                CouponRedeem : 0,
                MerchandiseRedeem : 0
            }
        };


        transactions.forEach(transaction => {
            const createdDate = new Date(transaction.createdAt);
            const monthName = createdDate.toLocaleString('default', { month: 'long' });

            // console.log("monthNamemonthName",monthName);

            if(transaction.transactionCategory == "VoucherRedeem"){
                monthWiseData[monthName].VoucherRedeem += 1;
            }else if(transaction.transactionCategory == "CouponRedeem"){
                monthWiseData[monthName].CouponRedeem += 1;
            }else if(transaction.transactionCategory == "MerchandiseRedeem"){
                monthWiseData[monthName][MerchandiseRedeem] += 1;
            }     
        });  

        return res.status(200).json({
            error: false,
            message: "Analytics data fetched successfully.",
            data: monthWiseData
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: `Get Analytics Data Error ${error}`
        });
    }
};





// export const updateStaffById = async(req, res, next)=>{
//     try {
//         const { id , ...rest} = req.body;
//         if(!id || id ==""){
//             return next(createError(403, "Enter the valid Id"));
//         }
        
//         const userExist = await Staff.findOne({id : rest.id});
        
//         if(!userExist){
//             return  next( createError(409,"User does not Exists")) ;
//         }

//         const updateStaff = await Staff.update({
//             ...rest,
//             updateByStaff: req.user.data.name,
//             updatedIstAt: DateTime()
//         },{
//             where:{
//                 id: id
//             }
//         })

//         return res.status(200).json({
//             error:false,
//             message:"WholeSeller Staff Updated Successfully...!",
//             data:updateStaff
//         })
//     } catch (error) {
//         console.log("Get-WholeSeller-By-Id Error ::>>", error);
//         next(error);
//     } 
// };

export const exportLogs = async(req, res, next)=>{
    try {

        let { page, limit, sortBy, startDate, endDate, search } = req.body;

        page = page || 1;
        limit = limit || 10;
        let offset = limit * (page - 1);
        let sort = !sortBy ? "DESC" : sortBy == "ascending" ? "ASC" : "DESC";

        // Build the base SQL query with joins first
        let baseQuery = `
        FROM loggers lg
        WHERE 1=1`; // Default WHERE clause that is always true
    
        // Add conditions to the WHERE clause
        if (search) {
            baseQuery += ` AND (lg.status LIKE '%${search}%')`;
        }
    
        // Set date range conditions
        const sDate = startDate ? new Date(startDate) : new Date('2023-01-01');
        const eDate = endDate ? new Date(endDate) : new Date('2100-01-03');
        eDate.setDate(eDate.getDate() + 1); // Adjust the end date to include the last day
    
        baseQuery += ` AND lg.createdAt > '${sDate.toISOString().split('T')[0]}' AND lg.createdAt < '${eDate.toISOString().split('T')[0]}'`;
    
        // Construct the SQL query for fetching transactions
        const allTransactionsQuery = `
        SELECT lg.*
        ${baseQuery}
        ORDER BY lg.id ${sort}
        LIMIT ${limit} OFFSET ${offset}
        `;
    
        // Construct the SQL query for counting total transactions
        const totalTransactionsQuery = `
        SELECT COUNT(*) as total
        ${baseQuery}
        `;
    
        // Execute the queries using raw SQL
        const allLogsData = await sequelize.query(allTransactionsQuery, { type: sequelize.QueryTypes.SELECT });
        const totalLogs = await sequelize.query(totalTransactionsQuery, { type: sequelize.QueryTypes.SELECT });
    
        res.status(200).json({
            error: false,
            message: "All-Logs found Successfully...!",
            totalLogs: totalLogs[0].total,
            data: allLogsData
        });
    } catch (error) {
        console.log("Logs Error ::>>", error);
        next(error);
    } 
};

export const exportLogsPdf = async(req, res, next)=>{
    try {

        let { sortBy, startDate, endDate } = req.body;

        let sort = !sortBy ? "DESC" : sortBy == "ascending" ? "ASC" : "DESC";

        // Build the base SQL query with joins first
        let baseQuery = `
        FROM loggers lg
        WHERE 1=1`; // Default WHERE clause that is always true
    
        // Set date range conditions
        const sDate = startDate ? new Date(startDate) : new Date('2023-01-01');
        const eDate = endDate ? new Date(endDate) : new Date('2100-01-03');
        eDate.setDate(eDate.getDate() + 1); // Adjust the end date to include the last day
    
        baseQuery += ` AND lg.createdAt > '${sDate.toISOString().split('T')[0]}' AND lg.createdAt < '${eDate.toISOString().split('T')[0]}'`;
    
        // Construct the SQL query for fetching transactions
        const allTransactionsQuery = `
        SELECT lg.*
        ${baseQuery}
        ORDER BY lg.id ${sort}
        `;
    
        // Construct the SQL query for counting total transactions
        const totalTransactionsQuery = `
        SELECT COUNT(*) as total
        ${baseQuery}
        `;
    
        // Execute the queries using raw SQL
        const allLogsData = await sequelize.query(allTransactionsQuery, { type: sequelize.QueryTypes.SELECT });
        const totalLogs = await sequelize.query(totalTransactionsQuery, { type: sequelize.QueryTypes.SELECT });
    
        res.status(200).json({
            error: false,
            message: "All-Logs found Successfully...!",
            totalLogs: totalLogs[0].total,
            data: allLogsData
        });
    } catch (error) {
        console.log("Logs Error ::>>", error);
        next(error);
    } 
};

// update user
export const updateSellerByIdAdmin = async(req, res, next)=>{
    try {
        if(!req.body.sellerId || req.body.sellerId===""){
            return next(createError(403,"Please Enter Valid User ID!"));
        }
        if(!req.body.firstName || req.body.firstName===""){
            return next(createError(403,"Enter the Valid firstname"));
        }
        if(!req.body.lastName || req.body.lastName===""){
            return next(createError(403,"Enter the Valid lastname"));
        }

        const seller = await Seller.findOne({
            where :{
                id:req.body.sellerId
            },
            raw : true
        })

        if(seller.length === 0)
        {
            return next(createError(403,"Seller not found!"));
        }

        const sellerObject={
            firstName:req.body.firstName,
            lastName:req.body.lastName,
            bizomId:req.body.bizomId,
            updatedIstAt: DateTime()
        };

        // Update seller data
        const updatedSeller = await Seller.update(sellerObject,
        {
            where :{
                id:req.body.sellerId
            }
        });

        return res.status(200).json({
            error:false,
            message: "Profile Update Successfully",
            data:updatedSeller[0]
        })
        
    } catch (error) {
        console.log("Update-WholeSeller-By-Id Error ::>>", error);
        next(error);
    } 
};



// end of code by Ritik