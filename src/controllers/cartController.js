import { Sequelize } from "sequelize";
import DateTime from "../../utils/constant/getDate&Time";
import sequelize from "../../utils/db/dbConnection";
import { createError } from "../../utils/error";
import { Cart } from "../models/Cart";
import { DSProduct } from "../models/DSProduct";
import { Seller } from "../models/Seller";

// export const addToCart = async(req, res, next)=>{
//     try {
//         const { sellerId, productId, totalCost, quantity } = req.body;
//         if(!productId || productId===""){
//             next(createError(403,"Please ADD Product!"));
//         }
//         else if(!quantity || quantity==="" || quantity<=0){
//             next(createError(403,"Please ADD Quantity!"));
//         }
//         const seller = await Seller.findOne({
//             where:{
//                 id:sellerId
//             },
//             raw:true
//         });
//         if(!seller){
//             return next(createError(403, 'User Not Found In System!'));
//         }
//         const cartObj = {
//             sellerId,
//             products:[],
//             createdIstAt : DateTime(),
//             updatedIstAt : DateTime()
//         };
//         const getProduct = await DSProduct.findOne({
//             where:{
//                 id:productId,
//                 status:'Active'
//             },
//             raw:true
//         });
//         if(!getProduct){
//             return next(createError(403, "Product Not Found in System!"));
//         }
//         // console.log("Calculation ::>>", getProduct.cost, quantity, getProduct.cost*quantity, totalCost, getProduct.cost*quantity!==totalCost);
//         if(parseFloat(getProduct.cost)*parseFloat(quantity)!==parseFloat(totalCost)){
//             return next(createError(403, "Wrong calculation found"));
//         }
//         let getCart;
//         getCart = await Cart.findOne({
//             where:{
//                 sellerId,
//                 status:'Pending'
//             },
//             raw:true
//         });
//         // console.log("Cart ::>>",getCart);
//         if(!getCart){
//             getCart = await Cart.create(cartObj);
//         }

//         let productCart = getCart.products;
//         // console.log("Cart Products ::>>",productCart);
//         let haveProduct = productCart.filter((item)=>item.productId===productId);

//         if(haveProduct.length>0){

//             let updatedQuantity = productCart.map((product)=>{
//                 if(product.productId == haveProduct[0].productId){
//                     product.quantity += 1
//                     product.totalCost = parseFloat(product.quantity) * parseFloat(product.cost)
//                 }
//                 return product;
//             })

//             const saveCart = await Cart.update({
//                 amount : parseFloat(getCart.amount) + parseFloat(haveProduct[0].cost) ,
//                 products:updatedQuantity
//             },{
//                 where:{
//                     sellerId,
//                     status:'Pending'
//                 }
//             });

//             return  res.status(201).json({
//                 success: true,
//                 message:"Selected Product Quantity Added Successfully!",
//                 data : saveCart,
//                 totalItems:getCart.selectedQuantity
//             })
//         }
//         //[{"cost": 1000, "productId": 5, "totalCost": null, "productSku": "2g", "description": "butterskoach", "productName": "Ice-Cream"}]
//         let item = {
//             pId:getProduct.pId,
//             productId:productId,
//             productName:getProduct.productName,
//             productSku:getProduct.productSku,
//             description:getProduct.description,
//             image:getProduct.images,
//             cost:getProduct.cost,
//             coins:getProduct.rewardCoins,
//             quantity:quantity,
//             totalCost:parseFloat(getProduct.cost)*parseFloat(quantity)
//         };
//         productCart.push(item);
//         let amount = getCart.amount;
//         amount = parseFloat(amount) + parseFloat(item.totalCost);
//         let selectedQuantity = getCart.selectedQuantity;
//         selectedQuantity +=1;
//         const saveCart = await Cart.update({
//             amount,
//             selectedQuantity,
//             products:productCart
//         },{
//             where:{
//                 sellerId,
//                 status:'Pending'
//             }
//         });

//         const updatedCart = await Cart.findOne({
//             where:{
//                 sellerId,
//                 status:'Pending'
//             }
//         });

//         res.status(200).json({
//             error: false,
//             message: "Selected Items added In The Cart Successfully!",
//             data: updatedCart,
//             totalItems:getCart.selectedQuantity+1
//         });
//     } catch (error) {
//         console.log("Add Item to cart Error ::>>", error);
//         next(error);
//     }
// };

