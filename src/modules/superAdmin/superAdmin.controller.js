import { Admin, Ministries, User } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";
import { comparePassword, hashPassword } from "../../utils/hashAndcompare.js";
import { genrateToken } from "../../utils/token.js";
import { deleteFromCloudinary, uploadToCloudinary } from '../../utils/cloudinary.js';
import { ApiFeature } from "../../utils/apiFeature.js";

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
    if (role === 'admin' && !email) {
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
    const hashedPassword = hashPassword({ password });

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

// Get all ministries
export const getAllMinistries = async (req, res, next) => {
    const apiFetures = new ApiFeature(Ministries, req.query)
        .pagination()
        .filter()
        .sort()
        .select()

    const result = await apiFetures.execute();

    if (!result) {
        return next(new AppError(messages.ministry.notFound), 404);
    }
    return res.status(200).json(result)
};


// get ministry by id
export const getMinistryById = async (req, res, next) => {
    const { id } = req.params;
    const ministry = await Ministries.findByPk(id);
    if (!ministry) {
        return next(new AppError(messages.ministry.notFound), 404);
    }
    return res.status(200).json(ministry);
}

// update ministry by id
export const updateMinistryById = async (req, res, next) => {
    const { id } = req.params;
    const { name, location, siteLink } = req.body;

    if (!name || !location || !siteLink) {
        return next(new AppError(messages.user.contentRequired), 400);
    }

    const ministry = await Ministries.findByPk(id);
    if (!ministry) {
        return next(new AppError(messages.ministry.notFound), 404);
    }

    let logoUrl = ministry.logo;
    if (req.file) {
        try {
            const uploadResult = await uploadToCloudinary(req.file.buffer, 'ministries_logos');
            logoUrl = uploadResult.secure_url;
        } catch (err) {
            return next(new AppError('Failed to upload logo', 500));
        }
    }

    await ministry.update({ name, logo: logoUrl, location, siteLink });

    res.status(200).json({
        message: messages.user.updateSuccessfully,
        ministry
    });
}

// delete ministry by id
export const deleteMinistryById = async (req, res, next) => {
    const { id } = req.params;

    const ministry = await Ministries.findByPk(id);
    if (!ministry) {
        return next(new AppError(messages.ministry.notFound), 404);
    }
    if (ministry.logo) {
        try {
            await deleteFromCloudinary(ministry.logo);
        } catch (err) {
            return next(new AppError('Failed to delete logo from cloud storage', 500));
        }
    }
    await ministry.destroy();

    res.status(200).json({
        message: messages.user.deleteSuccessfully,
        ministryId: id
    });
}

// get all users
export const getAllUsers = async (req, res, next) => {
    const apiFetures = new ApiFeature(User, req.query)
        .pagination()
        .filter()
        .sort()
        .select()

    const result = await apiFetures.execute();

    if (!result) {
        return next(new AppError(messages.user.notFound), 404);
    }
    return res.status(200).json(result);
}

// get user by id
export const getUserById = async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
        return next(new AppError(messages.user.notFound), 404);
    }
    return res.status(200).json(user);
}

// update user by id
export const updateUserById = async (req, res, next) => {
    const { id } = req.params;
    const { userName, password, email, role, ministryId } = req.body;

    if (!userName || !role) {
        return next(new AppError(messages.user.invalidData), 400);
    }

    const user = await User.findByPk(id);
    if (!user) {
        return next(new AppError(messages.user.notFound), 404);
    }

    if (role !== 'admin' && role !== 'superadmin') {
        return next(new AppError(messages.user.invalidRole), 400);
    }

    if (role === 'admin' && !email) {
        return next(new AppError(messages.user.emailRequired), 400);
    }
    if (role === 'admin' && !ministryId) {
        return next(new AppError(messages.user.invalidMinistry), 400);
    }

    // Prepare user update data
    const updatedData = { userName, role };
    if (password) {
        updatedData.password = hashPassword({ password });
    }

    await user.update(updatedData);

    let admin = null;
    if (role === 'admin') {
        admin = await Admin.findOne({ where: { AdminId: id } });
        if (admin) {
            await admin.update({ email, ministryId });
        } else {
            // If admin record doesn't exist, create it
            admin = await Admin.create({ AdminId: id, email, ministryId });
        }
    }

    res.status(200).json({
        message: messages.user.updateSuccessfully,
        user: {
            id: user.id,
            userName: user.userName,
            role: user.role
        },
        admin
    });
}

// delete user by id
export const deleteUserById = async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
        return next(new AppError(messages.user.notFound), 404);
    }

    await user.destroy();

    res.status(200).json({
        message: messages.user.deleteSuccessfully,
        userId: id
    });
}