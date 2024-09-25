import { ContactQuery } from "../models/ContactUsQuery";
import { createError } from "../../utils/error";
import { QueryStaff } from "../models/QueryStaff";

export const addContactStaff = async(req, res, next)=>{
    try {
        const { queryType, subQueryType, emailList, toCCList } = req.body;
        if(!queryType){
            return next(createError(403,'Please Give the Query Type'));
        }
        if(!subQueryType){
            return next(createError(403,'Please Give the SubQuery Type'));
        }
        if(!emailList || !Array.isArray(emailList) || emailList.length===0){
            return next(createError(403,'Please Give the valid Emails for this query'));
        }
        if(!toCCList || !Array.isArray(toCCList) || toCCList.length===0){
            return next(createError(403,'Please Give the valid CC list for this query'));
        }
        //email list check for duplicates values
        let set = new Set();
        for(let i=0;i<emailList.length;i++) set.add(emailList[i].email);
        let list = [...set];
        if(emailList.length!==list.length){
            return next(createError(403,'Please check You have duplicates in Email list'));
        }
        //cc list check for duplicates values
        set = new Set();
        for(let i=0;i<toCCList.length;i++) set.add(toCCList[i].email);
        list = [...set];
        if(toCCList.length!==list.length){
            return next(createError(403,'Please check You have duplicates in Email CC list'));
        }
        //previous check on query type and sub-query type
        const findContactStaff = await QueryStaff.findOne({
            where:{
                queryType,
                subQueryType
            },
            raw:true
        });
        if(findContactStaff){
            return next(createError(403,'You have Already registered with Query Type and Sub-Query Type'));
        }
        const newContactStaff = await QueryStaff.create({
            queryType,
            subQueryType,
            emailList,
            toCCList,
            updateByStaff:req?.user?.data.name
        });
        return res.status(200).json({
            error:false,
            message:'Contact staff added Successfully',
            data:newContactStaff
        });
    } catch (error) {
        console.log("Add Contact Staff Error :>>", error);
        next(error);
    }
}
export const getContactStaff = async(req, res, next)=>{
    try {
        const { staffId } = req.body;
        if(!staffId){
            return next(createError(403,'Please Give the valid staff id'));
        }
        const getContactStaff = await QueryStaff.findOne({
            where:{
                id:staffId
            },
            raw:true
        });
        return res.status(200).json({
            error:false,
            message:'Contact staff found Successfully',
            data:getContactStaff
        });
    } catch (error) {
        console.log("Add Contact Staff Error :>>", error);
        next(error);
    }
}

export const deleteContactStaff = async(req, res, next)=>{
    try {
        const { staffId } = req.body;
        if(!staffId){
            return next(createError(403,'Please Give the Staff Id'));
        }
        const deleteContactStaff = await QueryStaff.destroy({
            where:{
                id:staffId
            }
        });
        return res.status(200).json({
            error:false,
            message:'Contact staff Deleted Successfully',
            data:deleteContactStaff
        });
    } catch (error) {
        console.log("Delete Contact Staff Error :>>", error);
        next(error);
    }
}

export const updateContactStaff = async(req, res, next)=>{
    try {
        const { staffId, queryType, subQueryType, emailList, toCCList } = req.body;
        if(!staffId){
            return next(createError(403,'Please Give the valid staff id'));
        }
        if(!queryType){
            return next(createError(403,'Please Give the Query Type'));
        }
        if(!subQueryType){
            return next(createError(403,'Please Give the SubQuery Type'));
        }
        if(!emailList || !Array.isArray(emailList) || emailList.length===0){
            return next(createError(403,'Please Give the valid Emails for this query'));
        }
        if(!toCCList || !Array.isArray(toCCList) || toCCList.length===0){
            return next(createError(403,'Please Give the valid CC list for this query'));
        }
        const getContactStaff = await QueryStaff.findOne({
            where:{
                id:staffId
            },
            raw:true
        });

        if(!getContactStaff){
            return next(createError(403,'Invalid Staff Id'));
        }

        if(getContactStaff.queryType!==queryType || getContactStaff.subQueryType!==subQueryType){
            const findContactStaff = await QueryStaff.findOne({
                where:{
                    queryType,
                    subQueryType
                },
                raw:true
            });
            if(findContactStaff){
                return next(createError(403,'You have Already registered with Query Type and Sub-Query Type'));
            }
        }
        //email list check for duplicates values
        let set = new Set();
        for(let i=0;i<emailList.length;i++) set.add(emailList[i].email);
        let list = [...set];
        if(emailList.length!==list.length){
            return next(createError(403,'Please check You have duplicates in Email list'));
        }
        //cc list check for duplicates values
        set = new Set();
        for(let i=0;i<toCCList.length;i++) set.add(toCCList[i].email);
        list = [...set];
        if(toCCList.length!==list.length){
            return next(createError(403,'Please check You have duplicates in Email CC list'));
        }
        const updateContactStaff = await QueryStaff.update({
            queryType, 
            subQueryType, 
            emailList, 
            toCCList,
            updatedByStaff:req?.user?.data.name},{
            where:{
                id:staffId
            }
        });
        return res.status(200).json({
            error:false,
            message:'Contact staff updated Successfully',
            data:updateContactStaff
        });
    } catch (error) {
        console.log("Updated Contact Staff Error :>>", error);
        next(error);
    }
}

export const staffForNotify = async()=>{
    try { 
        const AllStaff = await QueryStaff.findAll({
            // attributes:['email'],
        });
        return AllStaff;
    } catch (error) {
        console.log("Staff For Notify Fetched Error :>>", error);
        next(error);
    }
}

export const getAllContactStaff = async(req, res, next)=>{
    try {
        let { page, limit } = req.body;
        page = page || 1;
        limit = limit || 10;
        const offset = limit * (page-1);
        const AllStaff = await QueryStaff.findAll({
            limit,
            offset,
            raw:true
        });
        const totalStaff = await QueryStaff.count();
        return res.status(200).json({
            error:false,
            message:'All Contact Staff are fetched successfully',
            totalInAPage:AllStaff.length,
            totalStaff,
            data:AllStaff
        });
    } catch (error) {
        console.log("All Contact Staff Fetched Error :>>", error);
        next(error);
    }
}

export const getOnlyStaffEmail = async(req, res, next)=>{
    try {
        const staff = await QueryStaff.findAll({
            attributes:['emailList'],
            raw:true
        });
        let set = new Set();
        for(let s of staff){
            for(let e of s.emailList) set.add(e.email);
        }
        return res.status(200).json({
            error:false,
            message:'All Contact Staff Email are fetched successfully',
            data:[...set],
        });
    } catch (error) {
        console.log("All Contact Staff Email Fetched Error :>>", error);
        next(error);
    }
}

