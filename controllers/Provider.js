'use strict';

var restMiddleware = require('../restMiddleware'),
    data = require('../data'),
    _ = require('underscore');

module.exports.newProvider = new restMiddleware.CreateController({
    model: data.models.Provider,
    body: 'provider'
}).getMiddleware();

module.exports.getProvider = new restMiddleware.ReadController({
    model: data.models.Provider,
    idParam: 'providerId'
}).getMiddleware();

module.exports.updateProvider = new restMiddleware.UpdateController({
    model: data.models.Provider,
    idParam: 'providerId',
    body: 'provider'
}).getMiddleware();

module.exports.deleteProvider = new restMiddleware.DeleteController({
    model: data.models.Provider,
    idParam: 'providerId'
}).getMiddleware();

module.exports.listProviders = new restMiddleware.ListController({
    model: data.models.Provider
}).getMiddleware();