import { DataTypes } from "sequelize";
import sequelize from "../../utils/db/dbConnection";
import { Seller } from "./Seller";

export const SellerProducts = sequelize.define('sellerproduct',{
    sellerId:{
        type:DataTypes.INTEGER,
        references:{
            model:Seller,
            key:'id'
        }
    },
    accountId:{
        type:DataTypes.STRING,
    },
    sellerName:{
        type:DataTypes.STRING,
    },
    email:{
        type:DataTypes.STRING
    },
    contactNo:{
        type:DataTypes.STRING
    },
    orderId:{
        type:DataTypes.STRING
    },
    pId:{
        type:DataTypes.STRING
    },
    productId:{
        type:DataTypes.INTEGER
    },
    productName:{
        type:DataTypes.STRING
    },
    sku:{
        type:DataTypes.STRING
    },
    productImageURL:{
        type:DataTypes.STRING
    },
    quantity:{
        type:DataTypes.INTEGER
    },
    requiredPoints:{
        type:DataTypes.INTEGER
    },
    billingAddress:{
        type:DataTypes.JSON,
        defaultValue:{}
    },
    Message:{
        type:DataTypes.STRING
    },
    status:{
        type:DataTypes.ENUM,
        values:['Pending','Completed','Expired','Rejected'],
        defaultValue:'Pending'
    },
    resendNotification:{
        type:DataTypes.JSON,
        defaultValue:{count:0,attemptAt:DataTypes.DATE}
    },
    productType:{
        type:DataTypes.ENUM,
        values:['DSProduct','Merchandise']
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