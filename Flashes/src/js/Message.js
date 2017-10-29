_context.invoke('Nittro.Flashes', function (DOM, Arrays, CSSTransitions, Helpers) {

    var Message = _context.extend('Nittro.Object', function (service, content, options) {
        Message.Super.call(this);

        this._doDismiss = this._doDismiss.bind(this);

        this._.service = service;
        this._.options = Arrays.mergeTree({}, Message.defaults, options);
        this._.visible = false;

        if (this._.service === null) {
            this._.elem = content;
            this._scheduleDismiss();
            return;
        }

        var target = this._getTarget(),
            tag = 'div';

        if (target) {
            this._.options.classes === null && (this._.options.classes = DOM.getData(target, 'flash-classes'));
            this._.options.inline === null && (this._.options.inline = DOM.getData(target, 'flash-inline'));

            if (this._.options.inline) {
                tag = target.tagName.match(/^(?:ul|ol)$/i) ? 'li' : 'p';
            }
        } else {
            this._.options.inline = false;
        }

        this._.elem = DOM.create(tag, {
            'class': 'nittro-flash nittro-flash-' + this._.options.type,
            'data-flash-dynamic': 'true'
        });

        if (this._.options.classes) {
            DOM.addClass(this._.elem, this._.options.classes.replace(/%type%/g, this._.options.type));
        }

        if (this._.options.rich) {
            DOM.html(this._.elem, content);
        } else {
            DOM.addClass(this._.elem, 'nittro-flash-plain');
            this._.elem.textContent = content;
        }

        if (this._.options.dismiss !== false) {
            if (typeof this._.options.dismiss !== 'number') {
                this._.options.dismiss = Math.max(5000, Math.round(this._.elem.textContent.split(/\s+/).length / 0.003));
            }
        }
    }, {
        STATIC: {
            wrap: function (elem) {
                return new Message(null, elem);
            },
            defaults: {
                type: 'info',
                target: null,
                classes: null,
                inline: null,
                placement: null,
                rich: false,
                dismiss: null
            }
        },

        getElement: function () {
            return this._.elem;
        },

        show: function () {
            if (this._.visible !== false) {
                return Promise.resolve(this);
            }

            this._.visible = null;

            var target = this._getTarget();

            if (target) {
                if (this._.options.inline) {
                    target.appendChild(this._.elem);
                    return this._show('inline');
                } else {
                    this._.service.getLayer().appendChild(this._.elem);

                    var placement = Helpers.tryFloatingPosition(this._.elem, target, this._.options.placement, this._.service.getPositioner());

                    if (placement) {
                        return this._show(placement);
                    }
                }
            }

            this._.service.getGlobalHolder().appendChild(this._.elem);
            return this._show('global');
        },

        hide: function () {
            if (this._.visible !== true) {
                return Promise.resolve(this);
            }

            this._.visible = null;

            DOM.addClass(this._.elem, 'nittro-flash-hide');
            this.trigger('hide');

            return CSSTransitions.run(this._.elem).then(function () {
                this._.visible = false;
                this._.elem.parentNode.removeChild(this._.elem);
                DOM.removeClass(this._.elem, 'nittro-flash-hide');
                this.trigger('hidden');
                return this;
            }.bind(this));
        },

        dismiss: function () {
            return this.hide().then(function () {
                this.off();
                this._.elem = this._.options = this._.service = null;
            }.bind(this));
        },

        _show: function (placement) {
            DOM.toggleClass(this._.elem, 'nittro-flash-prepare nittro-flash-' + placement, true);
            this.trigger('show');
            this.one('hidden', function() { DOM.toggleClass(this._.elem, 'nittro-flash-' + placement, false); });

            return CSSTransitions.run(this._.elem, {remove: 'nittro-flash-prepare'}, true).then(function () {
                this._.visible = true;
                this.trigger('shown');
                this._scheduleDismiss();
                return this;
            }.bind(this));
        },

        _scheduleDismiss: function () {
            if (this._.options.dismiss === false) {
                return;
            }

            DOM.addListener(document, 'mousemove', this._doDismiss);
            DOM.addListener(document, 'mousedown', this._doDismiss);
            DOM.addListener(document, 'keydown', this._doDismiss);
            DOM.addListener(document, 'touchstart', this._doDismiss);
        },

        _doDismiss: function () {
            DOM.removeListener(document, 'mousemove', this._doDismiss);
            DOM.removeListener(document, 'mousedown', this._doDismiss);
            DOM.removeListener(document, 'keydown', this._doDismiss);
            DOM.removeListener(document, 'touchstart', this._doDismiss);

            window.setTimeout(this.dismiss.bind(this), this._.options.dismiss);
        },

        _getTarget: function () {
            return typeof this._.options.target === 'string' ? DOM.getById(this._.options.target) : this._.options.target;
        }
    });

    _context.register(Message, 'Message');

}, {
    DOM: 'Utils.DOM',
    Arrays: 'Utils.Arrays',
    CSSTransitions: 'Utils.CSSTransitions'
});
