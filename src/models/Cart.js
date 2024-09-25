import sequelize from "../../utils/db/dbConnection";
import { DataTypes } from "sequelize";
import { Seller } from "./Seller";
import { DSproduct } from "./DSProduct"

export const Cart = sequelize.define("cart", {
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
    },
    totalPoints:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    selectedQuantity:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    status:{
        type:DataTypes.ENUM,
        values:["Pending", "Complete"],
        defaultValue:"Pending"
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