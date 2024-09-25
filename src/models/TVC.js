import { DataTypes } from "sequelize";
import sequelize from "../../utils/db/dbConnection";

export const TVC = sequelize.define("tvc", {
    TVC_Name:{
        type:DataTypes.STRING,
        unique:true
    },
    TVC_Link:{
        type:DataTypes.STRING,
    },
    TVC_Category:{
        type:DataTypes.ENUM,
        values:['Silver_Pearls', 'Pan_Masala', "Clove_Pan_Masala"]
    },
    coverImageName:{
        type:DataTypes.STRING,
    },
    coverImagePath:{
        type:DataTypes.STRING,
    },
    status:{
        type:DataTypes.ENUM,
        values:['Active', 'Inactive']
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