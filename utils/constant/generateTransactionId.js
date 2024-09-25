import crypto from 'crypto';

const generateTransactionId = () =>{
    return crypto.randomBytes(16).toString("hex");;
}

export default generateTransactionId;