import { DataTypes } from "sequelize";
import sequelize from "../../utils/db/dbConnection";

export const Product = sequelize.define("product", {
    productName:{
        type:DataTypes.STRING,
    },
    productWeightages:{
        type:DataTypes.JSON,
        defaultValue:[]
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