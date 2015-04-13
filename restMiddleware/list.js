/**
 * Created by damian on 3/16/2015.
 */
//opts
//{
//  model: sequelize model
//  include: sequelize style include
//  searchParam: search param name, defaults q
//  sortParam: sort param name, defaults to "sort", value contains columns separated by commas, they can be preceded by - to sort in descending order ex: sort=firstName,-lastName
//  offsetParam: offset Param Name, defaults to "offset", used for pagination
//  limitParam: limit Param Name, defaults to "limit", used for pagination
// }

'use strict';

var
    util = require('util'),
    BaseRestMiddleware = require('./base'),
    errors = require('./errors'),
    _ = require('underscore'),
    Promise = require('bluebird'),
    ListRestMiddleware = function (opts, extend) {
        var
            self = this;
        BaseRestMiddleware.call(self, opts, extend);
    };

util.inherits(ListRestMiddleware, BaseRestMiddleware);

ListRestMiddleware.prototype.getFindOpts = function (context) {
    var
        self = this,
        opts = self.opts,
        req = context.req,
        searchParam = req.swagger.params[opts.searchParam || 'q'].value,
        criteria = {},
        sortParam = req.swagger.params[opts.sortParam || 'sort'].value,
        order = [],
        offset = req.swagger.params[opts.offsetParam || 'offset'].value,
        limit = req.swagger.params[opts.limitParam || 'limit'].value,
        include = [],
        result = {};

    if (_.isArray(opts.include)) {
        _.each(opts.include, function (includeItem) {
            include.push(_.clone(includeItem));
        });
        result.include = include;
    }


    if (!_.isUndefined(offset) && !_.isUndefined(limit)) {
        result = _.extend(result, {
            offset: offset,
            limit: limit
        });
    }

    if (searchParam) {
        var search = [],
            searchAttributes = Object.keys(opts.model.rawAttributes),
            qf = req.swagger.params[opts.searchFields || 'qf'].value;

        if (qf) {
            var qfArr = qf.split(',');
            if (qfArr.length) {
                var dif = _.difference(qfArr, searchAttributes);
                if (dif.length) {
                    throw errors.badRequestError({
                        message: 'Invalid search fields ' + dif.join(', ')
                    });
                }
                searchAttributes = qfArr;
            }
        }

        searchAttributes.forEach(function (attr) {
            var item = {};
            item[attr] = {
                like: '%' + searchParam + '%'
            };
            search.push(item);
        });


        criteria = opts.model.sequelize.or.apply(null, search);

    }

    //if (_.isString(req.swagger.params['nin'].value)) {
    //    criteria = opts.model.sequelize.and(criteria, {
    //        id: {
    //            $not: req.swagger.params['nin'].value.split(',')
    //        }
    //    });
    //}


    if (sortParam) {

        var columnNames = [],
            sortColumns = sortParam.split(',');
        sortColumns.forEach(function (sortColumn) {
            if (sortColumn.indexOf('-') === 0) {
                var actualName = sortColumn.substring(1);
                order.push([actualName, 'DESC']);
                columnNames.push(actualName);
            } else {
                columnNames.push(sortColumn);
                order.push([sortColumn, 'ASC']);
            }
        });
        var allowedColumns = Object.keys(opts.model.rawAttributes),
            disallowedColumns = _.difference(columnNames, allowedColumns);
        if (disallowedColumns.length) {
            throw errors.badRequestError({
                message: 'Sorting not allowed on given attributes ' + disallowedColumns.join(', ')
            });
        }

    }

    result = _.extend(result, {
        where: criteria,
        order: order
    });

    return result;

};

ListRestMiddleware.prototype.fetch = function (context) {
    var
        self = this,
        opts = self.opts;

    return Promise.resolve(self.getFindOpts(context)).then(function (findOpts) {
        return opts.model
            .findAndCountAll(findOpts)
            .then(function (result) {
                context.fetchedData = result.rows;

                if (!_.isUndefined(findOpts.offset)) {
                    var start = findOpts.offset,
                        end = start + result.rows.length - 1;
                    end = end === -1 ? 0 : end;
                    if (result.count) {
                        ++start;
                        ++end;
                    }
                    context.res.setHeader('Content-Range', 'items ' + [[start, end].join('-'), result.count].join('/'));
                }

            });
    });
};

ListRestMiddleware.prototype.data = function (context) {
    context.result = context.fetchedData;
};


ListRestMiddleware.prototype.send = function (context) {
    var
        res = context.res;
    res.restSend(200, context.result);
};


module.exports = ListRestMiddleware;