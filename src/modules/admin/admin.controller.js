import Services from '../../../db/models/services.model.js';
import { AppError } from '../../utils/appError.js';
import { messages } from '../../utils/constant/messages.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary.js';
import { ApiFeature } from '../../utils/apiFeature.js';
import { User, Admin } from '../../../db/index.js';
import { comparePassword } from '../../utils/hashAndcompare.js';
import { genrateToken } from '../../utils/token.js';


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
            const uploadResult = await uploadToCloudinary(req.file.buffer, 'services_documents');
            documentUrl = uploadResult.secure_url;
        } catch (err) {
            return next(new AppError('Failed to upload document', 500));
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
        ministryId: req.authUser.ministryId,
        AddedBy: req.authUser.id
    });

    res.status(201).json({
        message: messages.service.created,
        service
    });
};

// Get all services
export const getAllServices = async (req, res, next) => {
    const apiFeatures = new ApiFeature(Services, req.query)
        .pagination()
        .filter()
        .sort()
        .select();

    const result = await apiFeatures.execute();

    if (!result) {
        return next(new AppError(messages.service.notFound, 404));
    }

    res.status(200).json(result);
};

// Get service by ID
export const getServiceById = async (req, res, next) => {
    const { id } = req.params;

    const service = await Services.findByPk(id);
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
            // Delete old document if exists
            if (service.document) {
                await deleteFromCloudinary(service.document);
            }
            // Upload new document
            const uploadResult = await uploadToCloudinary(req.file.buffer, 'services_documents');
            documentUrl = uploadResult.secure_url;
        } catch (err) {
            return next(new AppError('Failed to update document', 500));
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

    // Delete document from cloudinary if exists
    if (service.document) {
        try {
            await deleteFromCloudinary(service.document);
        } catch (err) {
            return next(new AppError('Failed to delete document', 500));
        }
    }

    await service.destroy();

    res.status(200).json({
        message: messages.service.deleted,
        serviceId: id
    });
};