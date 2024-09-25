import axios from "axios";

export const set_user_opt_in = async (contactNo)=>{
    try{

        const response = await axios({
            method: 'get',
            url: `https://media.smsgupshup.com/GatewayAPI/rest?method=OPT_IN&format=json&userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&phone_number=91${contactNo}&v=1.1&auth_scheme=plain&channel=WHATSAPP`
        });

        // console.log("response for OPT IN to send whatsapp messages", response);

        return response

    }catch(err){
        console.log("Error while OPT IN to sent messages in whatsapp", err);
        return
    }
}
export const set_user_opt_out = async (contactNo)=>{
    try{
        const response = await axios({
            method: 'get',
            url: `https://media.smsgupshup.com/GatewayAPI/rest?method=OPT_OUT&format=json&userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&phone_number=91${contactNo}&v=1.1&auth_scheme=plain&channel=WHATSAPP`
        });
        // console.log("response for OPT OUT to send whatsapp messages", response);
        return response

    }catch(err){
        console.log("Error while OPT OUT  to sent messages in whatsapp", err);
        return
    }
}

// whatsapp template id - 7080350
export const sent_OTP_to_whatsapp = async (name,contactNo,otp)=>{
    try{
        const response = await axios({
            method: 'get',
            // url: `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=One+Time+Password+for+login+to+DS+APP+is+${otp}.Please+use+the+OTP+to+complete+the+login+process+and+don%27t+share+this+with+anyone.`
            // url: `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Dear+${name}%2C+Your+OTP+for+logging+to+business.rajnigandha.com+is+${otp}.+The+OTP+will+remain+valid+for+5+minutes.+Thank+You%2C+DS+Group`
            url: `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Dear+${name}%2C+Your+OTP+for+logging+into+business.rajnigandha.com+is+${otp}.+The+OTP+will+remain+valid+for+5+minutes+-+DS+Group`
        });

        // console.log("response for sending otp through whatsapp", response);

        return response

    }catch(err){
        console.log("Error while sending OTP through whatsapp", err);
        return
    }
}

// // whatsapp template id - 6907565
export const sent_birthday_wishes_whatsapp = async (name, contactNo)=>{
    try{
        console.log("birthday in")
        const response = await axios({
            method: 'get',
            // url: `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Dear+${name}%2C+Wish+you+many+happy+returns+of+the+day.+May+God+bless+you+with+health%2C+wealth+and+prosperity+in+your+life.+-+DS+Group`
            url: `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Dear+${name}%2C+Wish+you+many+happy+returns+of+the+day.+May+God+bless+you+with+health%2C+wealth+and+prosperity+in+your+life.+-+DS+Group`
        });

        // console.log("response for sending otp through whatsapp", response);

        console.log("responseresponse ::>", response);

        return response

    }catch(err){
        console.log("Error while sending Birthday wish on whatsapp", err);
        return 
    }
}

// whatsapp template id - 6907573
export const sent_welcome_message_whatsapp = async (name,contactNo,username,password)=>{
    try{
        const response = await axios({
            method: 'get',
            // url: `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Dear+${name}%2C+Welcome+to+our+Rajnigandha+Biz+Club.+Your+User+Id+is+${username}+and+Password+is+${password}+.+DS+Group`
            // url: `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Dear+${name}%2C+Welcome+to+our+Rajnigandha+Business+Club%21+Your+User+ID+is+${username}+and+your+Password+is+${password}+-+DS+GROUP&isTemplate=true&header=Welcome+to+our+Rajnigandha+Business+Club%21`
            url: `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Dear+${name}%2C+Welcome+to+Rajnigandha+Business+Club.+Log+in+now+to+start+earning+reward+points+and+avail+benefits+of+the+program+-+DS+Group&isTemplate=true&header=Welcome+to+Rajnigandha+Business+Club%21`
        });

        return response

    }catch(err){
        console.log("Error while sending Welcome message on whatsapp", err);
        return 
    }
}

export const sent_forget_password_whatsapp = async (contactNo,password)=>{
    try{
        const response = await axios({
            method: 'get',
            url: `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Your+password+is+%3A+${password}++-+DS+Group`
        });

        return response

    }catch(err){
        console.log("Error while sending forget password on whatsapp", err);
        return 
    }
}

// whatsapp template id - 7080309
export const sent_marriage_wishes_whatsapp = async (name ,contactNo)=>{
    try{

        const response = await axios({
            method: 'get',
            // url: `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Dear+${name}%2C+Best+Wishes+on+your+Marriage+Anniversary.+-+DS+Group`
            url: `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Dear+${name}%2C+Team+Rajnigandha+Business+Club+wishes+you+a+Happy+Marriage+Anniversary.+-+DS+Group&isTemplate=true&header=Happy+Marriage+Anniversary`
        });

        return response

    }catch(err){
        console.log("Error while sending Marriage Anniversary on whatsapp", err);
        return 
    }
}