export const addToCart = async(req, res, next)=>{
    try {
        const { sellerId, productId, totalPoints, selectedQuantity } = req.body;
        if (!productId || productId === "") {
            return next(createError(403, "Please provide the valid Product Id!"));
        } else if (!selectedQuantity || selectedQuantity === "" || selectedQuantity <= 0) {
            return next(createError(403, "Please give the valid quantity!"));
        } else if (!totalPoints || totalPoints === "" || totalPoints <= 0) {
            return next(createError(403, "Please give the valid total points!"));
        }
        const sellerQuery = `SELECT * FROM sellers WHERE id = :sellerId LIMIT 1`;
        const seller = await sequelize.query(sellerQuery, {
            replacements: { sellerId },
            type: Sequelize.QueryTypes.SELECT,
        });
        if (!seller.length) {
            return next(createError(403, "Seller Not Found!"));
        }
        const createdIstAt = DateTime(); 
        const updatedIstAt = DateTime();
        const cartObj = {
            sellerId,
            productId,
            totalPoints,
            selectedQuantity,
            createdIstAt,
            updatedIstAt,
        };
        const productQuery = `SELECT * FROM dsproducts WHERE id = :productId AND status = 'Active' LIMIT 1`;
        const getProduct = await sequelize.query(productQuery, {
            replacements: { productId },
            type: Sequelize.QueryTypes.SELECT,
        });
        if (!getProduct.length) {
            return next(createError(403, "Product Not Found"));
        }
        const cartQuery = `SELECT * FROM carts WHERE sellerId = :sellerId AND productId = :productId LIMIT 1`;
        const getProductInCart = await sequelize.query(cartQuery, {
            replacements: { sellerId, productId },
            type: Sequelize.QueryTypes.SELECT,
        });
        if (Number(getProduct[0].rewardCoins) * Number(selectedQuantity) !== Number(totalPoints)) {
            return next(createError(403, "Your Calculation is wrong"));
        }
        let add;
        if (getProductInCart.length) {
            let quantity = Number(getProductInCart[0].selectedQuantity);
            if (quantity > 5000) {
                return next(createError(403, "Reached your limit for adding Product in Your Cart...!"));
            }
            quantity = Number(quantity) + 1;
            let getTotalPoints = getProductInCart[0].totalPoints;
            getTotalPoints = Number(getTotalPoints) + Number(getProduct[0].rewardCoins);
            const updateCartQuery = `UPDATE carts SET totalPoints = :getTotalPoints, selectedQuantity = :quantity, updatedIstAt = :updatedIstAt WHERE sellerId = :sellerId AND productId = :productId`;
            const increaseQuantityOfProduct = await sequelize.query(updateCartQuery, {
                replacements: {
                    getTotalPoints,
                    quantity,
                    updatedIstAt,
                    sellerId,
                    productId,
                },
                type: Sequelize.QueryTypes.UPDATE,
            });
            add = increaseQuantityOfProduct;
    
        } else {
            const insertCartQuery = `INSERT INTO carts (sellerId, productId, totalPoints, selectedQuantity, createdIstAt, updatedIstAt, createdAt, updatedAt) VALUES (:sellerId, :productId, :totalPoints, :selectedQuantity, :createdIstAt, :updatedIstAt, NOW(), NOW())`;
            const addItem = await sequelize.query(insertCartQuery, {
                replacements: cartObj,
                type: Sequelize.QueryTypes.INSERT,
            });
            add = addItem;
        }
        res.status(200).json({
            error: false,
            message: "Selected Items added In The Cart Successfully!",
            data: add,
        });
    } catch (error) {
        console.log("Add Item to cart Error ::>>", error);
        next(error);
    }    
};

// export const quanityManageOfProductInCart = async(req, res, next)=>{
//     try {
//         const { sellerId, productId, totalQuantity} = req.body;

//         if( !sellerId || sellerId == "" ){
//             return next(createError(402,"Please Provide Seller ID!"))
//         }

//         if( !productId || productId == "" ){
//             return next(createError(402,"Please Provide Product ID!"))
//         }

//         if(!totalQuantity || totalQuantity == "" || totalQuantity <= 0 || totalQuantity > 20 ){
//             return next(createError(400,
//                 "The selected Quantity must be between 1 to 20 units!"
//             ))       
//         }
        
//         const getProduct = await DSProduct.findOne({
//             where:{
//                 id:productId
//             },
//             raw:true
//         });

//         if(!getProduct){
//             return next(createError(403, "Selected Product Not Found!"));
//         }
//         const getProductInCart = await Cart.findOne({
//             where:{
//                 sellerId
//             },
//             raw:true
//         });

