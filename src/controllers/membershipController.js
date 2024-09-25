import { createError } from '../../utils/error';
import crypto from "crypto";
import { Seller, SellerGracePeriodRecord, SellerInfo, SellerMembershipTrack } from '../models/Seller';
import DateTime from '../../utils/constant/getDate&Time';
import { Membership } from '../models/Membership';
import { Transaction } from '../models/Transaction';
import { Op } from 'sequelize';
import { membership_upgradation_whatsapp_message } from '../../utils/messages/whatsapp_messages';
import { membership_downgradation_whatsapp_message } from '../../utils/messages/whatsapp_messages';
import { tierUpgrade } from '../../utils/messages/sms_messages';
import { query } from 'express';
import generateTransactionId from '../../utils/constant/generateTransactionId';
import sequelize from '../../utils/db/dbConnection';

function checkTierName( membershipSettings , sellerInfo ){

    const { totalPoints , availablePoints , membershipCycle } = sellerInfo;   

    const lastTotalPoints = sellerInfo.track[sellerInfo.track.length - 1].totalPoints;

    let tierName = sellerInfo.membershipLevel;
    let totalPointsIncludingGiftingPoints = totalPoints;
    let availablePointsIncludingGiftingPoints = availablePoints;
    let cycle = membershipCycle;

    let giftedPoints = {};

    switch(tierName) {
        case "Welcome":
            giftedPoints = {
                tierBenefits: membershipSettings.milestoneAchievementTierBenefits.welcome,
                bonusCoins:membershipSettings.milestoneAchievementBonusCoinsBenefits.welcome,
                throughoutTheYear:membershipSettings.throughoutTheYear.welcome.times * membershipSettings.throughoutTheYear.welcome.points,
                birthdayPoints:membershipSettings.birthdayBenefits.welcome.points
            }
            break;
        case "Blue":
            giftedPoints = {
                tierBenefits: membershipSettings.milestoneAchievementTierBenefits.blue,
                bonusCoins:membershipSettings.milestoneAchievementBonusCoinsBenefits.blue,
                throughoutTheYear:membershipSettings.throughoutTheYear.blue.times * membershipSettings.throughoutTheYear.blue.points,
                birthdayPoints:membershipSettings.birthdayBenefits.blue.points
            }
            break;
        case "Silver":
            giftedPoints = {
                tierBenefits: membershipSettings.milestoneAchievementTierBenefits.silver,
                bonusCoins:membershipSettings.milestoneAchievementBonusCoinsBenefits.silver,
                throughoutTheYear:membershipSettings.throughoutTheYear.silver.times * membershipSettings.throughoutTheYear.silver.points,
                birthdayPoints:membershipSettings.birthdayBenefits.silver.points
            }
            break;
        case "Gold":
            giftedPoints = {
                tierBenefits: membershipSettings.milestoneAchievementTierBenefits.gold,
                bonusCoins:membershipSettings.milestoneAchievementBonusCoinsBenefits.gold,
                throughoutTheYear:membershipSettings.throughoutTheYear.gold.times * membershipSettings.throughoutTheYear.gold.points,
                birthdayPoints:membershipSettings.birthdayBenefits.gold.points
            }
            break;
        default:
            giftedPoints = {
                tierBenefits: 0,
                bonusCoins: 0,
                throughoutTheYear: 0,
                birthdayPoints: 0
            }
            break;
        }

    if (sellerInfo.track[sellerInfo.track.length - 1].membershipLevel == "Welcome" && membershipSettings.maxWelcome<=(totalPoints-lastTotalPoints) ) {
        tierName = "Blue";
        totalPointsIncludingGiftingPoints = totalPoints + (membershipSettings.throughoutTheYear.blue.times * membershipSettings.throughoutTheYear.blue.points);
        availablePointsIncludingGiftingPoints = availablePoints + (membershipSettings.throughoutTheYear.blue.times * membershipSettings.throughoutTheYear.blue.points);
        giftedPoints.throughoutTheYear = membershipSettings.throughoutTheYear.blue.times * membershipSettings.throughoutTheYear.blue.points;
        giftedPoints.birthdayPoints = membershipSettings.birthdayBenefits.blue.points;
        giftedPoints.bonusCoins = membershipSettings.milestoneAchievementBonusCoinsBenefits.blue;
        giftedPoints.tierBenefits = membershipSettings.milestoneAchievementTierBenefits.blue;
        cycle = cycle

    } else if (sellerInfo.track[sellerInfo.track.length - 1].membershipLevel == "Blue" && membershipSettings.maxBlue<=(totalPoints-lastTotalPoints)) {
        tierName = "Silver";
        totalPointsIncludingGiftingPoints = totalPoints + (membershipSettings.throughoutTheYear.silver.times * membershipSettings.throughoutTheYear.silver.points);
        availablePointsIncludingGiftingPoints = availablePoints + (membershipSettings.throughoutTheYear.silver.times * membershipSettings.throughoutTheYear.silver.points);
        giftedPoints.throughoutTheYear = membershipSettings.throughoutTheYear.silver.times * membershipSettings.throughoutTheYear.silver.points;
        giftedPoints.birthdayPoints = membershipSettings.birthdayBenefits.silver.points;
        giftedPoints.bonusCoins = membershipSettings.milestoneAchievementBonusCoinsBenefits.silver;
        giftedPoints.tierBenefits = membershipSettings.milestoneAchievementTierBenefits.silver;
        cycle = cycle

    } else if (sellerInfo.track[sellerInfo.track.length - 1].membershipLevel == "Silver" && membershipSettings.maxSilver<=(totalPoints-lastTotalPoints)){
        tierName = "Gold";
        totalPointsIncludingGiftingPoints = totalPoints + (membershipSettings.throughoutTheYear.gold.times * membershipSettings.throughoutTheYear.gold.points);
        availablePointsIncludingGiftingPoints = availablePoints + (membershipSettings.throughoutTheYear.gold.times * membershipSettings.throughoutTheYear.gold.points);
        giftedPoints.throughoutTheYear = membershipSettings.throughoutTheYear.gold.times * membershipSettings.throughoutTheYear.gold.points
        giftedPoints.birthdayPoints = membershipSettings.birthdayBenefits.gold.points;
        giftedPoints.bonusCoins = membershipSettings.milestoneAchievementBonusCoinsBenefits.gold;
        giftedPoints.tierBenefits = membershipSettings.milestoneAchievementTierBenefits.gold;
        cycle = cycle

    } else if (sellerInfo.track[sellerInfo.track.length - 1].membershipLevel == "Gold" && membershipSettings.maxGold<=(totalPoints-lastTotalPoints)){
        tierName = "Welcome";
        totalPointsIncludingGiftingPoints = totalPoints;
        availablePointsIncludingGiftingPoints= availablePoints;
        giftedPoints.throughoutTheYear = membershipSettings.throughoutTheYear.welcome.times * membershipSettings.throughoutTheYear.welcome.points; 
        giftedPoints.birthdayPoints = membershipSettings.birthdayBenefits.welcome.points;
        giftedPoints.bonusCoins = membershipSettings.milestoneAchievementBonusCoinsBenefits.welcome;
        giftedPoints.tierBenefits = membershipSettings.milestoneAchievementTierBenefits.welcome;
        cycle = cycle + 1
    }

    return {
        tierName,
        totalPointsIncludingGiftingPoints,
        availablePointsIncludingGiftingPoints,
        giftedPoints,
        cycle
    }
};

