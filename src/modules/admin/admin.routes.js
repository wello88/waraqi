import { Router } from "express";
import { asyncHandler } from "../../utils/appError.js";
import { isAuthenticated, isAuthorized } from "../../middleware/authentication.js";
import { cloudupload } from "../../utils/multer.cloud.js";
import { addService, adminLogin } from "./admin.controller.js";

const adminRouter = Router();



// Importing controllers()
// admin login
adminRouter.post('/login', asyncHandler(adminLogin));
// add services
adminRouter.post('/add-service', isAuthenticated(), isAuthorized(['admin'],['superadmin']), cloudupload().single('image'), asyncHandler(addService))

export default adminRouter;