_context.invoke('Nittro.Forms', function (DOM, Arrays, DateTime, FormData, Vendor, undefined) {

    var Form = _context.extend('Nittro.Object', function (form) {
        Form.Super.call(this);

        this._.submittedBy = null;
        this._.inLiveValidation = false;
        this._handleSubmit = this._handleSubmit.bind(this);
        this._handleReset = this._handleReset.bind(this);

        this.setElement(form);

        this.on('error:default', this._handleError.bind(this));
        this.on('blur:default', this._handleBlur.bind(this));

    }, {
        setElement: function (form) {
            if (typeof form === 'string') {
                form = DOM.getById(form);

            }

            if (!form || !(form instanceof HTMLFormElement)) {
                throw new TypeError('Invalid argument, must be a HTMLFormElement');

            }

            this._.form = form;
            this._.form.noValidate = 'novalidate';
            this._.validationMode = DOM.getData(form, 'validation-mode');

            if (this._.submittedBy) {
                this._.form['nette-submittedBy'] = this.getElement(this._.submittedBy);
            }

            DOM.addListener(this._.form, 'submit', this._handleSubmit);
            DOM.addListener(this._.form, 'reset', this._handleReset);

            return this;
        },

        getElement: function (name) {
            return name ? this._.form.elements.namedItem(name) : this._.form;

        },

        getElements: function () {
            return this._.form.elements;

        },

        setSubmittedBy: function (value) {
            if (value) {
                this._.submittedBy = value;
                this._.form['nette-submittedBy'] = this.getElement(value);
            } else {
                this._.submittedBy = this._.form['nette-submittedBy'] = null;
            }

            return this;

        },

        validate: function (sender) {
            var container;

            for (var i = 0, names = this._getFieldNames(); i < names.length; i++) {
                container = this._getErrorContainer(this.getElement(names[i]));

                if (container) {
                    DOM.getByClassName('error', container).forEach(function(elem) {
                        elem.parentNode.removeChild(elem);
                    });
                }
            }

            if (!Vendor.validateForm(sender || this._.form)) {
                return false;

            }

            var evt = this.trigger('validate', {
                sender: sender
            });

            return !evt.isDefaultPrevented();

        },

        setValues: function (values, reset) {
            var names = this._getFieldNames(),
                name, value, i;

            values || (values = {});

            for (i = 0; i < names.length; i++) {
                name = names[i];
                value = undefined;

                if (name.indexOf('[') > -1) {
                    value = values;

                    name.replace(/]/g, '').split(/\[/g).some(function (key) {
                        if (key === '') {
                            return true;

                        } else if (!(key in value)) {
                            value = undefined;
                            return true;

                        } else {
                            value = value[key];
                            return false;

                        }
                    });
                } else if (name in values) {
                    value = values[name];

                }

                if (value === undefined) {
                    if (reset) {
                        value = null;

                    } else {
                        continue;

                    }
                }

                this.setValue(name, value);

            }
        },

        setValue: function (elem, value) {
            if (typeof elem === 'string') {
                elem = this._.form.elements.namedItem(elem);

            }

            var i,
                toStr = function(v) { return '' + v; };

            if (!elem) {
                throw new TypeError('Invalid argument to setValue(), must be (the name of) an existing form element');

            } else if (!elem.tagName) {
                if ('length' in elem) {
                    for (i = 0; i < elem.length; i++) {
                        this.setValue(elem[i], value);

                    }
                }
            } else if (elem.type === 'radio') {
                elem.checked = value !== null && elem.value === toStr(value);

            } else if (elem.type === 'file') {
                if (value === null) {
                    value = elem.parentNode.innerHTML;
                    DOM.html(elem.parentNode, value);

                }
            } else if (elem.tagName.toLowerCase() === 'select') {
                var single = elem.type === 'select-one',
                    arr = Array.isArray(value),
                    v;

                if (arr) {
                    value = value.map(toStr);

                } else {
                    value = toStr(value);

                }

                for (i = 0; i < elem.options.length; i++) {
                    v = arr ? value.indexOf(elem.options.item(i).value) > -1 : value === elem.options.item(i).value;
                    elem.options.item(i).selected = v;

                    if (v && single) {
                        break;

                    }
                }
            } else if (elem.type === 'checkbox') {
                elem.checked = Array.isArray(value) ? value.map(toStr).indexOf(elem.value) > -1 : !!value;

            } else if (elem.type === 'date') {
                elem.value = value ? DateTime.from(value).format('Y-m-d') : '';

            } else if (elem.type === 'datetime-local' || elem.type === 'datetime') {
                elem.value = value ? DateTime.from(value).format('Y-m-d\\TH:i:s') : '';

            } else {
                elem.value = value !== null ? toStr(value) : '';

            }

            return this;

        },

        getValue: function (name) {
            return Vendor.getEffectiveValue(this.getElement(name));
        },

        serialize: function () {
            var elem, i,
                data = new FormData(),
                names = this._getFieldNames(true),
                value;

            if (this._.submittedBy) {
                names.push(this._.submittedBy);
            }

            for (i = 0; i < names.length; i++) {
                elem = this._.form.elements.namedItem(names[i]);
                value = Vendor.getEffectiveValue(elem);

                if (Array.isArray(value) || value instanceof FileList) {
                    for (var j = 0; j < value.length; j++) {
                        data.append(names[i], value[j]);

                    }
                } else {
                    data.append(names[i], value);

                }
            }

            this.trigger('serialize', data);

            return data;

        },

        submit: function (by) {
            if (by) {
                var btn = this._.form.elements.namedItem(by);

                if (btn && btn.type === 'submit') {
                    DOM.trigger(btn, 'click');

                } else {
                    throw new TypeError('Unknown element or not a submit button: ' + by);

                }
            } else {
                DOM.trigger(this._.form, 'submit');

            }

            return this;

        },

        reset: function () {
            this._.form.reset();
            return this;

        },

        destroy: function () {
            this.trigger('destroy');
            this.off();
            DOM.removeListener(this._.form, 'submit', this._handleSubmit);
            DOM.removeListener(this._.form, 'reset', this._handleReset);
            this._.form = null;
        },

        _handleSubmit: function (evt) {
            if (this.trigger('submit').isDefaultPrevented()) {
                evt.preventDefault();
                return;

            }

            var sender = this._.submittedBy ? this.getElement(this._.submittedBy) : null;

            if (!this.validate(sender)) {
                evt.preventDefault();

            }
        },

        _handleReset: function (evt) {
            if (evt.target !== this._.form) {
                return;

            }

            var elem, i;

            for (i = 0; i < this._.form.elements.length; i++) {
                elem = this._.form.elements.item(i);

                if (elem.type === 'hidden' && elem.hasAttribute('data-default-value')) {
                    this.setValue(elem, DOM.getData(elem, 'default-value'));

                } else if (elem.type === 'file') {
                    this.setValue(elem, null);

                }
            }

            this._.submittedBy = this._.form['nette-submittedBy'] = null;

            this.trigger('reset');

        },

        _handleError: function (evt) {
            var container = this._getErrorContainer(evt.data.element),
                elem;

            if (!this._.inLiveValidation && evt.data.element && typeof evt.data.element.focus === 'function') {
                evt.data.element.focus();
            }

            if (container) {
                if (evt.data.element && evt.data.element.parentNode === container) {
                    elem = DOM.create('span', {'class': 'error'});
                } else {
                    elem = DOM.create(container.tagName.match(/^(ul|ol)$/i) ? 'li' : 'p', {'class': 'error'});
                }

                elem.textContent = evt.data.message;
                container.appendChild(elem);
            }
        },

        _handleBlur: function (evt) {
            var container = this._getErrorContainer(evt.data.element);

            if (container) {
                DOM.getByClassName('error', container)
                    .forEach(function (elem) {
                        elem.parentNode.removeChild(elem);
                    });
            }

            if (DOM.getData(evt.data.element, 'validation-mode', this._.validationMode) === 'live') {
                this._.inLiveValidation = true;
                Vendor.validateControl(evt.data.element);
                this._.inLiveValidation = false;
            }
        },

        _getFieldNames: function (enabledOnly) {
            var elem, i,
                names = [];

            for (i = 0; i < this._.form.elements.length; i++) {
                elem = this._.form.elements.item(i);

                if (elem.name && (!enabledOnly || !elem.disabled) && names.indexOf(elem.name) === -1 && !(elem.type in {submit: 1, button: 1, reset: 1})) {
                    names.push(elem.name);

                }
            }

            return names;
        },

        _getErrorContainer: function (elem) {
            var container = elem && elem.id ? DOM.getById(elem.id + '-errors') : null;
            return container || DOM.getById(this._.form.id + '-errors') || (elem ? elem.parentNode : null);
        }
    });

    _context.register(Form, 'Form');

}, {
    DOM: 'Utils.DOM',
    Arrays: 'Utils.Arrays',
    DateTime: 'Utils.DateTime'
});
