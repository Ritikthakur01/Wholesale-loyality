import DateTime from '../../utils/constant/getDate&Time.js';
import { createError } from '../../utils/error.js';
import { TVC } from '../models/TVC.js';
import path from 'path';
import fs from 'fs';

export const addTVC = async(req, res, next) => {
    try {
        if (!req.body.TVC_Name || req.body.TVC_Name === "") {
            return next(createError(403, "Enter the valid Name of TVC"));
        }
        else if (!req.body.TVC_Link || req.body.TVC_Link === "") {
            return next(createError(403, "Enter the valid Name of TVC"));
        }
        else if (!req.body.TVC_Category || req.body.TVC_Category === "" && (req.body.TVC_Category!=='Silver_Pearls' && req.body.TVC_Category!=='Pan_Masala' && req.body.TVC_Category !== 'Clove_Pan_Masala')) {
            return next(createError(403, "Enter the valid Name of TVC"));
        }
        else if (!req.body.status || req.body.status === "" && (req.body.status!=='Active' && req.body.status!=='Inactive')){
            return next(createError(403, "Enter the valid Name of TVC"));
        }

        const isExistTVC = await TVC.findOne({ where:{
            TVC_Name: req.body.TVC_Name
        },raw:true });

        console.log('isExistTVC',isExistTVC);

        if(isExistTVC){
            return next(createError(409, `The ${req.body.TVC_Name} already exists`));
        }

        const tvcObj = {
            TVC_Name:req.body.TVC_Name,
            TVC_Link:req.body.TVC_Link,
            TVC_Category: req.body.TVC_Category,
            status:req.body.status,
            updateByStaff: req.user.data.name,
            createdIstAt:DateTime(),
            updatedIstAt:DateTime()
        };
        const newTVC= await TVC.create(tvcObj);
        res.status(200).json({
            error: false,
            message: "New TVC created Successfully...!",
            data: newTVC,
          });
    } catch (error) { 
        console.log("Add-TVC Error ::>>",error);
        next(error);
    }
};

export const addTVCWithCoverImage = async(req, res, next) => {
    try {
        if(!req.newTVC){
            return next(createError(403, "Enter the valid fields...!"));
        }
        res.status(200).json({
            error: false,
            message: "New TVC created Successfully...!",
            data: req.newTVC,
          });
    } catch (error) { 
        console.log("Add-TVC Error ::>>",error);
        next(error);
    }
};

export const updateTVC = async(req, res, next) => {
    try {
        
        const { TVC_Id , ...rest } = req.body

        const updatedTVC= await TVC.update({
            ...rest,
            updateByStaff: req.user.data.name,
            updatedIstAt: DateTime()
        },{
            where:{
                id : TVC_Id
            }
        });

        res.status(200).json({
            error: false,
            message: "TVC updated Successfully...!",
            data: updatedTVC,
          });
    } catch (error) { 
        console.log("Update-TVC Error ::>>",error);
        next(error);
    }
};

export const getTVC = async(req, res, next) => {
    try {
        
        const {TVC_Id} = req.body

        if (!TVC_Id || TVC_Id === "") {
            return next(createError(403, "Enter the valid TVC id"));
        }

        const getTVC= await TVC.findOne({
            where:{
                id: TVC_Id
            }
        });

        res.status(200).json({
            error: false,
            message: "TVC Fetched Successfully...!",
            data: getTVC,
          });
    } catch (error) { 
        console.log("Get-TVC Error ::>>",error);
        next(error);
    }
};

export const getAllTVC = async(req, res, next) => {
    try {
        let { page, limit, TVC_Category, status } = req.body;
        page = page || 1;
        limit = limit || 10;
        const offset = limit * (page-1);
        let whereClause = {};
        if(status && status!==""){
            whereClause.status = status;
        }
        if(TVC_Category && TVC_Category!==""){
            whereClause.TVC_Category = TVC_Category;
        }
        const getAll = await TVC.findAll({
            where:whereClause,
            limit,
            offset
        });
        const totalTvc = await TVC.count({ where:whereClause });
        res.status(200).json({
            error: false,
            message: "All TVC Successfully...!",
            tvcInAPage:getAll.length,
            totalTvc:totalTvc,
            data: getAll,
          });
    } catch (error) { 
        console.log("All-TVC Error ::>>",error);
        next(error);
    }
};

export const getAllTVCWithoutP = async(req, res, next) => {
    try {
        let { TVC_Category, status } = req.body;
        let whereClause = {};
        if(status && status!==""){
            whereClause.status = status;
        }
        if(TVC_Category && TVC_Category!==""){
            whereClause.TVC_Category = TVC_Category;
        }
        const getAll = await TVC.findAll({
            where:whereClause
        });
        res.status(200).json({
            error: false,
            message: "All TVC Successfully...!",
            totalTvc:getAll.length,
            data: getAll,
          });
    } catch (error) { 
        console.log("All-TVC Error ::>>",error);
        next(error);
    }
};

export const deleteTVC = async(req, res, next) => {
    try {
        if (!req.body.TVC_ID || req.body.TVC_ID === "") {
            return next(createError(403, "Enter the valid Id of TVC"));
        }

        const getTVC= await TVC.findOne({
            where:{
                id: req.body.TVC_ID
            }
        });
        if(!getTVC){
            return next(createError(403,"No TVC Found"));
        }
        const deleteTVC= await TVC.destroy({
            where:{
                id:req.body.TVC_ID
            }
        });
        const __dirname = path.resolve();
        const p = path.join(__dirname,"../assests/images/tvc/",getTVC.coverImageName);
        // const p = path.join(__dirname,"./src/assests/images/tvc/",getTVC.coverImageName);
        // console.log("Path ::>>", p);
        fs.access(p, fs.constants.F_OK, (err) => {
            if (err) {
            //   console.error('File does not exist or cannot be accessed.');
            } else {
            //   console.log('File exists.');
            fs.unlinkSync(p);
            }
        });

        if(!deleteTVC || deleteTVC == 0){
            return next(createError(404,"No Data Found to Delete..!"))
        }

        res.status(200).json({
            error: false,
            message: "TVC deleted Successfully...!",
            data: deleteTVC,
          });
    } catch (error) { 
        console.log("Delete-TVC Error ::>>",error);
        next(error);
    }
}

export const getTvcByCategory = async(req, res, next) => {
    try {
        if (!req.body.TVC_Category || req.body.TVC_Category === "") {
            return next(createError(403, "Enter the valid category of TVC"));
        }
        
        const data = await TVC.findAll({
            where : {
                TVC_Category : req.body.TVC_Category
            }
        })

        if(!data || data.length == 0){
            return next(createError(
                400,`No data found for ${req.body.TVC_Category} category`
            ))
        }

        res.status(200).json({
            error: false,
            message: `TVC's of ${req.body.TVC_Category} category fetched Successfully...!`,
            data: data,
          });
    } catch (error) { 
        console.log("fetch-TVC-by-category Error ::>>",error);
        next(error);
    }
}
