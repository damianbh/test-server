'use strict';

var restMiddleware = require('../restMiddleware'),
    data = require('../data');

module.exports.newOffice = new restMiddleware.CreateController({
    model: data.models.Office,
    body: 'office'
}).getMiddleware();

module.exports.getOffice = new restMiddleware.ReadController({
    model: data.models.Office,
    idParam: 'officeId'
}).getMiddleware();

module.exports.updateOffice = new restMiddleware.UpdateController({
    model: data.models.Office,
    idParam: 'officeId',
    body: 'office'
}).getMiddleware();

module.exports.deleteOffice = new restMiddleware.DeleteController({
    model: data.models.Office,
    idParam: 'officeId'
}).getMiddleware();

module.exports.listOffices = new restMiddleware.ListController({
    model: data.models.Office
}).getMiddleware();