import axios from "axios";
import dotenv from 'dotenv';
import { staffForNotify } from "../../src/controllers/queryStaffController";

dotenv.config();

//registration mail content
const RegistrationMailContent = (templateObject) => {
    let templ = `<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        <section id="containt" style="background-color: #ffffff9a;">     
        <div class="text" style="background-color:#1c2257;text-align: center;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem; color: #fff;margin-top: 5px;"><h2>Rajnigandha Business Club</h2></div>
            <div class="text" style="background-color:#deeaf6;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem;margin-top: 5px;">
                <p>Dear <span id="user">${templateObject.name}</span>, <p></p>
                <p style="font-size: 0.95rem;">
                Welcome to our Rajnigandha Business Club!<br>
                Your Account Id : ${templateObject.accountId}<br>
                <br>
                    <br>Thank for your registration.
                </p>        
                <p>
                    Best Regards,<br/>
                    Rajnigandha Business Club
                </p>
                <p>
        
      </p>
            </div>      
        </section>
    </body>
    </html>
  `;
    return templ;
};

//send mail method
export const sendRegistrationMail = async(name, email, accountId, password)=>{
    try {
        const payload = {
            from:{
                email:"info@therclub.co.in",
                name:"The Rajnigandha Business Club"},
                subject:"Registration on Rajnigandha Business Club :: Successfull",
                content:[
                    {
                        type:"html",
                        value:RegistrationMailContent({name, accountId, password})
                    }
                ],
                personalizations:[
                    {
                        to:[
                            {
                                email:email,
                                name:name
                            }
                        ]
                    }
                ]
            };
        // console.log("Payload",payload);
        const response = await axios({
            method: 'POST',
            url: `https://emailapi.netcorecloud.net/v5/mail/send`,
            headers: {
                'content-type': 'application/json',
                'api_key': process.env.NETCORE_MAIL_API_KEY
            },
            data:payload
        });
        // console.log("Result ::>>",response.data);
        return response.data;

    } catch (error) {
        console.log("Registration Mail Error ::>>",error);
    }
};

//OTP Mail Content
const OTPLoginMailContent = (templateObject) => {
    let templ = `<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        <section id="containt" style="background-color: #ffffff9a;">     
        <div class="text" style="background-color:#1c2257;text-align: center;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem; color: #fff;margin-top: 5px;"><h2>Rajnigandha Business Club</h2></div>
            <div class="text" style="background-color:#deeaf6;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem;margin-top: 5px;">
                <p>Dear <span id="user">${templateObject.name}</span>, <p></p>
                <p style="font-size: 0.95rem;">Email : </b><span id ="Soft Skill">${templateObject.email}</span><br><b>Your (OTP) One Time Password :</b> <span id ="Total">${templateObject.otp}</span>
                <br>
                    <br>Thank you.
                </p>        
                <p>
                    Best Regards,<br/>
                    Rajnigandha Business Club
                </p>
                <p>
        
      </p>
            </div>      
        </section>
    </body>
    </html>
  `;
    return templ;
};

//send mail method
export const sendOTPLoginMail = async(name, email, otp)=>{
    try {
        const payload = {
            from:{
                email:"info@therclub.co.in",
                name:"Rajnigandha Business Club"},
                subject:"OTP Login on DS Group",
                content:[
                    {
                        type:"html",
                        value:OTPLoginMailContent({name, email, otp})
                    }
                ],
                personalizations:[
                    {
                        to:[
                            {
                                email:email,
                                name:name
                            }
                        ]
                    }
                ]
            };
        // console.log("Payload",payload);
        const response = await axios({
            method: 'POST',
            url: `https://emailapi.netcorecloud.net/v5/mail/send`,
            headers: {
                'content-type': 'application/json',
                'api_key': process.env.NETCORE_MAIL_API_KEY
            },
            data:payload
        });
        // console.log("Result ::>>",response.data);
        return response.data;

    } catch (error) {
        console.log("OTP Mail Error ::>>",error);
    }
};

