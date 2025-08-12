import Services from '../../../db/models/services.model.js';
import { AppError } from '../../utils/appError.js';
import { messages } from '../../utils/constant/messages.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary.js';
import { ApiFeature } from '../../utils/apiFeature.js';
import { User, Admin, Ministries } from '../../../db/index.js';
import { comparePassword } from '../../utils/hashAndcompare.js';
import { genrateToken } from '../../utils/token.js';
import { uploadToSupabase, sanitizeFileName, deleteFromSupabase } from "../../utils/supabase.js";


export const adminLogin = async (req, res, next) => {
    const { userName, password } = req.body;

    // Validate input
    if (!userName || !password) {
        return next(new AppError(messages.user.invalidCreadintials, 401));
    }

    // Find user and include admin details with alias
    const user = await User.findOne({
        where: { userName },
        include: [{
            model: Admin,
            as: 'admin',
            attributes: ['email', 'ministryId'],
            required: true // INNER JOIN to ensure admin exists
        }]
    });

    if (!user || user.role !== 'admin') {
        return next(new AppError(messages.user.invalidCreadintials, 401));
    }

    // Compare raw password with hashed password
    const isPasswordValid = comparePassword({
        password,
        hashPassword: user.password
    });

    if (!isPasswordValid) {
        return next(new AppError(messages.user.invalidCreadintials, 409));
    }
    // Set isActive to true on successful login
    if (!user.isActive) {
        await user.update({ isActive: true });
    }

    // Generate token
    const token = genrateToken({
        payload: {
            id: user.id,
            role: user.role,
            ministryId: user.admin.ministryId
        }
    });

    res.status(200).json({
        message: messages.user.loginSuccessfully,
        user: {
            id: user.id,
            userName: user.userName,
            role: user.role,
            email: user.admin.email,
            ministryId: user.admin.ministryId
        },
        token
    });
}


// Add service


export const addService = async (req, res, next) => {
    const {
        name,
        steps,
        price,
        duration,
        locationAndTime,
        info,
        ServiceLink
    } = req.body;

    const { ministryId, id } = req.authUser;

    // Validation
    if (!name || !price || !duration) {
        return next(new AppError(messages.service.requiredFields, 400));
    }

    // Check if service already exists
    const existingService = await Services.findOne({ where: { name } });
    if (existingService) {
        return next(new AppError(messages.service.alreadyExist, 409));
    }

    let documentUrl;
    if (req.file) {
        try {
            const safeFileName = sanitizeFileName(req.file.originalname);

            documentUrl = await uploadToSupabase(
                req.file.buffer,
                safeFileName,
                "waraqi_bucket",
                req.file.mimetype
            );
        } catch (err) {
            console.error("Upload error:", err);
            return next(new AppError(`Failed to upload document: ${err.message}`, 500));
        }
    }

    // Create service
    const service = await Services.create({
        name,
        document: documentUrl,
        steps,
        price,
        duration,
        locationAndTime,
        info,
        ServiceLink,
        ministryId,
        AddedBy: id
    });

    res.status(201).json({
        message: messages.service.created,
        service
    });
};


// Get all services
export const getAllServices = async (req, res, next) => {
    const services = await Services.findAll({
        include: [
            {
                model: Ministries,
                as: 'ministry',
                attributes: ['id', 'name', 'logo', 'location', 'siteLink']
            }
        ]
    });

    if (!services || services.length === 0) {
        return next(new AppError(messages.service.notFound, 404));
    }

    res.status(200).json(services);
};

// Get service by ID
export const getServiceById = async (req, res, next) => {
    const { id } = req.params;

    const service = await Services.findByPk(id, {
        include: [
            {
                model: Ministries,
                as: 'ministry',
                attributes: ['id', 'name', 'logo', 'location', 'siteLink']
            }
        ]
    });

    if (!service) {
        return next(new AppError(messages.service.notFound, 404));
    }

    res.status(200).json(service);
};



// Update service
export const updateService = async (req, res, next) => {
    const { id } = req.params;
    const {
        name,
        steps,
        price,
        duration,
        locationAndTime,
        info,
        ServiceLink
    } = req.body;

    const service = await Services.findByPk(id);
    if (!service) {
        return next(new AppError(messages.service.notFound, 404));
    }

    // Check if admin belongs to the same ministry
    if (service.ministryId !== req.authUser.ministryId) {
        return next(new AppError(messages.user.notauthorized, 403));
    }

    let documentUrl = service.document;

    if (req.file) {
        try {
            // If there's an old document in Supabase, remove it
            if (service.document) {
                // Extract the file path from the public URL
                const oldFilePath = service.document.split("/waraqi_bucket/")[1];
                if (oldFilePath) {
                    await deleteFromSupabase(oldFilePath);
                }
            }

            // Upload the new file
            const fileExt = req.file.originalname.split(".").pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
            documentUrl = await uploadToSupabase(req.file.buffer, fileName);
        } catch (err) {
            return next(new AppError("Failed to update document", 500));
        }
    }

    await service.update({
        name,
        document: documentUrl,
        steps,
        price,
        duration,
        locationAndTime,
        info,
        ServiceLink
    });

    res.status(200).json({
        message: messages.service.updated,
        service
    });
};





// Delete service
export const deleteService = async (req, res, next) => {
    const { id } = req.params;

    const service = await Services.findByPk(id);
    if (!service) {
        return next(new AppError(messages.service.notFound, 404));
    }

    // Check if admin belongs to the same ministry
    if (service.ministryId !== req.authUser.ministryId) {
        return next(new AppError(messages.user.notauthorized, 403));
    }

    // Delete document from Supabase if exists
    if (service.document) {
        try {
            await deleteFromSupabase(service.document, "waraqi_bucket");
        } catch (err) {
            return next(new AppError("Failed to delete document from Supabase", 500));
        }
    }

    await service.destroy();

    res.status(200).json({
        message: messages.service.deleteSuccessfully,
        serviceId: id,
    });
};
