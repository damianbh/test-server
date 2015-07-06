/**
 * Created by damian on 3/13/2015.
 */
var
    config = require('../config'),
    _ = require('underscore'),
    connection = config.connection,
    Sequelize = require('sequelize'),
    Promise = require('bluebird'),
    data = function () {
        var
            self = this;

        self.sequelize = Sequelize;

        if (connection.options && _.isUndefined(connection.options.logging)) {
            connection.options.logging = (process.env.LOG_LEVEL === 'trace') ? console.log : false;
        }
        self.database = new Sequelize(connection.database, connection.username, connection.password, connection.options);

        // Define your models

        self.models = {
            Provider: self.database.define('provider', {
                name: {
                    type: Sequelize.STRING,
                    unique: true,
                    allowNull: false,
                    validate: {
                        notEmpty: true
                    }
                },
                phone: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    validate: {
                        notEmpty: true
                    }
                },
                descr: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    validate: {
                        notEmpty: true
                    }
                },
                address: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    validate: {
                        notEmpty: true
                    }
                }
            }, {
                timestamps: false
            }),
            Client: self.database.define('client', {
                name: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    validate: {
                        notEmpty: true
                    }
                },
                email: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    validate: {
                        isEmail: true,
                        notEmpty: true
                    }
                },
                phone: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    validate: {
                        notEmpty: true
                    }
                }
            }, {
                timestamps: false
            }),
            ClientProvider: self.database.define('ClientProvider', {}, {
                timestamps: false,
                tableName: 'client_provider'
            }),
            Employee: self.database.define('employee', {
                firstName: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    validate: {
                        notEmpty: true
                    }
                },
                lastName: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    validate: {
                        notEmpty: true
                    }
                },
                initials: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    validate: {
                        notEmpty: true
                    }
                }
            }, {
                timestamps: false
            }),
            Office: self.database.define('office', {
                name: {
                    type: Sequelize.STRING,
                    unique: true,
                    allowNull: false,
                    validate: {
                        notEmpty: true
                    }
                }
            }, {
                timestamps: false
            })
        };

        self.models.Client.belongsToMany(self.models.Provider, {
            as: 'Providers', through: 'ClientProvider',
            onDelete: 'cascade'
        });
        self.models.Provider.belongsToMany(self.models.Client, {
            as: 'Clients', through: 'ClientProvider',
            onDelete: 'restrict'
        });

        self.models.Employee.belongsTo(self.models.Office, {
            as: 'Office',
            foreignKey: {
                name: 'officeId',
                allowNull: false
            },
            onDelete: 'restrict'
        });
    };

