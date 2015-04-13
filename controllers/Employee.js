'use strict';

var restMiddleware = require('../restMiddleware'),
    data = require('../data'),
    _ = require('underscore'),
    Promise = require('bluebird');

module.exports.newEmployee = new restMiddleware.CreateController({
    model: data.models.Employee,
    body: 'employee',
    include: [{
        model: data.models.Office,
        as: 'Office'
    }]
}).getMiddleware();

module.exports.getEmployee = new restMiddleware.ReadController({
        model: data.models.Employee,
        idParam: 'employeeId'
    }
    //, {
    //    transform: function (context) {
    //        return data.models.Office.findAll().then(function (allOffices) {
    //            context.result = context.result.toJSON();
    //            context.result.allOffices = allOffices;
    //        });
    //    }
    //}
).getMiddleware();

module.exports.updateEmployee = new restMiddleware.UpdateController({
    model: data.models.Employee,
    body: 'employee',
    idParam: 'employeeId',
    include: [{
        model: data.models.Office,
        as: 'Office'
    }]
}).getMiddleware();

module.exports.deleteEmployee = new restMiddleware.DeleteController({
    model: data.models.Employee,
    idParam: 'employeeId'
}).getMiddleware();

module.exports.listEmployees = new restMiddleware.ListController({
    model: data.models.Employee,
    include: [{
        model: data.models.Office,
        as: 'Office'
    }]
}, {
    getFindOpts: function (context) {
        var self = this,
            opts = self.opts,
            req = context.req;

        return Promise.resolve(restMiddleware.ListController.prototype.getFindOpts.call(self, context)).then(function (findOpts) {
            var
                searchParam = req.swagger.params[opts.searchParam || 'q'].value;

            if (!_.isUndefined(searchParam)) {
                return data.models.Office.findAll({
                    where: {
                        name: {
                            $like: '%' + searchParam + '%'
                        }
                    }
                }).then(function (results) {
                    if (results.length) {
                        findOpts.where = data.sequelize.or(findOpts.where, {
                            officeId: {
                                $in: _.map(results, function (office) {
                                    return office.get('id');
                                })
                            }
                        });
                    }
                    return findOpts;

                });
            } else {
                return findOpts;
            }

        });
    }
}).getMiddleware();