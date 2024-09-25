import { TransactionLog } from "../../src/models/TransactionLog";


export const zillionSuccessResponse = async(req, res, next)=>{
    try {
        let status = 'success';
        let message = res.res_data.message;
        if(res?.res_data){
            await TransactionLog.create({
                requestedPath: req.originalUrl,
                requestedBody: req.body,
                status: status,
                account: req.zUser,
                message: message,
                });
            return res.status(200).json(res.res_data)
        }
        next();
    } catch (error) {
        console.log("Zillion Success Response Error :>>", error);
        next(error);
    }
}

export const zillionErrorResponse = async(error, req, res, next)=>{
    try {
        const errorStatus = error.status || 500;
        const errorMessage = error.message || "Something went wrong on Server::";
        await TransactionLog.create({
            requestedPath:req.originalUrl,
            requestedBody:req.body,
            status:errorStatus,
            account: req.zUser,
            message:errorMessage,
            stack:error.stack
        });
        return res.status(errorStatus).json({
            error: true,
            success: false,
            status: errorStatus,
            message: errorMessage,
            stack: error.stack
        })
    } catch (error) {
        console.log("Zillion Error Response Error :>>", error);
        next(error)
    }
}