import DateTime from "../../utils/constant/getDate&Time";
import sequelize from "../../utils/db/dbConnection";
import { DataTypes } from 'sequelize';


export const Subscriber = sequelize.define('subscriber',{
    SubscriberId:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV1,
        unique:true
    },
    email:{
        type : DataTypes.STRING,
        unique:true
    },
    status:{
        type:DataTypes.ENUM,
        values:['Subscribe',"Unsubscribe"],
        defaultValue:'Subscribe'
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