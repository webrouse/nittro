_context.invoke('Nittro.DI', function(Nittro, ReflectionClass, ReflectionFunction, Arrays, Strings, HashMap, Neon, NeonEntity, ServiceDefinition, undefined) {

    var prepare = function (self) {
        if (!self._) {
            self._ = {};
        }

        if (!self._.services) {
            self._.services = {};
            self._.serviceDefs = {};

        }
    };

    var ContainerMixin = {
        addService: function (name, service) {
            prepare(this);

            if (this._.services[name] || this._.serviceDefs[name]) {
                throw new Error('Container already has a service named "' + name + '"');

            }

            this._.services[name] = service;

            return this;

        },

        addServiceDefinition: function (name, definition, override) {
            prepare(this);

            if (!override && (this._.services[name] || this._.serviceDefs[name])) {
               throw new Error('Container already has a service named "' + name + '"');

            }

            this._.serviceDefs[name] = definition;

            return this;

        },

        hasServiceDefinition: function(name) {
            prepare(this);
            return this._.serviceDefs[name] !== undefined;
        },

        getServiceDefinition: function(name) {
            prepare(this);

            if (!this._.serviceDefs[name]) {
                throw new Error('Container has no service "' + name + '"');

            }

            if (typeof this._.serviceDefs[name] === 'string') {
                this._.serviceDefs[name] = new ServiceDefinition(
                    this._.serviceDefs[name].replace(/!$/, ''),
                    null,
                    null,
                    !!this._.serviceDefs[name].match(/!$/)
                );
            } else if (typeof this._.serviceDefs[name] === 'function') {
                this._.serviceDefs[name] = new ServiceDefinition(
                    this._.serviceDefs[name]
                );
            } else if (!(this._.serviceDefs[name] instanceof ServiceDefinition)) {
                this._.serviceDefs[name] = new ServiceDefinition(
                    this._.serviceDefs[name].factory,
                    this._.serviceDefs[name].args,
                    this._.serviceDefs[name].setup,
                    this._.serviceDefs[name].run
                );
            }

            return this._.serviceDefs[name];

        },

        getService: function (name) {
            prepare(this);

            if (name === 'container') {
                return this;

            } else if (this._.services[name] === undefined) {
                if (this._.serviceDefs[name]) {
                    this._createService(name);

                } else {
                    throw new Error('Container has no service named "' + name + '"');

                }
            }

            return this._.services[name];

        },

        hasService: function (name) {
            prepare(this);
            return name === 'container' || this._.services[name] !== undefined || this._.serviceDefs[name] !== undefined;

        },

        isServiceCreated: function (name) {
            if (!this.hasService(name)) {
                throw new Error('Container has no service named "' + name + '"');

            }

            return !!this._.services[name];

        },

        runServices: function () {
            prepare(this);

            var name, def;

            for (name in this._.serviceDefs) {
                def = this.getServiceDefinition(name);

                if (def.isRun()) {
                    this.getService(name);

                }
            }
        },

        invoke: function (callback, args, thisArg) {
            prepare(this);
            args = this._autowireArguments(callback, args);
            return callback.apply(thisArg || null, this._expandArguments(args));

        },

        _createService: function (name) {
            var def = this.getServiceDefinition(name),
                factory = def.getFactory(),
                obj,
                service,
                setup;

            if (typeof factory === 'function') {
                service = this.invoke(factory, def.getArguments());

                if (!service) {
                    throw new Error('Factory failed to create service "' + name + '"');

                }
            } else {
                factory = this._toEntity(factory);
                service = this._expandEntity(factory, null, def.getArguments());

                if (service === factory) {
                    throw new Error('Invalid factory for service "' + name + '"');

                }
            }

            this._.services[name] = service;

            if (def.hasSetup()) {
                setup = def.getSetup();

                for (var i = 0; i < setup.length; i++) {
                    if (typeof setup[i] === 'function') {
                        this.invoke(setup[i], null, service);

                    } else {
                        obj = this._toEntity(setup[i]);
                        this._expandEntity(obj, service);

                    }
                }
            }

            return service;

        },

        _autowireArguments: function (callback) {
            var argList = ReflectionFunction.from(callback).getArgs();

            var args = Arrays.createFrom(arguments, 1)
                .filter(function(arg) { return !!arg; })
                .map(function (arg) {
                    if (arg instanceof HashMap) {
                        if (arg.isList()) {
                            arg = HashMap.from(arg.getValues(), argList);

                        }
                    } else {
                        arg = HashMap.from(arg, argList);

                    }

                    return arg;

                });

            var i, a;

            lookupArg:
            for (i = 0; i < argList.length; i++) {
                for (a = args.length - 1; a >= 0; a--) {
                    if (args[a].has(argList[i])) {
                        argList[i] = args[a].get(argList[i]);
                        continue lookupArg;

                    } else if (args[a].has(i)) {
                        argList[i] = args[a].get(i);
                        continue lookupArg;

                    }
                }

                if (this.hasService(argList[i])) {
                    argList[i] = this.getService(argList[i]);
                    continue;

                }

                throw new Error('Cannot autowire argument "' + argList[i] + '" of function');

            }

            return argList;

        },

        _expandArguments: function (args) {
            for (var i = 0; i < args.length; i++) {
                args[i] = this._expandArg(args[i]);

            }

            return args;

        },

        _expandArg: function (arg) {
            if (arg instanceof NeonEntity) {
                return this._expandEntity(arg);

            } else if (typeof arg === 'string' && arg.match(/^@\S+$/)) {
                return this.getService(arg.substr(1));

            } else {
                return arg;

            }
        },

        _toEntity: function (str) {
            var m = str.match(/^([^\(]+)\((.*)\)$/);

            if (m) {
                return new NeonEntity(m[1], Neon.decode('[' + m[2] + ']'));

            } else {
                return new NeonEntity(str, new HashMap());

            }
        },

        _expandEntity: function (entity, context, mergeArgs) {
            var m, obj, method, args;

            if (m = entity.value.match(/^(?:(@)?([^:].*?))?(?:::(.+))?$/)) {
                if (m[2]) {
                    obj = m[1] ? this.getService(m[2]) : ReflectionClass.getClass(m[2]);

                } else if (context) {
                    obj = context;

                } else {
                    throw new Error('No context for calling ' + entity.value + ' given');

                }

                if (m[3] !== undefined) {
                    method = m[3];
                    args = this._autowireArguments(obj[method], entity.attributes, mergeArgs);
                    return obj[method].apply(obj, this._expandArguments(args));

                } else if (!m[1]) {
                    args = this._autowireArguments(obj, entity.attributes, mergeArgs);
                    return ReflectionClass.from(obj).newInstanceArgs(this._expandArguments(args));

                } else if (entity.attributes.length) {
                    throw new Error('Invalid entity "' + entity.value + '"');

                } else {
                    return obj;

                }
            } else {
                return entity;

            }
        }
    };

    _context.register(ContainerMixin, 'ContainerMixin');

}, {
    ReflectionClass: 'Utils.ReflectionClass',
    ReflectionFunction: 'Utils.ReflectionFunction',
    Arrays: 'Utils.Arrays',
    Strings: 'Utils.Strings',
    HashMap: 'Utils.HashMap',
    Neon: 'Nittro.Neon.Neon',
    NeonEntity: 'Nittro.Neon.NeonEntity'
});
