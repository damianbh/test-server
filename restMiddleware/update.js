/**
 * Created by damian on 3/16/2015.
 */
//opts
//{
//  model: sequelize model
//  include: sequelize style include
//  body: body param name
//  idParam: i

// }
var
    util = require('util'),
    BaseRestMiddleware = require('./base'),
    errors = require('./errors'),
    _ = require('underscore'),
    Promise = require('bluebird'),
    UpdateRestMiddleware = function (opts, extend) {
        var
            self = this;
        BaseRestMiddleware.call(self, opts, extend);
    };

util.inherits(UpdateRestMiddleware, BaseRestMiddleware);

UpdateRestMiddleware.prototype.getFindOpts = function (context) {
    var
        self = this,
        opts = self.opts,
        req = context.req;

    return {
        where: {
            id: req.swagger.params[opts.idParam].value
        }
    };
};

UpdateRestMiddleware.prototype.fetch = function (context) {
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

UpdateRestMiddleware.prototype.data = function (context) {
    var
        self = this,
        opts = self.opts,
        req = context.req;

    context.fetchedData.setAttributes(_.extend({}, req.swagger.params[opts.body].value, {id: req.swagger.params[opts.idParam].value}));
    return context.fetchedData
        .save()
        .then(function (instance) {
            context.result = instance;

        });
};

UpdateRestMiddleware.prototype.transform = function (context) {
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


UpdateRestMiddleware.prototype.send = function (context) {
    var
        res = context.res;

    res.restSend(200, context.result);
};


module.exports = UpdateRestMiddleware;