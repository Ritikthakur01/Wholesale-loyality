import { createError } from "../../utils/error";
import { subscriberNotificationMail } from "../../utils/mail/mail_message";
import { Subscriber } from "../models/Subscriber";

export const makeSubscribe = async(req, res, next)=>{
    try {
        let { email } = req.body;
        if(!email){
            return next(createError(403,"Please give gou valid email id"));
        }
        const getSubscriber = await Subscriber.findOne({where:{email},raw:true});
        if(getSubscriber){
            return res.status(200).json({
                error:false,
                message:"You are already subscribed The Rajnigandha Business Club!"
            });
        }
        const subscriber = await Subscriber.create({email});
        return res.status(201).json({
            error:false,
            message:"Thank you for subscribing The Rajnigandha Business Club!",
            data:{subscriberId:subscriber.SubscriberId,
                email:subscriber.email,
            }
        })
    } catch (error) {
        console.log("Get All Subcriber Error ::>>", error);
        next(error);
    }
}

export const getAllSubscriber = async(req, res, next)=>{
    try {
        // let { page, limit } = req.body;
        // page = page || 1;
        // limit = limit || 10;
        // const offset = limit * (page-1);
        const subscribers = await Subscriber.findAll({
            // limit,
            // offset,
            raw:true
        });
        // const totalSubscribers = await Subscriber.count()
        return res.status(200).json({
            error:false,
            message:"Get all the Subscribers Successfully",
            totalSubscriberInAPage:subscribers.length,
            // totalSubscribers,
            data:subscribers
        })
    } catch (error) {
        console.log("Get All Subcriber Error ::>>", error);
        next(error);
    }
}

export const SendNotificationToAllSubscriber = async(req, res, next)=>{
    try { 
        let { content, subscribers, select } = req.body;
        if(!content){
            return next(createError(403, 'Please provide the description content'));
        }
        if(!select){
            return next(createError(403, 'Please provide the sellers selection'));
        }
        if(select!=='All' && !Array.isArray(subscribers) || subscribers.length===0){
            return next(createError(403, 'Please provide the Seller list'))
        }
        if(select==='All'){
            subscribers = await Subscriber.findAll({attributes:['email']});
        }
        subscribers.map(async (subscriber)=>{
            await subscriberNotificationMail("", subscriber.email, content);
        })
        return res.status(200).json({
            error:false,
            message:"Send notification to all the Subscribers Successfully",
            data:subscribers
        })
    } catch (error) {
        console.log("Send to all the Subscribers Error ::>>", error);
        next(error);
    }
}