import { DataTypes } from "sequelize";
import sequelize from "../../utils/db/dbConnection";

export const Notification = sequelize.define('notification',{
    sellerId:{
        type:DataTypes.INTEGER
    },
    category:{
        type:DataTypes.ENUM,
        values:['Voucher','Merchandise','Purchase']
    },
    itemId:{
        type:DataTypes.INTEGER
    },
    message:{
        type : DataTypes.STRING
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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