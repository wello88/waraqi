import { Router } from "express";
import { addMinistry, AddUser, deleteMinistryById, deleteUserById, getAllMinistries, getAllUsers, getMinistryById, getUserById, SuperLogin, updateMinistryById, updateUserById } from "./superAdmin.controller.js";
import { asyncHandler } from "../../utils/appError.js";
import { isAuthenticated, isAuthorized } from "../../middleware/authentication.js";
import { cloudupload } from "../../utils/multer.cloud.js";

const superAdminRouter = Router();



// Importing controllers()
superAdminRouter.post('/login', asyncHandler(SuperLogin))

superAdminRouter.post('/addUser', isAuthenticated(), isAuthorized(['superadmin']), asyncHandler(AddUser));
superAdminRouter.post('/add-ministry', isAuthenticated(), isAuthorized(['superadmin']), cloudupload().single('logo'), asyncHandler(addMinistry));
// get all ministries
superAdminRouter.get('/get-ministries', isAuthenticated(), isAuthorized(['superadmin']), asyncHandler(getAllMinistries));
// get ministry by id
superAdminRouter.get('/get-ministry/:id', isAuthenticated(), isAuthorized(['superadmin']), asyncHandler(getMinistryById));
// update ministry by id
superAdminRouter.put('/update-ministry/:id', isAuthenticated(), isAuthorized(['superadmin']), cloudupload().single('logo'), asyncHandler(updateMinistryById));
// delete ministry by id
superAdminRouter.delete('/delete-ministry/:id', isAuthenticated(), isAuthorized(['superadmin']), asyncHandler(deleteMinistryById));
// get all users
superAdminRouter.get('/get-users', isAuthenticated(), isAuthorized(['superadmin']), asyncHandler(getAllUsers));
// get user by id
superAdminRouter.get('/get-user/:id', isAuthenticated(), isAuthorized(['superadmin']), asyncHandler(getUserById));
// update user by id
superAdminRouter.put('/update-user/:id', isAuthenticated(), isAuthorized(['superadmin']), asyncHandler(updateUserById));
// delete user by id
superAdminRouter.delete('/delete-user/:id', isAuthenticated(), isAuthorized(['superadmin']), asyncHandler(deleteUserById));

export default superAdminRouter;