import { DataTypes } from "sequelize";
import sequelize from "../../utils/db/dbConnection";

export const DSProductTag = sequelize.define('dsproducttag',{
    tagName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    sequence:{
        type:DataTypes.INTEGER
    },
    status:{
        type:DataTypes.ENUM,
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

DSProductTag.addHook('beforeCreate', async(productTag, options)=>{
    const lastDSProduct =  await DSProductTag.findOne({
        attributes:['sequence'],
        order:[
            ['sequence','desc']
        ],
        limit:1,
        raw:true
    });
    
    const sequence = lastDSProduct ? lastDSProduct.sequence : 0;
    productTag.sequence = Number(sequence)+1;
})