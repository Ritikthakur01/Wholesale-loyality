import { DataTypes } from "sequelize";
import sequelize from "../../utils/db/dbConnection";
import { options } from "serverless-bundle/src/config";

export const Images = sequelize.define("images", {
    imageName:{
        type:DataTypes.STRING
    },
    imagePath:{
        type:DataTypes.STRING
    },
    altName:{
        type:DataTypes.STRING
    },
    usage:{
        type:DataTypes.ENUM,
        values:['Home_Banner','Scheme_Banner','Signup_Banner','Redemption_Banner','Other'],
    },
    bannerType:{
        type:DataTypes.ENUM,
        values:['Announcement','Normal'],
        defaultValue:'Normal'
    },
    sequence:{
        type:DataTypes.INTEGER
    },
    TVC_Link:{
        type:DataTypes.STRING
    },
    show_TVC:{
        type : DataTypes.ENUM,
        values:['Yes','No'],
    },
    tvc_Cover_Image:{
        type : DataTypes.JSON,
        defaultValue : {}
    },
    status:{
        type : DataTypes.ENUM,
        values:['Active', 'Inactive'],
        defaultValue:'Active'
    },
    sDate:{
        type:DataTypes.STRING
    },
    eDate:{
        type:DataTypes.STRING
    },
    startTime:{
        type:DataTypes.STRING
    },
    endTime:{
        type:DataTypes.STRING
    },
    startDate:{
        type:DataTypes.DATE
    },
    endDate:{
        type:DataTypes.DATE
    },
    updateByStaff:{
        type: DataTypes.STRING,
        allowNull: false
    },
    createdIstAt:{
        type : DataTypes.STRING, 
    },
    updatedIstAt:{
        type : DataTypes.STRING,
    }
});

Images.addHook('beforeCreate', async(image, options)=>{
    const lastImage = await Images.findOne({
        attributes:['sequence'],
        where:{
            usage:image.usage
        },
        order:[
            ['sequence','DESC']
        ],
        limit:1,
        raw:true
    });
    const lastSequence = lastImage ? lastImage.sequence : 0;
    image.sequence = Number(lastSequence)+1;
});
