import { DataTypes } from "sequelize";
import sequelize from "../../utils/db/dbConnection";
import moment from "moment";

export const Staff = sequelize.define("staff", {
    name:{
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING,
        unique:true
    },
    contactNo:{
        type: DataTypes.STRING,
    },
    roles:{
        type: DataTypes.ENUM,
        values:["superadmin","admin"],
        defaultValue: "admin"
    },  
    password: {
      type: DataTypes.TEXT,
    },
    roleId:{
        type: DataTypes.INTEGER
    },
    roleName:{
        type: DataTypes.STRING
    },
    status:{
        type: DataTypes.ENUM,
        values:["Active", "Inactive"],
        defaultValue: "Active"
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