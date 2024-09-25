import { fn, col, Op, json, literal, Sequelize } from "sequelize";
import DateTime from "../../utils/constant/getDate&Time";
import { createError } from "../../utils/error";
import { DSProductTag } from "../models/ProductTag";
import { Seller, SellerInfo } from "../models/Seller";
import sequelize from "../../utils/db/dbConnection";


export const getEnrollementData = async (req, res, next) => {
    try {

        const currentYear = new Date().getFullYear();

        const monthlyRegistrations = await Seller.findAll({
            attributes: [
                [fn('DATE_FORMAT', col('createdAt'), '%b'), 'month'],  // Abbreviated month name
                [fn('COUNT', col('id')), 'totalRegistrations']
            ],
            where: {
                createdAt: {
                    [Op.between]: [new Date(`${currentYear}-01-01`), new Date(`${currentYear}-12-31`)]
                }
            },
            group: [fn('DATE_FORMAT', col('createdAt'), '%b')],  // Group by month name
            order: [[literal('MIN(createdAt)'), 'ASC']]  // Order by the minimum created date to ensure the correct month order
        });

        // const cityWiseSellers = await SellerInfo.findAll({
        //     attributes: [
        //         [json('billingAddress.city'), 'city'],
        //         [fn('COUNT', col('id')), 'totalSellers']
        //     ],
        //     group: [json('billingAddress.city')],
        //     order: [[json('billingAddress.city'), 'ASC']]
        // });
        
        const query = `SELECT
            JSON_UNQUOTE(JSON_EXTRACT(billingAddress, '$.city')) AS city,
            COUNT(DISTINCT si.sellerId) AS totalSellers,  -- Count of all sellers
            COUNT(DISTINCT CASE 
                            WHEN ts.createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                                AND ts.status IN ('earn', 'redeem')  -- Active condition
                            THEN si.sellerId
                        END) AS totalActiveSellers  -- Count of active sellers
            FROM
                sellerInfos si
            LEFT JOIN
                transactions ts ON si.sellerId = ts.sellerId  -- Join transactions
            GROUP BY
                JSON_UNQUOTE(JSON_EXTRACT(billingAddress, '$.city'))
            ORDER BY
                city ASC;
            `;
        const cityWiseSellers = await sequelize.query(query, {
            replacements: [],
            type: Sequelize.QueryTypes.SELECT
        });

        return res.status(200).json({
            error: false,
            message: "Analytics data successfully.",
            monthlyRegistrations: monthlyRegistrations,
            cityWiseSellers: cityWiseSellers
        });

    } catch (error) {
        console.error("Get Enrollment Data Tag Error:", error.message);
        next(error);
    }
};

export const Top5cities = async (req, res, next) => {
    try {
        console.log("Top 5 cities ::>>>");
        const query = `SELECT 
                JSON_UNQUOTE(JSON_EXTRACT(si.billingAddress, '$.city')) AS city,
                JSON_UNQUOTE(JSON_EXTRACT(si.billingAddress, '$.state')) AS state,
                COUNT(si.sellerId) AS totalUsers
                FROM 
                    sellerinfos si
                JOIN 
                    sellers s ON s.id = si.sellerId
                GROUP BY 
                    city, state
                ORDER BY 
                    totalUsers DESC
                LIMIT 5;
        `;
        const data = await sequelize.query(query, {
            replacements: [],
            type: Sequelize.QueryTypes.SELECT
        });
        return res.status(200).json({
            error: false,
            message: 'Maximum Seller from Top 5 Cities',
            data: data
        })
    } catch (error) {
        console.log("Top5Cities ::>>>", error);
        next(error);
    }
}

export const Top5ActiveMembers = async (req, res, next) => {
    try {
        console.log("7782587872 top 5 members ::>>");
        const query = `
        SELECT 
        s.id,
        s.firstName,
        s.lastName,
        MAX(JSON_UNQUOTE(JSON_EXTRACT(si.billingAddress, '$.state'))) AS state,
        MAX(JSON_UNQUOTE(JSON_EXTRACT(si.billingAddress, '$.city'))) AS city,
        COUNT(t.id) AS totalTransactions
        FROM 
            sellers s
        LEFT JOIN
            sellerinfos si ON s.id = si.sellerId
        JOIN 
            transactions t ON s.id = t.sellerId
        WHERE 
            t.status IN ('Earn', 'Redeem')
        GROUP BY 
            s.id, s.firstName, s.lastName
        ORDER BY 
        totalTransactions DESC
        LIMIT 5;
        `;
        const data = await sequelize.query(query, {
            replacements: [],
            type: Sequelize.QueryTypes.SELECT
        });
        return res.status(200).json({
            error: false,
            message: 'Top 5 active member',
            data: data
        })
    } catch (error) {
        console.log("Top5ActiveMembers ::>>>", error);
        next(error);
    }
}