export const checkAndUpdateSellerMembership = async(req, res, next) => {
    try {
        const { sellerId } = req.body;

        if (!sellerId) {
            return next(createError(400, "Please Provide seller Id."));
        }

        const sellerInfo = await SellerInfo.findOne({
            where: {
                sellerId: sellerId
            },
            raw: true
        });

        if(!sellerInfo){
            return next(createError(404, "Seller is not exist."));
        }

        const currentDate = new Date();
        const membershipSettings = await Membership.findOne({where:{id:1}, raw:true})

        let expiry_date = '';


        if(membershipSettings.month >= currentDate.getMonth()+1){
            if(membershipSettings.month == currentDate.getMonth()+1 && membershipSettings.date < currentDate.getDate()) {
                expiry_date = `${currentDate.getFullYear()+1}-${membershipSettings.month}-${membershipSettings.date}`
            }else{
                expiry_date =  `${currentDate.getFullYear()}-${membershipSettings.month}-${membershipSettings.date}`
            }
        }else{
            expiry_date =  `${currentDate.getFullYear()+1}-${membershipSettings.month}-${membershipSettings.date}`
        }

        let end_date = new Date(expiry_date)
        

        const { totalPoints , tierExpiryDate , contactNo , membershipCycle } = sellerInfo;   

        if(currentDate >= tierExpiryDate){
           
            const tierData = checkTierName( membershipSettings , sellerInfo )
            
            if(sellerInfo.membershipLevel === tierData.tierName){
                const sellerTransactions = await Transaction.findAll({
                    where:{
                        sellerId : sellerId
                    },
                    attributes : ["updatedAt"],
                    order: [['updatedAt', "DESC" ]]
                })

                let haveSellerAnyTransaction = sellerTransactions.length == 0 ? false : sellerTransactions[0].updatedAt > sellerInfo.tierEntryDate ? true : false

                if(!sellerInfo.track[sellerInfo.track.length - 1].isProfileUpdate && !haveSellerAnyTransaction && !sellerInfo.track[sellerInfo.track.length - 1].isFeedback){

                    let downgradeTierName = sellerInfo.membershipLevel === 'Gold' ? 'Silver' : sellerInfo.membershipLevel === 'Silver' ? 'Blue' : sellerInfo.membershipLevel === 'Blue' ? 'Welcome' : 'Welcome';

                    let downgradeRecord = {
                        totalPoints: totalPoints,
                        tierEntryDate:  currentDate.toISOString(),
                        tierExpiryDate: end_date,
                        membershipLevel: downgradeTierName,
                        isProfileUpdate : false,
                        isFeedback : false,
                        giftedPoints : tierData.giftedPoints ,
                        status : "Downgrade",
                        membershipCycle : membershipCycle,
                        feedbackPoints:0,
                        profilePoints:0,
                    }

                    sellerInfo.track.push(downgradeRecord);

                    await SellerInfo.update({ 
                        membershipLevel : downgradeRecord.membershipLevel,
                        tierEntryDate : tierExpiryDate,
                        tierExpiryDate: end_date,           
                        track : sellerInfo.track
                    }, {
                        where: { sellerId }
                    });  
                    membership_downgradation_whatsapp_message(tierData.tierName , contactNo)

                    return res.status(200).json({
                        error : false,
                        message : `Due to inactive account, Seller membership has been downgraded to ${downgradeRecord.membershipLevel} tier.`,
                        data : sellerInfo.track[sellerInfo.track.length - 1]
                    })
                }

                let SamegradeRecord = {
                    totalPoints: totalPoints,
                    tierEntryDate:  currentDate.toISOString(),
                    tierExpiryDate: end_date,
                    membershipLevel: sellerInfo.membershipLevel,
                    isProfileUpdate : false,
                    isFeedback : false,
                    giftedPoints :tierData.giftedPoints,
                    status : "Samegrade",
                    membershipCycle : membershipCycle,
                    feedbackPoints:0,
                    profilePoints:0,
                }

                sellerInfo.track.push(SamegradeRecord);

                await SellerInfo.update({ 
                    tierEntryDate : tierExpiryDate,
                    tierExpiryDate: end_date,           
                    track : sellerInfo.track,
                }, {
                    where: { sellerId }
                });  

                return res.status(200).json({
                    error : false,
                    message : `Please gain more points. You are still on ${sellerInfo.membershipLevel} tier.`,
                    data : sellerInfo.track[sellerInfo.track.length - 1]
                })
            }

            let updatedTier = {
                totalPoints: tierData.totalPointsIncludingGiftingPoints,
                tierEntryDate:  currentDate.toISOString(),
                tierExpiryDate: end_date,
                membershipLevel: tierData.tierName,
                isProfileUpdate : false,
                isFeedback : false,
                giftedPoints :tierData.giftedPoints,
                status : "Upgrade",
                membershipCycle : membershipCycle != tierData.cycle ? tierData.cycle : membershipCycle,
                feedbackPoints:0,
                profilePoints:0,
            }

            sellerInfo.track.push(updatedTier);

            await SellerInfo.update({ 
                membershipLevel : tierData.tierName,
                tierEntryDate : tierExpiryDate,
                tierExpiryDate: end_date,
                track : sellerInfo.track,
                availablePoints:tierData.availablePointsIncludingGiftingPoints,
                totalPoints: tierData.totalPointsIncludingGiftingPoints,
                tierExpiryDate : end_date,
                membershipCycle : updatedTier.membershipCycle
             }, {
                where: { sellerId }
            });

            membership_upgradation_whatsapp_message(tierData.tierName , contactNo)

            return res.status(200).json({
                error : false,
                message : `Your tier has been updated. You are now in the ${tierData.tierName ? tierData.tierName : sellerInfo.membershipLevel} tier.`,
                data : sellerInfo.track[sellerInfo.track.length - 1]
            })
        }

        return res.status(200).json({
            error : false,
            message : `Please wait for expiry date`
        })

    } catch (error) {
        console.log("membership Level Manage Error:", error);
        next(error);
    }
};