//         if(!getProductInCart){
//             return next(createError(403, "Something went wrong, please try again after sometime."));
//         }
//         let products= getProductInCart.products;

//         if(products.length == 0){
//             return next(createError(409,"No Products Added in the Cart!"))
//         }

//         let haveProduct = products.filter((product)=>product.productId == productId)

//         if(haveProduct.length == 0){
//             return next(createError(409,"Selected Product Not Added in the cart!"))
//         }

//         let haveToUpdatedEntity = haveProduct[0];

//         haveToUpdatedEntity.quantity = totalQuantity
//         haveToUpdatedEntity.totalCost = parseFloat(haveToUpdatedEntity.cost) * parseFloat(totalQuantity)

//         let updatedProduct = products.filter((product)=>product.productId !== productId)

//         updatedProduct.push(haveToUpdatedEntity)

//         let totalAmount = 0;
        
//         updatedProduct.map((product)=>{
//             totalAmount = parseFloat(totalAmount) + parseFloat(product.totalCost);
//         })

//         let saveUpdatedProduct = await Cart.update({
//             products : updatedProduct,
//             amount : totalAmount
//         },{
//             where:{
//                 sellerId: sellerId,
//                 status: "Pending"
//             }
//         })

//         res.status(200).json({
//             error: false,
//             message: "Product Quantity Updated in Your Cart Successfully!",
//             data: saveUpdatedProduct
//         });
//     } catch (error) {
//         console.log("Manage Qauntity of DS Product Item to cart Error ::>>", error);
//         next(error);
//     }
// };

export const quanityManageOfProductInCart = async(req, res, next)=>{
    try {
        const { sellerId, productId, totalQuantity} = req.body;

        if( !sellerId || sellerId == "" ){
            return next(createError(402,"Please Provide Seller ID!"))
        }

        if( !productId || productId == "" ){
            return next(createError(402,"Please Provide Product ID!"))
        }

        if(!totalQuantity || totalQuantity == "" || totalQuantity <= 0 || totalQuantity > 20 ){
            return next(createError(400,
                "The selected Quantity must be between 1 to 20 units!"
            ))       
        }
        
        const getProduct = await DSProduct.findOne({
            where:{
                id:productId,
                status:'Active'
            },
            raw:true
        });

        if(!getProduct){
            return next(createError(403, "Selected Product Not Found!"));
        }
        const getProductInCart = await Cart.findOne({
            where:{
                sellerId,
                productId
            },
            raw:true
        });

        if(!getProductInCart){
            return next(createError(403, "Something went wrong, please try again after sometime."));
        }
        let saveUpdatedProduct = await Cart.update({
                        selectedQuantity:totalQuantity,
                        totalPoints : Number(totalQuantity)*Number(getProduct.rewardCoins)
                    },{
                        where:{
                            sellerId: sellerId,
                            productId,
                            status: "Pending"
                        }
                    });
        res.status(200).json({
            error: false,
            message: "Product Quantity Updated in Your Cart Successfully!",
            data: saveUpdatedProduct
        });
    } catch (error) {
        console.log("Manage Qauntity of DS Product Item to cart Error ::>>", error);
        next(error);
    }
};


// export const RemoveFromCart = async(req, res, next)=>{
//     try {
//         const { sellerId, productId } = req.body;
//         if( !sellerId || sellerId == "" ){
//             return next(createError(402,"Please Provide Correct Seller ID!"));
//         }

//         if( !productId || productId == "" ){
//             return next(createError(402,"Please Provide Correct Product  ID!"));
//         }
//         const getCart = await Cart.findOne({
//             where:{
//                 sellerId,
//                 status:'Pending'
//             },
//             raw:true
//         });
//         if(!getCart){
//             //show message
//             return next(createError(403, "Something went wrong, please try again later!"));
//         }
//         let productCart = getCart.products;
//         if(productCart.length===0){
//             return next(createError(403, "No Product Found!"));
//         }
//         // console.log("Cart ::>>",getCart);
//         const haveProduct = productCart.filter((item)=>item.productId===productId);
//         if(haveProduct.length===0){
//             return next(createError(403, "No Product Found In The Cart!"));
//         }
//         // console.log("Have product ::>>", haveProduct);
//         const newProductsInCart = productCart.filter((item)=>item.productId!==productId);
//         // console.log("New Product In Cart ::>>", newProductsInCart);
//         let amount = getCart.amount-haveProduct[0].totalCost;
//         let selectedQuantity = getCart.selectedQuantity-1;
//         const saveCart = await Cart.update({
//             amount,
//             selectedQuantity,
//             products:newProductsInCart
//         },{
//             where:{
//                 sellerId,
//                 status:'Pending'
//             }
//         });
//         if(saveCart===0){
//             return next(createError(405, "Cart Not Updated!"));
//         }
//         res.status(200).json({
//             error: false,
//             message: "Item Removed from the cart successfully!",
//             data: {products:newProductsInCart}
//         });
//     } catch (error) {
//         console.log("Remove Item to cart Error ::>>", error);
//         next(error);
//     }
// };

