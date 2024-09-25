import { DataTypes } from "sequelize";
import sequelize from "../../utils/db/dbConnection";
import { Category } from "./Category";
import { options } from "serverless-bundle/src/config";

export const DSProduct = sequelize.define('dsproducts',{
    pId:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        unique:true
    },
    productName:{
        type:DataTypes.STRING,
    },
    productSku:{
        type:DataTypes.STRING,
        // unique:true
    },
    description:{
        type:DataTypes.TEXT,
    },
    details:{
        type:DataTypes.TEXT
    },
    images:{
        type:DataTypes.JSON,
        defaultValue:[]
        //array of imagesPath : String
    },
    thumbnails:{
        type:DataTypes.JSON,
        defaultValue:[]
        //array of imagesPath : String
    },
    cost:{
        type:DataTypes.DECIMAL(10,2),
        defaultValue:0.00
    },
    availableQuantity:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    totalQuantity:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    inStock:{
        type:DataTypes.ENUM,
        values:['Yes','No']
    },
    netWeight:{
        type:DataTypes.STRING
    },
    categoryId:{
        type:DataTypes.INTEGER,
        references:{
            model:Category,
            key:'id'
        }
    },
    tagId:{
        type:DataTypes.INTEGER,
        allowNull: true
    },
    rewardCoins:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    status:{
        type:DataTypes.ENUM,
        values:['Active', 'Inactive'],
        defaultValue:'Active'
    },
    startDate:{
        type:DataTypes.STRING
    },
    endDate:{
        type:DataTypes.STRING
    },
    sequence:{
        type:DataTypes.INTEGER
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

DSProduct.addHook('beforeCreate', async(product, options)=>{
    const lastProduct =  await DSProduct.findOne({
        attributes:['sequence'],
        order:[
            ['sequence','desc']
        ],
        limit:1,
        raw:true
    });
    
    const sequence = lastProduct ? lastProduct.sequence : 0;
    product.sequence = Number(sequence)+1;
})