//forgot password mail content
const forgotPasswordMailContent = (templateObject) => {
    let templ = `<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        <section id="containt" style="background-color: #ffffff9a;">     
        <div class="text" style="background-color:#1c2257;text-align: center;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem; color: #fff;margin-top: 5px;"><h2>Rajnigandha Business Club</h2></div>
            <div class="text" style="background-color:#deeaf6;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem;margin-top: 5px;">
                <p>Dear <span id="user">${templateObject.name}</span>, <p></p>
                <p style="font-size: 0.95rem;"> Your Password has been changed successfully<span id="Total Skills"> in the Loyalty Program application</span> with credentials.<br><b>Email : </b><span id ="Soft Skill">${templateObject.email}</span><br><b>New Password :</b> <span id ="Total">${templateObject.password}</span>
                <br>
                    <br>Thank You
                </p>        
                <p>
                    Regards,<br/>
                    Rajnigandha Business Club
                </p>
                <p>
        
      </p>
            </div>      
        </section>
    </body>
    </html>
  `;
    return templ;
};

//forgot password mail
export const sendForgettingPasswordMail = async(name, email, password)=>{
    try {
        const payload = {
            from:{
                email:"info@therclub.co.in",
                name:"Rajnigandha Business Club"},
                subject:"Forgot Password on Rajnigandha Business Club",
                content:[
                    {
                        type:"html",
                        value:forgotPasswordMailContent({name, email, password})
                    }
                ],
                personalizations:[
                    {
                        to:[
                            {
                                email:email,
                                name:name
                            }
                        ]
                    }
                ]
            };
        // console.log("Payload",payload);
        const response = await axios({
            method: 'POST',
            url: `https://emailapi.netcorecloud.net/v5/mail/send`,
            headers: {
                'content-type': 'application/json',
                'api_key': process.env.NETCORE_MAIL_API_KEY
            },
            data:payload
        });
        // console.log("Result ::>>",response.data);
        return response.data;

    } catch (error) {
        console.log("Forgot Password Mail Error ::>>",error);
    }
};

//BirthDay wishes
const BirthDayWishMailContent = (templateObject) => {
    let templ = `<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        <section id="containt" style="background-color: #ffffff9a;">     
        <div class="text" style="background-color:#1c2257;text-align: center;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem; color: #fff;margin-top: 5px;"><h2>Rajnigandha Business Club</h2></div>
            <div class="text" style="background-color:#deeaf6;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem;margin-top: 5px;">
                <p>Dear <span id="user">${templateObject.name}</span>, <p></p>
                <p style="font-size: 0.95rem;"> 
                    Wish you many happy returns of the day. May God bless you with health, wealth and prosperity in your life.
                </p>
                <br>Thank you.
                </p>        
                <p>
                    Best Regards,<br/>
                    Rajnigandha Business Club
                </p>
                <p>
        
      </p>
            </div>      
        </section>
    </body>
    </html>
  `;
    return templ;
};

//birthday wishes mail
export const sendBirthDayWishesMail = async(name, email)=>{
    try {
        const payload = {
            from:{
                email:"info@therclub.co.in",
                name:"Rajnigandha Business Club"},
                subject:"Birthday Wishes from DS Group",
                content:[
                    {
                        type:"html",
                        value:BirthDayWishMailContent({name})
                    }
                ],
                personalizations:[
                    {
                        to:[
                            {
                                email:email,
                                name:name
                            }
                        ]
                    }
                ]
            };
        // console.log("Payload",payload);
        const response = await axios({
            method: 'POST',
            url: `https://emailapi.netcorecloud.net/v5/mail/send`,
            headers: {
                'content-type': 'application/json',
                'api_key': process.env.NETCORE_MAIL_API_KEY
            },
            data:payload
        });

        // console.log("Result ::>>",response.data);
        return response.data;

    } catch (error) {
        console.log("Birthday wishes Mail Error ::>>",error);
    }
};

//Anniversary wishes
const AnniversaryWishMailContent = (templateObject) => {
    let templ = `<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        <section id="containt" style="background-color: #ffffff9a;">     
        <div class="text" style="background-color:#1c2257;text-align: center;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem; color: #fff;margin-top: 5px;"><h2>Rajnigandha Business Club</h2></div>
            <div class="text" style="background-color:#deeaf6;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem;margin-top: 5px;">
                <p>Dear <span id="user">${templateObject.name}</span>, <p></p>
                <p style="font-size: 0.95rem;"> 
                    Best Wishes on your Marriage Anniversary.
                </p>
                <br>Thank you.
                </p>        
                <p>
                    Regards,<br/>
                    Rajnigandha Business Club
                </p>
                <p>
        
      </p>
            </div>      
        </section>
    </body>
    </html>
  `;
    return templ;
};