export const controlMembershipSetting = async(req, res, next) => {
    try {
        
        const [memberShip, isMemberShipJustCreated] = await Membership.findOrCreate({
            where: { id: 1 },
            defaults: { 
                ...req.body,
                createdIstAt: DateTime(),
                updatedIstAt: DateTime(),
                updateByStaff:req.user.data.name
            }
        });

        const updateOrGet = isMemberShipJustCreated ? memberShip : await memberShip.update(req.body,{ where : { id : 1 } });

        return res.status(200).json({
            error : false,
            message : "Membership Setting has been set successfully",
            data : updateOrGet
        })

    } catch (error) {
        console.log("Membership Setting Error:", error);
        next(error);
    }
};

export const getMembershipSetting = async(req, res, next) => {
    try {
        const getMembership = await Membership.findOne({
            where:{
                id:1
            },
            raw:true
        });

        if(!getMembership){
            return next(createError(404,"Membership Setting Not Found"));
        }

        return res.status(200).json({
            error : false,
            message : "Get Membership Setting has been Found successfully",
            data : getMembership
        })

    } catch (error) {
        console.log("Get Membership Setting Error:", error);
        next(error);
    }
};
   
//Intially Set the welcome record when register seller according to the day and month set tby admin 
const checkInMemberShipOfSeller = async(sellerId, getSeller, getSellerInfo, getMembership)=>{
    let isUpdated = false;
    const currentLevel = getSellerInfo.membershipLevel;
    const totalPoints = getSellerInfo.totalPoints;
    const availablePoints = getSellerInfo.availablePoints;
    const currentTime = new Date();
    const tierEntryDate = new Date(getSellerInfo.tierEntryDate);
    const tierExpiryDate = new Date(getSellerInfo.tierExpiryDate);
    tierEntryDate.setFullYear(tierEntryDate.getFullYear()+1);
    const makeExpiryDate = new Date();
    makeExpiryDate.setFullYear(makeExpiryDate.getFullYear()+1);
    let getTrack = getSellerInfo.track;
    let memberShipObj = {};
    // console.log("Current Level ::>>",currentLevel);
    // console.log("CurrentTime ::>>",currentTime);
    // console.log("TierEntryDate ::>>",tierEntryDate);
    // console.log("TierExpiryDate ::>>",tierExpiryDate);
    // console.log("Make tier expiry date ::>>",makeExpiryDate);
    // console.log("Total Points ::>>",totalPoints);
    // console.log("Points ::>>",totalPoints,getTrack[getTrack.length-1].totalPoints);
    // console.log("Net Points ::>>",totalPoints-getTrack[getTrack.length-1].totalPoints);
    const newTierEntryDate = new Date(`${new Date().getFullYear()}-${getMembership.month}-${getMembership.date}`);
    const newTierExpiryDate = new Date(`${makeExpiryDate.getFullYear()}-${getMembership.month}-${getMembership.date}`);
    // console.log("New Tier Entry Date ::>>",newTierEntryDate);
    // console.log("New Tier Expiry Date ::>>",newTierExpiryDate);
    if(currentLevel==='Welcome' && getMembership.maxWelcome<(totalPoints-getTrack[getTrack.length-1].totalPoints) && (getSellerInfo.track.length===1 || getSellerInfo.track.length>1 && tierEntryDate<currentTime)){
        //update the memberShip level to blue
        // console.log("---BLue Membership---");
        const newTotalPoints = Number(totalPoints) + Number(getMembership.throughoutTheYear['blue'].times)*Number(getMembership.throughoutTheYear['blue'].points);
        const newAvailablePoints = Number(availablePoints) + Number(getMembership.throughoutTheYear['blue'].times)*Number(getMembership.throughoutTheYear['blue'].points);
        isUpdated = true;   
        let record = {
            status:"Upgrade",
            membershipLevel:'Blue',
            tierEntryDate:newTierEntryDate,
            tierExpiryDate:newTierExpiryDate,
            totalPoints:newTotalPoints,
            availablePoints:newAvailablePoints,
            isProfileUpdate:false,
            isFeedback:false,
            feedbackPoints:0,
            profilePoints:0,
            membershipCycle:getTrack[getTrack.length-1].membershipCycle,
            giftingPoints: {
                bonusCoins: getMembership.milestoneAchievementBonusCoinsBenefits['blue'],
                tierBenefits: getMembership.milestoneAchievementTierBenefits['blue'],
                birthdayPoints: getMembership.birthdayBenefits['blue'].points,
                throughoutTheYear: Number(getMembership.throughoutTheYear['blue'].times)*Number(getMembership.throughoutTheYear['blue'].points)
            }
        };
        getTrack.push(record);
        memberShipObj = {
            membershipLevel:'Blue',
            track : getTrack,
            tierEntryDate:newTierEntryDate,
            tierExpiryDate:newTierExpiryDate,
            totalPoints:newTotalPoints,
            availablePoints:newAvailablePoints
        };
    }
    else if(currentLevel==='Blue' && getMembership.maxBlue<(totalPoints-getTrack[getTrack.length-1].totalPoints) && tierEntryDate<currentTime){
        //update the memberShip level to Silver
        // console.log("---Silver Membership---")
        //update points Total Points & available points
        const newTotalPoints = Number(totalPoints) + Number(getMembership.throughoutTheYear['silver'].times)*Number(getMembership.throughoutTheYear['silver'].points);
        const newAvailablePoints = Number(availablePoints) + Number(getMembership.throughoutTheYear['silver'].times)*Number(getMembership.throughoutTheYear['silver'].points);
        isUpdated = true;
        let record = {
            status:"Upgrade",
            membershipLevel:'Silver',
            tierEntryDate:newTierEntryDate,
            tierExpiryDate:newTierExpiryDate,
            totalPoints:newTotalPoints,
            availablePoints:newAvailablePoints,
            isProfileUpdate:false,
            isFeedback:false,
            feedbackPoints:0,
            profilePoints:0,
            membershipCycle:getTrack[getTrack.length-1].membershipCycle,
            giftingPoints: {
                bonusCoins: getMembership.milestoneAchievementBonusCoinsBenefits['silver'],
                tierBenefits: getMembership.milestoneAchievementTierBenefits['silver'],
                birthdayPoints: getMembership.birthdayBenefits['silver'].points,
                throughoutTheYear: Number(getMembership.throughoutTheYear['silver'].times)*Number(getMembership.throughoutTheYear['silver'].points)
            }
        };
        getTrack.push(record);
        memberShipObj = {
            membershipLevel:'Silver',
            track : getTrack,
            tierEntryDate:newTierEntryDate,
            tierExpiryDate:newTierExpiryDate,
            totalPoints:newTotalPoints,
            availablePoints:newAvailablePoints
        };
    }
    else if(currentLevel==='Silver' && getMembership.maxSilver<(totalPoints-getTrack[getTrack.length-1].totalPoints) && tierEntryDate<currentTime){
        //update the memberShip level to Gold
        // console.log("---Gold Membership---")
        const newTotalPoints = Number(totalPoints) + Number(getMembership.throughoutTheYear['gold'].times)*Number(getMembership.throughoutTheYear['gold'].points);
        const newAvailablePoints = Number(availablePoints) + Number(getMembership.throughoutTheYear['gold'].times)*Number(getMembership.throughoutTheYear['gold'].points);
        isUpdated = true;
        let record = {
            status:"Upgrade",
            membershipLevel:'Gold',
            tierEntryDate:newTierEntryDate,
            tierExpiryDate:newTierExpiryDate,
            totalPoints:newTotalPoints,
            availablePoints:newAvailablePoints,
            isProfileUpdate:false,
            isFeedback:false,
            feedbackPoints:0,
            profilePoints:0,
            membershipCycle:getTrack[getTrack.length-1].membershipCycle,
            giftingPoints: {
                bonusCoins: getMembership.milestoneAchievementBonusCoinsBenefits['gold'],
                tierBenefits: getMembership.milestoneAchievementTierBenefits['gold'],
                birthdayPoints: getMembership.birthdayBenefits['gold'].points,
                throughoutTheYear: Number(getMembership.throughoutTheYear['gold'].times)*Number(getMembership.throughoutTheYear['gold'].points)
            }
        };
        getTrack.push(record);
        memberShipObj = {
            membershipLevel:'Gold',
            track : getTrack,
            tierEntryDate:newTierEntryDate,
            tierExpiryDate:newTierExpiryDate,
            totalPoints:newTotalPoints,
            availablePoints:newAvailablePoints
        };
    }
    else if(currentLevel==='Gold' && getMembership.maxGold<(totalPoints-getTrack[getTrack.length-1].totalPoints) && tierEntryDate<currentTime){
        //update the memberShip level to Gold
        // console.log("---Again Welcome Membership---")
        const newTotalPoints = Number(totalPoints) + Number(getMembership.throughoutTheYear['welcome'].times)*Number(getMembership.throughoutTheYear['welcome'].points);
        const newAvailablePoints = Number(availablePoints) + Number(getMembership.throughoutTheYear['welcome'].times)*Number(getMembership.throughoutTheYear['welcome'].points);
        isUpdated = true;
        let record = {
            status:"Upgrade",
            membershipLevel:'Welcome',
            tierEntryDate:newTierEntryDate,
            tierExpiryDate:newTierExpiryDate,
            totalPoints:newTotalPoints,
            availablePoints:newAvailablePoints,
            isProfileUpdate:false,
            isFeedback:false,
            feedbackPoints:0,
            profilePoints:0,
            membershipCycle:Number(getTrack[getTrack.length-1].membershipCycle)+1,
            giftingPoints: {
                bonusCoins: getMembership.milestoneAchievementBonusCoinsBenefits['welcome'],
                tierBenefits: getMembership.milestoneAchievementTierBenefits['welcome'],
                birthdayPoints: getMembership.birthdayBenefits['welcome'].points,
                throughoutTheYear: Number(getMembership.throughoutTheYear['welcome'].times)*Number(getMembership.throughoutTheYear['welcome'].points)
            }
        };
        getTrack.push(record);
        memberShipObj = {
            membershipLevel:'Welcome',
            track : getTrack,
            tierEntryDate:newTierEntryDate,
            tierExpiryDate:newTierExpiryDate,
            totalPoints:newTotalPoints,
            availablePoints:newAvailablePoints,
            membershipCycle:Number(getTrack[getTrack.length-1].membershipCycle),
        };
    }
    else{
        // console.log("---Not Upgraded Membership---")
        isUpdated = true;
        let currentMembershipLevel = getSellerInfo.membershipLevel==='Welcome' ? 'welcome' : 
                                     getSellerInfo.membershipLevel==='Blue' ? 'blue' :
                                     getSellerInfo.membershipLevel==='Silver' ? 'silver' : 'gold';
        let record = {
            status:"Samegrade",
            membershipLevel:getSellerInfo.membershipLevel,
            tierEntryDate:newTierEntryDate,
            tierExpiryDate:newTierExpiryDate,
            totalPoints,
            availablePoints,
            isProfileUpdate:false,
            isFeedback:false,
            feedbackPoints:0,
            profilePoints:0,
            membershipCycle:Number(getTrack[getTrack.length-1].membershipCycle)
        };
        //Downgrade---->
        const lastTransaction = await Transaction.findOne({
            attributes:['updatedAt'],
            where:{
                sellerId:getSellerInfo.sellerId,
                updatedAt:{
                    [Op.gt]:getSellerInfo.tierEntryDate
                }
            },
            order:[
                ['id','desc']
            ],
            raw:true
        });
        //Check for activity----->If there is no activity then downgrade----->
        if(!lastTransaction && !getSellerInfo.track[getSellerInfo.track.length-1].updateProfile && !getSellerInfo.track[getSellerInfo.track.length-1].isFeedback){
            if(getSellerInfo.membershipLevel==='Gold'){
                getSellerInfo.membershipLevel = "Silver";
                currentMembershipLevel = 'silver';
            }
            else if(getSellerInfo.membershipLevel==='Silver'){
                getSellerInfo.membershipLevel = "Blue";
                currentMembershipLevel = 'blue';
            }
            else if(getSellerInfo.membershipLevel==='Blue'){
                getSellerInfo.membershipLevel = "Welcome";
                currentMembershipLevel = 'welcome';
            }
            record.membershipLevel = getSellerInfo.membershipLevel;
            record.status = "downgrade";
        }
        // console.log("Last Transaction ::>>",lastTransaction);
        //------------->
        record.giftingPoints = {
            bonusCoins: getMembership.milestoneAchievementBonusCoinsBenefits[currentMembershipLevel],
            tierBenefits: getMembership.milestoneAchievementTierBenefits[currentMembershipLevel],
            birthdayPoints: getMembership.birthdayBenefits[currentMembershipLevel].points,
            throughoutTheYear: Number(getMembership.throughoutTheYear[currentMembershipLevel].times)*Number(getMembership.throughoutTheYear[currentMembershipLevel].points)
        }
        getTrack.push(record);
        memberShipObj = {
            membershipLevel:getSellerInfo.membershipLevel,
            track : getTrack,
            tierEntryDate:newTierEntryDate,
            tierExpiryDate:newTierExpiryDate,
        };
    }
    // console.log("isUpdate",isUpdated);
    if(isUpdated){
        // console.log("Membership status ::>>",memberShipObj.track[memberShipObj.track.length-1].status);
        const upgradeSeller = await SellerInfo.update(memberShipObj,{
            where:{
                sellerId
            }
        });
        if(memberShipObj.track[memberShipObj.track.length-1].status==='Upgrade'){
            tierUpgrade(memberShipObj.membershipLevel, getSeller.contactNo);
            membership_upgradation_whatsapp_message(memberShipObj.membershipLevel,getSeller.contactNo);
        }
        else if(memberShipObj.track[memberShipObj.track.length-1].status==='downgrade'){
            membership_downgradation_whatsapp_message(memberShipObj.membershipLevel, getSeller.contactNo);
        }
        return isUpdated;
    }
    // console.log("Nothing To Update::-- on Membership");
    return isUpdated;
};

