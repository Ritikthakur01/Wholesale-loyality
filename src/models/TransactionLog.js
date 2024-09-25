import { DataTypes, UUIDV1 } from "sequelize";
import DateTime from "../../utils/constant/getDate&Time";
import sequelize from "../../utils/db/dbConnection";

export const TransactionLog = sequelize.define('transactionslog',{
    logId:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
    },
    requestedPath:{
        type:DataTypes.TEXT
    },
    requestedBody:{
        type:DataTypes.JSON
    },
    account:{
        type:DataTypes.JSON
    },
    // orderId:{
    //     type:DataTypes.JSON
    // },
    status:{
        type:DataTypes.STRING
    },
    message:{
        type:DataTypes.STRING
    },
    stack:{
        type:DataTypes.TEXT
    },
    // fromServer:{
    //     type:DataTypes.ENUM,
    //     values:['OWN','VOUCHAGRAM'],
    //     defaultValue:'OWN'
    // },
    updateByStaff:{
        type : DataTypes.STRING
    },
    createdIstAt:{
        type : DataTypes.STRING, 
        defaultValue: DateTime()
    },
    updatedIstAt:{
        type : DataTypes.STRING,
        defaultValue: DateTime()
    }
});