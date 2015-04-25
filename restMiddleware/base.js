var
    errors = require('./errors'),
    _ = require('underscore'),
    Promise = require('bluebird'),
    BaseRestMiddleware = function (opts, extend) {
        var
            self = this;

        opts = opts || {};
        self.opts = _.clone(opts);
        extend = extend || {};

        _.extend(self, extend);
    };


BaseRestMiddleware.prototype.fetch = function () {
};
BaseRestMiddleware.prototype.data = function () {
};
BaseRestMiddleware.prototype.transform = function () {
};
BaseRestMiddleware.prototype.send = function () {
};

BaseRestMiddleware.prototype.getMiddleware = function () {
    var
        self = this,
        opts = self.opts;

    return function (req, res, next) {
        var context = {
            req: req,
            res: res,
            next: next
        };


        Promise.resolve(self.fetch(context)).then(function () {
            return Promise.resolve(self.data(context)).then(function () {
                return Promise.resolve(self.transform(context)).then(function () {
                    return Promise.resolve(self.send(context));
                });
            });
        }).catch(opts.model.sequelize.ValidationError, function (err) {
            errors.badRequestError({
                error: err,
                code: 'VALIDATION_ERROR'
            });
            next(err);
        }).catch(opts.model.sequelize.ForeignKeyConstraintError, function (err) {
            errors.badRequestError({
                error: err,
                message: 'Foreign Key Constraint Error ' + err.index,
                code: 'CONSTRAINT_ERROR'
            });
            next(err);
        }).catch(function (err) {
            next(errors.restError({
                error: err
            }));
        });


    }
};

module.exports = BaseRestMiddleware;