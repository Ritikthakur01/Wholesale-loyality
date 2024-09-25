import { DataTypes } from "sequelize";
import sequelize from "../../utils/db/dbConnection";

export const Module = sequelize.define("module", {
    moduleName:{
        type:DataTypes.STRING
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