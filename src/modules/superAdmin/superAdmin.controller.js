import { Admin, Ministries, User } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";
import { comparePassword, hashPassword } from "../../utils/hashAndcompare.js";
import { genrateToken } from "../../utils/token.js";
import { uploadToCloudinary } from '../../utils/cloudinary.js';

export const SuperLogin = async (req,res,next)=>{

   const {userName, password} = req.body;

    if (!userName) {
        return next (new AppError(messages.user.invalidCreadintials),401) 
    }
    const user = await User.findOne({ where: { userName } });
    if (!user) {
         return next (new AppError(messages.user.notFound),404) 
    }

    const passwordHash = comparePassword({ password, hashPassword:user.password });

    if (!passwordHash) {
         return next (new AppError(messages.user.invalidCreadintials),400) 
    }


    if (user.role !== 'superadmin') {
        return res.status(401).json(messages.user.notauthorized);
    }

    const token = genrateToken({ payload: { id: user.id, role: user.role } });;
    
    res.status(200).json({
        message: messages.user.loginSuccessfully,
        user: {
            id: user.id,
            userName: user.userName,
            role: user.role
        },
        token
    });

}

//superadmin can add superadmin, admin 

export const AddUser = async (req, res, next) => {
    const { userName, password, email, role, ministryId } = req.body;

    if (!userName || !password || !role) {
        return next(new AppError(messages.user.invalidData), 400);
    }
    if (role !== 'admin' && role !== 'superadmin') {
        return next(new AppError(messages.user.invalidRole), 400);
    }
    if (role === 'admin' && (!email )) {
        return next(new AppError(messages.user.emailRequired), 400);
    }
    if (role === 'admin' && !ministryId) {
        return next(new AppError(messages.user.invalidMinistry), 400);
    }

    const existingUser = await User.findOne({ where: { userName } });
    if (existingUser) {
        return next(new AppError(messages.user.alreadyExist), 409);
    }
    if (role === 'admin') {
        const existingEmail = await Admin.findOne({ where: { email } });
        if (existingEmail) {
            return next(new AppError(messages.user.alreadyExist), 409);
        }
        // Check if ministry exists
        const ministry = await Ministries.findByPk(ministryId);
        if (!ministry) {
            return next(new AppError(messages.user.invalidMinistry), 400);
        }
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Create user
    const newUser = await User.create({ userName, password: hashedPassword, role });

    // If admin, create admin record
    if (role === 'admin') {
        await Admin.create({
            AdminId: newUser.id,
            email,
            ministryId
        });
    }

    res.status(201).json({
        message: messages.user.createSuccessfully,
        user: {
            id: newUser.id,
            userName: newUser.userName,
            role: newUser.role
        }
    });
}



export const addMinistry = async (req, res, next) => {
    const { name, location, siteLink } = req.body;

    if (!name) {
        return next(new AppError(messages.user.contentRequired), 400);
    }
    if (!req.file) {
        return next(new AppError(messages.file.required), 400);
    }
    if (!location) {
        return next(new AppError(messages.user.contentRequired), 400);
    }
    if (!siteLink) {
        return next(new AppError(messages.user.contentRequired), 400);
    }

    const existingMinistry = await Ministries.findOne({ where: { name } });
    if (existingMinistry) {
        return next(new AppError(messages.ministry.alreadyExist), 409);
    }

    let logoUrl;
    try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, 'ministries_logos');
        logoUrl = uploadResult.secure_url;
    } catch (err) {
        return next(new AppError('Failed to upload logo', 500));
    }

    const newMinistry = await Ministries.create({ name, logo: logoUrl, location, siteLink,AddedBy: req.authUser.id });

    res.status(201).json({
        message: messages.user.createSuccessfully,
        ministry: {
            id: newMinistry.id,
            name: newMinistry.name,
            logo: newMinistry.logo
        }
    });
}