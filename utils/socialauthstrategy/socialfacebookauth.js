import dotenv from 'dotenv';
import passport from 'passport';
import passportFacebook from 'passport-facebook';
import { Seller, SellerInfo, SellerShippingAddress } from '../../src/models/Seller';
import generateSalt from "../constant/generateSalt";
import generateRandomPassword from "../constant/generatePassword";
import generateUniqueAccountId from "../constant/generateAccountId";
import bcrypt from "bcryptjs";
import { sendRegistrationMail } from '../mail/mail_message';


export const socialFacebookAuthStrategy = ()=>{

    dotenv.config();
    const FacebookStrategy = passportFacebook.Strategy;
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${process.env.CLIENT_URL}/auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'photos', 'email']
      },
      async function(accessToken, refreshToken, profile, cb) {
        const apiUser = profile._json;
        console.log("Facebook api Wholeseller::>> ",apiUser);
        const seller = await Seller.findOne({
          where:{
              email:apiUser.email
          },
          raw:true
        });
        if(!seller){
          console.log("--New Wholeseller Register through Facebook Sign In--")
          const name = apiUser.name;
          const strName = name.split(" ");
          const number = generateSalt();
          const password = generateRandomPassword();
          const salt = bcrypt.genSaltSync(number);
          const hash = bcrypt.hashSync(password, salt);
          // const id = generateUniqueAccountId();
          const sellerObj = {
            facebookId:apiUser.id,
            provider:'facebook',
            // accountId:id,
            firstName:strName[0],
            lastName:name.substring(strName[0].length+1),
            email:apiUser.email,
            password:hash
          };
          const savedSeller = await Seller.create(sellerObj);
          const sellerInfoObject={
            sellerId:savedSeller.id,
            alternativeContactNo:'',
            preferredContactTime:'',
            dob:'',
            marriageDate:'',
            gstNo:'',
            billingAddress:{},
            agreedToTerms:false,
            createdIstAt:'',
            updatedIstAt:''
        };
        const sellerShippingAddressObj = {
          sellerId:savedSeller.id,
          shippingAddress:{},
          createdIstAt: '',
          updatedIstAt: ''
        };
        const sellerInfo = await SellerInfo.create(sellerInfoObject);
        const sellerShippingAddress = await SellerShippingAddress.create(sellerShippingAddressObj);
        sendRegistrationMail(name, apiUser.email, savedSeller.accountId, password);
        return cb(null, savedSeller);
        }
        else{
          console.log("--Wholeseller Already Register through Facebook Sign In--")
          return cb(null, seller);
        }
        // return cb(null, profile);
      }
    ));

    // passport.serializeUser((user, done)=>{
    //     done(null, user);
    // });
    
    // passport.deserializeUser((user, done)=>{
    //     done(null, user);
    // });

}
