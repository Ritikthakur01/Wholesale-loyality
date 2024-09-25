import DateTime from "../../utils/constant/getDate&Time";
import { Product } from "../models/Produt";
import { createError } from "../../utils/error";
import { Op } from "sequelize";


export const addProduct = async(req, res, next) => {
    try {
        if (!req.body.productName || req.body.productName === "" || !req.body.productWeightages || !Array.isArray(req.body.productWeightages) || req.body.productWeightages.length === 0) {
            return next(createError(403, "Enter the valid fields"));
        }
        const productObj = {
            productName : req.body.productName,
            productWeightages : req.body.productWeightages,
            status:req.body.status===true ? "Active" : "Inactive",
            createdIstAt: DateTime(),
            updatedIstAt: DateTime(),
            updateByStaff:req.user.data.name
        };
        const findProduct = await Product.findOne({
            where:{
                productName:req.body.productName
            },
            raw:true
        });
        if(findProduct){
            return next(createError(403,'Product Name is already Exist'))
        }
        const newProduct = await Product.create(productObj);

        res.status(200).json({
            error: false,
            message: "New Product created Successfully...!",
            data: 1,
          });
    } catch (error) { 
        console.log("Add-Product Error ::>>",error);
        next(error);
    }
};

export const getProductById = async(req, res, next) => {
    try {
        if ( !req.body.id || req.body.id === "" ) {   
            return next(createError(403, "Enter the valid id"));
        }
        const getProduct = await Product.findOne({
            where : {
                id:req.body.id
            },
            raw:true
        });
        if(!getProduct){
            return next(createError(404,"Product Not Found :: Give the valid Id"))
        }
        res.status(200).json({
            error: false,
            message: "Get Product By Id found Successfully...!",
            data: getProduct,
          });
    } catch (error) { 
        console.log("Get-Product Error ::>>",error);
        next(error);
    }
};

export const updateProductById = async(req, res, next) => {
    try {
        if ( !req.body.id || req.body.id === "") {   
            return next(createError(403, "Enter the valid id"));
        }
        if (!req.body.productName || req.body.productName === "" || !req.body.productWeightages || !Array.isArray(req.body.productWeightages) || req.body.productWeightages.length === 0) {
            return next(createError(403, "Enter the valid fields"));
        }  
        const getProduct = await Product.findOne({
            where : {
                id:req.body.id
            },
            raw:true
        });
        if(!getProduct){
            return next(createError(404,"Product Not Found :: Give the valid Id"))
        }
        const productObj = {
            productName:req.body.productName,
            productWeightages:req.body.productWeightages,
            status:req.body.status===true ? "Active" : "Inactive",
            updatedIstAt: DateTime(),
            updateByStaff:req.user.data.name
        };
        if(getProduct.productName!==req.body.productName){
            const findProduct = await Product.findOne({
                where:{
                    productName:req.body.productName,
                    id:{
                        [Op.ne]:req.body.id
                    }
                },
                raw:true
            });
            if(findProduct){
                return next(createError(403,'Product Name is already Exist'))
            }
        }
        const updatedProduct = await Product.update(productObj, {
            where:{
                id:req.body.id
            }
        });
        res.status(200).json({
            error: false,
            message: "Update Product Successfully...!",
            data: updatedProduct,
          });
    } catch (error) { 
        console.log("Update-Product-By-id Error ::>>",error);
        next(error);
    }
};

export const deleteProductById = async(req, res, next) => {
    try {
        if ( !req.body.id || req.body.id === "" ) {   
            return next(createError(403, "Enter the valid id"));
        }
        const deleteProduct = await Product.destroy({
            where:{
                id:req.body.id
            }
        });
        res.status(200).json({
            error: false,
            message: "Product deleted Successfully...!",
            data: deleteProduct,
          });
    } catch (error) { 
        console.log("Delete-Product-By-id Error ::>>",error);
        next(error);
    }
};

export const getAllProductByP = async(req, res, next) => {
    try {
        let { page, limit, sortBy } = req.body;

        if(!page || page==="" ){
            return next(createError(403,"Please provide page no!"));
        }

        let pageNo = page || 1;
        limit = limit || 10;
        let offset = limit * (pageNo - 1);
        sortBy = !sortBy ? "DESC" : sortBy == "ascending" ? "ASC" : "DESC";
        const totalProducts = await Product.count();
        const products = await Product.findAll({
            limit,
            offset,
            order:[
                ['id', sortBy]
            ],
            raw:true});
        res.status(200).json({
            error: false,
            message: "All Products found Successfully...!",
            productInAPage:products.length,
            totalProducts,
            data: products,
          });
    } catch (error) { 
        console.log("ALL-Product Error ::>>",error);
        next(error);
    }
};

export const getAllProduct = async(req, res, next) => {
    try {
        const products = await Product.findAll({
            where:{
                status:'Active'
            },
            order:[
                ['id', 'desc']
            ],
            raw:true
        });
        // console.log("products",products);
        res.status(200).json({
            error: false,
            message: "All Products found Successfully...!",
            data: products,
          });
          
    } catch (error) { 
        console.log("ALL-Product Error ::>>",error);
        next(error);
    }
};