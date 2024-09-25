import { DataTypes } from "sequelize";
import sequelize from "../../utils/db/dbConnection";

export const VoucherBrands = sequelize.define("voucherBrands", {
    BrandName:{
        type:DataTypes.STRING,
        // unique:true
    },
    BrandProductCode:{
        type:DataTypes.STRING,
    },
    BrandType:{
        type:DataTypes.STRING,
    },
    RedemptionType:{
        type:DataTypes.STRING,
    },
    OnlineRedemptionUrl:{
        type:DataTypes.STRING,
    },
    BrandImage:{
        type:DataTypes.STRING,
    },
    minPrice:{
        type:DataTypes.INTEGER
    },
    DenominationList:{
        type:DataTypes.STRING
    },
    StockAvailable:{
        type:DataTypes.ENUM,
        values:['true', 'false']
    },
    Category:{
        type:DataTypes.STRING
    },
    // OwnCategory:{
    //     type:DataTypes.STRING
    // },
    Descriptions:{
        type:DataTypes.TEXT,
        allowNull: true
    },
    TermsAndCondition:{
        type:DataTypes.TEXT, 
        allowNull: true
    },
    ImportantInstruction:{
        type:DataTypes.TEXT,
        allowNull: true
    },
    RedeemSteps:{
        type:DataTypes.TEXT,
        allowNull: true
    },
    status:{
        type:DataTypes.ENUM,
        values:['Active', 'Inactive'],
        defaultValue: "Active"
    },
    vendor:{
        type:DataTypes.ENUM,
        values:['Vouchagram', 'Woohoo'],
    },
    platformFees: {
        type:DataTypes.INTEGER,
        defaultValue:0
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


// productId:{
//     by -> woohooo
// },
// BrandId:{
//     by -> woohooo
// },
// BrandName:{
//     by -> vouchagram & woohooo <- name
// },
// BrandProductCode:{
//     by -> vouchagram & woohoo <- sku
// },
// BrandType:{
//     by -> vouchagram 
// },
// RedemptionType:{
//     by -> vouchagram
// },
// sku:{
//     by -> woohoo
// },
// images:{
//     by -> woohoo
// },
// priceType:{
//     by -> woohoo
// },
// navigationApiCall:{
//     by -> woohooo
// },
// navigationUrlPath:{
//     by -> woohooo
// },
// minCustomPrice:{
//     by -> woohooo
// },
// maxCustomPrice:{
//     by -> woohooo
// },
// BrandImage:{
//     by -> vouchagram
// },
// DenominationList:{
//     by -> vouchagram & woohoo <- custom denomination (custom_denominations)
// },
// StockAvailable:{
//     by -> vouchagram
// },
// Category:{
//     by -> vouchagram
// },
// Descriptions:{
//     by -> vouchgram & woohoo <- (description)
// },
// shortDescription:{
//     by <- woohoo
// },
// TermsAndCondition:{
//     by -> vouchgram
// },
// ImportantInstruction:{
//     by -> vouchgram
// },
// RedeemSteps:{
//     by -> vouchgram
// },
// status:{
//     type:DataTypes.ENUM,
//     values:['Active', 'Inactive'],
//     defaultValue: "Active"
// },
// vendor:{
//     type:DataTypes.ENUM,
//     values:['Vouchagram', 'Woohoo'],
// },
// platformFees: {
//     type:DataTypes.INTEGER,
//     defaultValue:0
// },
// productType:{
//     by <- woohoo
// },
// payWithAmazonDisable:{
//     by <- woohoo
// },
// thumbnailImage:{
//     by <- woohoo ((images) when we get details of product and its is a single image)
// },
// tncMobile:{
//     by <- woohoo
// },
// tncMail:{
//     by <- woohoo
// },
// tncWeb:{
//     by <- woohoo
// },
// themes:{
//     by <- woohoo
// },
// orderHandlingCharge:{
//     by <- woohoo
// },
// updateByStaff:{
//     type : DataTypes.STRING
// },
// createdIstAt:{
//     type : DataTypes.STRING, 
// },
// updatedIstAt:{
//     type : DataTypes.STRING,
// }