export const membershipUpgrade = async(req, res, next)=>{
    try{
        // console.log("Membership Upgrade ::------->>");
        const { sellerId } = req.body;
        if(!sellerId || sellerId === ""){
            return next(createError(400, "Please provide sellerID"));
        }
        let [getSeller, getSellerInfo, getMembership] = await Promise.all([
            Seller.findOne({ where: { id: sellerId }, raw: true }),
            SellerInfo.findOne({ where: { sellerId }, raw: true }),
            Membership.findOne({ where: { id: 1 }, raw: true })
        ]);

        if (!getSeller || !getSellerInfo || !getMembership) {
            return next(createError(401, !getSeller ? `Seller not found` : !getSellerInfo ? `Seller Info not found` : `Membership not found`));
        }
        const currentTime = new Date();
        const tierEntryDate = new Date(getSellerInfo.tierEntryDate);
        const tierExpiryDate = new Date(getSellerInfo.tierExpiryDate);
        tierEntryDate.setFullYear(tierEntryDate.getFullYear()+1);
        // console.log("Current Date ::>>",currentTime);
        // console.log("Tier Entry Date ::>>",tierEntryDate);
        // console.log("Tier Expiry Date ::>>",tierExpiryDate);
        // console.log("check ::>>",getSellerInfo.track.length>=1, tierEntryDate<currentTime);
        if(currentTime.getDate()>=getMembership.date && currentTime.getMonth()+1>=getMembership.month && (getSellerInfo.track.length>=1 && tierEntryDate<currentTime)){
            // console.log("|::-- Time To Update ::--|");
            const checkUpdation = await checkInMemberShipOfSeller(sellerId, getSeller, getSellerInfo, getMembership);
            // console.log("Check updation::>>",checkUpdation);
            if(checkUpdation){
                getSellerInfo = await SellerInfo.findOne({
                    where:{
                        sellerId : sellerId
                    },
                    raw: true
                });
            }
        }
        //--------------------------->
        // console.log("<------------------------->");
        // console.log("Get-Seller-Info ::>>",getSellerInfo);
        const address = getSellerInfo.billingAddress;
        const dataToSent = {
            pincode : address.pinCode,
            memberShipId:getSellerInfo.memberShipId,
            membershipLevel:getSellerInfo.membershipLevel,
            tierEntryDate:getSellerInfo.tierEntryDate,
            totalPoints : getSellerInfo.totalPoints,
            earnedPoints : getSellerInfo.earnedPoints,
            availablePoints : getSellerInfo.availablePoints,
            accountID : getSeller.accountId,
            agreedToTerms:getSellerInfo.agreedToTerms
        };
        return res.status(200).json({
            error: false,
            message:"Membership-Upgrade Fetched Succesfully.",
            data:dataToSent
        });
    }
    catch (error) { 
        console.log("Membership-Upgrade Error ::>>",error);
        next(error);
    }
};

