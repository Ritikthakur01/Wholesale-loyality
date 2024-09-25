import { DataTypes } from "sequelize";
import DateTime from "../../utils/constant/getDate&Time";
import sequelize from "../../utils/db/dbConnection";

export const AuthorizationCode = sequelize.define('authorizationcode',{
    authCode:{
        type:DataTypes.STRING,
        unique:true
    },
    sellerId:{
        type:DataTypes.INTEGER,
    },
    accountId:{
        type:DataTypes.STRING,
    },
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
