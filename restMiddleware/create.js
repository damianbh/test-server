/**
 * Created by damian on 3/16/2015.
 */
//opts
//{
//  location: rest request standard header for creation methods,
//     if not specified it will be set to req.swagger.swaggerObject.basePath + req.swagger.apiPath  + /new instance id
//  model: sequelize model
//  body: body param name
//  include: sequelize style include
// }
var
    util = require('util'),
    BaseRestMiddleware = require('./base'),
    Promise = require('bluebird'),
    CreateRestMiddleware = function (opts, extend) {
        var
            self = this;
        BaseRestMiddleware.call(self, opts, extend);
    };

util.inherits(CreateRestMiddleware, BaseRestMiddleware);

CreateRestMiddleware.prototype.fetch = function (context) {
    var
        self = this,
        opts = self.opts,
        req = context.req;

    context.fetchedData = req.swagger.params[opts.body].value;
};

CreateRestMiddleware.prototype.data = function (context) {
    var
        self = this,
        opts = self.opts;

    return opts.model
        .create(context.fetchedData)
        .then(function (instance) {
            context.result = instance;

        });
};

CreateRestMiddleware.prototype.transform = function (context) {
    var
        self = this,
        opts = self.opts;

    if (opts.include) {
        return opts.model.find({
            where: {
                id: context.result.id
            },
            include: opts.include
        }).then(function (filledInstance) {
            context.result = filledInstance;

        });
    }

};

CreateRestMiddleware.prototype.getLocationHeader = function (context) {
    var
        self = this,
        opts = self.opts,
        req = context.req,
        location = opts.location || req.swagger.swaggerObject.basePath + req.swagger.apiPath + '/';

    location += context.result.id;
    return location;

};

CreateRestMiddleware.prototype.send = function (context) {
    var
        self = this,
        res = context.res;

    return Promise.resolve(self.getLocationHeader(context)).then(function (location) {
        location && res.setHeader('Location', location);
        res.restSend(201, context.result);
    });
};

module.exports = CreateRestMiddleware;