import DateTime from "../../utils/constant/getDate&Time";
import sequelize from "../../utils/db/dbConnection";
import { DataTypes } from 'sequelize';


export const WoohooAuth = sequelize.define('woohooauth',{
    accessOauthToken:{
        type:DataTypes.STRING
    },
    accessTokenSecret:{
        type:DataTypes.STRING
    },
    categoryId:{
        type:DataTypes.STRING
    },
    for:{
        type:DataTypes.ENUM,
        values:['UAT',"PROD"]
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