import { ContactQuery } from "../models/ContactUsQuery";
import { createError } from "../../utils/error";
import { queryMailForItself, queryReplyByStaffMail, queryStaffMail } from "../../utils/mail/mail_message";
import { staffForNotify } from "./queryStaffController";
import { Op } from "sequelize";
import { QueryStaff } from "../models/QueryStaff";
import DateTime from "../../utils/constant/getDate&Time";

export const addQueryImages = async(req, res, next)=>{
    try {
        if(!req.images){
            return next(createError(403,'Please Select the images'));
        }
        return res.status(200).json({
            error:false,
            message:'your Images is here',
            data:req.images
        });
    } catch (error) {
        console.log("Add Query Images Error :>>", error);
        next(error);
    }
}

export const addQuery = async(req, res, next)=>{
    try {
        const { name, email, contactNo, address, city, queryType, subQueryType, description, images } = req.body;
        if(!name){
            return next(createError(403,'Please provide the name'));
        }
        if(!email){
            return next(createError(403,'Please provide the email'));
        }
        if(!contactNo){
            return next(createError(403,'Please provide the comtactNo'));
        }
        if(!queryType){
            return next(createError(403,'Please provide the queryType'));
        }
        if(!subQueryType){
            return next(createError(403,'Please provide the subQueryType'));
        }
        if(!description){
            return next(createError(403,'Please provide the description'));
        }
        if(!address){
            return next(createError(403,'Please provide the address'));
        }
        if(!city){
            return next(createError(403,'Please provide the city'));
        }
        let ccList;
        let queryStaff = await QueryStaff.findOne({
            where:{
                queryType,
                subQueryType
            },
            raw:true
        });
        if(queryStaff){
            ccList = queryStaff.toCCList;
        }
        else{
            queryStaff = await QueryStaff.findOne({
                where:{
                    queryType:'Default',
                    subQueryType:'Default'
                },
                raw:true
            });
            ccList = queryStaff?.toCCList;
        }
        const newQuery = await ContactQuery.create({
            name,
            email,
            contactNo,
            address,
            city,
            queryType,
            subQueryType,
            description,
            toBeEmail:queryStaff?.emailList[0].email,
            images,
            ccEmail:ccList
        });
        //Send Notification on Query Staff
        //--- Here
        queryMailForItself(newQuery.queryId, newQuery.name, newQuery.email, newQuery.createdIstAt);
        if(queryStaff && queryStaff.emailList.length){
            queryStaff?.emailList.map(async(staff)=>{
                await queryStaffMail(newQuery.queryId, newQuery.name, newQuery.email, newQuery.contactNo, newQuery.queryType, newQuery.subQueryType, newQuery.createdIstAt, staff.email, staff.toCCList);
            })
        }
        return res.status(200).json({
            error:false,
            message:`Your Query is registered with Id : ${newQuery.queryId}`,
        });
    } catch (error) {
        console.log("Add Query Error :>>", error);
        next(error);
    }
}

export const getAllContactQuery = async(req, res, next)=>{
    try {
        let { page, limit, search } = req.body;
        page = page || 1;
        limit = limit || 10;
        const offset = limit * (page-1);
        let whereClause = {
            [Op.or]:[
                {
                    name:{
                        [Op.substring]:search
                    }
                },
                {
                    email:{
                        [Op.substring]:search
                    }
                },
                {
                    contactNo:{
                        [Op.substring]:search
                    }
                },
                {
                    queryType:{
                        [Op.substring]:search
                    }
                },
            ]
        };
        const AllQueries = await ContactQuery.findAll({
            where:whereClause,
            order:[['id','desc']],
            limit,
            offset,
            raw:true
        });
        const totalQueries = await ContactQuery.count();
        return res.status(200).json({
            error:false,
            message:'All Queries are fetched successfully',
            totalInAPage:AllQueries.length,
            totalQueries,
            data:AllQueries
        });
    } catch (error) {
        console.log("All Queries Fetched Error :>>", error);
        next(error);
    }
}

export const exportContactQuery = async(req, res, next)=>{
    try {
        let { startDate, endDate } = req.body;
        const sDate = startDate ? new Date(startDate) : new Date("2000-01-01");
        const eDate = endDate ? new Date(endDate) : new Date("3000-01-01");
        if(sDate>eDate){
            return next(createError(403, 'Please select the valid date formate for start date and end date'));
        }
        eDate.setDate(eDate.getDate()+1);
        const AllQueries = await ContactQuery.findAll({
            where:{
                createdAt:{
                    [Op.gte]:sDate,
                    [Op.lt]:eDate
                }
            },
            raw:true
        });
        return res.status(200).json({
            error:false,
            message:'Export Contact Queries are fetched successfully',
            totalQueries:AllQueries.length,
            data:AllQueries
        });
    } catch (error) {
        console.log("Export Contact Queries Error :>>", error);
        next(error);
    }
}

export const replyOfContactQuery = async(req, res, next)=>{
    try {
        const { queryId, mail_of_handler, content } = req.body;
        if(!queryId){
            return next(createError(403, 'Please provide query id!'));
        }
        if(!mail_of_handler){
            return next(createError(403, 'Please provide Mail of Handler!'));
        }
        if(!content){
            return next(createError(403, 'Please provide Content!'));
        }

        const query = await ContactQuery.findOne({
            where:{
                id:req.body.queryId
            },
            raw:true
        });
        queryReplyByStaffMail(
            query.queryId, query.name, query.email, query.queryType, query.subQueryType,
            query.createdIstAt, mail_of_handler, query.ccEmail, content
        );
        const updated = await ContactQuery.update({
            status:'Fullfilled',
            toBeEmail:mail_of_handler,
            mailOfHandler:mail_of_handler,
            replyData:content,
            lastReplyTimestamp:DateTime()
        },{
            where:{
                id:queryId
            }
        });
        return res.status(200).json({
            error:false,
            message:'Reply has been send for this Contact Query Successfully!',
            data:updated
        });
    } catch (error) {
        console.log("Reply Contact Query Error :>>", error);
        next(error);
    }
}

