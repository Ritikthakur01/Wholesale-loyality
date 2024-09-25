import sequelize from "../../utils/db/dbConnection";
import { DataTypes } from "sequelize";

export const ContactVerify = sequelize.define("contactverification", {
    contactNo:{
        type:DataTypes.STRING,
        unique:true
    },
    sellerId:{
        type:DataTypes.INTEGER,
        allowNull: true,
        unique:true
    },
    otp:{
        type:DataTypes.STRING
    },
    otpTimeStampAt:{
        type:DataTypes.DATE
    },
    verified:{
        type:DataTypes.ENUM,
        values:["verified","unverified"],
        defaultValue:'unverified'
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