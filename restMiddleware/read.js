/**
 * Created by damian on 3/16/2015.
 */
//opts
//{
//  model: sequelize model
//  include: sequelize style include
//  idParam: Id Param name
// }
var
    util = require('util'),
    BaseRestMiddleware = require('./base'),
    errors = require('./errors'),
    Promise = require('bluebird'),
    ReadRestMiddleware = function (opts, extend) {
        var
            self = this;
        BaseRestMiddleware.call(self, opts, extend);
    };

util.inherits(ReadRestMiddleware, BaseRestMiddleware);

ReadRestMiddleware.prototype.getFindOpts = function (context) {
    var
        self = this,
        opts = self.opts,
        req = context.req;

    return {
        where: {
            id: req.swagger.params[opts.idParam || 'id'].value
        },
        include: opts.include
    };
};

ReadRestMiddleware.prototype.fetch = function (context) {
    var
        self = this,
        opts = self.opts;

    return Promise.resolve(self.getFindOpts(context)).then(function (findOpts) {
        return opts.model
            .find(findOpts)
            .then(function (instance) {
                if (!instance) {
                    throw errors.notFoundError();
                }

                context.fetchedData = instance;
            });
    });
};

ReadRestMiddleware.prototype.data = function (context) {
    context.result = context.fetchedData;
};


ReadRestMiddleware.prototype.send = function (context) {
    var
        res = context.res;
    res.restSend(200, context.result);
};

module.exports = ReadRestMiddleware;