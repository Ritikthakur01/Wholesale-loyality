
const generateSalt = ()=>{
    return new Date().getMilliseconds()%14;
}

export default generateSalt;