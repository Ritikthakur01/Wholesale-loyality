
export const generateMemberShipId = ()=>{
    const timestamp = Date.now().toString(36); // Convert current timestamp to base36 string
    const randomString = Math.random().toString(36).substring(2, 6); // Generate a random string
  
    const accountNumber = `MBL-${timestamp}${randomString}`; //DSG-1z2jvxzoi1zy8
    return accountNumber.toUpperCase(); // Convert to uppercase for consistency
}

