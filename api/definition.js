var
    config = require('../config'),
    host = config.host,
    port = process.env.PORT || 8000,
    _ = require('underscore'),
    listParameters = [
        {
            "name": "q",
            "in": "query",
            "description": "Search query string. Search is done in all record's fields",
            "required": false,
            "type": "string"
        },
        {
            "name": "qf",
            "in": "query",
            "description": "Search query fields. Search is done on this table fields, if not specified, search is done on all fields. Ex: 'name,phone'",
            "required": false,
            "type": "string"
        },
        {
            "name": "sort",
            "in": "query",
            "description": "Sort description. Ex: 'name,-id'",
            "required": false,
            "type": "string"


        }, {
            "name": "limit",
            "in": "query",
            "description": "Items per page (Used for Pagination)",
            "required": false,
            "type": "integer"
        },
        {
            "name": "offset",
            "in": "query",
            "description": "Offset from the beginning (Used for Pagination)",
            "required": false,
            "type": "integer"
        }
        //{
        //    "name": "nin",
        //    "in": "query",
        //    "description": "List of Ids of Items not to be included in result. Ex: '1,2,3,5'",
        //    "required": false,
        //    "type": "string"
        //}
    ],
    idProperty = {
        "id": {
            "type": "integer",
            "format": "int64",
            "description": "Identifier",
            "minimum": 0
        }
    },
    employeeProperties = {
        "firstName": {"type": "string", "description": "Employee's First Name"},
        "lastName": {"type": "string", "description": "Employee's Last Name"},
        "initials": {"type": "string", "description": "Employee's Initials"},
        "officeId": {
            "type": "integer",
            "format": "int64",
            "description": "Employee's Office Identifier"
        }
    },
    officeProperties = {
        "name": {"type": "string", "description": "Office's Name"}
    },
    providerProperties = {
        "name": {"type": "string", "description": "Provider's Name"}
    },
    clientProperties = {
        "name": {"type": "string", "description": "Client's Name"},
        "email": {"type": "string", "description": "Client's Email"},
        "phone": {"type": "string", "description": "Client's Phone"}
    };

