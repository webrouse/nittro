_context.invoke('Nittro.Forms', function (Form, Vendor, DOM, Arrays) {

    var Locator = _context.extend('Nittro.Object', function () {
        this._ = {
            registry: {},
            anonId: 0
        };

        Vendor.addError = this._forwardError.bind(this);
        DOM.addListener(document, 'blur', this._handleBlur.bind(this), true);

    }, {
        getForm: function (id) {
            var elem;

            if (typeof id !== 'string') {
                elem = id;

                if (!elem.getAttribute('id')) {
                    elem.setAttribute('id', 'frm-anonymous' + (++this._.anonId));

                }

                id = elem.getAttribute('id');

            }

            if (!(id in this._.registry)) {
                this._.registry[id] = new Form(elem || id);
                this.trigger('form-added', { form: this._.registry[id] });
            }

            return this._.registry[id];

        },

        removeForm: function (id) {
            if (typeof id !== 'string') {
                id = id.getAttribute('id');

            }

            if (id in this._.registry) {
                this.trigger('form-removed', { form: this._.registry[id] });
                this._.registry[id].destroy();
                delete this._.registry[id];

            }
        },

        refreshForms: function () {
            var elem, id;

            for (id in this._.registry) {
                if (this._.registry.hasOwnProperty(id)) {
                    elem = DOM.getById(id);

                    if (elem) {
                        if (elem !== this._.registry[id].getElement()) {
                            this._.registry[id].setElement(elem);
                        }
                    } else {
                        this.removeForm(id);
                    }
                }
            }
        },

        _forwardError: function (elem, msg) {
            this.getForm(elem.form).trigger('error', {element: elem, message: msg});
        },

        _handleBlur: function (evt) {
            if (evt.target.form && evt.target.form instanceof HTMLFormElement) {
                this.getForm(evt.target.form).trigger('blur', { element: evt.target });
            }
        }
    });

    _context.register(Locator, 'Locator');

}, {
    DOM: 'Utils.DOM',
    Arrays: 'Utils.Arrays'
});
