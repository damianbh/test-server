/**
 * Created by damian on 3/16/2015.
 */
//opts
//{
//  model: sequelize model
//  idParam: Id Param name
// }
var
    util = require('util'),
    BaseRestMiddleware = require('./base'),
    errors = require('./errors'),
    Promise = require('bluebird'),
    DeleteRestMiddleware = function (opts, extend) {
        var
            self = this;
        BaseRestMiddleware.call(self, opts, extend);
    };

util.inherits(DeleteRestMiddleware, BaseRestMiddleware);

DeleteRestMiddleware.prototype.getFindOpts = function (context) {
    var
        self = this,
        opts = self.opts,
        req = context.req;

    return {
        where: {
            id: req.swagger.params[opts.idParam || 'id'].value
        }
    }
};

DeleteRestMiddleware.prototype.fetch = function (context) {
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

            })
    });
};

DeleteRestMiddleware.prototype.data = function (context) {

    return context.fetchedData.destroy();
};

DeleteRestMiddleware.prototype.send = function (context) {
    var
        res = context.res;

    res.restSend(204);

};


module.exports = DeleteRestMiddleware;