//Anneversary wishes mail
export const sendMarriageWishesMail = async(name, email, password)=>{
    try {
        const payload = {
            from:{
                email:"info@therclub.co.in",
                name:"Rajnigandha Business Club"},
                subject:"Marriage Anniversary Wishes from DS Group",
                content:[
                    {
                        type:"html",
                        value:AnniversaryWishMailContent({name})
                    }
                ],
                personalizations:[
                    {
                        to:[
                            {
                                email:email,
                                name:name
                            }
                        ]
                    }
                ]
            };
        // console.log("Payload",payload);
        const response = await axios({
            method: 'POST',
            url: `https://emailapi.netcorecloud.net/v5/mail/send`,
            headers: {
                'content-type': 'application/json',
                'api_key': process.env.NETCORE_MAIL_API_KEY
            },
            data:payload
        });
        // console.log("Result ::>>",response.data);
        return response.data;

    } catch (error) {
        console.log("Marriage Anniversary wishes Mail Error ::>>",error);
    }
};

//Reward Point updation
const RewardPointUpdateMailContent = (templateObject) => {
    let templ = `<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        <section id="containt" style="background-color: #ffffff9a;">     
        <div class="text" style="background-color:#1c2257;text-align: center;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem; color: #fff;margin-top: 5px;"><h2>Rajnigandha Business Club</h2></div>
            <div class="text" style="background-color:#deeaf6;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem;margin-top: 5px;">
                <p>Dear <span id="user">${templateObject.name}</span>, <p></p>
                <p style="font-size: 0.95rem;"> 
                Thank you for choosing Rajnigandha! Your recent updated reward coins has earned you ${templateObject.getPoints} points, bringing your total to ${templateObject.totalPoints} reward coins. We appreciate your loyalty.
                </p>
                <br>Thank you.
                </p>        
                <p>
                    Best Regards,<br/>
                    Rajnigandha Business Club
                </p>
                <p>
        
      </p>
            </div>      
        </section>
    </body>
    </html>
  `;
    return templ;
};

//Reward point mail
export const RewardPointUpdateMail = async(name, email, getPoints, totalPoints)=>{
    try {
        const payload = {
            from:{
                email:"info@therclub.co.in",
                name:"Rajnigandha Business Club"},
                subject:"Rewards Points Upgrade on DS Group",
                content:[
                    {
                        type:"html",
                        value:RewardPointUpdateMailContent({name, getPoints, totalPoints})
                    }
                ],
                personalizations:[
                    {
                        to:[
                            {
                                email:email,
                                name:name
                            }
                        ]
                    }
                ]
            };
        // console.log("Payload",payload);
        const response = await axios({
            method: 'POST',
            url: `https://emailapi.netcorecloud.net/v5/mail/send`,
            headers: {
                'content-type': 'application/json',
                'api_key': process.env.NETCORE_MAIL_API_KEY
            },
            data:payload
        });
        // console.log("Result ::>>",response.data);
        return response.data;

    } catch (error) {
        console.log("Reward Points update Mail Error ::>>",error);
    }
};

//Membership level updation
const MemeberShiplevelUpdateMailContent = (templateObject) => {
    let templ = `<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        <section id="containt" style="background-color: #ffffff9a;">     
        <div class="text" style="background-color:#1c2257;text-align: center;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem; color: #fff;margin-top: 5px;"><h2>Rajnigandha Business Club</h2></div>
            <div class="text" style="background-color:#deeaf6;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem;margin-top: 5px;">
                <p>Dear <span id="user">${templateObject.name}</span>, <p></p>
                <p style="font-size: 0.95rem;"> 
                Thank you for choosing Rajnigandha! Your recent updated reward coins has earned you ${templateObject.getPoints} points, bringing your total to ${templateObject.totalPoints} reward coins. We appreciate your loyalty.
                </p>
                <br>Thank you.
                </p>        
                <p>
                    Best Regards,<br/>
                    Rajnigandha Business Club
                </p>
                <p>
        
      </p>
            </div>      
        </section>
    </body>
    </html>
  `;
    return templ;
};

