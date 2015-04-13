'use strict';

var restMiddleware = require('../restMiddleware'),
    data = require('../data'),
    _ = require('underscore'),
    Promise = require('bluebird');

//function clearClientProvider(it) {
//    var item = it.toJSON();
//    if (item.Providers) {
//        item.Providers.forEach(function (prov) {
//            delete prov.ClientProvider;
//        });
//    }
//    return item;
//}
//
//function transformItem(context) {
//    var
//        self = this;
//    return Promise.resolve(self.constructor.prototype.transform.call(self, context)).then(function () {
//        context.result = clearClientProvider(context.result);
//    });
//
//}
var
    dataFn = function (protoFn, context) {
        var
            self = this,
            req = context.req,
            providers = req.swagger.params[self.opts.body].value['Providers'] || [];
        return protoFn.call(self, context).then(function () {
            var
                clientId = context.result.get('id'),
                clientProviders = _.map(providers, function (provId) {
                        return {
                            clientId: clientId,
                            providerId: provId
                        };
                    }
                );
            return data.models.ClientProvider.destroy({
                where: {
                    clientId: clientId
                }
            }).then(function () {
                if (providers.length)
                    return data.models.ClientProvider
                        .bulkCreate(clientProviders);
            });
        });
    };

module.exports.newClient = new restMiddleware.CreateController({
    model: data.models.Client,
    body: 'client'
}, {
    data: _.partial(dataFn, restMiddleware.CreateController.prototype.data)
}).getMiddleware();

module.exports.getClient = new restMiddleware.ReadController({
    model: data.models.Client,
    idParam: 'clientId',
    include: [{
        model: data.models.Provider,
        as: 'Providers',
        attributes: ['id']
    }]
}, {
    transform: function (context) {
        context.result = context.result.toJSON();
        context.result.Providers = _.pluck(context.result.Providers, 'id');
    }
}).getMiddleware();

module.exports.updateClient = new restMiddleware.UpdateController({
    model: data.models.Client,
    body: 'client',
    idParam: 'clientId',
    include: [{
        model: data.models.Provider,
        as: 'Providers'
    }]
}, {
    data: _.partial(dataFn, restMiddleware.UpdateController.prototype.data),
    transform: function (context) {
        context.result = context.result.toJSON();
        context.result.Providers = _.pluck(context.result.Providers, 'id');
    }
}).getMiddleware();

module.exports.deleteClient = new restMiddleware.DeleteController({
    model: data.models.Client,
    idParam: 'clientId'
}).getMiddleware();

module.exports.listClients = new restMiddleware.ListController({
        model: data.models.Client
        //,include: [{
        //    model: data.models.Provider,
        //    as: 'Providers'
        //}]
    }
    //, {
    //    transform: function (context) {
    //        var
    //            result = [];
    //        _.each(context.result, function (it) {
    //            result.push(clearClientProvider(it));
    //        });
    //
    //        context.result = result;
    //    }
    //}
).getMiddleware();

module.exports.getClientProviders = new restMiddleware.ListController({
    model: data.models.Provider
}, {
    getFindOpts: function (context) {
        var self = this,
            req = context.req;
        return Promise.resolve(restMiddleware.ListController.prototype.getFindOpts.call(self, context)).then(function (opts) {
            return data.models.Client.find({
                where: {id: req.swagger.params['clientId'].value},
                include: [{
                    model: data.models.Provider,
                    as: 'Providers'
                }]
            }).then(function (instance) {
                if (instance) {
                    instance.Providers = instance.Providers || [];
                    opts.where = data.sequelize.and(opts.where, {
                        id: {
                            $in: _.map(instance.Providers, function (prov) {
                                return prov.get('id');
                            })
                        }
                    });
                    return opts;
                } else {
                    throw restMiddleware.errors.notFoundError({
                        message: 'Client not Found'
                    })
                }

            });
        });
    }
}).getMiddleware();

//module.exports.setClientProviders = new restMiddleware.BaseController({
//    model: data.models.ClientProvider,
//    body: 'providers'
//}, {
//    fetch: function (context) {
//        var
//            self = this,
//            opts = self.opts,
//            req = context.req,
//            list = req.swagger.params[opts.body].value || [];
//
//        //context.fetchedData = _.extend({},
//        //    req.swagger.params[opts.body].value,
//        //    {clientId: req.swagger.params['clientId'].value}
//        //);
//        context.fetchedData = _.map(list, function (provId) {
//                return {
//                    clientId: req.swagger.params['clientId'].value,
//                    providerId: provId
//                };
//            }
//        );
//    },
//    data: function (context) {
//        var
//            self = this,
//            opts = self.opts,
//            req = context.req;
//        return opts.model.destroy({
//            where: {
//                clientId: req.swagger.params['clientId'].value
//            }
//        }).then(function () {
//            context.result = [];
//            if (context.fetchedData.length)
//                return opts.model
//                    .bulkCreate(context.fetchedData)
//                    .then(function (instance) {
//                        context.result = instance;
//
//                    });
//        });
//
//    },
//    transform: function (context) {
//        var
//            self = this,
//            opts = self.opts,
//            req = context.req,
//            list = req.swagger.params[opts.body].value || [];
//
//        return data.models.Provider.findAll({
//            where: {
//                id: list
//            }
//        }).then(function (filledInstance) {
//            context.result = filledInstance;
//        });
//
//    },
//    send: function (context) {
//        context.res.restSend(201, context.result);
//    }
//}).getMiddleware();

//module.exports.deleteClientProvider = new restMiddleware.DeleteController({
//    model: data.models.ClientProvider
//}, {
//    getFindOpts: function (context) {
//        var
//            req = context.req;
//
//        return {
//            where: {
//                clientId: req.swagger.params['clientId'].value,
//                providerId: req.swagger.params['providerId'].value
//            }
//        }
//    },
//    data: function (context) {
//        var
//            self = this,
//            opts = self.opts;
//        return self.opts.model.destroy({where: context.fetchedData.toJSON()});
//    }
//}).getMiddleware();