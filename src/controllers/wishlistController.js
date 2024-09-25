import { Op } from "sequelize";
import DateTime from "../../utils/constant/getDate&Time";
import { createError } from "../../utils/error";
import sequelize from "../../utils/db/dbConnection";
import { Wishlist } from "../models/Wishlist";
import { DSProduct } from "../models/DSProduct";

  export const createWishlist = async (req, res, next) => {
    try {
    
        const { sellerId , productId } = req.body

        if (!sellerId || sellerId == ""){
            return next(createError(402,"Please provide SellerId."));
        }

        if(!productId || productId == ""){
            return next(createError(402,"Please provide ProductId."));
        }

        let isProductExist = await DSProduct.findOne({where:{id:productId}})  // check the product already exist in

        if(!isProductExist){
            return next(createError(402,"Product is not exist"));
        }

        let isExistWishlist = await Wishlist.findOne({ where: { sellerId : sellerId, productId : productId } })

        if(isExistWishlist){
            return  next(createError(402,"This Wishlist already exist."));
        }
        
        console.log("req.userreq.user",req.user.data.firstName);

        const  createWishlist = await Wishlist.create({
            sellerId : sellerId,
            productId : productId,
            updateByStaff : req.user.data.firstName,
            createdIstAt : DateTime(),
            updatedIstAt : DateTime()
        })

        if(!createWishlist){
            return next(createError(503,"Failed to add the new Wishlist."))
        }

        return res.status(200).json({
            error: false,
            message: "Wishlist has been added successfully.",
            data: createWishlist
        });

    } catch (error) {
      console.error("Create Wishlist Error:", error.message);
      next(error);
    }
  };

  export const getWishlistById = async (req, res, next) => {
    try {
    
        const { WishlistId , sellerId } =  req.body;

        if(!WishlistId || WishlistId == ""){
            return next(createError(402, "Please provide Wishlist Id."))
        }

        if(!sellerId || sellerId == ""){
            return next(createError(402, "Please provide seller Id."))
        }

        const getWishlist = await Wishlist.findOne({ where:{id : WishlistId , sellerId: sellerId}, raw:true });

        if(!getWishlist){
            return next(createError(404, 'No such Wishlist found.'))
        }

        return res.status(200).json({
            error: false,
            message: "Wishlist has been fetched successfully.",
            data: getWishlist
        });

    } catch (error) {
      console.error("get Wishlist Error:", error.message);
      next(error);
    }
  };

  export const removeWishlistById = async (req, res, next) => {
    try {
    
        const { WishlistId , sellerId } =  req.body;

        if(!WishlistId || WishlistId == ""){
            return next(createError(402, "Please provide Wishlist Id."))
        }

        if(!sellerId || sellerId == ""){
            return next(createError(402, "Please provide Seller Id."))
        }

        const deleteWishlist = await Wishlist.destroy({
            where:{
                id: WishlistId,
                sellerId : sellerId
            }
        })

        if(!deleteWishlist || deleteWishlist == 0){
            return next(createError(404, 'No such Wishlist found.'))
        }

        return res.status(200).json({
            error: false,
            message: "Wishlist has been deleted successfully.",
            data: deleteWishlist
        });

    } catch (error) {
      console.error("Delete Wishlist Error:", error.message);
      next(error);
    }
  };

  export const getAllSellerWishlists = async (req, res, next) => {
    try {

        const { sellerId } = req.body;

        if(!sellerId || sellerId == ''){
            return next(createError(404,"Please provide a valid Seller ID"))
        }

        const getAllWishlist = await Wishlist.findAll({
            where : {
                sellerId : sellerId
            }
        });

        if(!getAllWishlist || getAllWishlist.length == 0){
            return next(createError(404, 'No any Wishlist found.'))
        }

        return res.status(200).json({
            error: false,
            message: "All Wishlist has been fetched successfully.",
            data: getAllWishlist
        });

    } catch (error) {
      console.error("get all Wishlist Error:", error.message);
      next(error);
    }
  };