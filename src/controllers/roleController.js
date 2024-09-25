import DateTime from "../../utils/constant/getDate&Time";
import Query from "../../utils/db/rawQuery";
import { createError } from "../../utils/error";
import { Permission } from "../models/Permission";
import { Role } from "../models/Role";

export const addRole = async(req, res, next) => {
    try {
        if (!req.body.roleName || req.body.roleName === "") {
            return next(createError(403, "Enter the valid Role Name"));
        }
        const roleObj = {
            roleName:req.body.roleName,
            status:req.body.status===true ? "Active" :"Inactive",
            createdIstAt: DateTime(),
            updatedIstAt: DateTime(),
            updateByStaff:req.user.data.name
        };
        const newRole = await Role.create(roleObj);
        const permsn = req.body.permissions;
        const perm1Obj = {
            roleId:newRole.id,
            moduleName:"coupon",
            access:permsn.coupon,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        };
        const perm1 = await Permission.create(perm1Obj);
        const perm2Obj = {
            roleId:newRole.id,
            moduleName:"staff",
            access:permsn.staff,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        };
        const perm2 = await Permission.create(perm2Obj);
        const perm3Obj = {
            roleId:newRole.id,
            moduleName:"role",
            access:permsn.role,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        };
        const perm3 = await Permission.create(perm3Obj);
        const perm4Obj = {
            roleId:newRole.id,
            moduleName:"product",
            access:permsn.product,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        };
        const perm4 = await Permission.create(perm4Obj);
        const perm5Obj = {
            roleId:newRole.id,
            moduleName:"pin",
            access:permsn.pin,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        };
        const perm5 = await Permission.create(perm5Obj);
        const perm6Obj = {
            roleId:newRole.id,
            moduleName:"page",
            access:permsn.page,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        };
        const perm6 = await Permission.create(perm6Obj);
        const perm7Obj = {
            roleId:newRole.id,
            moduleName:"seller",
            access:permsn.seller,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        };
        const perm7 = await Permission.create(perm7Obj);
        const perm8Obj = {
            roleId:newRole.id,
            moduleName:"transaction",
            access:permsn.transaction,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        };
        const perm8 = await Permission.create(perm8Obj);
        const perm9Obj = {
            roleId:newRole.id,
            moduleName:"tvc",
            access:permsn.tvc,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        };
        const perm9 = await Permission.create(perm9Obj);
        const perm10Obj = {
            roleId:newRole.id,
            moduleName:"banner",
            access:permsn.banner,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        };
        const perm10 = await Permission.create(perm10Obj);

        const perm11Obj = {
            roleId:newRole.id,
            moduleName:"e_voucher",
            access:permsn.e_voucher,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        };
        const perm11 = await Permission.create(perm11Obj);

        const perm12Obj = {
            roleId:newRole.id,
            moduleName:"membership",
            access:permsn.membership,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        };
        const perm12 = await Permission.create(perm12Obj);

        const perm13Obj = {
            roleId:newRole.id,
            moduleName:"ds_products",
            access:permsn.ds_products,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        };
        const perm13 = await Permission.create(perm13Obj);

        const perm14Obj = {
            roleId:newRole.id,
            moduleName:"ds_products_history",
            access:permsn.ds_products_history,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        };
        const perm14 = await Permission.create(perm14Obj);
        
        const perm15Obj = {
            roleId:newRole.id,
            moduleName:"e_voucher_history",
            access:permsn.e_voucher_history,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        };
        const perm15 = await Permission.create(perm15Obj);

        const perm16Obj = {
            roleId:newRole.id,
            moduleName:"offersNotificationAndMail",
            access:permsn.offersNotificationAndMail,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        };
        const perm16 = await Permission.create(perm16Obj);
       
        const perm17Obj = {
            roleId:newRole.id,
            moduleName:"subscriptionList",
            access:permsn.subscriptionList,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        };
        const perm17 = await Permission.create(perm17Obj);
       
        const perm18Obj = {
            roleId:newRole.id,
            moduleName:"contactQueryList",
            access:permsn.contactQueryList,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        };
        const perm18 = await Permission.create(perm18Obj);
       
        const perm19Obj = {
            roleId:newRole.id,
            moduleName:"mailSetting",
            access:permsn.mailSetting,
            createdIstAt: DateTime(),
            updatedIstAt: DateTime()
        };
        const perm19 = await Permission.create(perm19Obj);
       

        res.status(200).json({
            error: false,
            message: "New Role created Successfully...!",
            data: 1,
          });
    } catch (error) { 
        console.log("Add-Role Error ::>>",error);
        next(error);
    }
};

