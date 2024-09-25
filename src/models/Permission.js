import { DataTypes } from "sequelize";
import sequelize from "../../utils/db/dbConnection";
import { Role } from "./Role";

export const Permission = sequelize.define("permission" , {
    roleId:{
        type: DataTypes.INTEGER,
        references:{
            model:Role,
            key:'id'
        },
        onUpdate:'CASCADE',
        onDelete:'CASCADE',
    },
    moduleId:{
        type: DataTypes.INTEGER,
        // references:{
        //     model:Module,
        //     key:'id'
        // }
    },
    moduleName:{
        type: DataTypes.STRING
    },
    access:{
        type: DataTypes.JSON
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