import { error } from "console";
import { createError } from "../../utils/error";
import { Images } from "../models/Images";
import fs from 'fs';
import path from 'path';
import { Op } from "sequelize";
import { create } from "domain";
import DateTime from "../../utils/constant/getDate&Time";


export const addImage = async(req, res, next)=>{
    try {
        if(!req.bannerImage){
            return next(createError(403, 'Please give the valid fields...!'));
        }
        
        return res.status(200).json({
            error: false,
            message: "New Images Added Successfully...!",
            data: req.bannerImage,
        });
    } catch (error) {
        console.log("Add Ds Product Images Error ::>>",error);
        next(error);
    }
};

export const addTVCCoverImage = async(req, res, next)=>{
    try {
        if(!req.tvcCoverImage){
            return next(createError(403, 'Please give the valid fields...!'));
        }
        // res.status(200).json({
        //     error:false,
        //     message:'Ds Product Images saved successfully...!',
        //     data:{images:req.productImages}
        // });

        return res.status(200).json({
            error: false,
            message: "New TVC cover Images Added Successfully...!",
            data: req.tvcCoverImage,
        });
    } catch (error) {
        console.log("Add TVC cover Images Error ::>>",error);
        next(error);
    }
};


export const addBanner = async(req, res, next)=>{
    try {


        let result;

        if(req.body.imageId){
            
            const startDate = new Date(req.body?.sDate);
            const endDate = new Date(req.body?.eDate);
            if(req.body.startTime===undefined){
                startDate.setHours(req.body?.startTime?.split(':')[0]);
                startDate.setMinutes(req.body?.startTime?.split(':')[1]);
            }
            if(req.body.endTime===undefined){
                endDate.setHours(req.body?.endTime?.split(':')[0]);
                endDate.setMinutes(req.body?.endTime?.split(':')[1]);
            }

            const updateImageObj = req.body?.sDate ? 
                            {
                                imageName: req.body?.imageName,
                                imagePath: req.body?.imagePath,
                                altName:req.body?.altName,
                                tvc_Cover_Image : req.body.show_TVC == "Yes" ? {
                                    name : req.body?.tvcCoverImageName,
                                    path : req.body?.tvcCoverImagePath
                                } : {},
                                usage:req.body?.usage,
                                show_TVC:req.body?.show_TVC,
                                TVC_Link:req.body?.TVC_Link,
                                sDate:req.body?.sDate,
                                eDate:req.body?.eDate,
                                startTime:req.body?.startTime,
                                endTime:req.body?.endTime,
                                startDate,
                                endDate,
                                bannerType:req.body?.bannerType,
                                status:req.body?.status,
                                updatedIstAt: DateTime(),
                                updateByStaff:req.user.data.name
                            } : {
                                imageName: req.body?.imageName,
                                imagePath: req.body?.imagePath,
                                altName:req.body?.altName,
                                tvc_Cover_Image : req.body.show_TVC == "Yes" ? {
                                    name : req.body.tvcCoverImageName,
                                    path : req.body.tvcCoverImagePath
                                } : {},
                                usage:req.body?.usage,
                                show_TVC:req.body?.show_TVC,
                                TVC_Link:req.body?.TVC_Link,
                                bannerType:req.body?.bannerType,
                                status:req.body?.status,
                                updatedIstAt: DateTime(),
                                updateByStaff:req.user.data.name
                            };
            result = await Images.update(updateImageObj,{
                where:{
                    id:req.body.imageId
                }
            }); 

        }else{

            const startDate = new Date(req.body?.sDate);
            const endDate = new Date(req.body?.eDate);
            if(req.body.startTime===undefined){
                startDate.setHours(req.body?.startTime?.split(':')[0]);
                startDate.setMinutes(req.body?.startTime?.split(':')[1]);
            }
            if(req.body.endTime===undefined){
                endDate.setHours(req.body?.endTime?.split(':')[0]);
                endDate.setMinutes(req.body?.endTime?.split(':')[1]);
            }
            const addImageObj = req.body?.sDate ? 
                            {
                                imageName:req.body?.imageName,
                                imagePath:req.body?.imagePath,
                                altName:req.body?.altName,
                                tvc_Cover_Image : req.body.show_TVC == "Yes" ? {
                                    name : req.body.tvcCoverImageName,
                                    path : req.body.tvcCoverImagePath
                                } : {},
                                usage:req.body?.usage,
                                show_TVC:req.body?.show_TVC,
                                TVC_Link:req.body?.TVC_Link,
                                sDate:req.body?.sDate,
                                eDate:req.body?.eDate,
                                startTime:req.body?.startTime,
                                endTime:req.body?.endTime,
                                startDate,
                                endDate,
                                bannerType:req.body?.bannerType,
                                status:req.body?.status,
                                createdIstAt: DateTime(),
                                updatedIstAt: DateTime(),
                                updateByStaff:req.user.data.name
                            } : {
                                imageName:req.body?.imageName,
                                imagePath:req.body?.imagePath,
                                altName:req.body?.altName,
                                tvc_Cover_Image : req.body.show_TVC == "Yes" ? {
                                    name : req.body.tvcCoverImageName,
                                    path : req.body.tvcCoverImagePath
                                } : {},
                                usage:req.body?.usage,
                                show_TVC:req.body?.show_TVC,
                                TVC_Link:req.body?.TVC_Link,
                                bannerType:req.body?.bannerType,
                                status:req.body?.status,
                                createdIstAt: DateTime(),
                                updatedIstAt: DateTime(),
                                updateByStaff:req.user.data.name
                            };
            result = await Images.create(addImageObj);
        
        }

        return res.status(200).json({
            error: false,
            message: "Banner has been uploaded Successfully...!",
            data: result,
          });
    } catch (error) { 
        console.log("Banner upload Error ::>>",error);
        next(error);
    }
};



