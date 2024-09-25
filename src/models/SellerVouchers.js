import { DataTypes } from "sequelize";
import sequelize from "../../utils/db/dbConnection";
import { Seller } from "./Seller";

export const SellerVouchers = sequelize.define('sellervoucher',{
    sellerId:{
        type:DataTypes.INTEGER,
        references:{
            model:Seller,
            key:'id'
        }
    },
    accountId:{
        type:DataTypes.STRING,
    },
    sellerName:{
        type:DataTypes.STRING,
    },
    email:{
        type:DataTypes.STRING
    },
    contactNo:{
        type:DataTypes.STRING
    },
    requiredPoints:{
        type:DataTypes.INTEGER
    },
    ExternalOrderId:{
        type:DataTypes.STRING,
        unique:true
    },
    brandImageUrl:{
        type:DataTypes.STRING
    },
    woohooProductId:{
        type:DataTypes.STRING
    },
    woohooOrderId:{
        type:DataTypes.STRING
    },
    BrandName:{
        type:DataTypes.STRING,
    },
    BrandProductCode:{
        type:DataTypes.STRING,
    },
    Denomination:{
        type:DataTypes.INTEGER
    },
    Quantity:{
        type:DataTypes.INTEGER
    },
    ResultType:{
        type:DataTypes.STRING
    },
    PullVouchers:{
        type:DataTypes.JSON,
        defaultValue:[]
    },
    Notification: {
        type: DataTypes.JSON,
        defaultValue: { "sms": false, "mail": false, "whatsapp": true }
    },
    ErrorCode:{
        type:DataTypes.STRING
    },
    ErrorMessage:{
        type:DataTypes.STRING
    },
    Message:{
        type:DataTypes.STRING
    },
    status:{
        type:DataTypes.ENUM,
        values:['Pending','Completed','Expired','Rejected'],
        defaultValue:'Pending'
    },
    endDateOfApprovedVouchers:{
        type:DataTypes.STRING
    },
    resendNotification:{
        type:DataTypes.JSON,
        defaultValue:{count:0,attemptAt:DataTypes.DATE}
    },
    selectedTheme:{
        type:DataTypes.STRING
    },
    voucherType:{
        type:DataTypes.ENUM,
        values:['Woohoo','Vouchagram']
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