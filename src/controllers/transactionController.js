import crypto from "crypto";
import DateTime from "../../utils/constant/getDate&Time";

import { Transaction } from "../models/Transaction";

import { Op, where } from "sequelize";
import { Seller, SellerInfo } from "../models/Seller";
import { SellerVouchers } from "../models/SellerVouchers";
import { SellerProducts } from "../models/SellerProducts";
import { CouponCode } from "../models/Coupon";
import { createError } from "../../utils/error";
import sequelize from "../../utils/db/dbConnection";


function generateId() {
    return crypto.randomBytes(10).toString("hex");
}

export const addTransaction = async(req, res, next) => {
    try {

        const { sellerId , points, status} = req.body;

        const transactionId = generateId();

        if (!sellerId || !points || !status ){
            return res.status(400).json({ message : "Provide complete details" })
        }
        
        const createTransaction = await Transaction.create({
            transactionId,
            sellerId,
            points,
            status,
            createdIstAt : DateTime(),
            updatedIstAt : DateTime()
        })

        return res.status(200).json({
            error: false,
            message: "New Transition created Successfully...!",
            data: createTransaction,
          });
    } catch (error) { 
        console.log("Add-Transaction Error ::>>",error);
        next(error);
    }
};

export const updateTransaction = async(req, res, next) => {
    try {

        const { transactionId , ...rest } = req.body;

        if (!transactionId){
            return res.status(400).json({ message : "Provide Transaction Id" })
        }
        
        const updateTransaction = await Transaction.update({
            ...rest,
            updatedIstAt : DateTime()
        },{
            where:{
                transactionId: transactionId
            }
        })

        if(!updateTransaction){
            return res.status(404).json({message:"No such Transaction found!"})
        }

        return res.status(200).json({
            error: false,
            message: "Transition updated Successfully...!",
            data: updateTransaction,
          });

    } catch (error) { 
        console.log("Update-Transaction Error ::>>",error);
        next(error);
    }
};

export const deleteTransaction = async(req, res, next) => {
    try {

        const { transactionId } = req.body;

        if (!transactionId){
            return res.status(400).json({ message : "Provide Transaction Id" })
        }
        
        const deleteTransaction = await Transaction.destroy({
            where:{
                transactionId: transactionId
            }
        })

        if(!deleteTransaction){
            return res.status(404).json({message:"No such Transaction found!"})
        }

        return res.status(200).json({
            error: false,
            message: "Transition deleted Successfully...!",
            data: deleteTransaction,
          });
    } catch (error) { 
        console.log("Delete-Transaction Error ::>>",error);
        next(error);
    }
}; 

export const filterTransaction = async(req, res, next) => {
    try {

        const { sellerId , transactionName , sortBy } = req.body;      
        
        const filteredTransaction = await Transaction.findAll({
            where:{
                status : transactionName,

            }
        })

        if(filteredTransaction.length == 0){
            return res.status(404).json({message:"No such Transactions found!"})
        }

        return res.status(200).json({
            error: false,
            message: "Filter Transitions fetched Successfully...!",
            data: filteredTransaction,
          });
    } catch (error) { 
        console.log("Filter Transaction Error ::>>",error);
        next(error);
    }
};

