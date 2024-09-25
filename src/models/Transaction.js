import { DataTypes, INTEGER, STRING } from "sequelize";
import sequelize from "../../utils/db/dbConnection";
import { Seller } from "./Seller";

export const Transaction = sequelize.define("transaction", {
    transactionId:{
        type:DataTypes.STRING,
        unique:true
    },
    sellerId:{
        type:DataTypes.INTEGER,
        references:{
            model: Seller,
            key:'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    ExternalOrderId:{
        type:DataTypes.STRING
    },
    transactionCategory:{
        type:DataTypes.ENUM,
        values:['VoucherRedeem',
                'MerchandiseRedeem',
                'CouponRedeem',
                'DSProductRedeem',
                'ProfileUpdate', 
                'WelcomeBonus', 
                'WelcomeBonusPoints','BlueBonusPoints','SilverBonusPoints','GoldBonusPoints',
                'WelcomeTierBenefits','BlueTierBenefits','SilverTierBenefits','GoldTierBenefits',
                'WelcomeThroughoutYear','BlueThroughoutYear','SilverThroughoutYear','GoldThroughoutYear',
                'RegisterCoupon',
                'BirthdayPoint'
            ]
    },
    couponId:{
        type:DataTypes.INTEGER,
    },
    serialNo:{
        type:DataTypes.STRING
    },
    code:{
        type:DataTypes.STRING
    },
    voucherTransaction:{
        type:DataTypes.JSON,
        defaultValue:{}
    },
    sellerMerchandiseId:{
        type:DataTypes.INTEGER
    },
    merchandiseTransaction:{
        type:DataTypes.JSON,
        defaultValue:{}
    },
    dsProductTransaction:{
        type:DataTypes.JSON,
        defaultValue:{}
    },
    points:{
        type:DataTypes.INTEGER
    },
    amount:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    status:{
        type:DataTypes.ENUM,
        values:['Earn', 'Redeem', 'Refund', 'Hold', 'Release']
    },
    brandImageUrl:{
        type : DataTypes.STRING, 
    },
    transactionThrough: {
        type: DataTypes.ENUM,
        values: ['System', 'Zillion'],
        defaultValue: 'System'
    },
    // transactionStatus:{
    //     type:DataTypes.ENUM,
    //     values:['Pending','Completed','Failed']
    // },
    createdIstAt:{
        type : DataTypes.STRING, 
    },
    updatedIstAt:{
        type : DataTypes.STRING,
    }
}); 

//voucherTransaction:
// {
    // sellerVoucherId:{
    //     type:DataTypes.INTEGER
    // },
//     ExternalOrderId:{
//         type:DataTypes.STRING
//     },
//     BrandProductCode:{
//         type:DataTypes.STRING,
//     },
//     Denomination:{
//         type:DataTypes.INTEGER
//     },
//     Quantity:{
//         type:DataTypes.INTEGER
//     },
// }

//merchandiseTransaction
// {

// }

// dsProductTransaction{
    // array of products redeem
    // {
    //     "orderId": "2b1385ede639f105ceba", 
    //     "redeemProducts": [
    //         {
    //             "pId": "6e5e2c45-a8ab-45a3-829f-063243158abb", 
    //             "sku": "SQAS1132", 
    //             "coins": 300, 
    //             "quantity": "1", 
    //             "productId": 11, 
    //             "productName": "Catch Red Chilli Powder", 
    //             "productImage": "https://50be-2405-201-4019-619b-bca4-469a-af7a-4c7a.ngrok-free.app/dsProduct/product/product17-1714562419702.webp", 
    //             "usedCoinsPerProduct": 300
    //         }
    //     ]
    // }
// }
