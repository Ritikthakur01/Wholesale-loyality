import { DataTypes } from "sequelize";
import sequelize from "../../utils/db/dbConnection";
import DateTime from "../../utils/constant/getDate&Time";

export const QueryStaff = sequelize.define('querystaff',{
    queryType:{
        type:DataTypes.STRING
    },
    subQueryType:{
        type:DataTypes.STRING
    },
    emailList:{
        type:DataTypes.JSON,
        defaultValue:[]
    },
    toCCList:{
        type:DataTypes.JSON,
        defaultValue:[]
    },
    toBCCList:{
        type:DataTypes.JSON,
        defaultValue:[]
    },
    updateByStaff:{
        type:DataTypes.STRING
    },
    createdIstAt:{
        type:DataTypes.STRING, 
        defaultValue:DateTime()
    },
    updatedIstAt:{
        type:DataTypes.STRING,
        defaultValue:DateTime()
    }
});