// record:{
//     totalPoints:totalPoints,
//     tierEntryDate:tierEntryDate,
//     tierExpiryDate:tierExpiryDate,
//     membershipLevel:membershipLevel,
//     isProfileUpdate:isProfileUpdate,
//     isFeedback:isFeedback,
//     status:['upgrade','downgrade'],
//     membershipCycle:membershipCycle,
//     giftPoints:{
//         tierBenefits:tierBenefits,
//         bonusCoins:bonusCoins,
//         throughoutTheYear:throughoutTheYear,
//         birthdayPoints:birthdayPoints
//     }
// }

const tierUpgrader = async(sellerId, getSeller, getSellerInfo, getMembership, transaction)=>{
    try {
        let isUpdated = false;
        const currentLevel = getSellerInfo.membershipLevel;
        const totalPoints = getSellerInfo.totalPoints;
        const availablePoints = getSellerInfo.availablePoints;
        const finacialPoints = getSellerInfo.finacialPoints;
        const earnedPoints = getSellerInfo.earnedPoints;
        const currentTime = new Date();
        const tierEntryDate = new Date();
        let memberShipObj = {};
        let track = {};
        // console.log("Current Level ::>>",currentLevel);
        // console.log("CurrentTime ::>>",currentTime);
        // console.log("Total Points ::>>",totalPoints);
        // console.log("Points ::>>",totalPoints,getTrack[getTrack.length-1].totalPoints);
        // console.log("Net Points ::>>",totalPoints-getTrack[getTrack.length-1].totalPoints);
        if(currentLevel==='Welcome' && getMembership.maxWelcome<(finacialPoints)){
            // update the memberShip level to blue
            // console.log("---BLue Membership---");
            isUpdated = true;   
            track = {
                membershipStatus:"UPGRADE",
                membershipLevel:'Blue',
                earnedPoints:earnedPoints,
                tierEntryDate:tierEntryDate,
                isProfileUpdate:false,
                isFeedback:false,
                feedbackPoints:0,
                profilePoints:0,
                bonusPoints: getMembership.milestoneAchievementBonusCoinsBenefits['blue'],
                tierBenefitsPoints: getMembership.milestoneAchievementTierBenefits['blue'],
                birthdayPoints: getMembership.birthdayBenefits['blue'].points,
                throughoutTheYearPoints: Number(getMembership.throughoutTheYear['blue'].times)*Number(getMembership.throughoutTheYear['blue'].points)
            };
            const newTotalPoints = Number(totalPoints) + Number(track.bonusPoints) + Number(track.tierBenefitsPoints);
            const newAvailablePoints = Number(availablePoints) + Number(track.bonusPoints) + Number(track.tierBenefitsPoints);
            const newFinacialPoints = Number(finacialPoints) + Number(track.bonusPoints) + Number(track.tierBenefitsPoints);
            track.totalPoints = newTotalPoints;
            track.availablePoints = newAvailablePoints;
            track.finacialPoints = newFinacialPoints;
            memberShipObj = {
                membershipLevel:'Blue',
                tierEntryDate:tierEntryDate,
                totalPoints:newTotalPoints,
                availablePoints:newAvailablePoints,
                finacialPoints:newFinacialPoints
            };
        }
        else if(currentLevel==='Blue' && getMembership.maxBlue<(finacialPoints)){
            //update the memberShip level to Silver
            // console.log("---Silver Membership---")
            //update points Total Points & available points
            isUpdated = true;
            track = {
                membershipStatus:"UPGRADE",
                membershipLevel:'Silver',
                earnedPoints:earnedPoints,
                tierEntryDate:tierEntryDate,
                isProfileUpdate:false,
                isFeedback:false,
                feedbackPoints:0,
                profilePoints:0,
                bonusPoints: getMembership.milestoneAchievementBonusCoinsBenefits['silver'],
                tierBenefitsPoints: getMembership.milestoneAchievementTierBenefits['silver'],
                birthdayPoints: getMembership.birthdayBenefits['silver'].points,
                throughoutTheYearPoints: Number(getMembership.throughoutTheYear['silver'].times)*Number(getMembership.throughoutTheYear['silver'].points)
            };
            const newTotalPoints = Number(totalPoints) + Number(track.bonusPoints) + Number(track.tierBenefitsPoints);
            const newAvailablePoints = Number(availablePoints) + Number(track.bonusPoints) + Number(track.tierBenefitsPoints);
            const newFinacialPoints = Number(finacialPoints) + Number(track.bonusPoints) + Number(track.tierBenefitsPoints);
            track.totalPoints = newTotalPoints;
            track.availablePoints = newAvailablePoints;
            track.finacialPoints = newFinacialPoints;
            memberShipObj = {
                membershipLevel:'Silver',
                tierEntryDate:tierEntryDate,
                totalPoints:newTotalPoints,
                availablePoints:newAvailablePoints,
                finacialPoints:newFinacialPoints
            };
        }
        else if(currentLevel==='Silver' && getMembership.maxSilver<(finacialPoints)){
            //update the memberShip level to Gold
            // console.log("---Gold Membership---")
            isUpdated = true;
            track = {
                membershipStatus:"UPGRADE",
                membershipLevel:'Gold',
                earnedPoints:earnedPoints,
                tierEntryDate:tierEntryDate,
                isProfileUpdate:false,
                isFeedback:false,
                feedbackPoints:0,
                profilePoints:0,
                bonusPoints: getMembership.milestoneAchievementBonusCoinsBenefits['gold'],
                tierBenefitsPoints: getMembership.milestoneAchievementTierBenefits['gold'],
                birthdayPoints: getMembership.birthdayBenefits['gold'].points,
                throughoutTheYearPoints: Number(getMembership.throughoutTheYear['gold'].times)*Number(getMembership.throughoutTheYear['gold'].points)
            };
            const newTotalPoints = Number(totalPoints) + Number(track.bonusPoints) + Number(track.tierBenefitsPoints);
            const newAvailablePoints = Number(availablePoints) + Number(track.bonusPoints) + Number(track.tierBenefitsPoints);
            const newFinacialPoints = Number(finacialPoints) + Number(track.bonusPoints) + Number(track.tierBenefitsPoints);
            track.totalPoints = newTotalPoints;
            track.availablePoints = newAvailablePoints;
            track.finacialPoints = newFinacialPoints;
            memberShipObj = {
                membershipLevel:'Gold',
                tierEntryDate:tierEntryDate,
                totalPoints:newTotalPoints,
                availablePoints:newAvailablePoints,
                finacialPoints:newFinacialPoints
            };
        } 
        // console.log("IsUpdated ::>>", isUpdated);
        if(isUpdated){
            // console.log("Membership status ::>>",track?.membershipStatus);
            const createTrack = await SellerMembershipTrack.create({...track, sellerId, memberShipId:getSellerInfo.memberShipId},{transaction});
            await membershipPointTransaction({...track, sellerId}, transaction);
            const upgradeSeller = await SellerInfo.update(memberShipObj,{
                where:{
                    sellerId
                },
                transaction
            });

            if(track.membershipStatus==='UPGRADE'){
                tierUpgrade(memberShipObj.membershipLevel, getSeller.contactNo);
                membership_upgradation_whatsapp_message(memberShipObj.membershipLevel,getSeller.contactNo);
            }
            // else if(memberShipObj.track[memberShipObj.track.length-1].status==='downgrade'){
            //     membership_downgradation_whatsapp_message(memberShipObj.membershipLevel, getSeller.contactNo);
            // }
        }
        return isUpdated;
    } catch (error) {
        console.log("Tier Upgrader Error ::>>", error);
        throw error;
    }
};

