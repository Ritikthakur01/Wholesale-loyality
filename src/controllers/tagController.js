import { Op } from "sequelize";
import DateTime from "../../utils/constant/getDate&Time";
import { createError } from "../../utils/error";
import { DSProductTag } from "../models/ProductTag";


export const createTag = async (req, res, next) => {
    try {

        const { tagName, status } = req.body;

        if (!tagName || tagName == "") {
            return next(createError(402, "Please provide tag name."));
        }

        if (!status || status == "" || (status != 'Active' && status != 'Inactive')) {
            return next(createError(402, "Invalid Status"));
        }

        let isExistTag = await DSProductTag.findOne({ where: { tagName: tagName } })

        if (isExistTag) {
            return next(createError(402, "This Tag already exist."));
        }

        const isParentExist = await DSProductTag.create({
            tagName: tagName,
            status: status,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        })

        if (!isParentExist) {
            return next(createError(503, "Failed to add the new Tag."))
        }

        return res.status(200).json({
            error: false,
            message: "Tag has been added successfully.",
            data: isParentExist
        });

    } catch (error) {
        console.error("Create Tag Error:", error.message);
        next(error);
    }
};

export const getTagById = async (req, res, next) => {
    try {

        const { tagId } = req.body;

        if (!tagId || tagId == "") {
            return next(createError(402, "Please provide Tag Id."))
        }

        const Tag = await DSProductTag.findOne({ where: { id: tagId }, raw: true });

        if (!Tag) {
            return next(createError(404, 'No such Tag found.'))
        }

        return res.status(200).json({
            error: false,
            message: "Tag has been fetched successfully.",
            data: Tag
        });

    } catch (error) {
        console.error("get Tag Error:", error.message);
        next(error);
    }
};

export const updateTagById = async (req, res, next) => {
    try {

        const { tagId, tagName, status } = req.body;

        if (!tagId || tagId == "") {
            return next(createError(402, "Please provide Tag Id."))
        }

        const Tag = await DSProductTag.update({
            tagName: tagName,
            status: status,
            updatedIstAt: DateTime()
        },
            {
                where: {
                    id: tagId
                }
            })

        if (!Tag || Tag == 0) {
            return next(createError(404, 'No such Tag found.'))
        }

        return res.status(200).json({
            error: false,
            message: "Tag has been updated successfully.",
            data: Tag
        });

    } catch (error) {
        console.error("Update Tag Error:", error.message);
        next(error);
    }
};

export const deleteTagById = async (req, res, next) => {
    try {
        const { tagId } = req.body;

        if (!tagId || tagId == "") {
            return next(createError(402, "Please provide Tag Id."));
        }
        // const getDSProduct = await DSProductTag.findOne({
        //     where: {
        //         id: tagId
        //     },
        //     raw: true
        // });
        // if (getDSProduct) {
        //     return next(createError(402, "You have to delete first DS products then you will be delete this Tag."))
        // }
        const Tag = await DSProductTag.destroy({
            where: {
                id: tagId
            }
        })

        if (!Tag || Tag == 0) {
            return next(createError(404, 'No such Tag found.'))
        }


        return res.status(200).json({
            error: false,
            message: "Tag has been deleted successfully.",
            data: Tag
        });

    } catch (error) {
        console.error("Delete Tag Error:", error.message);
        next(error);
    }
};


export const getAllTag = async (req, res, next) => {
    try {

        let { page, limit, status, sortBy } = req.body;

        if (!page || page === "") {
            return next(createError(403, "Please provide page no!"));
        }

        let pageNo = page || 1;
        const limitForShowTag = limit || 10;

        let offset = limitForShowTag * (pageNo - 1);

        let sort = !sortBy ? "DESC" : sortBy == "ascending" ? "ASC" : "DESC"

        let whereClause = {};

        if (status) {
            whereClause.status = status;
        }

        const getAllTag = await DSProductTag.findAll({
            where: whereClause,
            limit: limitForShowTag,
            offset: offset,
            order: [['sequence', 'ASC']],
        });

        const totalTag = await DSProductTag.count();

        return res.status(200).json({
            error: false,
            message: "All Tag has been fetched successfully.",
            totalCount: totalTag,
            totalCountInPage: getAllTag.length,
            data: getAllTag
        });

    } catch (error) {
        console.error("get all Tag Error:", error.message);
        next(error);
    }
};

export const searchTagByName = async (req, res, next) => {
    try {
        let { search } = req.body;
        let whereClause = {};
        if (search) {
            whereClause.TagName = {
                [Op.substring]: search
            }
        }
        const getAllTag = await DSProductTag.findAll({
            where: whereClause,
            order: [['TagName', 'ASC']],
            raw: true
        });

        return res.status(200).json({
            error: false,
            message: "All Tag has been fetched successfully.",
            data: getAllTag
        });

    } catch (error) {
        console.error("get all Tag Error:", error.message);
        next(error);
    }
};

export const updateProductTagSequence = async(req, res, next)=>{
    try {
        const { tagId, sequenceNo } = req.body;
        if(!tagId){
            return next(createError(403, "Enter the valid tag Id ...!"));
        }
        if(!sequenceNo || sequenceNo<=0){
            return next(createError(403, "Enter the valid Sequence No ...!"));
        }
        const getTag = await DSProductTag.findOne({
            where:{
                id:tagId
            },
            raw:true
        });
        // console.log(getTag, "getTag")
        if(!getTag){
            return next(createError(403, 'Tag not found...!'));
        }
        const lastSequence = await DSProductTag.findOne({
            attributes:['sequence'],
            order:[['sequence','desc']],
            limit:1,
            raw:true
        });
        if(lastSequence.sequence===1){
            return next(createError(403,'There is only one tag so it has to only be a sequence 1'));
        }
        if(lastSequence.sequence<sequenceNo){
            return next(createError(403, 'Sequence out of range for banner...!'));
        }
        // if(lastSequence.sequence===sequenceNo){
        //     return next(createError(403, 'Sequence will be same for this banner...!'));
        // }
        const findTagWithSequence = await DSProductTag.findOne({
            where:{
                sequence:sequenceNo
            },
            raw:true
        });
        if(!findTagWithSequence){
            return next(createError(403,"You are adding unwanted sequence of another category...!"))
        }
        const updateTag = await DSProductTag.update(
            { sequence: sequenceNo },
            { where: { id: tagId } }
        );
        const updateTagWithSequence = await DSProductTag.update(
            { sequence: getTag.sequence },
            { where: { id: findTagWithSequence.id } }
        );
        // console.log(updateTag, updateTagWithSequence, "updateTagWithSequence");
        if (updateTag[0] === 0 || updateTagWithSequence[0] === 0) {
            return next(createError(500, 'Failed to update tag.'));
        }
        return res.status(200).json({
            error:false,
            message:"Sequence will be updated for your requested sequence for tag",
            data:updateTag[0] + updateTagWithSequence[0]
        });
    } catch (error) {
        console.log("Update Sequence Of Tag Error ::>>",error);
        next(error);
    }
}
