import Joi from 'joi';


//TODO

// Validation for adding a service
export const addServiceSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    steps: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
    price: Joi.number().min(0).required(),
    duration: Joi.string().required(),
    locationAndTime: Joi.string().allow('', null),
    info: Joi.string().allow('', null),
    ServiceLink: Joi.string().uri().allow('', null)
});

// Validation for updating a service
export const updateServiceSchema = Joi.object({
    name: Joi.string().min(2).max(100),
    steps: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
    price: Joi.number().min(0),
    duration: Joi.string(),
    locationAndTime: Joi.string().allow('', null),
    info: Joi.string().allow('', null),
    ServiceLink: Joi.string().uri().allow('', null)
});