import { DataTypes } from "sequelize";
import sequelize from "../../utils/db/dbConnection";

export const PinCode = sequelize.define("PinCodeLimitation",{
    district:{
        type:DataTypes.STRING
    },
    pinCode:{
        type:DataTypes.STRING,
        unique:true
    },
    stateName:{
        type:DataTypes.STRING
    },
    status:{
        type : DataTypes.ENUM,
        values:['Active', 'In-Active'],
        defaultValue:'Active'
    },
    updateByStaff:{
        type:DataTypes.STRING
    },
    createdIstAt:{
        type : DataTypes.STRING, 
    },
    updatedIstAt:{
        type : DataTypes.STRING,
    }
});