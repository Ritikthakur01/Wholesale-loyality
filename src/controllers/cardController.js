import { Op } from "sequelize";
import DateTime from "../../utils/constant/getDate&Time";
import { createError } from "../../utils/error";
import { CardImage } from "../models/Card";

export const addCard = async(req, res,next)=>{
    try {
        if(!req.newCard){
            return next(createError(403,'Enter the valid fields'));
        }
        res.status(200).json({
            error:false,
            message:'Card added successfully...!',
            data:req.newCard
        });
    } catch (error) {
        console.log('New Card Error ::>>',error);
        next(error);
    }
};

export const getCardById = async(req, res,next)=>{
    try {
        if(!req.body.cardId){
            return next(createError(403,'Enter the valid card Id...!'));
        }
        const getCard = await CardImage.findOne({
            where:{
                id:req.body.cardId
            },
            raw:true
        });
        res.status(200).json({
            error:false,
            message:'Get Card successfully...!',
            data:getCard
        });
    } catch (error) {
        console.log('Get Card Error ::>>',error);
        next(error);
    }
};

export const updateCard = async(req, res,next)=>{
    try {
        if(!req.body.cardId){
            return next(createError(403, 'Enter the valid card Id...!'));
        }
        if(!req.body.status && req.body.status!=='Active' && req.body.status!=='Inactive'){
            return next(createError(403, 'Enter the valid status...!'));
        }
        const findAnotherCard = await CardImage.findOne({
            where:{
                id:{
                    [Op.ne]:req.body.cardId,
                },
                cardType:req.body.cardType
            },
            raw:true
        });
        if(findAnotherCard){
            return next(createError(403, `We have already this of ${req.body.cardType} Card`));
        }
        const updateCard = await CardImage.update({
            status:req.body.status,
            cardType:req.body.cardType,
            visibilityInDays:req.body.visibilityInDays,
            updateByStaff:req.user.data.name,
            updatedIstAt: DateTime(),
        },{
            where:{
                id:req.body.cardId
            }
        });
        res.status(200).json({
            error:false,
            message:'Card Updated successfully...!',
            data:updateCard
        });
    } catch (error) {
        console.log('Update Card Error ::>>',error);
        next(error);
    }
};

export const deleteCard = async(req, res,next)=>{
    try {
        if(!req.body.cardId){
            return next(createError(403,'Enter the valid card Id...!'));
        }
        const deleteCardImage = await CardImage.destroy({
            where:{
                id:req.body.cardId
            }
        });
        res.status(200).json({
            error:false,
            message:'Card Deleted successfully...!',
            data:deleteCardImage
        });
    } catch (error) {
        console.log('Delete Card Error ::>>',error);
        next(error);
    }
};

export const getAllCard = async(req, res,next)=>{
    try {
        const getAllCard = await CardImage.findAll({});
        res.status(200).json({
            error:false,
            message:'Get All Card Successfully...!',
            data:getAllCard
        });
    } catch (error) {
        console.log('Get-All-Card Error ::>>',error);
        next(error);
    }
};

