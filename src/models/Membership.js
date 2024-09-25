import { DataTypes } from "sequelize";
import sequelize from "../../utils/db/dbConnection";

export const Membership = sequelize.define('membership', {
    minWelcome: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    maxWelcome: {
        type: DataTypes.INTEGER
    },
    minBlue: {
        type: DataTypes.INTEGER,
    },
    maxBlue: {
        type: DataTypes.INTEGER
    },
    minSilver: {
        type: DataTypes.INTEGER,
    },
    maxSilver: {
        type: DataTypes.INTEGER
    },
    minGold: {
        type: DataTypes.INTEGER
    },
    maxGold: {
        type: DataTypes.INTEGER
    },
    date: {
        type: DataTypes.INTEGER
    },
    month: {
        type: DataTypes.INTEGER
    },
    duration: {
        type: DataTypes.INTEGER,
        defaultValue: 12
        //month  
    },
    profilePoints: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    feedbackPoints: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    birthdayBenefits: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    milestoneAchievementTierBenefits: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    milestoneAchievementBonusCoinsBenefits: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    startDate: {
        type: DataTypes.STRING
    },
    endDate: {
        type: DataTypes.STRING
    },
    campaignName: {
        type: DataTypes.STRING
    },
    campaignType: {
        type: DataTypes.STRING
    },
    campaignStatus: {
        type:DataTypes.ENUM,
        values:['Active','Inactive'],
        defaultValue: "Active"
    },
    throughoutTheYear: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    updateByStaff: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createdIstAt: {
        type: DataTypes.STRING,
    },
    updatedIstAt: {
        type: DataTypes.STRING,
    }
});

//profilePoints:{
//     welcome:points,
//     blue:points,
//     silver:points,
//     gold:points,
// }

//feedbackPoints:{
//     welcome:points,
//     blue:points,
//     silver:points,
//     gold:points,
// }

// birthdayBenefits:{
//     welcome:{
//         points:points,
//         expiryDays:days
//     },
//     blue:{
//         points:points,
//         expiryDays:days
//     },
//     silver:{
//         points:points,
//         expiryDays:days
//     },
//     gold:{
//         points:points,
//         expiryDays:days
//     }
// }

// milestoneAchievementTierBenefits:{
//     welcome:points
//     blue:points,
//     silver:points,
//     gold:points
// }

// milestoneAchievementBonusCoinsBenefits:{
//     welcome:points
//     blue:points,
//     silver:points,
//     gold:points
// }

// throughoutTheYear:{
//     welcome:{
//         points:points,
//         times:times
//     },
//     blue:{
//         points:points,
//         times:times
//     },
//     silver:{
//         points:points,
//         times:times
//     },
//     gold:{
//         points:points,
//         times:times
//     }
// }