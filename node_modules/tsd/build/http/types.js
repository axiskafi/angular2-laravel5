var Joi = require('joi');
exports.manageSchema = Joi.object({
    lastSweep: Joi.date().required()
}).description('manageSchema');
exports.infoSchema = Joi.object({
    url: Joi.string().required(),
    key: Joi.string().required(),
    contentType: Joi.string().required(),
    httpETag: Joi.string().required(),
    httpModified: Joi.date().required(),
    cacheCreated: Joi.date().required(),
    cacheUpdated: Joi.date().required(),
    contentChecksum: Joi.string().required()
}).description('infoSchema');
exports.sha1Schema = Joi.string().length(40).regex(/^[0-9a-f]{40}$/).description('sha1');
exports.objectSchema = Joi.object({
    info: exports.infoSchema.required(),
    request: Joi.object().required(),
    response: Joi.object().optional(),
    body: Joi.binary(),
    storeDir: Joi.string().required(),
    bodyFile: Joi.string().required(),
    infoFile: Joi.string().required(),
    bodyChecksum: exports.sha1Schema.required()
}).description('objectSchema');