export const deleteImages = async(req, res, next)=>{
    try {
        if(!req.body.imageId || req.body.imageId===""){
            return next(createError(403, "Please give the valid Id...!"));
        }
        const getImage = await Images.findOne({
            where:{
                id:req.body.imageId
            },
            raw : true
        });

        if(!getImage){
            return next(createError(403, "Image Not found...!"));
        }

        const findAllGreaterSquences = await Images.findAll({
            where : {
                sequence : {
                    [Op.gt] : getImage.sequence
                },
                usage : getImage.usage
            },
            raw : true
        })

        const updateSequence = await Promise.all( findAllGreaterSquences.map(async( findAllGreaterSquence )=>{

                await Images.update({
                    sequence : findAllGreaterSquence.sequence - 1 
                },{
                    where: {
                        id : findAllGreaterSquence.id
                    }
                })
            })       
        )        

        const __dirname = path.resolve();
        const p = path.join(__dirname,"../assests/images/image/",getImage.imageName);
        // const p = path.join(__dirname,"./src/assests/images/image/",getImage.imageName);
        // console.log("Path ::>>", p);
        const deleteImages = await  Images.destroy({
            where:{
                id:req.body.imageId
            }
        });
        fs.access(p, fs.constants.F_OK, (err) => {
            if (err) {
            //   console.error('File does not exist or cannot be accessed.');
            } else {
            //   console.log('File exists.');
              fs.unlinkSync(p);
            }
          });
        return res.status(200).json({
            error: false,
            message: "Image deleted Successfully...!",
            data: deleteImages,
          });
    } catch (error) { 
        console.log("Image Delete Error ::>>",error);
        next(error);
    }
};

export const getAllImages = async(req, res, next)=>{
    try {
        let {page, limit} = req.body;
        page = page || 1;
        limit = limit || 10;
        const offset = limit * (page-1);
        let whereClause = {};
        if(req.body.usage){
            whereClause.usage = req.body.usage;
        }
        // console.log("clause :>>",whereClause);
        const allImages = await Images.findAll({
            where:whereClause,
            order:[
                ["sequence",'asc']
            ],
            limit,
            offset
        });

        const totalImages = await Images.count({where:whereClause});
        return res.status(200).json({
            error: false,
            message: "Images All Successfully...!",
            totalImagesInAPage:allImages.length,
            totalImages,
            data: allImages,
          });
    } catch (error) { 
        console.log("All-Images Error ::>>",error);
        next(error);
    }
};

