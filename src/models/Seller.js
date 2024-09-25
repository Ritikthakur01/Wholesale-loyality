import { DataTypes, INTEGER, Sequelize } from "sequelize";
import sequelize from "../../utils/db/dbConnection";
import { Transaction } from "./Transaction";
import DateTime from "../../utils/constant/getDate&Time";

export const Seller = sequelize.define("seller",{
    id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    accountId:{
        type:DataTypes.STRING,
        unique:true
    },
    googleId:{
        type:DataTypes.STRING
    },
    facebookId:{
        type:DataTypes.STRING
    },  
    provider:{
        type:DataTypes.ENUM,
        values:["google", "facebook", "itself"],
        defaultValue:"itself"
    }, 
    firstName: {
        type: DataTypes.STRING,
    },
    lastName:{
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
        // unique:true
    },
    contactNo:{
        type: DataTypes.STRING,
        allowNull: true,
        unique:true
    },
    roles:{
        type: DataTypes.ENUM,
        values:["user","wholeseller","superadmin","admin"],
        defaultValue: "wholeseller"
    }, 
    password: {
      type: DataTypes.TEXT,
    },
    otp:{
        type: DataTypes.STRING,
    },
    otpTimeStampAt:{
        type:DataTypes.DATE
    },
    loginAttempts:{
        type:DataTypes.JSON,
        defaultValue:{count:0,attemptAt:DataTypes.DATE}
    },
    otpLoginAttempts:{
        type:DataTypes.JSON,
        defaultValue:{count:0,attemptAt:DataTypes.DATE}
    },
    verified:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    },
    notificationPreference:{
        type:DataTypes.JSON,
    },
    bizomId:{
        type:DataTypes.STRING 
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
//for adding accountId
Seller.addHook('beforeCreate', async(user, options)=>{
    const lastSeller = await Seller.findOne({
        attributes:['accountId'],
        order:[
            ['id','DESC']
        ],
        limit:1,
        raw:true
    })
    // console.log("Last Seller ::>>", lastSeller);
    let accountId = !lastSeller ? 1 : Number(lastSeller.accountId.substring(3))+1;
    accountId = accountId.toString().padStart(7,'0');
    user.accountId = `RWC${accountId}`;
});

export const SellerInfo = sequelize.define("sellerinfo",{
    sellerId:{
        type:DataTypes.INTEGER,
        references:{
            model: Seller,
            key:'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    memberShipId:{
        type:DataTypes.STRING
    },
    membershipLevel:{
    type:DataTypes.ENUM,
        values:["Welcome", "Blue", "Silver", "Gold"],
        defaultValue:"Welcome"
    //     values:["Bronze", "Silver", "Gold", "Platinum"],
    //     defaultValue:"Bronze"
    },
    // membershipCycle:{
    //     type:DataTypes.INTEGER,
    //     defaultValue:1
    // },
    // track:{
    //     type:DataTypes.JSON,
    //     defaultValue:[]
    // },
    tierEntryDate:{
        type : DataTypes.DATE
    },
    // tierExpiryDate:{
    //     type : DataTypes.DATE
    // },
    activities :{
        type:DataTypes.JSON,
        defaultValue:{}
    },
    gender:{
        type:DataTypes.ENUM,
        values:["male", "female"]
    },
    totalPoints:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    availablePoints:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    earnedPoints:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    finacialPoints:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    contactNo:{
        type: DataTypes.STRING,
        allowNull: true,
        unique:true
    },
    preferredContactTime : {
        type: DataTypes.STRING,
    },
    dob:{
        type: DataTypes.STRING,
    },
    dobPointStatus:{
        type : DataTypes.ENUM,
        values:['Give', 'Deduct', 'Used']
    },
    marriageDate:{
        type: DataTypes.STRING,
    },
    gstNo:{
        type: DataTypes.STRING,
    },
    billingAddress:{
        type:DataTypes.JSON,
        defaultValue:{}
    },
    agreedToTerms:{
        type:DataTypes.BOOLEAN
    },
    otp:{
        type:DataTypes.STRING
    },
    otpTimeStampAt:{
        type:DataTypes.DATE
    },
    verified:{
        type:DataTypes.ENUM,
        values:["verified","unverified",""],
        defaultValue:""
    },
    activityStatus:{
        type:DataTypes.ENUM,
        values:['Fullfilled','NotFullfilled'],
        defaultValue:'Fullfilled'
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

export const SellerMembershipTrack = sequelize.define("sellermembershiptrack",{
    sellerId:{
        type:DataTypes.INTEGER,
        references:{
            model: Seller,
            key:'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    memberShipId:{
        type:DataTypes.STRING
    },
    membershipLevel:{
        type:DataTypes.ENUM,
        values:["Welcome", "Blue", "Silver", "Gold"],
        defaultValue:"Welcome"
    },
    membershipStatus:{
        type:DataTypes.ENUM,
        values:["UPGRADE", "DOWNGRADE", "SAMEGRADE"]
    },
    tierEntryDate:{
        type : DataTypes.DATE
    },
    totalPoints:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    availablePoints:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    earnedPoints:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    finacialPoints:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    isProfileUpdate:{
        type:DataTypes.BOOLEAN
    },
    isFeedback:{
        type:DataTypes.BOOLEAN
    },
    profilePoints:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    feedbackPoints:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    bonusPoints:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    tierBenefitsPoints:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    birthdayPoints:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    throughoutTheYearPoints:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    updateByStaff:{
        type : DataTypes.STRING
    },
    createdIstAt:{
        type : DataTypes.STRING, 
        defaultValue : DateTime()
    },
    updatedIstAt:{
        type : DataTypes.STRING,
        defaultValue : DateTime()
    }
});

export const SellerGracePeriodRecord = sequelize.define("sellergraceperiodrecord",{
    sellerId:{
        type:DataTypes.INTEGER,
        references:{
            model: Seller,
            key:'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    accountId:{
        type:DataTypes.STRING
    },
    contactNo:{
        type:DataTypes.STRING
    },
    memberShipId:{
        type:DataTypes.STRING
    },
    membershipLevel:{
        type:DataTypes.ENUM,
        values:["Welcome", "Blue", "Silver", "Gold"],
    },
    moveToTier:{
        type:DataTypes.ENUM,
        values:["Welcome", "Blue", "Silver", "Gold"],
    },
    deductPoints:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    actionOnDate:{
        type:DataTypes.DATE,
    },
    activityStatus:{
        type:DataTypes.ENUM,
        values:['Fullfilled','NotFullfilled','Downgraded'],
        defaultValue:'NotFullfilled'
    },
    gracePeriodFor:{
        type:DataTypes.ENUM,
        values:['Membership'],
    },
    message:{
        type:DataTypes.STRING
    },
    updateByStaff:{
        type : DataTypes.STRING
    },
    createdIstAt:{
        type : DataTypes.STRING, 
        defaultValue : DateTime()
    },
    updatedIstAt:{
        type : DataTypes.STRING,
        defaultValue : DateTime()
    }
});

export const SellerGracePeriodPointRecord = sequelize.define("sellergraceperiodpointrecord",{
    sellerId:{
        type:DataTypes.INTEGER,
        references:{
            model: Seller,
            key:'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    accountId:{
        type:DataTypes.STRING
    },
    contactNo:{
        type:DataTypes.STRING
    },
    membershipLevel:{
        type:DataTypes.ENUM,
        values:["Welcome", "Blue", "Silver", "Gold"],
    },
    transactionId:{
        type:DataTypes.STRING
    },
    points:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    deductPoints:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    actionOnDate:{
        type:DataTypes.DATE,
    },
    activityStatus:{
        type:DataTypes.ENUM,
        values:['Fullfilled','NotFullfilled','Expired'],
        defaultValue:'NotFullfilled'
    },
    gracePeriodFor:{
        type:DataTypes.ENUM,
        values:['Points'],
        defaultValue:'Points'
    },
    message:{
        type:DataTypes.STRING
    },
    updateByStaff:{
        type : DataTypes.STRING
    },
    createdIstAt:{
        type : DataTypes.STRING, 
        defaultValue : DateTime()
    },
    updatedIstAt:{
        type : DataTypes.STRING,
        defaultValue : DateTime()
    }
});

// activities = {
//     Reedemption : true,
//     Earned : true,
//     Feedback : true,
//     Purchase : true,
//     ProfileUpdate : true
// }

export const SellerShippingAddress = sequelize.define("sellershippingaddress",{
    sellerId:{
        type:DataTypes.INTEGER,
        references:{
            model: Seller,
            key:'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    shippingAddress:{
        type:DataTypes.JSON,
        defaultValue:{}
    },
    isDefault:{
        type:DataTypes.BOOLEAN,
        defaultValue: false
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

export const SellerLoggingHistory = sequelize.define("sellerLoggingHistory",{
    sellerId:{
        type:DataTypes.INTEGER,
        references:{
            model: Seller,
            key:'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    browserName:{
        type:DataTypes.STRING,
    },
    operatingSystem:{
       type:DataTypes.STRING 
    },
    device:{
        type:DataTypes.STRING
    },
    createdIstAt:{
        type : DataTypes.STRING, 
    },
    updatedIstAt:{
        type : DataTypes.STRING,
    }
}); 

export const PreviousSeller = sequelize.define("previousseller",{
    bizomId:{
        type:DataTypes.STRING 
    },
    shopName:{
       type:DataTypes.STRING 
    },
    name:{
        type:DataTypes.STRING,
    },
    email:{
        type:DataTypes.STRING 
    },
    mobileNumber:{
        type:DataTypes.STRING
    },
    location:{
        type:DataTypes.STRING
    },
    state:{
        type:DataTypes.STRING
    },
    pinCode:{
        type:DataTypes.STRING
    },
    address:{
        type:DataTypes.STRING
    },
    dob:{
        type:DataTypes.STRING
    },
    marriageDate:{
        type:DataTypes.STRING
    },
    createdIstAt:{
        type : DataTypes.STRING, 
        defaultValue:DateTime()
    },
    updatedIstAt:{
        type : DataTypes.STRING,
        defaultValue:DateTime()
    }
}); 

Seller.hasMany(Transaction);
Transaction.belongsTo(Seller);

// notificationPreference:{
//     mail:true, 
//     smsAndWhatsapp:true
// }

//formate of  address for billing or shipping
    // addressLine1:{
    //     type: DataTypes.STRING,
    // },
    // addressLine2:{
    //     type: DataTypes.STRING,
    // },
    // city:{
    //     type: DataTypes.STRING,
    // },
    // pinCode:{
    //     type: DataTypes.STRING,
    // },
    // state:{
    //     type: DataTypes.STRING,
    // }

//track[
//   {
    // membershipLevel:String,
    // totalPoints:INTEGER,
    // tierEntryDate:String
    // isProfileUpdate : boolean
    // isFeedback : boolean
//   }
// ]