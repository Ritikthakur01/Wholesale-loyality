import { Op } from "sequelize";
import DateTime from "../../utils/constant/getDate&Time";
import { createError } from "../../utils/error";
import { Category } from "../models/Category";
import { DSProduct } from "../models/DSProduct";


export const createCategory = async (req, res, next) => {
    try {

        const { categoryName, parentId, status } = req.body

        if (!categoryName || categoryName == "") {
            return next(createError(402, "Please provide category name."));
        }

        if (!status || status == "" || (status != 'Active' && status != 'Inactive')) {
            return next(createError(402, "Invalid Status"));
        }

        let isExistCategory = await Category.findOne({ where: { categoryName: categoryName } })

        if (isExistCategory) {
            return next(createError(402, "This category already exist."));
        }

        const isParentExist = await Category.create({
            categoryName: categoryName,
            parentId: parentId ? parentId : -1,
            status: status,
            updateByStaff: req.user.data.name,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        })

        if (!isParentExist) {
            return next(createError(503, "Failed to add the new category."))
        }

        return res.status(200).json({
            error: false,
            message: "Category has been added successfully.",
            data: isParentExist
        });

    } catch (error) {
        console.error("Create Category Error:", error.message);
        next(error);
    }
};

export const getCategoryById = async (req, res, next) => {
    try {

        const { categoryId } = req.body;

        if (!categoryId || categoryId == "") {
            return next(createError(402, "Please provide category Id."))
        }

        const category = await Category.findOne({ where: { id: categoryId }, raw: true });

        if (!category) {
            return next(createError(404, 'No such category found.'))
        }

        return res.status(200).json({
            error: false,
            message: "Category has been fetched successfully.",
            data: category
        });

    } catch (error) {
        console.error("get Category Error:", error.message);
        next(error);
    }
};

export const updateCategoryById = async (req, res, next) => {
    try {

        const { categoryId, categoryName, parentId, status } = req.body;

        if (!categoryId || categoryId == "") {
            return next(createError(402, "Please provide category Id."))
        }

        const category = await Category.update({
            categoryName: categoryName,
            status: status,
            parentId: parentId,
            updateByStaff: req.user.data.name,
            updatedIstAt: DateTime()
        },
            {
                where: {
                    id: categoryId
                }
            })

        if (!category || category == 0) {
            return next(createError(404, 'No such category found.'))
        }

        return res.status(200).json({
            error: false,
            message: "Category has been updated successfully.",
            data: category
        });

    } catch (error) {
        console.error("Update Category Error:", error.message);
        next(error);
    }
};

export const deleteCategoryById = async (req, res, next) => {
    try {
        const { categoryId } = req.body;

        if (!categoryId || categoryId == "") {
            return next(createError(402, "Please provide category Id."));
        }
        const getDSProduct = await DSProduct.findOne({
            where:{
                categoryId:categoryId
            },
            raw:true
        });
        if(getDSProduct){
            return next(createError(402, "You have to delete first DS products then you will be delete this category."))
        }
        const category = await Category.destroy({
            where: {
                id: categoryId
            }
        })

        if (!category || category == 0) {
            return next(createError(404, 'No such category found.'))
        }


        return res.status(200).json({
            error: false,
            message: "Category has been deleted successfully.",
            data: category
        });

    } catch (error) {
        console.error("Delete Category Error:", error.message);
        next(error);
    }
};


export const getAllCategory = async (req, res, next) => {
    try {

        let { page, limit, status, sortBy } = req.body;

        if (!page || page === "") {
            return next(createError(403, "Please provide page no!"));
        }

        let pageNo = page || 1;
        const limitForShowCategory = limit || 10;

        let offset = limitForShowCategory * (pageNo - 1);

        let sort = !sortBy ? "DESC" : sortBy == "ascending" ? "ASC" : "DESC"

        let whereClause = {};
        
        if (status) {
            whereClause.status = status;
        }
        
        const getAllCategory = await Category.findAll({
            where: whereClause,
            limit: limitForShowCategory,
            offset: offset,
            order: [['id', sort],['categoryName','ASC']],
        });

        const totalCategory = await Category.count();

        return res.status(200).json({
            error: false,
            message: "All Category has been fetched successfully.",
            totalCount : totalCategory,
            totalCountInPage : getAllCategory.length,
            data: getAllCategory
        });

    } catch (error) {
        console.error("get all Category Error:", error.message);
        next(error);
    }
};

export const searchCategoryByName = async (req, res, next) => {
    try {
        let { search } = req.body;
        let whereClause = {};
        if(search){
            whereClause.categoryName={
                [Op.substring]:search
            }
        }
        const getAllCategory = await Category.findAll({
            where: whereClause,
            order: [['categoryName','ASC']],
            raw:true
        });

        return res.status(200).json({
            error: false,
            message: "All Category has been fetched successfully.",
            data: getAllCategory
        });

    } catch (error) {
        console.error("get all Category Error:", error.message);
        next(error);
    }
};
