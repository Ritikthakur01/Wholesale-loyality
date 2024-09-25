import { DataTypes } from "sequelize";
import sequelize from "../../utils/db/dbConnection";

export const NewPage = sequelize.define("NewPage", {
    updateByStaff:{
        type: DataTypes.STRING,
        allowNull: false
    },
    pageName:{
        type: DataTypes.STRING,
        allowNull: false,
        unique:true
    },
    title:{
        type: DataTypes.STRING,
        unique:true
    },
    description:{
        type: DataTypes.TEXT,
        allowNull: true
    },
    status:{
        type : DataTypes.ENUM,
        values:['Active', 'Inactive'],
        defaultValue:'Active'
    },
    createdIstAt:{
        type : DataTypes.STRING, 
    },
    updatedIstAt:{
        type : DataTypes.STRING,
    }
});

