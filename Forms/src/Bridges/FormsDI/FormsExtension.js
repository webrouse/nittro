_context.invoke('Nittro.Forms.Bridges.FormsDI', function(Nittro) {

    var FormsExtension = _context.extend('Nittro.DI.BuilderExtension', function(containerBuilder, config) {
        FormsExtension.Super.call(this, containerBuilder, config);
    }, {
        STATIC: {
            defaults: {
                whitelistForms: false,
                autoResetForms: true
            }
        },

        load: function() {
            var builder = this._getContainerBuilder();
            builder.addServiceDefinition('formLocator', 'Nittro.Forms.Locator()');

        },

        setup: function () {
            var builder = this._getContainerBuilder(),
                config = this._getConfig(FormsExtension.defaults);

            if (builder.hasServiceDefinition('page')) {
                builder.getServiceDefinition('page')
                    .addSetup(function (formLocator) {
                        this.initForms(formLocator, config);
                    });

            }
        }
    });

    _context.register(FormsExtension, 'FormsExtension')

});