data.prototype.createDb = function () {
    var
        self = this;

    return self.database
        .query('SET FOREIGN_KEY_CHECKS = 0')
        .then(function () {
            return self.database.sync({force: true}).then(function () {
                    return self.models.Office.bulkCreate([
                        {
                            name: 'Miami'
                        }, {
                            name: 'San Francisco'
                        }, {
                            name: 'California'
                        }, {
                            name: 'Texas'
                        }, {
                            name: 'Alabama'
                        }, {
                            name: 'Las Vegas'
                        }, {
                            name: 'New Jersey'
                        }, {
                            name: 'Chicago'
                        }, {
                            name: 'Manhattan'
                        }, {
                            name: 'Orlando'
                        }, {
                            name: 'New York'
                        }, {
                            name: 'Washington'
                        }, {
                            name: 'Virginia'
                        }
                    ]).then(function () {
                        return Promise.join(self.models.Provider.bulkCreate([
                                {
                                    name: 'Sony',
                                    descr: 'Electronics',
                                    address: '2630 SW 28th Street',
                                    phone: '786123456'
                                },
                                {
                                    name: 'Amway',
                                    address: '2630 SW 28th Street',
                                    descr: 'All kind of products',
                                    phone: '786123456'
                                },
                                {
                                    name: 'Starbucks',
                                    descr: 'Coffee',
                                    address: '2630 SW 28th Street',
                                    phone: '786127674'
                                },
                                {
                                    name: 'Samsung',
                                    descr: 'Electronics',
                                    address: '2630 SW 28th Street',
                                    phone: '786644665'
                                },
                                {
                                    name: 'Lg Electronics',
                                    descr: 'Electronics',
                                    address: '2630 SW 28th Street',
                                    phone: '786146785'
                                },
                                {
                                    name: 'Dell',
                                    descr: 'Computers & Accessories',
                                    address: '2630 SW 28th Street',
                                    phone: '786144324'
                                },
                                {
                                    name: 'Hewlett Packard',
                                    descr: 'Computers & Accessories',
                                    address: '2630 SW 28th Street',
                                    phone: '786142675'
                                },
                                {
                                    name: 'ACER',
                                    descr: 'Computers & Accessories',
                                    address: '2630 SW 28th Street',
                                    phone: '786143267'
                                },
                                {
                                    name: 'LinkSys',
                                    descr: 'Modems & Routers',
                                    address: '2630 SW 28th Street',
                                    phone: '786143543'
                                },
                                {
                                    name: 'Apple',
                                    descr: 'Electronics',
                                    address: '2630 SW 28th Street',
                                    phone: '786658737'
                                },
                                {
                                    name: 'Huawei',
                                    descr: 'Electronics',
                                    address: '2630 SW 28th Street',
                                    phone: '786092300'
                                },
                                {name: 'Motorola', descr: 'Phones', address: '2630 SW 28th Street', phone: '786013406'},
                                {name: 'Ford', descr: 'Cars', address: '2630 SW 28th Street', phone: '765657162'}
                            ]),
                            self.models.Client.bulkCreate([
                                {
                                    name: 'Test',
                                    email: 'test@krfs.com',
                                    phone: '3053550000'
                                }, {
                                    name: 'Test1',
                                    email: 'test1@krfs.com',
                                    phone: '3050005555'
                                }, {
                                    name: 'Test2',
                                    email: 'test2@krfs.com',
                                    phone: '3053335555'
                                }
                            ]),
                            self.models.Employee.bulkCreate([
                                {
                                    firstName: 'Jose',
                                    lastName: 'Garcia',
                                    initials: 'JAG',
                                    officeId: 1
                                }, {
                                    firstName: 'Pedro',
                                    lastName: 'Fernandez',
                                    initials: 'PFD',
                                    officeId: 2
                                }, {
                                    firstName: 'Felipe',
                                    lastName: 'Lago',
                                    initials: 'FLG',
                                    officeId: 2
                                }, {
                                    firstName: 'Leonor',
                                    lastName: 'Lopez',
                                    initials: 'LLP',
                                    officeId: 2
                                }, {
                                    firstName: 'Mariuska',
                                    lastName: 'Garcia',
                                    initials: 'MGD',
                                    officeId: 1
                                }, {
                                    firstName: 'Orlando',
                                    lastName: 'Garcia',
                                    initials: 'OGD',
                                    officeId: 1
                                }, {
                                    firstName: 'Juan',
                                    lastName: 'Rodriguez',
                                    initials: 'JRR',
                                    officeId: 5
                                }, {
                                    firstName: 'Martha',
                                    lastName: 'Gavilan',
                                    initials: 'MGD',
                                    officeId: 9
                                }, {
                                    firstName: 'Yoana',
                                    lastName: 'Lopez',
                                    initials: 'YLD',
                                    officeId: 7
                                }, {
                                    firstName: 'Mongo',
                                    lastName: 'Perez',
                                    initials: 'MPD',
                                    officeId: 11
                                }, {
                                    firstName: 'Edgar',
                                    lastName: 'Hernandez',
                                    initials: 'EHB',
                                    officeId: 3
                                }
                            ])
                        );
                    });
                }
            );

        }).then(function () {
            return Promise.join(self.models.Provider.findAll(),
                self.models.Client.findAll(),
                self.models.Employee.findAll(),
                self.models.Office.findAll(),

                function (providers, clients, employees, offices) {
                    return Promise.join(clients[0].setProviders([providers[0], providers[2], providers[4]]),
                        clients[1].setProviders([providers[2]]),
                        clients[2].setProviders([providers[1], providers[3]])
                    );
                });
        })
};

data.prototype.syncDb = function () {
    var
        self = this;

    return self.database.query('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = \'' + connection.database + '\'').then(function (data) {
        if (data[0][0]['COUNT(*)'] == 0)
            return self.createDb();

        return self.database.sync();

    });


};

module.exports = new data();