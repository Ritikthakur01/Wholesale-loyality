import JWT from 'jsonwebtoken';
import { createError } from './error';

export const verifyToken = async(req, res, next)=>{

    const token = req.header("x-access-token");
    if(!token){
        return next(createError(401,"your are not authenticated!"))
    }
    JWT.verify(token, process.env.JWT_SECRET_KEY, (err, user)=>{
        if(err){
            return next(createError(403, "Token is not valid!"))
        }
        // console.log("14 user::>> ",user);
        req.user = user;
        next();
    });
}

export const verfiyWholeSeller = async(req, res, next)=>{
    const {sellerId} = req.body;
    // console.log("user id ::>> ",id)
    if(req.user.id===sellerId && req.user.role==="wholeseller"){
        next();
    }
    else{
        return next(createError(403, "You are not a authorised user!"))
    }
}

export const verfiyAdmin = async(req, res, next)=>{
    if(req.user.role==="superadmin" || req.user.role==="admin"){
        next();
    }
    else{
        return next(createError(403, "You are not a authorised user!"))
    }
}

export const verifyZillionToken = async(req, res, next)=>{

    const token = req.header("x-access-token");
    // const token1 = req.header('authorization').split(' ')[1];
    if(!token){
        return next(createError(401,"your are not authenticated!"))
    }
    JWT.verify(token, process.env.ZILLION_JWT_SECRET_KEY, (err, user)=>{
        if(err){
            return next(createError(403, "Token is not valid!"))
        }
        // console.log("14 user::>> ",user);
        req.zUser = user;
        next();
    });
}

export const verifyCronToken = async(req, res, next)=>{
    const { username, password } = req.query;
    if(!username || !password){
        return next(createError(401,"your are not authenticated!"))
    }
    const CRON_USERNAME = process.env.CRON_USERNAME;
    const CRON_PASSWORD = process.env.CRON_PASSWORD;
    if(username!==CRON_USERNAME || password!==CRON_PASSWORD){
        return next(createError(403,'you are not authorised!'))
    }
    next();
}