export const RemoveFromCart = async(req, res, next)=>{
    try {
        const { sellerId, productId } = req.body;
        if( !sellerId || sellerId == "" ){
            return next(createError(402,"Please Provide Correct Seller ID!"));
        }
        if( !productId || productId == "" ){
            return next(createError(402,"Please Provide Correct Product  ID!"));
        }
        const cartQuery = `SELECT * FROM carts WHERE sellerId = :sellerId AND productId = :productId AND status='Pending' LIMIT 1`;
        const getProductInCart = await sequelize.query(cartQuery, {
            replacements: { sellerId, productId },
            type: Sequelize.QueryTypes.SELECT,
        });
        if(!getProductInCart.length){
            return next(createError(402,"Product is not found in the cart!"));
        }
        const deleteQuery = `DELETE FROM carts WHERE sellerId = :sellerId AND productId = :productId`;
        const result = await sequelize.query(
            deleteQuery,
            {
              replacements: { sellerId, productId },
              type: sequelize.QueryTypes.DELETE,
            }
        );
        res.status(200).json({
            error: false,
            message: "Item Removed from the cart successfully!",
            data: result
        });
    } catch (error) {
        console.log("Remove Item to cart Error ::>>", error);
        next(error);
    }
};

// export const getSellerCart = async(req, res, next)=>{
//     try {
//         let { sellerId } = req.body;

//         const getCart = await Cart.findOne({
//             where:{
//                 sellerId,
//                 status:'Pending'
//             },
//             raw:true
//         });
//         if(!getCart){
//             //show message
//             return res.status(200).json({
//                 error: false,
//                 message: "Your Cart is Empty!t",
//                 data:[]        
//             });
//         }
//         const {products, ...rest} = getCart;
//         return res.status(200).json({
//             error: false,
//             message: "Successfully added the products in the cart!",
//             items:products,
//             totalItems:products.length,
//             data:{...rest}        
//         });
//     } catch (error) {
//         console.log("Seller cart Error ::>>", error);
//         next(error);
//     }
// };

export const getSellerCart = async(req, res, next)=>{
    try {
        let { sellerId } = req.body;
        const getCartQuery = `
        SELECT
            ct.*,
            ct.selectedQuantity AS quantity,
            dp.productName,
            dp.pId,
            dp.images AS image,
            dp.description,
            dp.productSku,
            dp.rewardCoins As coins
            FROM
                carts AS ct
            INNER JOIN
                dsproducts AS dp ON dp.id = ct.productId
            WHERE 
            ct.sellerId = :sellerId;  -- Parameterized value for sellerId
        `;
        const products = await sequelize.query(
            getCartQuery,
            {
              replacements: { sellerId: sellerId },  
              type: sequelize.QueryTypes.SELECT,
            }
        );
        if(!products || products.length === 0){
            //show message
            return res.status(200).json({
                error: false,
                message: "Your Cart is Empty!t",
                items:[],
                data:[]        
            });
        }
        return res.status(200).json({
            error: false,
            message: "Successfully added the products in the cart!",
            items:products,
            totalItems:products.length,
            data:products        
        });
    } catch (error) {
        console.log("Seller cart Error ::>>", error);
        next(error);
    }
};

export const getAllCart = async(req, res, next)=>{
    try {
        let { page, limit } = req.body;
        page = page || 1;
        limit = limit || 20;
        const offset = limit * (page-1);

        const getAllProductInCart = await Cart.findAll({
            limit,
            offset
        });
        const totalAllProductInCart = await Cart.count();
        if(!getAllProductInCart || getAllProductInCart.length==0){
            //show message
            return next(createError(403, "Empty Cart : No Products in your cart!"));
        }
        res.status(200).json({
            error: false,
            message: "Product Added In Your Caer Successfully!",
            ItemsInAPage : getAllProductInCart.length,
            totalItemsInACart : totalAllProductInCart,
            data:getAllProductInCart        
        });
    } catch (error) {
        console.log("All Product Item In cart Error ::>>", error);
        next(error);
    }
};