//Reward point mail
export const MemeberShiplevelUpdateMail = async(name, email, password)=>{
    try {
        const payload = {
            from:{
                email:"info@therclub.co.in",
                name:"Rajnigandha Business Club"},
                subject:"Rewards Points Upgrade on DS Group",
                content:[
                    {
                        type:"html",
                        value:MemeberShiplevelUpdateMailContent({name, getPoints, totalPoints})
                    }
                ],
                personalizations:[
                    {
                        to:[
                            {
                                email:email,
                                name:name
                            }
                        ]
                    }
                ]
            };
        // console.log("Payload",payload);
        const response = await axios({
            method: 'POST',
            url: `https://emailapi.netcorecloud.net/v5/mail/send`,
            headers: {
                'content-type': 'application/json',
                'api_key': process.env.NETCORE_MAIL_API_KEY
            },
            data:payload
        });
        // console.log("Result ::>>",response.data);
        return response.data;

    } catch (error) {
        console.log("Reward Points update Mail Error ::>>",error);
    }
};

const StaffRegistrationMailContent = (templateObject) => {
    let templ = `<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        <section id="containt" style="background-color: #ffffff9a;">     
        <div class="text" style="background-color:#1c2257;text-align: center;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem; color: #fff;margin-top: 5px;"><h2>Rajnigandha Business Club</h2></div>
            <div class="text" style="background-color:#deeaf6;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem;margin-top: 5px;">
                <p>Dear <span id="user">${templateObject.name}</span>, <p></p>
                <p style="font-size: 0.95rem;">
                Welcome to our Rajnigandha Business Club.<br>
                Admin registration Credentials
                Email : ${templateObject.email}
                Password : ${templateObject.password}
                <br>
                    <br>Thank for your Staff registration.
                </p>        
                <p>
                    Best Regards,<br/>
                    Rajnigandha Business Club
                </p>
                <p>
        
      </p>
            </div>      
        </section>
    </body>
    </html>
  `;
    return templ;
};

export const sendStaffRegistrationMail = async(name, email, password)=>{
    try {
        const payload = {
            from:{
                email:"info@therclub.co.in",
                name:"Rajnigandha Business Club"},
                subject:"Admin Registration on Rajnigandha Business Club :: Successfull",
                content:[
                    {
                        type:"html",
                        value:StaffRegistrationMailContent({name, email, password})
                    }
                ],
                personalizations:[
                    {
                        to:[
                            {
                                email:email,
                                name:name
                            }
                        ]
                    }
                ]
            };
        // console.log("Payload",payload);
        const response = await axios({
            method: 'POST',
            url: `https://emailapi.netcorecloud.net/v5/mail/send`,
            headers: {
                'content-type': 'application/json',
                'api_key': process.env.NETCORE_MAIL_API_KEY
            },
            data:payload
        });
        // console.log("Result ::>>",response.data);
        return response.data;

    } catch (error) {
        console.log("Staff Registration Mail Error ::>>",error);
    }
};

const SendNotificationForPendingVoucherRequestMailContent = (templateObject) => {
    let templ = `<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        <section id="containt" style="background-color: #ffffff9a;">     
        <div class="text" style="background-color:#1c2257;text-align: center;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem; color: #fff;margin-top: 5px;"><h2>Rajnigandha Business Club</h2></div>
            <div class="text" style="background-color:#deeaf6;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem;margin-top: 5px;">
                <p>Dear <span id="user">${'Rajnigandha Business Club'}</span>, <p></p>
                <p style="font-size: 0.95rem;">
                Welcome to our Rajnigandha Business Club.<br>
                ${templateObject.message}
                Account Id: ${templateObject.accountId}
                from : ${templateObject.email}
                contactNo : ${templateObject.contactNo}
                <br>
                    <br>Thank you.
                </p>        
                <p>
                    Best Regards,<br/>
                    Rajnigandha Business Club
                </p>
                <p>
        
      </p>
            </div>      
        </section>
    </body>
    </html>
  `;
    return templ;
};

export const SendingNotificationForPendingVoucherRequestMail = async(name, email, message, accountId, contactNo)=>{
    try {
        const payload = {
            from:{
                email:"info@therclub.co.in",
                name:"Rajnigandha Business Club"},
                subject:`Notification :: Pending voucher request from seller ${name}`,
                content:[
                    {
                        type:"html",
                        value:SendNotificationForPendingVoucherRequestMailContent({name, email, message, accountId, contactNo})
                    }
                ],
                personalizations:[
                    {
                        to:[
                            {
                                email:process.env.SUPERADMIN_MAIL,
                                name:'Rajnigandha Business Club'
                            }
                        ]
                    }
                ]
            };
        // console.log("Payload",payload);
        const response = await axios({
            method: 'POST',
            url: `https://emailapi.netcorecloud.net/v5/mail/send`,
            headers: {
                'content-type': 'application/json',
                'api_key': process.env.NETCORE_MAIL_API_KEY
            },
            data:payload
        });
        // console.log("Result ::>>",response.data);
        return response.data;

    } catch (error) {
        console.log("Staff Registration Mail Error ::>>",error);
    }
};

