/**
 * Created by damian on 3/16/2015.
 */
var
    _ = require('underscore');

module.exports = {
    CreateController: require('./create'),
    ReadController: require('./read'),
    UpdateController: require('./update'),
    DeleteController: require('./delete'),
    ListController: require('./list'),
    errors: require('./errors'),
    BaseController: require('./base'),
    optionsMiddleware: function (req, res, next) {
        var
            methods = _.keys(req.swagger.path);

        res.setHeader('Allow', methods.join(' ').toUpperCase());
        res.restSend(204);

    }
};