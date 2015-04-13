'use strict';

var
    _ = require('underscore');

var restError = function (opts) {
    var
        err,
        message = opts.message || 'Rest Error';

    opts = opts || {};

    if (_.isUndefined(opts.error)) {
        err = new Error(message);
    } else {
        err = opts.error;
        if (_.isUndefined(err.message)) {
            err.message = message;
        }
    }

    err.code = err.code || opts.code || 'INTERNAL_SERVER_ERROR';
    err.statusCode = err.statusCode || opts.statusCode || 500;

    if (!_.isUndefined(opts.doNotExpose)) {
        err.doNotExpose = opts.doNotExpose;
    }
    return err;
};


var badRequestError = function (opts) {
    opts = opts || {};
    opts.statusCode = 400;
    opts.message = opts.message || 'Bad Request';
    opts.code = opts.code || 'BAD_REQUEST';
    return restError(opts);
};

var forbiddenError = function (opts) {
    opts = opts || {};
    opts.statusCode = 403;
    opts.message = opts.message || 'Forbidden';
    opts.code = opts.code || 'FORBIDDEN';
    return restError(opts);
};

var notFoundError = function (opts) {
    opts = opts || {};
    opts.statusCode = 404;
    opts.message = opts.message || 'Not Found';
    opts.code = opts.code || 'NOT_FOUND';
    return restError(opts);
};

module.exports = {
    notFoundError: notFoundError,
    badRequestError: badRequestError,
    restError: restError,
    forbiddenError: forbiddenError
};