import sequelize from "../../utils/db/dbConnection";
import { DataTypes } from "sequelize";
import { Seller } from "./Seller";
import DateTime from "../../utils/constant/getDate&Time";

export const Order = sequelize.define('Order', {
    sellerId:{
        type:DataTypes.INTEGER,
        references:{
            model:Seller,
            key:'id'
        }
    },
    oId:{
        type:DataTypes.STRING,
        unique:true
    },
    productType:{
        type:DataTypes.ENUM,
        values:['DSProduct','Merchandise']
    },
    products:{
        type:DataTypes.JSON, 
        defaultValue:[]
    },
    quantity:{
        type:DataTypes.INTEGER
    },
    amount:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    points:{
        type:DataTypes.INTEGER,
        defaultValue:0
        //used points in order
    },
    status:{
        type:DataTypes.ENUM,
        values:['Pending', 'Complete', 'Failed'],
        defaultValue:'Pending'
    },
    payBy:{
        type:DataTypes.ENUM,
        values:['CASH', 'POINTS']
    },
    paymentId:{
        type:DataTypes.INTEGER,
    },
    transactionId:{
        type:DataTypes.STRING
    },
    shippingId:{
        type:DataTypes.STRING,
    },
    updateByStaff:{
        type : DataTypes.STRING
    },
    createdIstAt:{
        type : DataTypes.STRING, 
        defaultValue:DateTime()
    },
    updatedIstAt:{
        type : DataTypes.STRING,
        defaultValue:DateTime()
    }
});

// products:[
//     {
//         productId:'id',
//         productName:'name',
//         productSku:'sku',
//         cost:'cost',
//         quantity:'quantity',
//         amount:'amount'
//     }
// ]