export const tierUpgradation = async (req, res, next)=>{
    const transaction = await sequelize.transaction();
    try {
        const { sellerId } = req.body;
        if(!sellerId || sellerId === ""){
            return next(createError(400, "Please provide sellerID"));
        }
        let [getSeller, getSellerInfo, getMembership] = await Promise.all([
            Seller.findOne({ where: { id: sellerId }, raw: true }),
            SellerInfo.findOne({ where: { sellerId }, raw: true }),
            Membership.findOne({ where: { id: 1 }, raw: true })
        ]);

        if (!getSeller || !getSellerInfo || !getMembership) {
            return next(createError(401, !getSeller ? `Seller not found` : !getSellerInfo ? `Seller Info not found` : `Membership not found`));
        }

        //check is here
        const checkUpdation = await tierUpgrader(sellerId, getSeller, getSellerInfo, getMembership, transaction);
        // console.log("Check updation::>>",checkUpdation);
        if(checkUpdation){
            getSellerInfo = await SellerInfo.findOne({
                where:{
                    sellerId : sellerId
                },
                raw: true
            });
        }
        const address = getSellerInfo.billingAddress;
        const dataToSent = {
            pincode : address.pinCode,
            memberShipId:getSellerInfo.memberShipId,
            membershipLevel:getSellerInfo.membershipLevel,
            tierEntryDate:getSellerInfo.tierEntryDate,
            totalPoints : getSellerInfo.totalPoints,
            earnedPoints : getSellerInfo.earnedPoints,
            availablePoints : getSellerInfo.availablePoints,
            finacialPoints : getSellerInfo.finacialPoints,
            accountID : getSeller.accountId,
            agreedToTerms:getSellerInfo.agreedToTerms
        };
        await transaction.commit();
        return res.status(200).json({
            error: false,
            message:"Membership-Upgrade Fetched Succesfully.",
            data:dataToSent
        });
    } catch (error) {
        await transaction.rollback();
        console.log("Tier Upgration Error ::>>", error);
        next(error);
    }
}

