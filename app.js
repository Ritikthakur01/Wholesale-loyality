import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bp from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import sequelize from './utils/db/dbConnection'; // for db connection
import { socialGoogleAuthStrategy } from './utils/socialauthstrategy/socialgoogleauth.js';
import { socialFacebookAuthStrategy } from './utils/socialauthstrategy/socialfacebookauth.js';
// import modelRouter from './utils/db/modelSync.js'; // for alter tables
import { cronJobForSellerPointsNotify, myCronJob, wishCronJob } from './utils/crons/cronJob.js';
import helmet from 'helmet';
import expectCt from 'expect-ct';
import { Logger } from './src/models/Logger.js';
import './utils/logs.js';
import mainRouter from './src/routes/mainRoute.js';
import path from 'path';
import morgan from 'morgan';
import DateTime from './utils/constant/getDate&Time.js';


const app = express();
dotenv.config();

app.use(express.json());
app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());
app.use(cookieParser());
app.use(express.static('../assests/images'));
// app.use(express.static('./src/assests/images'));

morgan.token('date', (req, res, tz) => {
  return DateTime();
});

app.use(morgan(':date[iso] :method :url :status :res[content-length] - :response-time ms'));

app.use(
  expectCt({
    enforce: true,
    maxAge: 60 * 60 * 24 * 365
  })
);

var corsOptions = {
  origin: ['http://10.1.20.183:8091', 
    'http://localhost:8091', 'http://10.1.20.184:8091', 'https://business.rajnigandha.com', 
    'http://localhost:62820', 'http://staging.rajnigandhabiz.com:8091', 'https://dev-dsgrp-store.kellton.net'],
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

app.use(helmet());

// Set security headers using Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
    }
  },
  crossOriginEmbedderPolicy: { policy: 'require-corp' },
  expectCt: {
    enforce: true,
    maxAge: 60 * 60 * 24 * 365
  },
  frameguard: { action: 'deny' },
  hsts: {
    maxAge: 60 * 60 * 24 * 365,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'no-referrer-when-downgrade' },
  xssFilter: { setOnOldIE: true }
}));

// Start the cron job
myCronJob.start();
wishCronJob.start();
cronJobForSellerPointsNotify.start();


socialFacebookAuthStrategy();
socialGoogleAuthStrategy();
const PORT = process.env.PORT || 8090;
const ENVIORNMENT = process.env.ENVIORNMENT || 'dev';

// for checking
app.get('/', async(req, res, next)=>{
  return res.status(200).send(`Server is running at Port`);
  //return res.status(200).redirect('https://business.rajnigandha.com/');
});

//for checking Social media logins local
// app.get('/', (req, res)=>{
//     res.send(`<h2>Login through google</h2><h5><a href='http://localhost:8000/auth/google'>Login through google</a></h5><br/>
//               <h2>Login through facebook</h2><h5><a href='http://localhost:8000/auth/facebook'>Login through facebook</a></h5>`);
// })

//for checking Social media logins server
// app.get('/', (req, res)=>{
//     res.send(`<h2>Login through google</h2><h5><a href='https://wholesaleloyality-57350bab077c.herokuapp.com/auth/google'>Login through google</a></h5><br/>
//               <h2>Login through facebook</h2><h5><a href='https://wholesaleloyality-57350bab077c.herokuapp.com/auth/facebook'>Login through facebook</a></h5>`);
// })

app.use(session({
  secret: process.env.COOKIE_SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

//routers

// app.get('/', (req, res, next)=>{
//   const helmetHeaders = res.getHeaders(); 
//   return res.status(200).json({
//       error: false,
//       message: "All Headers are fetched Successfully...!",
//       allHeaders : helmetHeaders
//   });
// });

app.use(mainRouter);

app.use(async(error, req, res, next) => {
  const errorStatus = error.status || 500;
  const errorMessage = error.message || "Something went wrong on Server::";
  let account = {};
  if(req.user){
    if(req?.user?.role==='wholeseller'){
      account.name = req.user.data.firstName +" "+req.user.data.lastName;
    }
    else{
      account.name = req.user.data.name;
    }
    account.email = req.user.data.email,
    account.contactNo = req.user.data.contactNo
  }
  await Logger.create({
    requestedPath:req.originalUrl,
    requestedBody:req.body,
    account,
    status:errorStatus,
    message:errorMessage,
    stack:error.stack,
    createdIstAt:DateTime(),
    updatedIstAt:DateTime()
  });
  let responseObj = {
    error: true,
    success: false,
    status: errorStatus,
    message: errorMessage,
  };
  if(ENVIORNMENT==='dev'){
    responseObj.stack = error.stack;
  }
  return res.status(errorStatus).json(responseObj);
});

app.get("/.well-known/pki-validation/813A24CE46AC22CA4B8F7079FBD7F3FE.txt", (req, res) => {
  return res.sendFile(path.join(__dirname, './813A24CE46AC22CA4B8F7079FBD7F3FE.txt'))
});


app.listen(PORT, () => {
  console.log(`|---:Server is Running at Port : ${PORT}:---|`);
});
