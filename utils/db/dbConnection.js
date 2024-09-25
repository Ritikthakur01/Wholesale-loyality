import { Sequelize, DataTypes, ConnectionTimedOutError } from "sequelize";
import dotenv from 'dotenv';
dotenv.config();
// Sequelize.use(MysqlDialect)
let hosts = process.env.HOST;
let sslhost = hosts!=='localhost' 
    ? { ssl:{
    require: true,
    rejectUnauthorized: false
    }} : {};
    
    // sslhost.useUTC = false;
    // // sslhost.timezone = '+05:30';
    // sslhost.timezone = 'Asia/Calcutta';
    // console.log(process.env.HOST,'check_SSL ::>>',sslhost)

const dbConfig = {
    HOST:process.env.HOST,
    PORT:process.env.DB_PORT,
    USER:process.env.DB_USER,
    DB:process.env.DB,
    PASSWORD:process.env.PASSWORD,
    pool:{
        max:150,
        min:0,
        acquire:90000,
        idle:5000
    }
};

const sequelize = new Sequelize({
    database: dbConfig.DB,
    username: dbConfig.USER,
    password: dbConfig.PASSWORD,
    host: dbConfig.HOST,
    dialect: 'mysql',
    logging:false,
    port: dbConfig.PORT,
    dialectOptions: {
       connectTimeout:60000
    },
    pool:dbConfig.pool 
  })

  sequelize.authenticate().then(() => {
    console.log('|--:DB Connection has been established successfully:--|.');
 }).catch((error) => {
    console.error('|--:Unable to connect to the Database:--|', error.message);
 });

export default sequelize;
