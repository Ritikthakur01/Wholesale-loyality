import { Module } from "../models/Module";

export const addModule = async(req, res, next) => {
    try {
        if (req.body.moduleName === "") {
            return next(createError(403, "Enter the valid Module Name"));
        }
        const newModule = await Module.create(req.body);
        res.status(200).json({
            error: false,
            message: "New Module created Successfully...!",
            data: { module: newModule },
          });
    } catch (error) { 
        console.log("Add-Module Error ::>>",error);
        next(error);
    }
};