module.exports = {
    "swagger": "2.0",
    "info": {
        "title": "Rest Api",
        "description": "Rest Api Example",
        "version": "1.0"
    },
    "produces": ["application/json"],
    "host": host + ':' + port,
    "basePath": "/api",
    securityDefinitions: {
        "api_key": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header"
        }
    },
    security: [{
        "api_key": []
    }],
    "paths": {
        "/employees": {
            "get": {
                "x-swagger-router-controller": "Employee",
                "x-swagger-security": {
                    roles: ["human_resources"]
                },
                "operationId": "listEmployees",
                "tags": ["Employee"],
                "description": "Returns Employees filtered/sorted.",
                "summary": "Returns Employees filtered/sorted.",
                "parameters": listParameters,
                "responses": {
                    "200": {
                        "description": "Successful request.",
                        "schema": {
                            "type": "array",
                            "items": {
                                "$ref": "#/definitions/Employee"
                            }
                        }
                    },
                    "400": {
                        "description": "Invalid request.",
                        "schema": {
                            "$ref": "#/definitions/Error"
                        }
                    }
                }
            },
            "post": {
                "x-swagger-router-controller": "Employee",
                "x-swagger-security": {
                    roles: ["human_resources"]
                },
                "operationId": "newEmployee",
                "tags": ["Employee"],
                "description": "Create new Employee.",
                "summary": "Create new Employee.",
                "parameters": [{
                    "name": "employee",
                    "in": "body",
                    "description": "Employee to add to the System",
                    "required": true,
                    "schema": {
                        "$ref": "#/definitions/AddEmployee"
                    }
                }],
                "responses": {
                    "201": {
                        "description": "Successful creation.",
                        "schema": {
                            "$ref": "#/definitions/Employee"
                        }
                    },
                    "400": {
                        "description": "Validation Errors.",
                        "schema": {
                            "$ref": "#/definitions/Error"
                        }
                    }
                }
            },
            "options": {
                "x-swagger-router-controller": "Options",
                "operationId": "options",
                "tags": ["Employee"],
                "description": "OPTIONS method",
                "summary": "OPTIONS method",
                //"parameters": [],
                "responses": {
                    "204": {
                        "description": "Successful options."
                    }
                }
            }
        },
        "/employees/{employeeId}": {
            "get": {
                "x-swagger-router-controller": "Employee",
                "x-swagger-security": {
                    roles: ["human_resources"]
                },
                "operationId": "getEmployee",
                "tags": ["Employee"],
                "description": "Returns Employee by Id.",
                "summary": "Returns Employee by Id.",
                "parameters": [
                    {
                        "name": "employeeId",
                        "in": "path",
                        "description": "Id of the employee to search for",
                        "required": true,
                        "type": "integer"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Successful request.",
                        "schema": {
                            "$ref": "#/definitions/EmployeeOffices"
                        }
                    },
                    "400": {
                        "description": "Invalid request.",
                        "schema": {
                            "$ref": "#/definitions/Error"
                        }
                    }

                }
            },
            "post": {
                "x-swagger-router-controller": "Employee",
                "x-swagger-security": {
                    roles: ["human_resources"]
                },
                "operationId": "updateEmployee",
                "tags": ["Employee"],
                "description": "Update Employee by  Id.",
                "summary": "Update Employee by  Id.",
                "parameters": [{
                    "name": "employeeId",
                    "in": "path",
                    "description": "Id of the employee to search for",
                    "required": true,
                    "type": "integer"
                }, {
                    "name": "employee",
                    "in": "body",
                    "description": "Employee data to use for update",
                    "required": true,
                    "schema": {
                        "$ref": "#/definitions/EditEmployee"
                    }
                }],
                "responses": {
                    "200": {
                        "description": "Successful update.",
                        "schema": {
                            "$ref": "#/definitions/Employee"
                        }
                    },
                    "default": {
                        "description": "Invalid request.",
                        "schema": {
                            "$ref": "#/definitions/Error"
                        }
                    }

                }
            },
            "delete": {
                "x-swagger-router-controller": "Employee",
                "x-swagger-security": {
                    roles: ["human_resources"]
                },
                "operationId": "deleteEmployee",
                "tags": ["Employee"],
                "description": "Delete Employee by  Id.",
                "summary": "Delete Employee by  Id.",
                "parameters": [
                    {
                        "name": "employeeId",
                        "in": "path",
                        "description": "Id of the employee to search for",
                        "required": true,
                        "type": "integer"
                    }
                ],
                "responses": {
                    "default": {
                        "description": "Invalid request.",
                        "schema": {
                            "$ref": "#/definitions/Error"
                        }
                    },
                    "204": {
                        "description": "Successful Delete."
                    }
                }
            },
            "options": {
                "x-swagger-router-controller": "Options",
                "operationId": "options",
                "tags": ["Employee"],
                "description": "OPTIONS method",
                "summary": "OPTIONS method",
                "parameters": [{
                    "name": "employeeId",
                    "in": "path",
                    "description": "Id of the employee to search for",
                    "required": true,
                    "type": "integer"
                }],
                "responses": {
                    "204": {
                        "description": "Successful options."
                    }
                }
            }
        },


        "/offices": {
            "get": {
                "x-swagger-router-controller": "Office",
                "x-swagger-security": {
                    roles: ["director", "human_resources"]
                },
                "operationId": "listOffices",
                "tags": ["Office"],
                "description": "Returns Offices filtered/sorted.",
                "summary": "Returns Offices filtered/sorted.",
                "parameters": listParameters,
                "responses": {
                    "200": {
                        "description": "Successful request.",
                        "schema": {
                            "type": "array",
                            "items": {
                                "$ref": "#/definitions/Office"
                            }
                        }
                    },
                    "400": {
                        "description": "Invalid request.",
                        "schema": {
                            "$ref": "#/definitions/Error"
                        }
                    }
                }
            },
            "post": {
                "x-swagger-router-controller": "Office",
                "x-swagger-security": {
                    roles: ["director"]
                },
                "operationId": "newOffice",
                "tags": ["Office"],
                "description": "Create new Office.",
                "summary": "Create new Office.",
                "parameters": [{
                    "name": "office",
                    "in": "body",
                    "description": "Office to add to the System",
                    "required": true,
                    "schema": {
                        "$ref": "#/definitions/AddOffice"
                    }
                }],
                "responses": {
                    "201": {
                        "description": "Successful creation.",
                        "schema": {
                            "$ref": "#/definitions/Office"
                        }
                    },
                    "400": {
                        "description": "Validation Errors.",
                        "schema": {
                            "$ref": "#/definitions/Error"
                        }
                    }
                }
            },
            "options": {
                "x-swagger-router-controller": "Options",
                "operationId": "options",
                "tags": ["Office"],
                "description": "OPTIONS method",
                "summary": "OPTIONS method",
                //"parameters": [],
                "responses": {
                    "204": {
                        "description": "Successful options."
                    }
                }
            }
        },
        "/offices/{officeId}": {
            "get": {
                "x-swagger-router-controller": "Office",
                "x-swagger-security": {
                    roles: ["director"]
                },
                "operationId": "getOffice",
                "tags": ["Office"],
                "description": "Returns Office by Id.",
                "summary": "Returns Office by Id.",
                "parameters": [
                    {
                        "name": "officeId",
                        "in": "path",
                        "description": "Id of the office to search for",
                        "required": true,
                        "type": "integer"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Successful request.",
                        "schema": {
                            "$ref": "#/definitions/Office"
                        }
                    },
                    "400": {
                        "description": "Invalid request.",
                        "schema": {
                            "$ref": "#/definitions/Error"
                        }
                    }

                }
            },
            "post": {
                "x-swagger-router-controller": "Office",
                "x-swagger-security": {
                    roles: ["director"]
                },
                "operationId": "updateOffice",
                "tags": ["Office"],
                "description": "Update Office by Id.",
                "summary": "Update Office by Id.",
                "parameters": [{
                    "name": "officeId",
                    "in": "path",
                    "description": "Id of the office to search for",
                    "required": true,
                    "type": "integer"
                }, {
                    "name": "office",
                    "in": "body",
                    "description": "Office data to use for update",
                    "required": true,
                    "schema": {
                        "$ref": "#/definitions/EditOffice"
                    }
                }],
                "responses": {
                    "200": {
                        "description": "Successful update.",
                        "schema": {
                            "$ref": "#/definitions/Office"
                        }
                    },
                    "default": {
                        "description": "Invalid request.",
                        "schema": {
                            "$ref": "#/definitions/Error"
                        }
                    }

                }
            },
            "delete": {
                "x-swagger-router-controller": "Office",
                "x-swagger-security": {
                    roles: ["director"]
                },
                "operationId": "deleteOffice",
                "tags": ["Office"],
                "description": "Delete Office by Id.",
                "summary": "Delete Office by Id.",
                "parameters": [
                    {
                        "name": "officeId",
                        "in": "path",
                        "description": "Id of the Office to search for",
                        "required": true,
                        "type": "integer"
                    }
                ],
                "responses": {
                    "default": {
                        "description": "Invalid request.",
                        "schema": {
                            "$ref": "#/definitions/Error"
                        }
                    },
                    "204": {
                        "description": "Successful Delete."
                    }
                }
            },
            "options": {
                "x-swagger-router-controller": "Options",
                "operationId": "options",
                "tags": ["Office"],
                "description": "OPTIONS method",
                "summary": "OPTIONS method",
                "parameters": [{
                    "name": "officeId",
                    "in": "path",
                    "description": "Id of the employee to search for",
                    "required": true,
                    "type": "integer"
                }],
                "responses": {
                    "204": {
                        "description": "Successful options."
                    }
                }
            }
        },


        "/providers": {
            "get": {
                "x-swagger-router-controller": "Provider",
                "x-swagger-security": {
                    roles: ["human_resources", "manager"]
                },
                "operationId": "listProviders",
                "tags": ["Provider"],
                "description": "Returns Providers filtered/sorted.",
                "summary": "Returns Providers filtered/sorted.",
                "parameters": listParameters,
                "responses": {
                    "200": {
                        "description": "Successful request.",
                        "schema": {
                            "type": "array",
                            "items": {
                                "$ref": "#/definitions/Provider"
                            }
                        }
                    },
                    "400": {
                        "description": "Invalid request.",
                        "schema": {
                            "$ref": "#/definitions/Error"
                        }
                    }
                }
            },
            "post": {
                "x-swagger-router-controller": "Provider",
                "x-swagger-security": {
                    roles: ["human_resources"]
                },
                "operationId": "newProvider",
                "tags": ["Provider"],
                "description": "Create new Provider.",
                "summary": "Create new Provider.",
                "parameters": [{
                    "name": "provider",
                    "in": "body",
                    "description": "Provider to add to the System",
                    "required": true,
                    "schema": {
                        "$ref": "#/definitions/AddProvider"
                    }
                }],
                "responses": {
                    "201": {
                        "description": "Successful creation.",
                        "schema": {
                            "$ref": "#/definitions/Provider"
                        }
                    },
                    "400": {
                        "description": "Validation Errors.",
                        "schema": {
                            "$ref": "#/definitions/Error"
                        }
                    }
                }
            },
            "options": {
                "x-swagger-router-controller": "Options",
                "operationId": "options",
                "tags": ["Provider"],
                "description": "OPTIONS method",
                "summary": "OPTIONS method",
                //"parameters": [],
                "responses": {
                    "204": {
                        "description": "Successful options."
                    }
                }
            }
        },
        "/providers/{providerId}": {
            "get": {
                "x-swagger-router-controller": "Provider",
                "x-swagger-security": {
                    roles: ["human_resources"]
                },
                "operationId": "getProvider",
                "tags": ["Provider"],
                "description": "Returns Provider by Id.",
                "summary": "Returns Provider by Id.",
                "parameters": [
                    {
                        "name": "providerId",
                        "in": "path",
                        "description": "Id of the Provider to search for",
                        "required": true,
                        "type": "integer"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Successful request.",
                        "schema": {
                            "$ref": "#/definitions/Provider"
                        }
                    },
                    "400": {
                        "description": "Invalid request.",
                        "schema": {
                            "$ref": "#/definitions/Error"
                        }
                    }

                }
            },
            "post": {
                "x-swagger-router-controller": "Provider",
                "x-swagger-security": {
                    roles: ["human_resources"]
                },
                "operationId": "updateProvider",
                "tags": ["Provider"],
                "description": "Update Provider by  Id.",
                "summary": "Update Provider by  Id.",
                "parameters": [{
                    "name": "providerId",
                    "in": "path",
                    "description": "Id of the Provider to search for",
                    "required": true,
                    "type": "integer"
                }, {
                    "name": "provider",
                    "in": "body",
                    "description": "Provider data to use for update",
                    "required": true,
                    "schema": {
                        "$ref": "#/definitions/EditProvider"
                    }
                }],
                "responses": {
                    "200": {
                        "description": "Successful update.",
                        "schema": {
                            "$ref": "#/definitions/Provider"
                        }
                    },
                    "default": {
                        "description": "Invalid request.",
                        "schema": {
                            "$ref": "#/definitions/Error"
                        }
                    }

                }
            },
            "delete": {
                "x-swagger-router-controller": "Provider",
                "x-swagger-security": {
                    roles: ["human_resources"]
                },
                "operationId": "deleteProvider",
                "tags": ["Provider"],
                "description": "Delete Provider by Id.",
                "summary": "Delete Provider by Id.",
                "parameters": [
                    {
                        "name": "providerId",
                        "in": "path",
                        "description": "Id of the Provider to search for",
                        "required": true,
                        "type": "integer"
                    }
                ],
                "responses": {
                    "default": {
                        "description": "Invalid request.",
                        "schema": {
                            "$ref": "#/definitions/Error"
                        }
                    },
                    "204": {
                        "description": "Successful Delete."
                    }
                }
            },
            "options": {
                "x-swagger-router-controller": "Options",
                "operationId": "options",
                "tags": ["Provider"],
                "description": "OPTIONS method",
                "summary": "OPTIONS method",
                "parameters": [
                    {
                        "name": "providerId",
                        "in": "path",
                        "description": "Id of the Provider to search for",
                        "required": true,
                        "type": "integer"
                    }
                ],
                "responses": {
                    "204": {
                        "description": "Successful options."
                    }
                }
            }
        },


        "/clients": {
            "get": {
                "x-swagger-router-controller": "Client",
                "x-swagger-security": {
                    roles: ["manager"]
                },
                "operationId": "listClients",
                "tags": ["Client"],
                "description": "Returns Clients filtered/sorted.",
                "summary": "Returns Clients filtered/sorted.",
                "parameters": listParameters,
                "responses": {
                    "200": {
                        "description": "Successful request.",
                        "schema": {
                            "type": "array",
                            "items": {
                                "$ref": "#/definitions/Client"
                            }
                        }
                    },
                    "400": {
                        "description": "Invalid request.",
                        "schema": {
                            "$ref": "#/definitions/Error"
                        }
                    }
                }
            },
            "post": {
                "x-swagger-router-controller": "Client",
                "x-swagger-security": {
                    roles: ["manager"]
                },
                "operationId": "newClient",
                "tags": ["Client"],
                "description": "Create new Client.",
                "summary": "Create new Client.",
                "parameters": [{
                    "name": "client",
                    "in": "body",
                    "description": "Client to add to the System",
                    "required": true,
                    "schema": {
                        "$ref": "#/definitions/AddClient"
                    }
                }],
                "responses": {
                    "201": {
                        "description": "Successful creation.",
                        "schema": {
                            "$ref": "#/definitions/Client"
                        }
                    },
                    "400": {
                        "description": "Validation Errors.",
                        "schema": {
                            "$ref": "#/definitions/Error"
                        }
                    }
                }
            },
            "options": {
                "x-swagger-router-controller": "Options",
                "operationId": "options",
                "tags": ["Client"],
                "description": "OPTIONS method",
                "summary": "OPTIONS method",
                //"parameters": [],
                "responses": {
                    "204": {
                        "description": "Successful options."
                    }
                }
            }
        },
        "/clients/{clientId}": {
            "get": {
                "x-swagger-router-controller": "Client",
                "x-swagger-security": {
                    roles: ["manager"]
                },
                "operationId": "getClient",
                "tags": ["Client"],
                "description": "Returns Client by Id.",
                "summary": "Returns Client by Id.",
                "parameters": [
                    {
                        "name": "clientId",
                        "in": "path",
                        "description": "Id of the Client to search for",
                        "required": true,
                        "type": "integer"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Successful request.",
                        "schema": {
                            "$ref": "#/definitions/ClientProviders"
                        }
                    },
                    "400": {
                        "description": "Invalid request.",
                        "schema": {
                            "$ref": "#/definitions/Error"
                        }
                    }

                }
            },
            "post": {
                "x-swagger-router-controller": "Client",
                "x-swagger-security": {
                    roles: ["manager"]
                },
                "operationId": "updateClient",
                "tags": ["Client"],
                "description": "Update Client by Id.",
                "summary": "Update Client by  Id.",
                "parameters": [{
                    "name": "clientId",
                    "in": "path",
                    "description": "Id of the Client to search for",
                    "required": true,
                    "type": "integer"
                }, {
                    "name": "client",
                    "in": "body",
                    "description": "Client data to use for update",
                    "required": true,
                    "schema": {
                        "$ref": "#/definitions/ClientProviders"
                    }
                }],
                "responses": {
                    "200": {
                        "description": "Successful update.",
                        "schema": {
                            "$ref": "#/definitions/ClientProviders"
                        }
                    },
                    "default": {
                        "description": "Invalid request.",
                        "schema": {
                            "$ref": "#/definitions/Error"
                        }
                    }

                }
            },
            "delete": {
                "x-swagger-router-controller": "Client",
                "x-swagger-security": {
                    roles: ["manager"]
                },
                "operationId": "deleteClient",
                "tags": ["Client"],
                "description": "Delete Client by  Id.",
                "summary": "Delete Client by  Id.",
                "parameters": [
                    {
                        "name": "clientId",
                        "in": "path",
                        "description": "Id of the client to search for",
                        "required": true,
                        "type": "integer"
                    }
                ],
                "responses": {
                    "default": {
                        "description": "Invalid request.",
                        "schema": {
                            "$ref": "#/definitions/Error"
                        }
                    },
                    "204": {
                        "description": "Successful Delete."
                    }
                }
            },
            "options": {
                "x-swagger-router-controller": "Options",
                "operationId": "options",
                "tags": ["Client"],
                "description": "OPTIONS method",
                "summary": "OPTIONS method",
                "parameters": [{
                    "name": "clientId",
                    "in": "path",
                    "description": "Id of the client to search for",
                    "required": true,
                    "type": "integer"
                }],
                "responses": {
                    "204": {
                        "description": "Successful options."
                    }
                }
            }
        },
        "/clients/{clientId}/providers": {
            "get": {
                "x-swagger-router-controller": "Client",
                "x-swagger-security": {
                    roles: ["manager"]
                },
                "operationId": "getClientProviders",
                "tags": ["Client"],
                "description": "Returns Client's providers list filtered/sorted.",
                "summary": "Returns Client's providers list filtered/sorted.",
                "parameters": [
                    {
                        "name": "clientId",
                        "in": "path",
                        "description": "Id of the Client to search for",
                        "required": true,
                        "type": "integer"
                    }
                ].concat(listParameters),
                "responses": {
                    "200": {
                        "description": "Successful request.",
                        "schema": {
                            "type": "array",
                            "items": {
                                "$ref": "#/definitions/Provider"
                            }
                        }
                    },
                    "400": {
                        "description": "Invalid request.",
                        "schema": {
                            "$ref": "#/definitions/Error"
                        }
                    }

                }
            },
            //"post": {
            //    "x-swagger-router-controller": "Client",
            //    "operationId": "setClientProviders",
            //    "tags": ["Client"],
            //    "description": "Set Client's Provider list",
            //    "summary": "Set Client's Provider list",
            //    "parameters": [
            //        {
            //            "name": "clientId",
            //            "in": "path",
            //            "description": "Id of the Client to search for",
            //            "required": true,
            //            "type": "integer"
            //        }, {
            //            "name": "providers",
            //            "in": "body",
            //            "description": "Providers Id list",
            //            "required": true,
            //            "schema": {
            //                "type": "array",
            //                "items": {
            //                    "type": "integer"
            //                }
            //            }
            //        }],
            //    "responses": {
            //        "200": {
            //            "description": "Successful update.",
            //            "schema": {
            //                "type": "array",
            //                "items": {
            //                    "$ref": "#/definitions/Provider"
            //                }
            //            }
            //        },
            //        "default": {
            //            "description": "Invalid request.",
            //            "schema": {
            //                "$ref": "#/definitions/Error"
            //            }
            //        }
            //
            //    }
            //},
            "options": {
                "x-swagger-router-controller": "Options",
                "operationId": "options",
                "tags": ["Client"],
                "description": "OPTIONS method",
                "summary": "OPTIONS method",
                "parameters": [{
                    "name": "clientId",
                    "in": "path",
                    "description": "Id of the Client to search for",
                    "required": true,
                    "type": "integer"
                }],
                "responses": {
                    "204": {
                        "description": "Successful options."
                    }
                }
            }
        }
        //,"/clients/{clientId}/providers/{providerId}": {
        //    "delete": {
        //        "x-swagger-router-controller": "Client",
        //        "operationId": "deleteClientProvider",
        //        "tags": ["Client"],
        //        "description": "Delete Provider from Client's Provider list.",
        //        "summary": "Delete Provider from Client's Provider list.",
        //        "parameters": [
        //            {
        //                "name": "clientId",
        //                "in": "path",
        //                "description": "Id of the client to search for",
        //                "required": true,
        //                "type": "integer"
        //            },
        //            {
        //                "name": "providerId",
        //                "in": "path",
        //                "description": "Id of the Provider to remove from Client",
        //                "required": true,
        //                "type": "integer"
        //            }
        //        ],
        //        "responses": {
        //            "default": {
        //                "description": "Invalid request.",
        //                "schema": {
        //                    "$ref": "#/definitions/Error"
        //                }
        //            },
        //            "204": {
        //                "description": "Successful Delete."
        //            }
        //        }
        //    },
        //    "options": {
        //        "x-swagger-router-controller": "Options",
        //        "operationId": "options",
        //        "tags": ["Office"],
        //        "description": "OPTIONS method",
        //        "summary": "OPTIONS method",
        //        "parameters": [{
        //            "name": "clientId",
        //            "in": "path",
        //            "description": "Id of the client to search for",
        //            "required": true,
        //            "type": "integer"
        //        },
        //            {
        //                "name": "providerId",
        //                "in": "path",
        //                "description": "Id of the Provider to remove from Client",
        //                "required": true,
        //                "type": "integer"
        //            }],
        //        "responses": {
        //            "204": {
        //                "description": "Successful options."
        //            }
        //        }
        //    }
        //}
    },
    "definitions": {
        "Error": {
            "properties": {
                "message": {
                    "type": "string"
                }
            },
            "required": ["message"]
        },
        "AddEmployee": {
            "properties": _.extend({}, idProperty, employeeProperties),
            "required": [
                "firstName", "lastName", "initials", "officeId"
            ]
        },
        "EditEmployee": {
            "properties": employeeProperties
        },
        "Employee": {
            "type": "object",
            "properties": _.extend({}, idProperty, employeeProperties, {
                "Office": {
                    "$ref": "#/definitions/Office"
                }
            }),
            "required": [
                "id", "firstName", "lastName", "initials", "officeId", "Office"
            ]
        },
        "EmployeeOffices": {
            "type": "object",
            "properties": _.extend({}, idProperty, employeeProperties, {
                "allOffices": {
                    "type": "array",
                    "description": "List of all Offices",
                    "items": {
                        "$ref": "#/definitions/Office"
                    }
                }
            }),
            "required": [
                "id", "firstName", "lastName", "initials", "allOffices"
            ]
        },
        "AddOffice": {
            "properties": _.extend({}, idProperty, officeProperties),
            "required": [
                "name"
            ]
        },
        "EditOffice": {
            "properties": officeProperties
        },
        "Office": {
            "properties": _.extend({}, idProperty, officeProperties),
            "required": [
                "id", "name"
            ]
        },
        "AddProvider": {
            "properties": _.extend({}, idProperty, providerProperties),
            "required": [
                "name"
            ]
        },
        "EditProvider": {
            "properties": providerProperties
        },
        "Provider": {
            "properties": _.extend({}, idProperty, providerProperties),
            "required": [
                "id", "name"
            ]
        },
        "AddClient": {
            "properties": _.extend({}, idProperty, clientProperties, {
                "Providers": {
                    "type": "array",
                    "description": "List of Client's Providers Id",
                    "items": {
                        "type": "integer"
                    }

                }
            }),
            "required": [
                "name", "email", "phone"
            ]
        },
        //"EditClient": {
        //    "properties": clientProperties
        //},
        "Client": {
            "type": "object",
            "properties": _.extend({}, idProperty, clientProperties),
            "required": [
                "id", "name", "email", "phone"
            ]
        },
        "ClientProviders": {
            "type": "object",
            "properties": _.extend({}, idProperty, clientProperties, {
                "Providers": {
                    "type": "array",
                    "description": "List of Client's Providers Id",
                    "items": {
                        "type": "integer"
                    }

                }
                //,"allProviders": {
                //    "type": "array",
                //    "description": "List of all Providers",
                //    "items": {
                //        "$ref": "#/definitions/Provider"
                //    }
                //
                //}
            }),
            "required": [
                "id", "name", "email", "phone", "Providers"
            ]
        }
        //    ,"ClientProvider": {
        //    "type": "object",
        //    "properties": {
        //        "providerId": {
        //            "type": "integer",
        //            "format": "int64",
        //            "description": "Provider Id"
        //        }
        //    },
        //    "required": [
        //        "providerId"
        //    ]
        //}
        //,"ProvidersId": {
        //    "type": "object",
        //    "properties": {
        //        "providers": {"type": "string", "description": "Comma separated list of providers Id. Ex: '1,2,4,5'"}
        //    },
        //    "required": [
        //        "providers"
        //    ]
        //}
    }
};
