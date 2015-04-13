'use strict';

var app = require('connect')(),
    http = require('http'),
    swaggerTools = require('swagger-tools'),
    async = require('async'),

    config = require('./config'),
    host = config.host,
    port = process.env.PORT || 8000,
    url = 'http://' + host + ':' + port,

    bunyan = require('bunyan'),
    bunyanMiddleware = require('bunyan-middleware'),
    logger = bunyan.createLogger({
        name: config.appName,
        level: process.env.LOG_LEVEL || 'info',
        stream: process.stdout,
        serializers: bunyan.stdSerializers
    }),

    _ = require('underscore'),
    errors = require('./restMiddleware').errors;


app.use(bunyanMiddleware(
        {
            headerName: 'X-Request-Id'
            , propertyName: 'reqId'
            , logName: 'req_id'
            , obscureHeaders: []
            , logger: logger
        }
    )
);

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var swaggerDoc = require('./api/definition'),
    swaggerDocMock = _.clone(swaggerDoc);

swaggerDocMock.basePath = "/mockedapi";

// Initialize the Swagger middleware
async.map([swaggerDoc, swaggerDocMock], function (doc, callback) {
    try {
        swaggerTools.initializeMiddleware(doc, function (middleware) {
            callback(null, middleware);
        });
    }
    catch (err) {
        callback(err);
    }

}, function (err, results) {
    if (!err) {
        var middleware = results[0]
            , mockedMiddleware = results[1];

        // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
        app.use(mockedMiddleware.swaggerMetadata());

        // Validate Swagger requests
        app.use(mockedMiddleware.swaggerValidator());

        // Route validated requests to appropriate controller
        app.use(mockedMiddleware.swaggerRouter({
            controllers: {},
            useStubs: true
        }));

        // Serve the Swagger documents and Swagger UI
        app.use(mockedMiddleware.swaggerUi());


        app.use(function (req, res, next) {
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                res.setHeader("Access-Control-Expose-Headers", "Content-Range");
                res.restSend = function (statusCode, body) {

                    var CHARSET = 'utf8',
                        call = {args: [].slice.call(arguments)};

                    // handle single argument replies
                    if (typeof statusCode === 'string') {
                        body = {
                            message: statusCode
                        };
                        statusCode = 200;
                    } else if (statusCode instanceof Error) {
                        body = statusCode;
                        statusCode = (res.statusCode >= 400 && res.statusCode <= 500) ? res.statusCode : 500;
                    }

                    // handle error objects in replies
                    if (body instanceof Error) {
                        if (typeof body.statusCode === 'number') {
                            statusCode = body.statusCode;
                        }
                        if (body.doNotExpose) {
                            body = undefined;
                        } else {
                            if (body.toJSON) {
                                body = body.toJSON();
                            } else {
                                var
                                    bodyExt = {};
                                if (body.code) {
                                    bodyExt.code = body.code;
                                }

                                if (body instanceof data.sequelize.ValidationError) {
                                    bodyExt.errors = {};
                                    _.each(body.errors, function (err) {
                                        var
                                            code = err.message.toLowerCase().replace(/\s/g, '_');
                                        if (_.isUndefined(bodyExt.errors[err.path])) {
                                            bodyExt.errors[err.path] = {};
                                        }
                                        bodyExt.errors[err.path][code] = true;
                                    });
                                }
                                if (body.code === 'SCHEMA_VALIDATION_FAILED') {
                                    if (body.results && _.isArray(body.results.errors)) {
                                        bodyExt.errors = _.map(body.results.errors, function (error) {
                                            var result = _.clone(error);
                                            result.path = error.path.join('/');
                                            return result;
                                        });
                                    }
                                }
                                body = {message: body.message};
                                _.extend(body, bodyExt);
                            }
                        }
                    }

                    // default message
                    if (body === undefined) {
                        body = {message: http.STATUS_CODES[statusCode] || 'unknown response'}
                    }

                    call.statusCode = statusCode;
                    call.body = body;

                    var length = 0;
                    var type;

                    if (body !== undefined) {
                        if (Buffer.isBuffer(body)) {
                            length = body.length;
                        } else {
                            type = 'application/json';
                            body = JSON.stringify(body);
                            length = Buffer.byteLength(body, CHARSET);
                        }
                    }

                    var noContent = statusCode === 204 || statusCode === 304;

                    if (!noContent && !res.headersSent) {
                        if (type && !res.getHeader('content-type')) {
                            res.setHeader('content-type', type + '; charset=' + CHARSET);
                        }

                        if (!res.getHeader('content-length')) {
                            res.setHeader('content-length', length);
                        }

                    }

                    if (noContent && !res.headersSent) {
                        res.removeHeader('content-type');
                        res.removeHeader('content-length');
                        res.removeHeader('transfer-encoding');
                    }

                    if (noContent) body = '';

                    res.statusCode = statusCode;

                    return res.end(req.method === 'HEAD' ? null : body);

                };
                next();
            }
        );

        // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
        app.use(middleware.swaggerMetadata());

        // Validate Swagger requests
        app.use(middleware.swaggerValidator());

        // Route validated requests to appropriate controller
        app.use(middleware.swaggerRouter({
            controllers: './controllers',
            useStubs: false
        }));

        // Serve the Swagger documents and Swagger UI
        //app.use(middleware.swaggerUi());

        app.use(function (req, res, next) {
            next(errors.notFoundError({message: 'Path not found '+ req.url}));
        });

        app.use(function (err, req, res, next) {
            res.restSend(err);
            res.log.error({err: err, req: req, res: res}, err.message);
        });


        var
            data = require('./data'),
            initMethod = (process.env.INIT_DB === '1') ? 'createDb' : 'syncDb';

        data[initMethod]().then(function () {
            // Start the server
            http.createServer(app).listen(port, function () {
                console.log('Server listening on port %d (%s)', port, url);
            });
        });

    }
});