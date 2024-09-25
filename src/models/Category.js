import { DataTypes } from "sequelize";
import sequelize from "../../utils/db/dbConnection";

export const Category = sequelize.define('category',{
    categoryName:{
        type:DataTypes.STRING,
        unique:true
    },
    parentId:{
        type:DataTypes.INTEGER,
        defaultValue:-1
    },
    status:{
        type:DataTypes.ENUM,
        values:['Active', 'Inactive'],
        defaultValue:'Active'
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