//send Notification to subscriber
const SubscribersNotificationMailContent = (templateObject) => {
    let templ = `<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        <section id="containt" style="background-color: #ffffff9a;">     
        <div class="text" style="background-color:#1c2257;text-align: center;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem; color: #fff;margin-top: 5px;"><h2>Rajnigandha Business Club</h2></div>
            <div class="text" style="background-color:#deeaf6;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem;margin-top: 5px;">
                <p>Dear <span id="user">Subscriber</span>, <p></p>
                <p style="font-size: 0.95rem;">
                Welcome to our Rajnigandha Business Club.<br>
                Notifying you   
                ${templateObject.content}
                <br>
                    <br>Thank you for watching us.
                </p>        
                <p>
                    Best Regards,<br/>
                    Rajnigandha Business Club
                </p>
                <p>
        
      </p>
            </div>      
        </section>
    </body>
    </html>
  `;
    return templ;
};

export const subscriberNotificationMail = async(name, email, content)=>{
    try {
        const payload = {
            from:{
                email:"info@therclub.co.in",
                name:"Rajnigandha Business Club"},
                subject:"Notify from Rajnigandha Business Club",
                content:[
                    {
                        type:"html",
                        value:SubscribersNotificationMailContent({content})
                    }
                ],
                personalizations:[
                    {
                        to:[
                            {
                                email:email,
                                name:name
                            }
                        ],
                    }
                ]
            };
        // console.log("Payload",payload);
        const response = await axios({
            method: 'POST',
            url: `https://emailapi.netcorecloud.net/v5/mail/send`,
            headers: {
                'content-type': 'application/json',
                'api_key': process.env.NETCORE_MAIL_API_KEY
            },
            data:payload
        });
        // console.log("Result ::>>",response.data);
        return response.data;

    } catch (error) {
        console.log("Staff Registration Mail Error ::>>",error);
    }
};

//Query Mail to query staff
const queryItselfMailContent = (templateObject) => {
    let templ = `<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        <section id="containt" style="background-color: #ffffff9a;">     
            <div class="text" style="background-color:#1c2257;text-align: center;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem; color: alice#1c2257:margin-top: 5px;"><h2>Rajnigandha Business Club</h2></div>
            <div class="text" style="background-color:#deeaf6;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem;margin-top: 5px;">
                <p>Dear <span id="user">${'Rajnigandha Business Club'}</span>, <p></p>
                <p style="font-size: 0.95rem;">
                Dear ${templateObject.name},
                Welcome to Rajnigandha Business Club!<br>
                Your Query ID ${templateObject.queryId} has been generated, and our representative will reply to you shortly.
                <br>
                </p>        
                <p>
                    Best Regards,<br/>
                    Rajnigandha Business Club
                </p>
                <p>
        
      </p>
            </div>      
        </section>
    </body>
    </html>
  `;
    return templ;
};

export const queryMailForItself = async(queryId, name, email, createdIstAt)=>{
    try {
        const payload = {
            from:{
                email:"info@therclub.co.in",
                name:"Rajnigandha Business Club"},
                subject:`Notification :: Your Contact Query`,
                content:[
                    {
                        type:"html",
                        value:queryItselfMailContent({queryId, name, email, createdIstAt})
                    }
                ],
                personalizations:[
                    {
                        to:[
                            {
                                email:email,
                                name:name
                            }
                        ],
                    }
                ]
            };
        // console.log("Payload",payload);
        const response = await axios({
            method: 'POST',
            url: `https://emailapi.netcorecloud.net/v5/mail/send`,
            headers: {
                'content-type': 'application/json',
                'api_key': process.env.NETCORE_MAIL_API_KEY
            },
            data:payload
        });
        // console.log("Result ::>>",response.data);
        return response.data;

    } catch (error) {
        console.log("Contact Query Itself Error ::>>",error);
    }
};
//Query Mail to query staff
const queryStaffMailContent = (templateObject) => {
    let templ = `<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        <section id="containt" style="background-color: #ffffff9a;">     
        <div class="text" style="background-color:#1c2257;text-align: center;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem; color: #fff;margin-top: 5px;"><h2>Rajnigandha Business Club</h2></div>
            <div class="text" style="background-color:#deeaf6;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem;margin-top: 5px;">
                <p>Dear <span id="user">${'Rajnigandha Business Club'}</span>, <p></p>
                <p style="font-size: 0.95rem;">
                Welcome to Rajnigandha Business Club!<br>
                Query from the visitor is here:-<br>
                Query Id: ${templateObject.queryId}<br>
                Visitor Name : ${templateObject.name}<br>
                Visitor Email : ${templateObject.email}<br>
                contactNo : ${templateObject.contactNo}<br>
                Query Type : ${templateObject.queryType}<br>
                Sub-Query Type : ${templateObject.subQueryType}<br>
                Date : ${templateObject.createdIstAt}<br>
                <br>
                    <br>Thank you.
                </p>        
                <p>
                    Best Regards,<br/>
                    Rajnigandha Business Club
                </p>
                <p>
        
      </p>
            </div>      
        </section>
    </body>
    </html>
  `;
    return templ;
};

