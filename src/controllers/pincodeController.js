import { Op } from "sequelize";
import DateTime from "../../utils/constant/getDate&Time";
import { createError } from "../../utils/error";
import { PinCode } from "../models/Pincode";
import sequelize from "../../utils/db/dbConnection";
import { stat } from "@babel/core/lib/gensync-utils/fs";

export const newPinCode = async(req, res, next) => {
    try {
        const {district, pinCode, stateName, status} = req.body;
        if(!district || district===""){
            return next(createError(403,"Enter the valid district Name"));
        }
        if(!pinCode || pinCode===""){
            return next(createError(403,"Enter the valid Pincode"));
        }
        if(!stateName || stateName===""){
            return next(createError(403,"Enter the valid State Name"));
        }
        if(!status || status==="" || (status!=="Active" && status!=="In-Active")){
            return next(createError(403,"Enter the valid Status"));
        }
        const getPinCode = await PinCode.findOne({
            where:{
                pinCode
            },
            raw:true
        });
        if(getPinCode){
            return next(createError(403, "Pincode already exists...!"));
        }
        const pinCodeObj = {
            district:req.body.district,
            pinCode:req.body.pinCode,
            stateName:req.body.stateName,
            status:req.body.status,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime(),
            updateByStaff:req.user.data.name
        };
        const newPinCode = await PinCode.create(pinCodeObj);
        res.status(200).json({
            error: false,
            message: "New PinCode created Successfully...!",
            data: newPinCode,
          });
    } catch (error) { 
        console.log("New-Pincode Error ::>>",error);
        next(error);
    }
};

export const getPinCodeById = async (req, res, next) => {
  try {
    if (!req.body.id || req.body.id === "") {
      return next(createError(403, "Enter the valid id"));
    }
    const getPinCode = await PinCode.findOne({
      where: {
        id: req.body.id
      },
      raw: true
    });
    res.status(200).json({
      error: false,
      message: "Get PinCode By Id found Successfully...!",
      data: getPinCode,
    });
  } catch (error) {
    console.log("Get-PinCode-By-Id Error ::>>", error);
    next(error);
  }
};

export const findPinCode = async (req, res, next) => {
  try {
    // if (req.body.pincode === "" ) {   
    //     return next(createError(403, "Enter the valid pincode"));
    // }
    const { pinCode } = req.params;
    // console.log("pincode", pinCode);

    if(!pinCode || pinCode === ""){
      return next(createError(400,"Invalid pinCode"))
    }

    const getPinCode = await PinCode.findOne({
      where: {
        pinCode: pinCode,
        status: 'Active'
      },
      raw: true
    });
    if (!getPinCode) {
      return next(createError(404, "Pincode not found...!"))
    }
    res.status(200).json({
      error: false,
      message: "Get PinCode found Successfully...!",
      data: getPinCode,
    });
  } catch (error) {
    console.log("Get-PinCode Error ::>>", error);
    next(error);
  }
};

export const updatePinCodeById = async (req, res, next) => {
  try {
    if (!req.body.id || req.body.id === "") {
      return next(createError(403, "Enter the valid id"));
    }
    if (!req.body.stateName || req.body.stateName === "" || !req.body.district || req.body.district === "" || !req.body.pinCode || req.body.pinCode === "" || !req.body.status || req.body.status === "") {
      return next(createError(403, "Enter the valid fields"));
    }
    const pinCodeObj = {
      district: req.body.district,
      pinCode: req.body.pinCode,
      stateName: req.body.stateName,
      status: req.body.status,
      updatedIstAt: DateTime(),
      updateByStaff: req.user.data.name
    };
    const updatePinCode = await PinCode.update(pinCodeObj, {
      where: {
        id: req.body.id
      }
    });
    res.status(200).json({
      error: false,
      message: "Update PinCode Successfully...!",
      data: updatePinCode,
    });
  } catch (error) {
    console.log("Update-Pin-Code-By-id Error ::>>", error);
    next(error);
  }
};