export const sent_reward_points_update_whatsapp = async (contactNo,name,totalPoints,updatePoints)=>{
    try{
        const response = await axios({
            method: 'get',
            url: `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Dear+${name}%2C+Thank+you+for+choosing+Rajnigandha%21+Your+recent+updated+reward+coins+has+earned+you+${updatePoints}+points%2C+bringing+your+total+to+${totalPoints}+reward+coins.+We+appreciate+your+loyalty.+DS+Group`
        });

        return response

    }catch(err){
        console.log("Error while sending message for reward points update on whatsapp", err);
        return 
    }
}

export const sent_otp_for_redemption_voucher_whatsapp = async (contactNo,name,otp)=>{
    try{
        const response = await axios({
            method: 'get',
            url: `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Dear+${name}%2C+${otp}+is+the+OTP+for+completing+the+redemption+process.+This+OTP+is+valid+for+5+minutes+from+the+request.+DS+Group`
        });

        return response

    }catch(err){
        console.log("Error while sending message for voucher otp request on whatsapp", err);
        return 
    }
} 

// <===================E-VOUCHER REDEMPTION UPDATE=========================>
// whatsapp template id - 7080396
export const sent_pending_request_voucher_whatsapp = async (contactNo, brandName, price)=>{
    try{
        const response = await axios({
            method: 'get',
            // url: `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Thank+you+for+your+redemption+request.+Your+request+has+been+accepted+and+is+being+processed.+You+will+receive+your+e-vouchers+within+24+Hours.+-+DS+Group&isTemplate=true&header=Pending+E-voucher+Request&footer=Rajnigandha+Biz+Club`
            url: `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Dear+Member%2C+Thank+you+for+your+redemption+request+of+${brandName}+worth+INR+${price}.+We+are+pleased+to+inform+you+that+your+request+has+been+accepted+and+is+currently+being+processed.+You+can+expect+to+receive+your+e-vouchers+within+the+next+24+hours.+-+DS+GROUP&isTemplate=true&header=E-VOUCHER+REDEMPTION+UPDATE`
        });

        return response

    }catch(err){
        console.log("Error while sending message for voucher otp request on whatsapp", err);
        return 
    }
}

// whatsapp template id - 7080388
export const sent_approve_voucher_request_whatsapp = async (contactNo, name, brandName, voucherCode, totalValue, pin, validity)=>{
    try{
        const vt = validity.split(" ");
        const url = `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Dear+${name.split(' ')[0]}%2C+Congratulations%21+Here+is+your+${brandName}+voucher+from+Rajnigandha+Business+Club+-%0A%0AVoucher+Code%3A+${voucherCode}%0AValue%3A+INR+${totalValue}%0APin%3A+${pin==='' ? 'no' : pin}%0AValidity%3A+${vt[0]+vt[1]+vt[2]}%0A%0ANote%3A+No+physical+voucher+will+be+sent.+%0A%0AFor+complete+Terms+and+conditions+please+visit+business.rajnigandha.com&isTemplate=true&header=Congratulations%21`;
        console.log("Url ::>>>", url);
        const response = await axios({
            method: 'get',
            // url: `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Dear+${name}%2C+%0ACongratulations%2C+you+have+purchase+vouchers+from+the+R+club.+Total+value+%3A+Rs.+${totalValue}+from+vouchers+and+Denomination+value+Rs.+${denomination}+of+quantity+%3A+${quantity}.+%0ANOTE+%3A+No+physical+voucher+will+be+sent.+%0AFor+complete+Terms+and+conditions+please+visit+business.rajnigandha.com+DS+Group.&isTemplate=true&header=Rajnigandha+Biz+Club&footer=Thank+you`
            url: url
        });

        return response

    }catch(err){
        console.log("Error Sent approve voucher request on whatsapp", err);
        return 
    }
}

// <======================Rajnigandha Business Club - Refund of Reward Points=================>
// whatsapp template id - 7080394
export const sent_reject_voucher_request_whatsapp = async (contactNo, brandName, orderId, denomination, points)=>{
    try{
        const response = await axios({
            method: 'get',
            // url: `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Dear+${name}%2C+%0AYour+voucher+request+for+${brandName}+and+order+id+${orderId}+has+not+approved+this+time+and+your+${points}+points+has+been+refunded+from+this+request.+%0APlease+try+after+some+time.&isTemplate=true&header=Refund+points+from+Rajnigandha&footer=Rajnigandha+Biz+Club`
            url: `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Dear+Member%2C+we+regret+to+inform+you+that+your+redemption+request+for+${brandName}+voucher+worth+INR+${denomination}%2C+with+order+ID+${orderId}%2C+has+not+been+approved+this+time.+As+a+result%2C+your+${points}+points+have+been+refunded+to+your+account.+We+apologize+for+any+inconvenience+caused+-+DS+GROUP&isTemplate=true&header=Rajnigandha+Business+Club+-+Refund+of+Reward+Points`
        });

        return response

    }catch(err){
        console.log("Error Sent approve voucher request on whatsapp", err);
        return 
    }
}