const membershipPointTransaction = async(queryObj, transaction)=>{
    try {
        const pointTransaction = [];
        let ptObj = {
            sellerId:queryObj.sellerId,
            status:'Earn',
            createdIstAt:DateTime(),
            updatedIstAt:DateTime()
        };
        if(queryObj.bonusPoints!==0){
            pointTransaction.push({...ptObj, points:queryObj.bonusPoints, transactionId:generateTransactionId(), transactionCategory:queryObj.membershipLevel+'BonusPoints'});
        }
        if(queryObj.tierBenefitsPoints!==0){
            pointTransaction.push({...ptObj, points:queryObj.tierBenefitsPoints, transactionId:generateTransactionId(), transactionCategory:queryObj.membershipLevel+'TierBenefits'});
        }
        if(pointTransaction.length){
            const createTransaction = await Transaction.bulkCreate(pointTransaction,{transaction:transaction});
            return createTransaction;
        }
    } catch (error) {
        console.log("Membership Point Transaction Error::>>", error);
        throw error;
    }
}

export const downgradeTierNotify = async(req, res, next)=>{
    try {
        let isUpdated = false;
        const { sellerId } = req.body;
        if(!sellerId || sellerId === ""){
            return next(createError(400, "Please provide sellerID"));
        }
        let [getSeller, getSellerInfo, getMembership] = await Promise.all([
            Seller.findOne({ where: { id: sellerId }, raw: true }),
            SellerInfo.findOne({ where: { sellerId }, raw: true }),
            Membership.findOne({ where: { id: 1 }, raw: true })
        ]);

        if (!getSeller || !getSellerInfo || !getMembership) {
            return next(createError(401, !getSeller ? `Seller not found` : !getSellerInfo ? `Seller Info not found` : `Membership not found`));
        }

        const currentLevel = getSellerInfo.membershipLevel

        // Calculate the date three months ago from today
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        // Calculate the date three months ago from today
        const oneMonthsAfter = new Date();
        oneMonthsAfter.setMonth(oneMonthsAfter.getMonth() + 1);

        // Query for transactions within the last six months
        const transactions = await Transaction.findAll({
            where: {
            sellerId:getSellerInfo.sellerId,
            updatedAt:{
                [Op.gte]: threeMonthsAgo // `gte` is "greater than or equal to"
            }
            },
            order: [['updatedAt', 'DESC']]
        });

        const record = {
            sellerId: sellerId,
            accountId: getSeller.accountId,
            memberShipId: getSellerInfo.memberShipId,
            membershipLevel: currentLevel,
            actionOnDate: oneMonthsAfter,
            gracePeriodFor: "Membership",
            message: "Not do any activity"
        };
        if(transactions.length === 0)
        {
            isUpdated = true;
            if(currentLevel==='Blue'){
                record.moveToTier = 'Welcome'
            }
            else if(currentLevel==='Silver'){
              record.moveToTier = 'Blue'
            }
            else if(currentLevel==='Gold'){
               record.moveToTier = 'Silver'
            } 
            else if(currentLevel==='Welcome'){
                record.moveToTier = 'Welcome'
            } 
    }
        if(isUpdated){
            await SellerGracePeriodRecord.create(record);
            membership_downgradation_whatsapp_message(currentLevel, getSeller.contactNo);
            await getSellerInfo.update({
                activityStatus: "NotFullfilled",
            },
            {
                where: {
                    sellerId:getSellerInfo.sellerId
                }
            })
        }
        return res.status(200).json({
            error: false,
            message:"Membership-Downgrade Notify Succesfully."
        });
    } catch (error) {
        console.log("Downgrade Tier Error ::>>", error);
        next(error);
    }
}