export const getBannerImages = async(req, res, next)=>{
    try {
        const { usage } = req.body;
        if(!usage || usage===""){
            return next(createError(403, "Please provide usage"));
        }
        const allImages = await  Images.findAll({
            where:{
                usage:{
                    [Op.substring]:usage
                },
                status:'Active'
            },
            order:[
                ['sequence','asc']
            ],
            raw:true
        });
        return res.status(200).json({
            error: false,
            message: "Banner Images  Successfully...!",
            data: allImages,
          });
    } catch (error) { 
        console.log("Banner-Images Error ::>>",error);
        next(error);
    }
};

export const addLinkWithBanner = async(req, res, next)=>{
    // try {
        
    //     const { banner_id , TVC_Link , show_TVC } =  req.body;

    //     if(!banner_id || banner_id == ""){
    //         return next(createError(404,"Please provide banner Id."))
    //     }

    //     if(!TVC_Link || TVC_Link == ""){
    //         return next(createError(404,"Please provide TVC Link."))
    //     }

    //     const addLink = await Images.update({
    //         TVC_Link : TVC_Link,    
    //         show_TVC : show_TVC    
    //     },{
    //         where:{
    //            id : banner_id 
    //         }
    //     })

    //     if(addLink == 0){
    //         return next(createError(404,"Image not found"))
    //     }

    //     res.status(200).json({
    //         error: false,
    //         message: "Images All Successfully...!",
    //         data: addLink,
    //       });
    // } catch (error) { 
    //     console.log("All-Images Error ::>>",error);
    //     next(error);
    // }
};

export const getAllActiveImages = async(req, res, next)=>{
    try {
        const allImages = await Images.findAll({
            where:{
                show_TVC : "Yes"
            }
        });

        if(allImages == null || allImages.length <1 ){
            return next(createError(404,"No Images Found"));
        }

        return res.status(200).json({
            error: false,
            message: "All Active Images fetch Successfully...!",
            data: allImages,
          });
    } catch (error) { 
        console.log("All-Active-Images Error ::>>",error);
        next(error);
    }
};

export const getImageById = async(req, res, next)=>{
    try {
        const { imageId } = req.body

        if(!imageId || imageId == ""){
            return next(createError(400,"Please provide Image Id"))
        }

        const getImages = await Images.findOne({
            where:{
                id : imageId
            },
            raw: true
        });

        if(getImages == null || !getImages ){
            return next(createError(404,"No Image Found"));
        }

        return res.status(200).json({
            error: false,
            message: "Image fetch Successfully...!",
            data: getImages,
          });
    } catch (error) { 
        console.log("Image Error ::>>",error);
        next(error);
    }
};

export const getImageFile = async(req, res, next)=>{
    try {
        const { imageId } = req.body

        if(!imageId || imageId == ""){
            return next(createError(400,"Please provide Image Id"))
        }

        const getImages = await Images.findOne({
            where:{
                id : imageId
            },
            raw: true
        });

        if(getImages == null || !getImages ){
            return next(createError(404,"No Image Found"));
        }

        const imagePath = path.join(__dirname, '../assests', 'images','image', getImages.imageName);

        return res.sendFile(imagePath);

    } catch (error) { 
        console.log("Image Error ::>>",error);
        next(error);
    }
};