export const deletePinCodeById = async (req, res, next) => {
  try {
    if (!req.body.id || req.body.id === "") {
      return next(createError(403, "Enter the valid id"));
    }
    const deletePinCode = await PinCode.destroy({
      where: {
        id: req.body.id
      },
      truncate: true
    });
    res.status(200).json({
      error: false,
      message: "PinCode deleted Successfully...!",
      data: deletePinCode,
    });
  } catch (error) {
    console.log("Delete-Pin-Code-By-id Error ::>>", error);
    next(error);
  }
};

export const allPinCodeByP = async (req, res, next) => {
  try {

    if (!req.body.page || req.body.page === "") {
      return next(createError(403, "Please Give the page Number...!"))
    }

    let sort = !req.body?.sortBy ? "DESC" : req.body?.sortBy == "ascending" ? "ASC" : "DESC"

    const page = req.body.page;
    const limit = req.body.limit || 10;
    let offset = limit * (page - 1);
    let whereClause = {};
    const search = req.body?.search;
    if(req.body?.search){
      whereClause = {
        [Op.or]: [
          {
            stateName: {
              [Op.substring]: search
            }
          },
          {
            district: {
              [Op.substring]: search
            }
          },
          {
            pinCode: {
              [Op.substring]: search
            }
          }
        ]
      }
    }
    const allpincodes = await PinCode.findAll({
      where:whereClause,
      limit: limit,
      offset: offset,
      order: [['id', sort]],
      raw: true
    });

    const totalCount = await PinCode.count({where:whereClause, raw:true});

    res.status(200).json({
      error: false,
      message: "All PinCodes found Successfully...!",
      totalPincodes: totalCount,
      data: allpincodes,
    });
  } catch (error) {
    console.log("ALL-Pin-Code Error ::>>", error);
    next(error);
  }
};


export const getallPinCodes = async (req, res, next) => {
  try {
    let whereClause = {};
    const search = req.body?.search;
    if(req.body?.search){
      whereClause = {
        [Op.or]: [
          {
            stateName: {
              [Op.substring]: search
            }
          },
          {
            district: {
              [Op.substring]: search
            }
          },
          {
            pinCode: {
              [Op.substring]: search
            }
          }
        ]
      }
    }
    const allpincodes = await PinCode.findAll({
      where:whereClause,
      raw:true
    });

    if(!allpincodes || allpincodes.length == 0){
      return next(createError(500,"No Data Found!"));
    }

    res.status(200).json({
      error: false,
      message: "All PinCodes found Successfully...!",
      totalPincodes: allpincodes.length,
      data: allpincodes,
    })
  } catch (error) {
    console.log("ALL-Pin-Code Error ::>>", error);
    next(error);
  }
};

export const deleteSelectedPincodes = async (req, res, next) => {
  try {
    const ids = req.body.ids;
    // console.log("Ids::>>",ids);

    if(!ids || ids.length === 0 || !Array.isArray(ids)){
      return next(createError(403,"Please enter a valid ids."));
    }

    const deleteRows = ids.map(async (id) => {
      return await PinCode.destroy({
        where: {
          id: id.id
        }
      });
    })
    const getPincodes = await Promise.all(deleteRows);
    res.status(200).json({
      error: false,
      message: "Delete Pin codes Successfully...!",
      data: getPincodes,
    });
  } catch (error) {
    console.error("Delete-Pin-Code Error:", error.message);
    next(error);
  }
};

export const makePinCodeActiveInactive = async (req, res, next) => {
  try {
    if (!req.body.id || req.body.id === "") {
      return next(createError(403, "Enter the Valid Id"));
    }
    else if ((!req.body.status || req.body.status === "") || (req.body.status !== "Active" && req.body.status !== "In-Active")) {
      return next(createError(403, "Enter the Valid isActive"));
    }
    let pinCodeObj = {
      status: req.body.status,
      updatedIstAt: DateTime(),
      updateByStaff: req.user.data.name
    };
    const makePinCodeActiveInactive = await PinCode.update(pinCodeObj, {
      where: {
        id: req.body.id,
      },
    });
    res.status(200).json({
      error: false,
      message: "Pin Code Active Inactive Successfully...!",
      data: makePinCodeActiveInactive,
    });
  } catch (error) {
    console.error("Pin-Code-Active-Inactive Error:", error.message);
    next(error);
  }
};

