import { CouponCode } from "../../src/models/Coupon";

const getSerialNumber = async() => {
    const serialNo = await CouponCode.findOne({
        attributes : [ 'id' , 'serialNo' ],
        order:[
            ['id','desc']
        ],
        raw:true
    });
    console.log("GetSerialNumber ::>>", serialNo);
    if(serialNo===null){
        return "000000000";
    }
    return serialNo.serialNo;
};

export default getSerialNumber;