// whatsapp template id - 7080381
export const sent_ds_product_redeem_message_whatsapp = async (contactNo, name, totalValue, quantity, productName, availablePoints)=>{
    // console.log("Product ::>>", contactNo, name, totalValue, quantity, productName, availablePoints);
    try{
        const response = await axios({
            method: 'get',
            // url: `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Dear+${name}%2C+%0ACongratulations%2C+you+have+purchase+products+from+the+R+club.+Total+coins+${totalValue}+from+purchase+${productName}+of+quantity+${quantity}.%0ANow+your+total+balance+is+${availablePoints}.%0AFor+complete+Terms+and+conditions+please+visit+business.rajnigandha.com+DS+Group&isTemplate=true&header=Rajnigandha+Biz+Club&footer=Thank+You`
            url: `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Dear+${name}%2C+Thank+you+for+redeeming+DS+Product+from+Rajnigandha+Business+Club.+You+have+redeemed+${totalValue}+points+for+purchasing+${quantity}+quantity+of+${productName}.%0A%0AYour+current+Point+Balance+-+${availablePoints}+%0A%0AFor+complete+Terms+and+Conditions%2C+please+visit+site_url&isTemplate=true&header=Rajnigandha+Business+Club+Redemption+Update`
            });

        return response

    }catch(err){
        console.log("Error Sent Ds Product Redeem Message whatsapp", err);
        return 
    }
}

// whatsapp template id - 7080239
export const membership_upgradation_whatsapp_message = async (tiername, contactNo)=>{
    try{
        const response = await axios({
            method: 'get',
            // url: `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Congratulations%21+You%27ve+been+upgraded+to+${tiername}+status+in+our+Rajnigandha+Biz+Club+rewards+program.+Enjoy+the+additional+benefits+outlined+in+our+rewards+program+guide-+DS+Group`
            url: `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Dear+Member%2C+Congratulations%21+You%27ve+been+upgraded+to+${tiername}+Tier+in+our+Rajnigandha+Business+Club+program.+Enjoy+the+additional+benefits+outlined+in+our+rewards+program+guide+-+DS+Group&isTemplate=true&header=Congratulations+on+Rajnigandha+Business+Club+Tier+Upgrade%21`
        });

        return response

    }catch(err){
        console.log("Error while membership_upgradation_whatsapp_message update on whatsapp", err);
        return 
    }
}

// whatsapp template id - 7080235
export const membership_downgradation_whatsapp_message = async (tiername, contactNo)=>{
    try{
        const response = await axios({
            method: 'get',
            // url : `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Unfortunately%21++You%27ve+been+${tiername}+to+Welcome+status+in+our+Rajnigandha+Biz+Club+rewards+program.&isTemplate=true&header=Membership+Level+Downgradation`
            url : `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Dear+Member%2C+There+has+been+no+activity+in+your+Rajnigandha+Business+Club+account+in+the+last+${12}+months.+As+a+result%2C+your+membership+has+been+downgraded+to+${tiername}+Tier.+To+continue+enjoying+the+benefits+of+our+rewards+program%2C+please+ensure+you+update+your+reward+points+regularly+-+DS+GROUP&isTemplate=true&header=Membership+Level+Downgrade`
        });
        return response

    }catch(err){
        console.log("Error while membership_upgradation_whatsapp_message update on whatsapp", err);
        return 
    }
}

// whatsapp template id - 7145365
export const expiry_points_whatsapp_message = async (contactNo, name, points, expiredOn)=>{
    try{
        const response = await axios({
            method: 'get',
            // url : `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Unfortunately%21++You%27ve+been+${tiername}+to+Welcome+status+in+our+Rajnigandha+Biz+Club+rewards+program.&isTemplate=true&header=Membership+Level+Downgradation`
            url : `https://media.smsgupshup.com/GatewayAPI/rest?userid=${process.env.WHATSAPPUSERNAME}&password=${process.env.WHATSAPPPASSWORD}&send_to=${contactNo}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=Dear+${name}%2C+As+per+Rajnigandha+Business+Club+policy+your+${points}+reward+points+will+get+expired+on+${expiredOn}.+Hurry%21+Redeem+your+points+today.+-+DS+Group&isTemplate=true&header=Rajnigandha+Business+Club+-+Point+Expiry`
        });
        return response

    }catch(err){
        console.log("Error while membership_upgradation_whatsapp_message update on whatsapp", err);
        return 
    }
}
