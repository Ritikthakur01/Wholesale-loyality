// cronJobs.js

import cron from 'node-cron';
import { couponCodesGetExpiredFunc } from '../../src/controllers/couponController';
import { expirySellerPoints, sellersPointsExpiryNotify, sendWishes } from '../../src/controllers/sellerController';
import { downgradeTier, downgradeTierNotify } from '../../src/controllers/membershipController';

// Define a cron job
export const myCronJob = cron.schedule('59 23 * * *', async() => {
  console.log('==================Cron job running to expire coupan=================');
  const response = await couponCodesGetExpiredFunc();
  console.log(response, "response")
}, {
  scheduled: false // Start the job manually later
});

export const myCronPointExpire = cron.schedule('0 1 * * *', async() => {
  console.log('==================Cron job running to point expire =================');
  const response = await expirySellerPoints();
  console.log(response, "response")
}, {
  scheduled: false // Start the job manually later
});

export const downgradeNotifyCronJob = cron.schedule('0 0 1 4 *', async() => {
  console.log('===============Cron job Running the task on the 1st of April at midnight================');
    // Your task logic goes here
  const response = await downgradeTierNotify();
  console.log(response, "response")
}, {
  scheduled: false // Start the job manually later
});

export const downgradeCronJob = cron.schedule('0 0 1 5 *', async() => {
  console.log('===============Cron job Running the task on the 1st of May at midnight================');
    // Your task logic goes here
  const response = await downgradeTier();
  console.log(response, "response")
}, {
  scheduled: false // Start the job manually later
});
 
export const wishCronJob = cron.schedule('0 8 * * *', async() => {
  console.log('===============Cron job Running the task at 8am daily for wishing================');
    // Your task logic goes here
  const response = await sendWishes();
  console.log(response, "response")
}, {
  scheduled: false // Start the job manually later
});

export const cronJobForSellerPointsNotify = cron.schedule('0 9 * * *', async() => {
  console.log('===============Cron job Running the task at 9am daily for wishing================');
    // Your task logic goes here
  const response = await sellersPointsExpiryNotify();
  // console.log(response, "response")
}, {
  scheduled: false // Start the job manually later
});
