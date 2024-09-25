import { Router } from "express";
import { PreviousSeller, Seller, SellerGracePeriodPointRecord, SellerGracePeriodRecord, SellerInfo, SellerMembershipTrack, SellerShippingAddress} from "../../src/models/Seller";
import { CouponBatch, CouponCode, CouponDef, CouponSetting } from "../../src/models/Coupon";
import { Module } from "../../src/models/Module";
import { Role } from "../../src/models/Role";
import { Permission } from "../../src/models/Permission";
import { Staff } from "../../src/models/Staff";
import { Product } from "../../src/models/Produt";
import { Transaction } from "../../src/models/Transaction";
import { PinCode } from "../../src/models/Pincode";
import { NewPage } from "../../src/models/pages";
import { ContactVerify } from "../../src/models/ContactVerify";
import { SellerLoggingHistory } from "../../src/models/Seller";
import { FaqQuesAns, FaqTitle } from "../../src/models/faq";
import { Images } from "../../src/models/Images";
import { TVC } from "../../src/models/TVC";
import { VoucherBrands } from "../../src/models/VoucherBrands";
import { SellerVouchers } from "../../src/models/SellerVouchers";
import { Membership } from "../../src/models/Membership";
import { CardImage } from "../../src/models/Card";
import { Notification } from "../../src/models/Notification";
import { Category } from "../../src/models/Category";
import { DSProduct } from "../../src/models/DSProduct";
import { Cart } from "../../src/models/Cart";
import { Wishlist } from "../../src/models/Wishlist";
import { WoohooAuth } from "../../src/models/WoohooAuth";
import { SellerProducts } from "../../src/models/SellerProducts";
import { Logger } from "../../src/models/Logger";
import { Subscriber } from "../../src/models/Subscriber";
import { ContactQuery } from "../../src/models/ContactUsQuery";
import { QueryStaff } from "../../src/models/QueryStaff";
import { AuthorizationCode } from "../../src/models/AuthorizationCode";
import { Order } from "../../src/models/Order"
// import { Product } from "../../src/models/Produt";
import { DSProductTag } from "../../src/models/ProductTag";
import { TransactionLog } from "../../src/models/TransactionLog";


const modelRouter = Router();

//seller
Seller.sync({ alter: true }).then(() => {
  console.log('Update Seller table successfully!');
}).catch((error) => {
  console.error('Unable to Update Seller table : ', error);
});

//Coupon
CouponBatch.sync({ alter: true }).then(() => {
  console.log('Update Coupon-Batch table successfully!');
}).catch((error) => {
  console.error('Unable to Update Coupon-Batch table : ', error);
});

FaqTitle.sync({ alter: true }).then(() => {
  console.log('Update Faq Title table successfully!');
}).catch((error) => {
  console.error('Unable to Faq Title table : ', error);
});

//role
Role.sync({ alter: true }).then(() => {
  console.log('Update Role table successfully!');
}).catch((error) => {
  console.error('Unable to Update Role table : ', error);
});

//Contact verify
ContactVerify.sync({ alter: true }).then(() => {
  console.log('Update Contact Verify table successfully!');
}).catch((error) => {
  console.error('Unable to Contact Verify table : ', error);
});


//coupon-setting
CouponSetting.sync({ alter: true }).then(() => {
  console.log('Update Coupon-Code table successfully!');
}).catch((error) => {
  console.error('Unable to Update CouponSetting table : ', error);
});

PinCode.sync({ alter: true }).then(() => {
  console.log('Update Pin-Code table successfully!');
}).catch((error) => {
  console.error('Unable to Update Pin-Code table : ', error);
});

//staff
Staff.sync({ alter: true }).then(() => {
  console.log('Update Staff table successfully!');
}).catch((error) => {
  console.error('Unable to Update Staff table : ', error);
});

//product
Product.sync({ alter: true }).then(() => {
  console.log('Update Product table successfully!');
}).catch((error) => {
  console.error('Unable to Product table : ', error);
});

//New Page
NewPage.sync({ alter: true }).then(() => {
  console.log('Update New Page table successfully!');
}).catch((error) => {
  console.error('Unable to New Page table : ', error);
});

SellerInfo.sync({ alter: true }).then(() => {
  console.log('Update Seller-Info table successfully!');
}).catch((error) => {
  console.error('Unable to Update Seller-Info table : ', error);
});

SellerShippingAddress.sync({ alter: true }).then(() => {
  console.log('Update Seller-Shipping-Address table successfully!');
}).catch((error) => {
  console.error('Unable to Update Seller-Shipping-Address table : ', error);
});

//transaction
Transaction.sync({ alter: true }).then(() => {
  console.log('Update Transaction table successfully!');
}).catch((error) => {
  console.error('Unable to Transaction table : ', error);
}); 


CouponCode.sync({ alter: true }).then(() => {
  console.log('Update Coupon-Code table successfully!');
}).catch((error) => {
  console.error('Unable to Update Coupon-Code table : ', error);
});


//module
// Module.sync({ alter: true }).then(() => {
//   console.log('Update Module table successfully!');
// }).catch((error) => {
//   console.error('Unable to Update Module table : ', error);
// });

//SellerLoggingHistory verify
SellerLoggingHistory.sync({ alter: true }).then(() => {
  console.log('Update Seller Logging History table successfully!');
}).catch((error) => {
  console.error('Unable to Seller Logging History table : ', error);
});

