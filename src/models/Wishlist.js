import sequelize from "../../utils/db/dbConnection";
import { DataTypes } from "sequelize";
import { Seller } from "./Seller";
import { DSProduct } from "./DSProduct"

export const Wishlist = sequelize.define("wishlist", {
    sellerId:{
        type:DataTypes.INTEGER,
        references:{
            model: Seller,
            key:'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    productId:{
        type:DataTypes.INTEGER,
        references:{
            model: DSProduct,
            key:'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    updateByStaff:{
        type : DataTypes.STRING
    },
    createdIstAt:{
        type : DataTypes.STRING, 
    },
    updatedIstAt:{
        type : DataTypes.STRING,
    }
});