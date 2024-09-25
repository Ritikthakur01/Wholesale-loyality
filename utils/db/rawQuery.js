import sequelize from "./dbConnection";

const Query = async(query) => {
    const result = await sequelize.query(query);
    return result[0];
};

export default Query;