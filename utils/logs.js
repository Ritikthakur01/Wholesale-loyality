import winston from "winston";
import DateTime from "./constant/getDate&Time";

const { combine, timestamp, json, prettyPrint, errors} = winston.format;

winston.loggers.add('Home-Service',{
    level: 'error',
    format: combine(
        errors({stack:true}),
        timestamp(),
        json(),
        prettyPrint()
    ),
    transports:[
        new winston.transports.Console(),
        // new winston.transports.File({filename:'./src/assests/logs/Home.log'})
    ],
    defaultMeta:{service:'Home Logs',  timeAt:DateTime()}
});

winston.loggers.add('Seller-Service',{
    level: 'error',
    format: combine(
        errors({stack:true}),
        timestamp(),
        json(),
        prettyPrint()
    ),
    transports:[
        new winston.transports.Console(),
        // new winston.transports.File({filename:'./src/assests/logs/Seller.log'})
    ],
    defaultMeta:{service:'Seller Logs', timeAt:DateTime()}
});

winston.loggers.add('Admin-Service',{
    level: 'error',
    format: combine(
        errors({stack:true}),
        timestamp(),
        json(),
        prettyPrint()
    ),
    transports:[
        new winston.transports.Console(),
        // new winston.transports.File({filename:'./src/assests/logs/Admin.log'})
    ],
    defaultMeta:{service:'Seller Logs', timeAt:DateTime()}
});