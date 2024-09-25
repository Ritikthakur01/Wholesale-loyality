import { Op } from "sequelize";
import { Notification } from "../models/Notification";

export const sendNotificationForSellerVoucher = async(req, res, next)=>{
    try {
        const allNotification = await Notification.findAll();
        return res.status(200).json({
            error:false,
            message:"Get All Notification Successfully...!",
            data:allNotification
        })
    } catch (error) {
        console.log("Send Notification for Seller Voucher Error ::>>",error);
        next(error);
    }
}

const getTodayNotification = async()=>{
    const todayDate = new Date(`${new Date().getFullYear()}-${new Date().getMonth()+1}-${new Date().getDate()}`);
    const helperDate = new Date();
    helperDate.setDate(helperDate.getDate()+1);
    const nextDate = new Date(`${helperDate.getFullYear()}-${helperDate.getMonth()+1}-${helperDate.getDate()}`);
    // console.log("Today Date ::>>", todayDate);
    // console.log("Next Date ::>>", nextDate);
    const notifications = await Notification.count({
        where:{
            createdAt:{
                [Op.gte]:todayDate,
                [Op.lt]:nextDate
            },
            isDeleted: 0
        },
        raw:true
    });
    // console.log("Notifications ::>>", notifications);
    return notifications;
}

export const getAllNotifications = async(req, res, next)=>{
    try {
        let { page, limit, orderBy , startDate, endDate } = req.body;

        page = page || 1;
        limit = limit || 10;
        const offset = limit * (page - 1);
        orderBy = !orderBy ? 'asc' : orderBy == 'decending' ? 'desc' : 'asc';

        let clause = {};

        const sDate = startDate ? new Date(startDate) : new Date('2023-01-01');
        const eDate = endDate ? new Date(endDate) : new Date('2100-01-03');
        eDate.setDate(eDate.getDate()+1);

        clause.createdAt={
            [Op.gt] : sDate,
            [Op.lt] : eDate
        }
        clause.isDeleted = 0;

        const getAllNotication = await Notification.findAll({
            where: clause,
            limit: limit,
            offset: offset,
            order: [
                ['id', orderBy]
            ],
            raw: true
        });

        const getAllNoticationCount = await Notification.count({
            where: {
                isDeleted: 0
            }
        });
        const todayNotifications = await getTodayNotification();
        return res.status(200).json({
            error: false,
            message: getAllNotication.length === 0 ? "Empty" : "All Notifications of seller Vouchers Found Successfully...!",
            todayNotifications,
            totalCount: getAllNoticationCount,
            count: getAllNotication.length,
            data: getAllNotication
        })
    }catch (error) {
        console.log("Get All Notifications for Seller Voucher Error ::>>",error);
        next(error);
    }
}

export const clearNotification = async(req, res, next)=>{
    try {
        const { isAll, ids } = req.body;

        // updated data object
        const updateData = {
            isDeleted: true
        }
        let updatedNotification;
        if(isAll)
        {
            updatedNotification = await Notification.update(updateData, {
                where: {}
            });
        }
        else
        {
            updatedNotification = await Notification.update(updateData, {
                where: {
                  id: ids,
                },
              });
        }

        console.log(updatedNotification, "updatedNotification", updatedNotification.length)
        return res.status(200).json({
            error: false,
            message: updatedNotification.length === 0 ? "Empty" : "All Notifications of seller Vouchers updated Successfully...!",
            // data: updatedNotification
        })
    }catch (error) {
        console.log("Updated All Notifications for Seller Voucher Error ::>>",error);
        next(error);
    }
}

