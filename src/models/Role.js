import { DataTypes } from "sequelize";
import sequelize from "../../utils/db/dbConnection";

export const Role = sequelize.define("role", {
    roleName:{
        type:DataTypes.STRING,
        unique:true
    },
    status:{
        type: DataTypes.ENUM,
        values:["Active", "Inactive"]
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