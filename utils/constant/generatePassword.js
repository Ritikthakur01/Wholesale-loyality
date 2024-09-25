
const generateRandomPassword = (length = 8)=>{
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '@';
    
    let password = '';
    const allChars = lowercase + uppercase + numbers + symbols;
    
    // Ensure at least one character from each group
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Generate the rest of the password
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password characters randomly
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    // console.log("|--:Password:--|::>>",password);
    return password;
      
}

export default generateRandomPassword;