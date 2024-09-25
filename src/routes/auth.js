import express from 'express';
import passport from 'passport';
import { createError } from '../../utils/error.js';
import { adminLogin, forgorPassword, getOTP, login, loginThroughOTP, register } from '../controllers/authController.js';
import JWT from 'jsonwebtoken';
import { verfiyAdmin, verifyToken } from '../../utils/verifyToken.js';
import Query from '../../utils/db/rawQuery.js';
import dotenv from 'dotenv';
dotenv.config();



const router = express.Router();

function isLoggedIn (req, res, next){
    req.user ? next() :res.sendStatus(401);
}
router.post('/login', login);
router.post('/adminLogin', adminLogin);
router.post('/register', register);
router.post('/forgotPassword', forgorPassword);
router.post('/getOtp', getOTP);
router.post('/loginThroughOtp', loginThroughOTP);

/*************start google authentication*****************/

router.get('/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ], prompt: 'select_account' }
));

router.get( '/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/auth/login/success',
        failureRedirect: '/auth/login/failure'
}));

/*************end google authentication*****************/

/*************start facebook authentication*****************/

router.get('/facebook',
  passport.authenticate('facebook', { scope: 'email',authType: 'reauthenticate' }
));

router.get( '/facebook/callback',
    passport.authenticate( 'facebook', {
        successRedirect: '/auth/login/success',
        failureRedirect: '/auth/login/failure'
}));

/*************end facebook authentication*****************/

router.get("/login/success", async(req, res, next) => {

    // console.log("Print req ::>>", req.ser);

    if(req.user){

        const { password, role, ...rest } = req.user;
        //generate jwt token 
        const token = JWT.sign({ id:req.user.id, role:req.user.roles, data:{...rest} }, 
                            process.env.JWT_SECRET_KEY,{ expiresIn: '24h' });
        // console.log("Token ::>>",token);
        // return  res.cookie('accessToken', token, {httpOnly : true, expires : token.expiresIn})
        //            .status(200)
        //            .json({
        //                 error : false,
        //                 message : "Login Successfully...!",
        //                 token,
        //                 data: {...rest},
        //                 role,
        //             });
        // return  res.cookie('accessToken', token, {
        //                                             httpOnly : true, 
        //                                             expires : token.expiresIn,
        //                                         })
        //            .status(200)
        //            .redirect("https://dsgroup-prod.netlify.app/user/home");
        // //add prod url---

        return  res.status(200)
                   .redirect(`${process.env.UI_REDIRECT_URL}/home?token=${token}`);
        //add localhost url
        // return  res.status(200)
        //            .redirect(`http://localhost:8091/home?token=${token}`);
    }
    else return next(createError(403,"Not a authorised user...!")) 
});  

router.get("/login/failure", (req, res, next) => {
    next(createError(401, "Login failure...!"));
});

router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(createError(500, "Error in ,logging out"))
        }});
    req.session.regenerate((err) => {
        if (err) {
            return next(createError(500, "Error in ,logging out"))
        } 
        // else {
        //     return res.clearCookie('connect.sid').redirect('/');
        // }
    });
    return res.clearCookie('connect.sid').status(200).redirect('/');
});

export default router;