//permission
Permission.sync({ alter: true }).then(() => {
  console.log('Update Permission table successfully!');
}).catch((error) => {
  console.error('Unable to Update Permission table : ', error);
});

//faq

FaqQuesAns.sync({ alter: true }).then(() => {
  console.log('Update Faq Ques/Ans table successfully!');
}).catch((error) => {
  console.error('Unable to Faq Ques/Ans table : ', error);
});

//Image
Images.sync({ alter: true }).then(() => {
  console.log('Update Images table successfully!');
}).catch((error) => {
  console.error('Unable to Images table : ', error);
});

//TVC
TVC.sync({ alter: true }).then(() => {
  console.log('Update TVC table successfully!');
}).catch((error) => {
  console.error('Unable to TVC table : ', error);
});

//VoucherBrands
VoucherBrands.sync({ alter: true }).then(() => {
  console.log('Update Voucher brands table successfully!');
}).catch((error) => {
  console.error('Unable to Voucher brands table : ', error);
});

//SellerVouchers
SellerVouchers.sync({ alter: true }).then(() => {
  console.log('Update Seller Vouchers table successfully!');
}).catch((error) => {
  console.error('Unable to Seller Vouchers table : ', error);
});

//Membership
Membership.sync({ alter: true }).then(() => {
  console.log('Update Membership table successfully!');
}).catch((error) => {
  console.error('Unable to Membership table : ', error);
});

//card
CardImage.sync({ alter: true }).then(() => {
  console.log('Update CardImage table successfully!');
}).catch((error) => {
  console.error('Unable to CardImage table : ', error);
});

//notification
Notification.sync({ alter: true }).then(() => {
  console.log('Update Notification table successfully!');
}).catch((error) => {
  console.error('Unable to Notification table : ', error);
});

//Category
Category.sync({ alter: true }).then(() => {
  console.log('Update Category table successfully!');
}).catch((error) => {
  console.error('Unable to Category table : ', error);
});

//DS Product
DSProduct.sync({ alter: true }).then(() => {
  console.log('Update DSProduct table successfully!');
}).catch((error) => {
  console.error('Unable to DSProduct table : ', error);
});

//Cart
Cart.sync({ alter: true }).then(() => {
  console.log('Update Cart table successfully!');
}).catch((error) => {
  console.error('Unable to Cart table : ', error);
});

//wishlist
Wishlist.sync({ alter: true }).then(() => {
  console.log('Update Wishlist table successfully!');
}).catch((error) => {
  console.error('Unable to Wishlist table : ', error);
});

//SellerProduts auth
SellerProducts.sync({ alter: true }).then(() => {
  console.log('Update SellerProduts table successfully!');
}).catch((error) => {
  console.error('Unable to SellerProduts table : ', error);
});

//logger
Logger.sync({alter:true}).then(()=>{
  console.log('Update Logger table successfully!');
}).catch((error)=>{
  console.error('Unable to Logger table : ', error);
})

//subscriber
Subscriber.sync({alter:true}).then(()=>{
  console.log('Update Subscriber table successfully!');
}).catch((error)=>{
  console.error('Unable to Subscriber table : ', error);
});

//contact query
ContactQuery.sync({alter:true}).then(()=>{
  console.log('Update Contact Query table successfully!');
}).catch((error)=>{
  console.error('Unable to Contact Query table : ', error);
});

//contact staff
QueryStaff.sync({alter:true}).then(()=>{
  console.log('Update Query Staff table successfully!');
}).catch((error)=>{
  console.error('Unable to Query Staff table : ', error);
});

//previous seller
PreviousSeller.sync({alter:true}).then(()=>{
  console.log('Update Previous Seller table successfully!');
}).catch((error)=>{
  console.error('Unable to Previous Seller table : ', error);
});

//authorization code
AuthorizationCode.sync({alter:true}).then(()=>{
  console.log('Update Authorization Code table successfully!');
}).catch((error)=>{
  console.error('Unable to Authorization Code table : ', error);
});

//authorization code
Order.sync({alter:true}).then(()=>{
  console.log('Update Order Code table successfully!');
}).catch((error)=>{
  console.error('Unable to Order Code table : ', error);
});

//tag code
DSProductTag.sync({alter:true}).then(()=>{
  console.log('Product Tag table successfully!');
}).catch((error)=>{
  console.error('Unable to Product Tag Code table : ', error);
});

//tag code
TransactionLog.sync({alter:true}).then(()=>{
  console.log('Transaction Log Tag table successfully!');
}).catch((error)=>{
  console.error('Unable to Transaction Log Code table : ', error);
});

//seller membership track
SellerMembershipTrack.sync({alter:true}).then(()=>{
  console.log('Seller Membership Track table successfully!');
}).catch((error)=>{
  console.error('Unable to Create Seller Membership Track table : ', error);
});

//seller grace period membership record
SellerGracePeriodRecord.sync({alter:true}).then(()=>{
  console.log('Seller Grace Period Record table successfully!');
}).catch((error)=>{
  console.error('Unable to Create Seller Grace Period Record table : ', error);
});

//seller grace period point record
SellerGracePeriodPointRecord.sync({alter:true}).then(()=>{
  console.log('Seller Grace Period Point Record table successfully!');
}).catch((error)=>{
  console.error('Unable to Create Seller Grace Period Point Record table : ', error);
});




export default modelRouter;