// Actual downgrade api running on one month grace period
export const downgradeTier = async(req, res, next)=>{
    const transaction = await sequelize.transaction();
    try {
        let isUpdated = false;
        const { sellerId } = req.body;
        if(!sellerId || sellerId === ""){
            return next(createError(400, "Please provide sellerID"));
        }
        let [getSeller, getSellerInfo, getMembership] = await Promise.all([
            Seller.findOne({ where: { id: sellerId }, raw: true }),
            SellerInfo.findOne({ where: { sellerId }, raw: true }),
            Membership.findOne({ where: { id: 1 }, raw: true })
        ]);

        if (!getSeller || !getSellerInfo || !getMembership) {
            return next(createError(401, !getSeller ? `Seller not found` : !getSellerInfo ? `Seller Info not found` : `Membership not found`));
        }


        const currentLevel = getSellerInfo.membershipLevel;
        const totalPoints = getSellerInfo.totalPoints;
        const availablePoints = getSellerInfo.availablePoints;
        const finacialPoints = getSellerInfo.finacialPoints;
        const earnedPoints = getSellerInfo.earnedPoints;
        const currentTime = new Date();
        const tierEntryDate = new Date();
        let memberShipObj = {};
        let track = {};
       
        if(currentLevel==='Blue'){
            // update the memberShip level to blue
            // console.log("---BLue Membership---");
            isUpdated = true;   
            track = {
                membershipStatus:"DOWNGRADE",
                membershipLevel:'Welcome',
                earnedPoints:earnedPoints,
                tierEntryDate:tierEntryDate,
                isProfileUpdate:false,
                isFeedback:false,
                feedbackPoints:0,
                profilePoints:0
            };
            const newFinacialPoints = 0;
            track.totalPoints = totalPoints;
            track.availablePoints = availablePoints;
            track.finacialPoints = newFinacialPoints;
            memberShipObj = {
                membershipLevel:'Welcome',
                tierEntryDate:tierEntryDate,
                finacialPoints:newFinacialPoints
            };
        }
        else if(currentLevel==='Silver'){
            isUpdated = true;
            track = {
                membershipStatus:"DOWNGRADE",
                membershipLevel:'Blue',
                earnedPoints:earnedPoints,
                tierEntryDate:tierEntryDate,
                isProfileUpdate:false,
                isFeedback:false,
                feedbackPoints:0,
                profilePoints:0,
            };
            
            track.totalPoints = totalPoints;
            track.availablePoints = availablePoints;
            track.finacialPoints = 0;
            memberShipObj = {
                membershipLevel:'Blue',
                tierEntryDate:tierEntryDate,
                finacialPoints:0
            };
        }
        else if(currentLevel==='Gold'){
            //update the memberShip level to Gold
            // console.log("---Gold Membership---")
            isUpdated = true;
            track = {
                membershipStatus:"DOWNGRADE",
                membershipLevel:'Silver',
                earnedPoints:earnedPoints,
                tierEntryDate:tierEntryDate,
                isProfileUpdate:false,
                isFeedback:false,
                feedbackPoints:0,
                profilePoints:0,
            };
            track.totalPoints = totalPoints;
            track.availablePoints = availablePoints;
            track.finacialPoints = 0;
            memberShipObj = {
                membershipLevel:'Silver',
                tierEntryDate:tierEntryDate,
                finacialPoints:0
            };
        } 
        else if(currentLevel==='Welcome'){
            //update the memberShip level to Gold
            // console.log("---Gold Membership---")
            isUpdated = true;
            track = {
                membershipStatus:"DOWNGRADE",
                membershipLevel:'Welcome',
                earnedPoints:earnedPoints,
                tierEntryDate:tierEntryDate,
                isProfileUpdate:false,
                isFeedback:false,
                feedbackPoints:0,
                profilePoints:0,
            };
            track.totalPoints = totalPoints;
            track.availablePoints = availablePoints;
            track.finacialPoints = 0;
            memberShipObj = {
                membershipLevel:'Welcome',
                tierEntryDate:tierEntryDate,
                finacialPoints:0
            };
        } 
        // console.log("IsUpdated ::>>", isUpdated);
        if(isUpdated){
            // console.log("Membership status ::>>",track?.membershipStatus);
            const createTrack = await SellerMembershipTrack.create({...track, sellerId, memberShipId:getSellerInfo.memberShipId},{transaction});
            const upgradeSeller = await SellerInfo.update(memberShipObj,{
                where:{
                    sellerId
                },
                transaction
            });
            membership_downgradation_whatsapp_message(memberShipObj.membershipLevel, getSeller.contactNo);
        }
        await transaction.commit();
        return res.status(200).json({
            error: false,
            message:"Membership-Downgrade Succesfully."
        });
    } catch (error) {
        await transaction.rollback();
        console.log("Downgrade Tier Error ::>>", error);
        next(error);
    }
}