export const updateTVCDataInImage = async(req, res, next)=>{
    try {
        const { imageId, TVC_Link , show_TVC, status, bannerType } = req.body
        if(!bannerType){
            return next(createError(400,"Please provide Banner Type"));
        }
        if(bannerType==='Announcement'){
            if(!req.body.sDate){
                return next(createError(400,"Please provide start date"));
            }
            if(!req.body.eDate){
                return next(createError(400,"Please provide end date"));
            }
            if(!req.body.startTime){
                return next(createError(400,"Please provide start time"));
            }
            if(!req.body.endTime){
                return next(createError(400,"Please provide end Time"));
            }
            const startDate = new Date(req.body?.sDate);
            const endDate = new Date(req.body?.eDate);
            console.log("start Date :::>>",startDate);
            console.log("end Date :::>>",endDate);
            if(req.body.startTime!==undefined){
                startDate.setHours(req.body?.startTime?.split(':')[0]);
                startDate.setMinutes(req.body?.startTime?.split(':')[1]);
            }
            if(req.body.endTime!==undefined){
                endDate.setHours(req.body?.endTime?.split(':')[0]);
                endDate.setMinutes(req.body?.endTime?.split(':')[1]);
            }
        }

        if(!imageId || imageId == ""){
            return next(createError(400,"Please provide Image Id"));
        }

        const getImages = await Images.findOne({
            where:{
                id : imageId
            }
        });

        if(getImages == null || !getImages ){
            return next(createError(404,"No Image Found"));
        }
       
        const updateObj = bannerType==='Announcement' ? {
            TVC_Link,
            show_TVC,
            status,
            sDate:req.body?.sDate,
            eDate:req.body?.eDate,
            startTime:req.body?.startTime,
            endTime:req.body?.endTime,
            bannerType:req.body?.bannerType,
            startDate,
            endDate
        }:{
            TVC_Link,
            show_TVC,
            status,
            bannerType:req.body?.bannerType,
        };
        const updatedImages = await Images.update(updateObj,{
            where:{
                id : imageId
            }
        });
        if(updatedImages===0){
            return next(createError(404,"Field not updated...!"));
        }
        return res.status(200).json({
            error: false,
            message: "TVC data updated Successfully...!",
            data: updatedImages,
          });
    } catch (error) { 
        console.log("TVC data update Error ::>>",error);
        next(error);
    }
};

export const updateSequenceOfImageBanner = async(req, res, next)=>{
    try {
        const { imageId, sequenceNo } = req.body;
        if(!imageId){
            return next(createError(403, "Enter the valid Image Id ...!"));
        }
        if(!sequenceNo || sequenceNo<=0){
            return next(createError(403, "Enter the valid Sequence No ...!"));
        }
        const getImage = await Images.findOne({
            where:{
                id:imageId
            },
            raw:true
        });
        if(!getImage){
            return next(createError(403, 'Image not found...!'));
        }
        const lastSequence = await Images.findOne({
            attributes:['sequence'],
            where:{
                usage:getImage.usage
            },
            order:[['sequence','desc']],
            limit:1,
            raw:true
        });
        if(lastSequence.sequence===1){
            return next(createError(403,'There is only one banner so it has to only be a sequence 1'));
        }
        if(lastSequence.sequence<sequenceNo){
            return next(createError(403, 'Sequence out of range for banner...!'));
        }
        if(lastSequence.sequence===sequenceNo){
            return next(createError(403, 'Sequence will be same for this banner...!'));
        }
        const findImageWithSequence = await Images.findOne({
            where:{
                sequence:sequenceNo,
                usage:getImage.usage
            },
            raw:true
        });
        if(!findImageWithSequence){
            return next(createError(403,"You are adding unwanted sequence of another category...!"))
        }
        const updateImage = await Images.update(
            { sequence: sequenceNo },
            { where: { id: imageId } }
        );
        const updateImageWithSequence = await Images.update(
            { sequence: getImage.sequence },
            { where: { id: findImageWithSequence.id } }
        );
        if (updateImage[0] === 0 || updateImageWithSequence[0] === 0) {
            return next(createError(500, 'Failed to update images.'));
        }
        return res.status(200).json({
            error:false,
            message:"Sequence will be updated for your requested sequence for Banner",
            data:updateImage[0] + updateImageWithSequence[0]
        });
    } catch (error) {
        console.log("Update Sequence Of Image Error ::>>",error);
        next(error);
    }
}


