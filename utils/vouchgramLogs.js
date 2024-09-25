import { Logger } from "../src/models/Logger";

const VouchagramLog = async(requestedPath, requestedBody, status, message)=>{
    try {
        const createLog = await Logger.create({
            requestedPath:requestedPath,
            requestedBody:requestedBody,
            status:status,
            message:message,
            fromServer:'VOUCHAGRAM'
        });
    } catch (error) {
        console.log("Create Vouchagram Log Error ::>>",error);
        return error;
    }
}

export default VouchagramLog;