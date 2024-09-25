import passport from "passport";
import passportGoogleOauth20 from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { Seller, SellerInfo, SellerShippingAddress } from "../../src/models/Seller";
import generateSalt from "../constant/generateSalt";
import generateRandomPassword from "../constant/generatePassword";
import generateUniqueAccountId from "../constant/generateAccountId";
import bcrypt from "bcryptjs";
import { sendRegistrationMail } from "../mail/mail_message";

export const socialGoogleAuthStrategy = ()=>{

    dotenv.config();
    const GoogleStrategy = passportGoogleOauth20.Strategy;
    passport.use(new GoogleStrategy({
        clientID:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.CLIENT_URL}/auth/google/callback`,
        passReqToCallback   : true
      },
      async function(request, accessToken, refreshToken, profile, done) {
        const apiUser = profile._json;
        console.log("Google api Wholeseller::>> ",apiUser);
        const seller = await Seller.findOne({
          where:{
              email:apiUser.email
          },
          raw:true
        });

        if(!seller){
          console.log("--New Wholeseller Register through Google Sign In--")
          const number = generateSalt();
          const password = generateRandomPassword();
          const salt = bcrypt.genSaltSync(number);
          const hash = bcrypt.hashSync(password, salt);
          // const id = generateUniqueAccountId();
          const sellerObj = {
            googleId:apiUser.sub,
            provider:'google',
            // accountId:id,
            firstName:apiUser.given_name,
            lastName:apiUser.family_name,
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
        sendRegistrationMail(apiUser.name, apiUser.email, savedSeller.accountId, password)

        return done(null, savedSeller);
        }
        else{

          console.log("--Wholeseller Already Register through Google Sign In--")
          return done(null, seller);
        }
        //done(null, profile);
      }
    ));
    
    // passport.serializeUser((user, done)=>{
    //     done(null, user);
    // });
    
    // passport.deserializeUser((user, done)=>{
    //     done(null, user);
    // });
}
