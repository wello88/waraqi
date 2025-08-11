import { Router } from "express";
import { addMinistry, AddUser, SuperLogin } from "./superAdmin.controller.js";
import { asyncHandler } from "../../utils/appError.js";
import { isAuthenticated, isAuthorized } from "../../middleware/authentication.js";
import { cloudupload } from "../../utils/multer.cloud.js";

const superAdminRouter = Router();



// Importing controllers()
superAdminRouter.post('/login', asyncHandler(SuperLogin))

superAdminRouter.post('/addUser', isAuthenticated(), isAuthorized(['superadmin']), asyncHandler(AddUser));
superAdminRouter.post('/add-ministry', isAuthenticated(), isAuthorized(['superadmin']), cloudupload().single('logo'), asyncHandler(addMinistry));


export default superAdminRouter;