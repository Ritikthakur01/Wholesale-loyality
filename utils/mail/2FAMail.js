import nodemailer from 'nodemailer';

const MailContent = (templateObject) => {
    let templ = `<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        <section id="containt" style="background-color: #ffffff9a;">     
            <div class="text" style="background-color:blue;text-align: center;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem; color: aliceblue;margin-top: 5px;"><h2>Dharampal Satyapal Group</h2></div>
            <div class="text" style="background-color:#deeaf6;padding: 0.1rem;padding-left: 1rem; font-style: initial; font-weight: 500; word-spacing: 0.2rem;margin-top: 5px;">
                <p>Dear <span id="user">${templateObject.name}</span>, <p></p>
                <p style="font-size: 0.95rem;"> Making 2 Factor Authentication<span id="Total Skills"> in the Loyalty Program application</span> with credentials.<br><b>Email : </b><span id ="Soft Skill">${templateObject.email}</span><br><b>Verification OTP :</b> <span id ="Total">${templateObject.otp}</span>
                <br>
                    <br>Thank for your Verification.
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
  
const send2FactorAuthenticationMail = (name, email, otp)=>{

    console.log("2FA==> Email & otp ::>>",email,otp)
    // const transporter = nodemailer.createTransport({
    //     service: "Gmail",
    //     auth: {
    //       user: "alanjohnson2134@gmail.com",
    //       pass: "lwao yxmv yrom vduj",
    //     },
    //   });

    //   transporter.sendMail({
    //     from: "alanjohnson2134@gmail.com",
    //     to: email,
    //     subject: "DS Group 2FA-Verfication",
    //     html: MailContent({name, email, otp}),
    //   });
}
export default send2FactorAuthenticationMail;