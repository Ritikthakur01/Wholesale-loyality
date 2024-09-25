import { DataTypes, INTEGER, STRING } from "sequelize";
import sequelize from "../../utils/db/dbConnection";
import { Seller } from "./Seller";

export const CouponBatch = sequelize.define("couponbatch",{
    productName:{
        type:DataTypes.STRING
    },
    productSku:{
        type:DataTypes.STRING
    },
    description:{
        type:DataTypes.STRING
    },
    rewardPoint:{
        type:DataTypes.INTEGER
    },
    serialNo:{
        type:DataTypes.STRING
    },
    noOfCoupon:{
        type:DataTypes.INTEGER
    },
    startDate:{
        type:DataTypes.DATE,
    },
    endDate:{
        type:DataTypes.DATE,
    },
    startTime:{
        type:DataTypes.STRING
    },
    endTime:{
        type:DataTypes.STRING
    },
    generated:{
        type: DataTypes.ENUM,
        values:["Pending", "Success"],
        defaultValue:'Pending'
    },
    remarks:{
        type: DataTypes.ENUM,
        values:["Code by DS Group", "Code by Backend"],
        defaultValue:'Code by Backend'
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

export const CouponCode = sequelize.define("couponcode",{
    couponBatchId:{
        type: DataTypes.INTEGER,
        references:{
            model:CouponBatch,
            key:'id'
        },
        onUpdate:'CASCADE',
        onDelete:'CASCADE',
    },
    productName:{
        type:DataTypes.STRING
    },
    productSku:{
        type:DataTypes.STRING
    },
    description:{
        type:DataTypes.STRING
    },
    serialNo:{
        type:DataTypes.STRING,
    },
    code:{
        type:DataTypes.STRING,
    },
    pin:{
        type:DataTypes.STRING
    },
    rewardPoint:{
        type:DataTypes.INTEGER
    },
    qrCode:{
        type:DataTypes.TEXT
    },
    // expiryDays:{
    //     type:DataTypes.INTEGER
    // },
    noOfCoupon:{
        type:DataTypes.INTEGER
    },
    isActive:{
        type: DataTypes.ENUM,
        values:["Active", "Inactive"],
        defaultValue: "Active"
    },
    // timeline:{
    //     type:DataTypes.ENUM,
    //     values:["Date","Days "]
    // },
    startDate:{
        type:DataTypes.DATE,
    },
    endDate:{
        type:DataTypes.DATE,
    },
    startTime:{
        type:DataTypes.STRING
    },
    endTime:{
        type:DataTypes.STRING
    },
    status:{
        type:DataTypes.ENUM,
        values:["Inuse","Used","Expired"],
        defaultValue: "Inuse"
    },
    device:{
        type:DataTypes.JSON,
    },
    sellerId:{
        type: DataTypes.INTEGER,
    },
    email:{
        type: DataTypes.STRING,
    },
    accountId:{
        type: DataTypes.STRING,
    },
    contactNo:{
        type: DataTypes.STRING,
    },
    transactionTime:{
        type : DataTypes.STRING
    },
    remarks:{
        type: DataTypes.ENUM,
        values:["Code by DS Group", "Code by Backend"],
        defaultValue:'Code by Backend'
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
    }
);

export const TempCouponCode = sequelize.define("tempcouponcode",{
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey: true
    },
    serialNo:{
        type:DataTypes.STRING,
        unique: true
    },
    code:{
        type:DataTypes.STRING,
        unique: true
    },
    createdIstAt:{
        type : DataTypes.STRING, 
    },
    updatedIstAt:{
        type : DataTypes.STRING,
    }
    }
);

//Coupon-Setting
export const CouponSetting = sequelize.define("couponsetting",{
    charset:{
        type:DataTypes.ENUM,
        values:["Numbers", "Alphabetic","Alphanumeric"],
        defaultValue:"Alphanumeric"

    },
    pattern:{
        type:DataTypes.STRING
    },
    length:{
        type:DataTypes.INTEGER
    },
    prefix:{
        type:DataTypes.TEXT
    },
    postfix:{
        type:DataTypes.STRING
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
    }
); 

// usedDevice:{
//     browserName,
//     operatingSystem,
//     device
// }