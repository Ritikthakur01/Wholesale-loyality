import { DataTypes } from "sequelize";
import sequelize from "../../utils/db/dbConnection";

export const FaqTitle = sequelize.define("faqtitle",{
    title:{
        type:DataTypes.STRING,
        unique:true
    },
    status:{
        type:DataTypes.ENUM,
        values:['Active','Inactive'],
        defaultValue:'Active'
    },
    sequence:{
        type:DataTypes.INTEGER,
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

FaqTitle.addHook('beforeCreate', async(faq, options)=>{
    const lastFaq =  await FaqTitle.findOne({
        attributes:['sequence'],
        order:[
            ['sequence','desc']
        ],
        limit:1,
        raw:true
    });
    
    const sequence = lastFaq ? lastFaq.sequence : 0;
    faq.sequence = Number(sequence)+1;
})

export const FaqQuesAns = sequelize.define("faqquesans",{
    titleId:{
        type:DataTypes.INTEGER,
        references:{
            model:FaqTitle,
            key:'id'
        },
        onUpdate:'CASCADE',
        onDelete:'CASCADE',
    },
    question:{
        type:DataTypes.STRING,
    },
    answer:{
        type:DataTypes.TEXT,
    },
    status:{
        type:DataTypes.ENUM,
        values:['Active','Inactive'],
        defaultValue:'Active'
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