export const getAllTransaction = async(req, res, next) => {
    try {
        
        const Transactions = await Transaction.findAll();

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

export const getSortTransaction = async(req, res, next) => {
    try {
        
        const { sortOperation } = req.body;

        if(!sortOperation){
            return res.status.json({ message: 'Please provide the sorting operation' })
        }

        const Transactions = await Transaction.findAll();

        if(Transactions.length == 0){
            return res.status(404).json({message:"No Transactions found!"})
        }

        if( sortOperation == "ascending" ){
            Transactions.sort((a,b)=> a.id - b.id)
        }else if(sortOperation == "decending"){
            Transactions.sort((a,b)=> b.id - a.id)
        }

        return res.status(200).json({
            error: false,
            message: "Sorted Transitions fetched Successfully...!",
            data: Transactions,
          });
    } catch (error) { 
        console.log("Sorted Transaction Error ::>>",error);
        next(error);
    }
};


// export const getAllTransactionByPandF = async (req, res, next) => {
//   try {
//     let { page, limit, status, sortBy, sellerId, startDate, endDate, search } = req.body;
//     // console.log("Req Body ::>>",page, limit, status, sortBy, sellerId, startDate, endDate, search);
//     page = page || 1;
//     limit = limit || 10;
//     let offset = limit * (page - 1);
//     let sort = !sortBy ? "DESC" : sortBy == "ascending" ? "ASC" : "DESC"
//     let whereClause = search ? {
//                             [Op.or]:[
//                             {
//                                 transactionId:{
//                                 [Op.substring]:search
//                                 }
//                             },
//                             {
//                                 serialNo:{
//                                 [Op.substring]:search
//                                 }
//                             },
//                             {
//                                 code:{
//                                 [Op.substring]:search
//                                 }
//                             }
//                         ]
//                     } : {};
//     if (status) {
//       whereClause.status = status;
//     }
//     if (sellerId) {
//       whereClause.sellerId = sellerId;
//     }
//     // if(search){
//     //     whereClause.transactionId = {
//     //         [Op.substring]:search
//     //     }
//     // }
//     // console.log("where-clause ::>>",whereClause);
//     const sDate = startDate ? new Date(startDate) : new Date('2023-01-01');
//     const eDate = endDate ? new Date(endDate) : new Date('2100-01-03');
//     eDate.setDate(eDate.getDate()+1);
//     whereClause.createdAt={
//         [Op.gt] : sDate,
//         [Op.lt] : eDate
//     }
//     const allTransaction = await Transaction.findAll({
//       where: whereClause,
//       limit: limit,
//       offset: offset,
//       order: [['id', sort ]],
//       include:{
//         model:Seller,
//         attributes:['accountId', 'firstName', 'lastName', 'email', 'contactNo', 'createdIstAt']
//       },
//       include:{
//         model:SellerInfo,
//         attributes:[ 'billingAddress' ]
//       }
//     });

//     const totalTransaction = await Transaction.count({
//         where: whereClause,
//         order: [['id', sort ]],
//       });

//     res.status(200).json({
//       error: false,
//       message: "All-Transaction found Successfully...!",
//       transactionsInaPage: allTransaction.length,
//       totalTransactions: totalTransaction,
//       data: { allTransaction: allTransaction }
//     });
//   } catch (error) {
//     console.error("Get-All-Transaction Error:", error.message);
//     next(error);
//   }
// };

export const getAllTransactionByPandF = async (req, res, next) => {
    try {
      let { page, limit, status, sortBy, sellerId, startDate, endDate, search } = req.body;
  
      page = page || 1;
      limit = limit || 10;
      let offset = limit * (page - 1);
      let sort = !sortBy ? "DESC" : sortBy == "ascending" ? "ASC" : "DESC";
  
      // Build the base SQL query with joins first
      let baseQuery = `
      FROM transactions t
      LEFT JOIN sellers s ON t.sellerId = s.id
      LEFT JOIN sellerinfos si ON t.sellerId = si.sellerId
      WHERE 1=1`; // Default WHERE clause that is always true
  
      // Add conditions to the WHERE clause
      if (search) {
        baseQuery += ` AND (t.transactionId LIKE '%${search}%' OR t.serialNo LIKE '%${search}%' OR t.code LIKE '%${search}%' OR s.accountId LIKE '%${search}%' OR s.email LIKE '%${search}%' OR s.contactNo LIKE '%${search}%')`;
      }
  
      if (status) {
        baseQuery += ` AND t.status = '${status}'`;
      }
  
      if (sellerId) {
        baseQuery += ` AND t.sellerId = ${sellerId}`;
      }
  
      // Set date range conditions
      const sDate = startDate ? new Date(startDate) : new Date('2023-01-01');
      const eDate = endDate ? new Date(endDate) : new Date('2100-01-03');
      eDate.setDate(eDate.getDate() + 1); // Adjust the end date to include the last day
  
      baseQuery += ` AND t.createdAt >= '${sDate.toISOString().split('T')[0]}' AND t.createdAt <= '${eDate.toISOString().split('T')[0]}'`;
  
      // Construct the SQL query for fetching transactions
      const allTransactionsQuery = `
      SELECT t.*, 
             s.accountId, s.firstName, s.lastName, s.email, s.contactNo, 
             DATE_FORMAT(s.createdAt, '%c/%e/%Y') as registrationDate,  -- Format the date only
             si.billingAddress
      ${baseQuery}
      ORDER BY t.id ${sort}
      LIMIT ${limit} OFFSET ${offset}
      `;
  
      // Construct the SQL query for counting total transactions
      const totalTransactionsQuery = `
      SELECT COUNT(*) as total
      ${baseQuery}
      `;
  
      // Execute the queries using raw SQL
      const allTransactions = await sequelize.query(allTransactionsQuery, { type: sequelize.QueryTypes.SELECT });
      const totalTransactions = await sequelize.query(totalTransactionsQuery, { type: sequelize.QueryTypes.SELECT });
  
      res.status(200).json({
        error: false,
        message: "All-Transaction found Successfully...!",
        transactionsInaPage: allTransactions.length,
        totalTransactions: totalTransactions[0].total,
        data: { allTransaction: allTransactions }
      });
  
    } catch (error) {
      console.error("Get-All-Transaction Error:", error.message);
      next(error);
    }
  };
  

export const getTransactionByTransactionId = async (req, res, next) => {
  try {
    let { sellerId, transactionId } = req.body;
    let data = {};
    const getTransaction = await Transaction.findOne({
        where:{
            transactionId,
            sellerId
        },
        raw:true
    }); 
    if(!getTransaction){
        return next(createError(403,'Transaction not found with the given transaction Id'));
    }
    data.category = getTransaction.transactionCategory;
    data.transaction = getTransaction;
    if(getTransaction.transactionCategory==='DSProductRedeem'){
        const sellerRedeemProducts = await SellerProducts.findAll({
            where:{
                sellerId: sellerId,
                orderId:getTransaction?.dsProductTransaction?.orderId
            },
            raw: true
        });
        data.type = 'Ds Product Redeemption';
        data.redeemProducts = sellerRedeemProducts;
    }
    else if(getTransaction.transactionCategory==='VoucherRedeem'){
        const getVoucher = await SellerVouchers.findOne({
            where: {
                ExternalOrderId: getTransaction?.voucherTransaction?.ExternalOrderId,
            },
            raw: true
        });
        data.type = 'Voucher Redeemption';
        data.redeemVouchers = getVoucher;
    }
    else if(getTransaction.transactionCategory==='MerchandiseRedeem'){
        data.type = 'Merchandise Redeemption';
        data.redeemMerchandise = {};
    }
    else if(getTransaction.transactionCategory==='CouponRedeem' || getTransaction.transactionCategory==='RegisterCoupon'){
        data.type = 'Coupon Earned';
        const coupon = await CouponCode.findOne({
            where:{
                id:getTransaction.couponId
            },
            raw:true
        });
        data.earnedCoupon = coupon;
    }
    return res.status(200).json({
      error: false,
      message: "Get Transaction By Transaction Id found Successfully...!",
      data: data
    });
  } catch (error) {
    console.error("Get-Transaction By Transaction Id Error::>>", error);
    next(error);
  }
};

export const getTransactionBetweenDates = async (req, res, next) => {
    try {
      let { startDate, endDate } = req.body;
      const sDate = startDate ? new Date(startDate) : new Date('2023-01-01');
      const eDate = endDate ? new Date(endDate) : new Date('3100-01-03');
      eDate.setDate(eDate.getDate() + 1);  // Include the end date in the range
  
      // Construct the WHERE clause with date range
      const whereClause = `
        WHERE t.createdAt >= '${sDate.toISOString().split('T')[0]}' 
        AND t.createdAt <= '${eDate.toISOString().split('T')[0]}'
      `;
  
      // Raw SQL query to fetch transactions with their related seller information
      const getTransactionsQuery = `
        SELECT 
          t.*, 
          s.accountId, s.firstName, s.lastName, s.email, s.contactNo, DATE_FORMAT(s.createdAt, '%c/%e/%Y') as registrationDate,  -- Format the date only
          si.billingAddress
        FROM transactions t
        LEFT JOIN sellers s ON t.sellerId = s.id
        LEFT JOIN sellerinfos si ON t.sellerId = si.sellerId
        ${whereClause}
        ORDER BY t.createdAt ASC;
      `;
  
      // Execute the raw SQL query
      const getTransactions = await sequelize.query(getTransactionsQuery, {
        type: sequelize.QueryTypes.SELECT,
      });
  
      return res.status(200).json({
        error: false,
        message: getTransactions.length !== 0 ? "Transactions are fetched Successfully!" : "No Transactions are found",
        totalTransaction: getTransactions.length,
        data: getTransactions,
      });
    } catch (error) {
      console.error("Get-Transaction Between Dates Error::>>", error);
      next(error);
    }
  };
  

// export const getDeviceDetails = async (req, res, next) => {
//     try {

//         var VisitorAPI=function(t,e,a){var s=new XMLHttpRequest;s.onreadystatechange=function(){var t;s.readyState===XMLHttpRequest.DONE&&(200===(t=JSON.parse(s.responseText)).status?e(t.data):a(t.status,t.result))},s.open("GET","https://visitorapi-dev.uc.r.appspot.com/api/?pid="+t),s.send(null)};

        

//     } catch (error) {
//       console.error("Get-All-Transaction Error:", error.message);
//       next(error);
//     }
//   };

