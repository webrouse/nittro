_context.invoke('Nittro.Flashes', function (Message, DOM, Arrays) {

    var Service = _context.extend(function (positioner, options) {
        this._ = {
            positioner: positioner,
            options: Arrays.mergeTree({}, Service.defaults, options),
            globalHolder: DOM.create('div', {'class': 'nittro-flash-global-holder'})
        };

        if (typeof this._.options.layer === 'string') {
            this._.options.layer = DOM.getById(this._.options.layer);
        } else if (!this._.options.layer) {
            this._.options.layer = document.body;
        }

        this._.options.layer.appendChild(this._.globalHolder);

        if (!this._.options.classes) {
            this._.options.classes = DOM.getData(this._.options.layer, 'flash-classes');
        }

        Message.defaults.classes = this._.options.classes;

        this._removeStatic();
    }, {
        STATIC: {
            defaults: {
                layer: null,
                classes: null
            }
        },

        create: function (content, options) {
            return new Message(this, content, options);
        },

        add: function (content, type, target, rich) {
            var options;

            if (type && typeof type === 'object') {
                options = type;
            } else {
                options = {
                    type: type || 'info',
                    target: target,
                    rich: rich
                };
            }

            return this.create(content, options).show();
        },

        getGlobalHolder: function () {
            return this._.globalHolder;
        },

        getLayer: function () {
            return this._.options.layer;
        },

        getPositioner: function () {
            return this._.positioner;
        },

        _removeStatic: function () {
            DOM.getByClassName('nittro-flash')
                .forEach(function (elem) {
                    if (!DOM.getData(elem, 'flash-dynamic')) {
                        Message.wrap(elem);
                    }
                }.bind(this));
        }
    });

    _context.register(Service, 'Service');

}, {
    DOM: 'Utils.DOM',
    Arrays: 'Utils.Arrays',
    CSSTransitions: 'Utils.CSSTransitions'
});