export const getAllState = async (req, res, next) => {
  try {
    const allStates = await PinCode.findAll({
      attributes: ['stateName'],
      group: ['stateName'],
      raw: true
    });
    console.log("All States ::>>", allStates);
    res.status(200).json({
      error: false,
      message: "All State found Successfully...!",
      data: allStates,
    });
  } catch (error) {
    console.log("ALL-State Error ::>>", error);
    next(error);
  }
};

export const findAreaBySCP = async (req, res, next) => {
  try {
    const search = req.body.search.trim();
    if (!search || search === "") {
      return next(createError(403, "Enter the Valid field"));
    }
    const page = req.body.page || 1;
    const limit = req.body.limit || 10;
    const offset = limit * (page - 1);
    const getAreas = await PinCode.findAll({
      where: {
        [Op.or]: [
          {
            stateName: {
              [Op.substring]: search
            }
          },
          {
            district: {
              [Op.substring]: search
            }
          },
          {
            pinCode: {
              [Op.substring]: search
            }
          }
        ]
      },
      limit,
      offset,
      raw: true
    });

    const count = await PinCode.count({
      where: {
        [Op.or]: [
          {
            stateName: {
              [Op.substring]: search
            }
          },
          {
            district: {
              [Op.substring]: search
            }
          },
          {
            pinCode: {
              [Op.substring]: search
            }
          }
        ]
      }
    });
    // console.log("All States ::>>", getAreas);
    res.status(200).json({
      error: false,
      message: "All State found Successfully...!",
      countArea: getAreas.length,
      totalArea: count,
      data: getAreas,
    });
  } catch (error) {
    console.log("ALL-State Error ::>>", error);
    next(error);
  }
};

export const listingOfStatesName = async (req, res, next) => {
  try {

    const getAllState = await PinCode.findAll({
      attributes: ['stateName', [sequelize.fn('count', sequelize.col('stateName')), 'No_of_PinCodes_in_a_State']],
      group: ['stateName'],
      order: [['stateName', 'asc']],
      raw:true
    })

    const newResult = await Promise.all(getAllState.map(async (state) => {
      const data = await PinCode.findAll({
        where: {
          stateName: state.stateName
        },
        raw: true
      });
    
      const hasInactive = data.some(d => d.status === "In-Active");
    
      state.status = hasInactive ? "In-Active" : "Active";
      return state;
    }));
    
    if (!newResult || newResult.length === 0) {
      return next(createError(401, "No State Found"));
    }
    
    res.status(200).json({
      error: false,
      message: "All State Successfully...!",
      data: newResult
    });
    
  } catch (error) {
    console.error("Pin-Code-Active-Inactive Error:", error.message);
    next(error);
  }
};


export const updateSelectedPincode = async (req, res, next) => {
  try {

    const { stateName, status } = req.body;

    if(!stateName || stateName === ""){
      return next(createError(400,"Please Provide the Name of State"));
    }
    if(!status || status === ""){
      return next(createError(400,"Status Is Required"))
    }
      const updatePincodes = await PinCode.update({
        status: status,
        updatedIstAt: DateTime(),
        updateByStaff: req.user.data.name
      }, {
        where: {
          stateName
        }
      })

     const result = await PinCode.findAll({
        where: {
          stateName
        }
      })

    if (!result || result.length == 0) {
      return next(createError(401, "No pincode Found"));
    }

    res.status(200).json({
      error: false,
      message: "update pincodes Successfully...!",
      data: result
    });
  } catch (error) {
    console.error("Update pincodes Error:", error.message);
    next(error);
  }
};