// export const addRole = async(req, res, next) => {
//     try {
//         if (req.body.roleName === "") {
//             return next(createError(403, "Enter the valid Role Name"));
//         }
//         const roleObj = {
//             roleName:req.body.roleName,
//             status:req.body.status
//         };
//         const newRole = await Role.create(roleObj);
//         const permsn = req.body.permission;
//         let permission = permsn.map(async (data) => {
//             const permObj = {
//                 roleId: newRole.id,
//                 moduleName:data.moduleName,
//                 access: data.access,
//             };
//             const perm = await Permission.create(permObj);
//             return perm;
//         });
//         permission = await Promise.all(permission);
//         console.log("Role ::>>", newRole);
//         console.log("Permission ::>>", permission);
//         res.status(200).json({
//             error: false,
//             message: "New Role created Successfully...!",
//             data: 1,
//           });
//     } catch (error) { 
//         console.log("Add-Role Error ::>>",error);
//         next(error);
//     }
// };

export const getRoleById = async(req, res, next) => {
    try {
        if (!req.body.id || req.body.id === "" ) {   
            return next(createError(403, "Enter the valid id"));
        }
        const role = await Query(`
            Select r.roleName, r.status, p.moduleName, p.access from roles as r inner join permissions as p on r.id=p.roleId where r.id=${req.body.id}
        `);
        // console.log("role ::>>",role);
        // const role = await Role.findOne({
        //     where:{
        //         id:req.body.id
        //     },
        //     raw:true});
        // const permissions = await Permission.findAll({
        //     where:{
        //         roleId:role.id
        //     },
        //     raw:true
        // });
        res.status(200).json({
            error: false,
            message: "Get Role By Id found Successfully...!",
            // data: {role,permissions},
            data: {role},
          });
    } catch (error) { 
        console.log("Get-Role Error ::>>",error);
        next(error);
    }
};

const updateOrCreatePermission = async (roleId, moduleName, access) => {
    const permission = await Permission.findOne({
        where: { moduleName, roleId },
        raw: true,
    });

    const permObj = {
        moduleName,
        access,
        updatedIstAt: DateTime(),
    };

    if (permission) {
        await Permission.update(permObj, {
            where: { roleId, moduleName },
        });
    } else {
        await Permission.create({
            ...permObj,
            roleId,
            createdIstAt: DateTime(),
        });
    }
};

export const updateRoleById = async (req, res, next) => {
    try {
        if (!req.body.id || req.body.id === "") {
            return next(createError(403, "Enter the valid id"));
        }
        if (!req.body.roleName || req.body.roleName === "") {
            return next(createError(403, "Enter the valid Role Name"));
        }

        const roleObj = {
            roleName: req.body.roleName,
            status: req.body.status === true ? "Active" : "Inactive",
            updatedIstAt: DateTime(),
            updateByStaff: req.user.data.name,
        };

        await Role.update(roleObj, {
            where: { id: req.body.id },
        });

        const permissions = req.body.permissions;
        const modules = [
            "coupon", "staff", "role", "product", "pin", "page", "seller",
            "transaction", "tvc", "banner", "e_voucher", "membership", "ds_products",
            "ds_products_history", "e_voucher_history", "offersNotificationAndMail",
            "subscriptionList", "contactQueryList", "mailSetting"
        ];

        for (const moduleName of modules) {
            await updateOrCreatePermission(req.body.id, moduleName, permissions[moduleName]);
        }

        res.status(200).json({
            error: false,
            message: "Update Role Successfully...!",
            data: 1,
        });
    } catch (error) {
        console.log("Update-Role-By-id Error ::>>", error);
        next(error);
    }
};

export const deleteRoleById = async(req, res, next) => {
    try {
        if ( !req.body.id || req.body.id === "" ) {   
            return next(createError(403, "Enter the valid id"));
        }
        const deleteRole = await Role.destroy({
            where:{
                id:req.body.id
            }
        });
        //due to cascade it wil work -auto-
        // const deletePermission = await Permission.destroy({
        //     where:{
        //         roleId:req.body.id
        //     }
        // });
        res.status(200).json({
            error: false,
            message: "Role & Permission deleted Successfully...!",
            data: deleteRole,
          });
    } catch (error) { 
        console.log("Delete-Role-&-Permission-By-id Error ::>>",error);
        next(error);
    }
};

export const allRoleByP = async(req, res, next) => {
    try {
      let { page, limit, sortBy } = req.body;

      if(!page || page==="" ){
        return next(createError(403,"Please provide page no!"));
      }

      let pageNo = page || 1;
      limit = limit || 10;
      let offset = limit * (pageNo - 1);
      sortBy = !sortBy ? "DESC" : sortBy == "ascending" ? "ASC" : "DESC";

      const totalRoles = await Role.count();
        const roles = await Role.findAll({
            limit,
            offset,
            order:[
                ['id', sortBy]
            ],
            raw:true});
        res.status(200).json({
            error: false,
            message: "All Role found Successfully...!",
            rolesInAPage:roles.length,
            totalRoles,
            data: roles,
          });
    } catch (error) { 
        console.log("ALL-Role-Pagination Error ::>>",error);
        next(error);
    }
};

export const allRole = async(req, res, next) => {
    try {
        const roles = await Role.findAll({
            order:[
                ['id', 'desc']
            ],
            raw:true});
        res.status(200).json({
            error: false,
            message: "All Role found Successfully...!",
            data: roles,
          });
    } catch (error) { 
        console.log("ALL-Role Error ::>>",error);
        next(error);
    }
};
