import { Router } from "express";
import { asyncHandler } from "../../utils/appError.js";
import { isAuthenticated, isAuthorized } from "../../middleware/authentication.js";
import { cloudupload, fileValidation } from "../../utils/multer.cloud.js";
import { addService, adminLogin, deleteService, getAllServices, getServiceById, updateService } from "./admin.controller.js";

const adminRouter = Router();



// Importing controllers()
// admin login
adminRouter.post('/login', asyncHandler(adminLogin));
// add services
adminRouter.post('/add-service', isAuthenticated(), cloudupload({allowFile: fileValidation.file}).single('document'), asyncHandler(addService))
// get all services
adminRouter.get('/get-services', isAuthenticated(), isAuthorized(['admin']), asyncHandler(getAllServices));
// get service by id
adminRouter.get('/get-service/:id', isAuthenticated(), isAuthorized(['admin']), asyncHandler(getServiceById));
// update service by id
adminRouter.put('/update-service/:id', isAuthenticated(), isAuthorized(['admin']), cloudupload().single('document'), asyncHandler(updateService));
// delete service by id
adminRouter.delete('/delete-service/:id', isAuthenticated(), isAuthorized(['admin']), asyncHandler(deleteService));
export default adminRouter;