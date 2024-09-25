import { DataTypes } from "sequelize";
import sequelize from "../../utils/db/dbConnection";

export const CardImage = sequelize.define('cardimages' ,{
    cardName:{
        type:DataTypes.STRING
    },
    cardPath:{
        type:DataTypes.STRING
    },
    cardType:{
        type:DataTypes.ENUM,
        values:['BIRTHDAY', 'MARRIAGE_ANNIVERSARY', 'WELCOME_MEMBERSHIP','BLUE_MEMBERSHIP','SILVER_MEMBERSHIP','GOLD_MEMBERSHIP'],
        unique:true
    },
    status:{
        type:DataTypes.ENUM,
        values:['Active','Inactive'],
        defaultValue:'Inactive'
    },
     //after birthday & anniversary in number of days card will be visible
     visibilityInDays: {
        type: DataTypes.INTEGER,
        defaultValue: 0
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
