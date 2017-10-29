_context.invoke('Nittro.Flashes.Bridges.FlashesDI', function(Neon, NeonEntity, HashMap) {

    var FlashesExtension = _context.extend('Nittro.DI.BuilderExtension', function(containerBuilder, config) {
        FlashesExtension.Super.call(this, containerBuilder, config);

    }, {
        STATIC: {
            defaults: {
                layer: null,
                classes: null,
                positioner: {
                    defaultOrder: null,
                    margin: null
                }
            }
        },
        load: function() {
            var builder = this._getContainerBuilder(),
                config = this._getConfig(FlashesExtension.defaults);

            var positioner;

            if (typeof config.positioner === 'string') {
                positioner = config.positioner.match(/^@[^(]+$/) ? config.positioner : Neon.decode('[' + config.positioner + ']').shift();
            } else {
                positioner = new NeonEntity('Nittro.Flashes.DefaultPositioner', HashMap.from(config.positioner));
            }

            builder.addServiceDefinition('flashes', {
                factory: 'Nittro.Flashes.Service()',
                args: {
                    positioner: positioner,
                    options: {
                        layer: config.layer,
                        classes: config.classes
                    }
                },
                run: true
            });
        }
    });

    _context.register(FlashesExtension, 'FlashesExtension');

}, {
    Neon: 'Nittro.Neon.Neon',
    NeonEntity: 'Nittro.Neon.NeonEntity',
    HashMap: 'Utils.HashMap'
});
