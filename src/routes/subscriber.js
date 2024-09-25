import * as Subscriber from "../controllers/subscribeController";
import express from 'express';
import { verfiyAdmin, verifyToken } from "../../utils/verifyToken";

const Router = express();

Router.post('/doSubscribe', Subscriber.makeSubscribe);
Router.post('/getAllSubscriber', verifyToken, verfiyAdmin, Subscriber.getAllSubscriber);
Router.post('/sendNotifiyToAllSubscribers', verifyToken, verfiyAdmin, Subscriber.SendNotificationToAllSubscriber);

export default Router;