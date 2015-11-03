_context.invoke('Nette.Page', function (DOM) {

    var Snippet = _context.extend(function (id) {
        this._ = {
            id: id,
            state: Snippet.INACTIVE,
            handlers: [
                [], [], [], []
            ]
        };
    }, {
        STATIC: {
            INACTIVE: -1,
            PREPARE_SETUP: 0,
            RUN_SETUP: 1,
            PREPARE_TEARDOWN: 2,
            RUN_TEARDOWN: 3
        },

        setup: function (prepare, run) {
            if (prepare && !run) {
                run = prepare;
                prepare = null;

            }

            if (prepare) {
                if (this._.state === Snippet.PREPARE_SETUP) {
                    prepare(this.getElement());

                } else {
                    this._.handlers[Snippet.PREPARE_SETUP].push(prepare);

                }
            }

            if (run) {
                if (this._.state === Snippet.RUN_SETUP) {
                    run(this.getElement());

                } else {
                    this._.handlers[Snippet.RUN_SETUP].push(run);

                }
            }

            return this;

        },

        teardown: function (prepare, run) {
            if (prepare && !run) {
                run = prepare;
                prepare = null;

            }

            if (prepare) {
                if (this._.state === Snippet.PREPARE_TEARDOWN) {
                    prepare(this.getElement());

                } else {
                    this._.handlers[Snippet.PREPARE_TEARDOWN].push(prepare);

                }
            }

            if (run) {
                if (this._.state === Snippet.RUN_TEARDOWN) {
                    run(this.getElement());

                } else {
                    this._.handlers[Snippet.RUN_TEARDOWN].push(run);

                }
            }

            return this;

        },

        setState: function (state) {
            if (state === Snippet.PREPARE_SETUP && this._.state === Snippet.RUN_TEARDOWN || state === this._.state + 1) {
                this._.state = state;

                var elm = this.getElement();

                this._.handlers[this._.state].forEach(function (handler) {
                    handler(elm);

                });

                this._.handlers[this._.state].splice();

            }

            return this;

        },

        getState: function () {
            return this._.state;

        },

        getElement: function () {
            return DOM.getById(this._.id);

        }
    });

    _context.register(Snippet, 'Nette.Page.Snippet');

}, {
    DOM: 'Utils.DOM'
});