export const queryStaffMail = async(queryId, name, email, contactNo, queryType, subQueryType, createdIstAt, staffEmail, ccList)=>{
    try {
        ccList = ccList ? ccList :[];
        const payload = {
            from:{
                email:"info@therclub.co.in",
                name:"Rajnigandha Business Club"},
                subject:`Notification :: Contact Query from Visitor ${name}`,
                content:[
                    {
                        type:"html",
                        value:queryStaffMailContent({queryId, name, email, contactNo, queryType, subQueryType, createdIstAt})
                    }
                ],
                personalizations:[
                    {
                        to:[
                            {
                                email:staffEmail,
                                name:'Rajnigandha Business Club'
                            }
                        ],
                        cc:ccList
                    }
                ]
            };
        // console.log("Payload",payload);
        const response = await axios({
            method: 'POST',
            url: `https://emailapi.netcorecloud.net/v5/mail/send`,
            headers: {
                'content-type': 'application/json',
                'api_key': process.env.NETCORE_MAIL_API_KEY
            },
            data:payload
        });
        // console.log("Result ::>>",response.data);
        return response.data;

    } catch (error) {
        console.log("Staff Registration Mail Error ::>>",error);
    }
};

//Query Mail to query reply by staff
const queryReplyByStaffMailContent = (templateObject) => {
    let templ = `<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        <section id="containt" style="background-color: #ffffff9a;">     
            <div class="text" style="background-color:#1c2257;text-align: center;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem; color: #fff;margin-top: 5px;"><h2>Rajnigandha Business Club</h2></div>
            <div class="text" style="padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem;margin-top: 5px;">
                <p>Dear <span id="user">${templateObject.name}</span>, <p></p>
                <p style="font-size: 0.95rem;">
                Welcome to our Rajnigandha Business Club.<br>
                Query Id: ${templateObject.queryId}<br>
                Query Type : ${templateObject.queryType}<br>
                Sub-Query Type : ${templateObject.subQueryType}<br/><br/>
                ${templateObject.replyContent}
                <br>
                    <br>Thank you.
                </p>        
                <p>
                    Best Regards,<br/>
                    Rajnigandha Business Club
                </p>
                <p>
        
      </p>
            </div>      
        </section>
    </body>
    </html>
  `;
    return templ;
};

export const queryReplyByStaffMail = async(queryId, name, email, queryType, subQueryType, createdIstAt, mail_of_handler, ccList, replyContent)=>{
    try {
        ccList = ccList && ccList.length!==0 ? ccList :[];
        const payload = {
            from:{
                email:"info@therclub.co.in",
                name:"Rajnigandha Business Club"},
                reply_to: mail_of_handler,
                subject:`Notification :: Reply from Rajnigandha Business Club`,
                content:[
                    {
                        type:"html",
                        value:queryReplyByStaffMailContent({queryId, name, queryType, subQueryType, createdIstAt, replyContent})
                    }
                ],
                personalizations:[
                    {
                        to:[
                            {
                                email:email,
                                name:name
                            }
                        ],
                        cc:ccList
                    }
                ]
            };
        // console.log("Payload",payload);
        const response = await axios({
            method: 'POST',
            url: `https://emailapi.netcorecloud.net/v5/mail/send`,
            headers: {
                'content-type': 'application/json',
                'api_key': process.env.NETCORE_MAIL_API_KEY
            },
            data:payload
        });
        // console.log("Result ::>>",response.data);
        return response.data;

    } catch (error) {
        console.log("Staff Registration Mail Error ::>>",error);
    }
};

