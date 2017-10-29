_context.invoke('Nittro.Flashes', function () {

    var DefaultPositioner = _context.extend(function (margin, defaultOrder) {
        this._ = {
            margin: typeof margin === 'number' ? margin : 20,
            defaultOrder: defaultOrder || 'above,rightOf,below,leftOf'
        };

        if (typeof this._.defaultOrder === 'string') {
            this._.defaultOrder = this._.defaultOrder.split(/\s*,\s*/g);
        }
    }, {
        supports: function (placement) {
            return placement === 'above' || placement === 'below' || placement === 'leftOf' || placement === 'rightOf';
        },

        getDefaultOrder: function () {
            return this._.defaultOrder;
        },

        above: function (target, elem, force) {
            var res = {
                left: target.left + (target.width - elem.width) / 2,
                top: target.top - elem.height
            };

            if (force || res.left > this._.margin && res.left + elem.width < window.innerWidth - this._.margin && res.top > this._.margin && res.top + elem.height < window.innerHeight - this._.margin) {
                return res;

            }
        },
        below: function(target, elem, force) {
            var res = {
                left: target.left + (target.width - elem.width) / 2,
                top: target.bottom
            };

            if (force || res.left > this._.margin && res.left + elem.width < window.innerWidth - this._.margin && res.top + elem.height < window.innerHeight - this._.margin && res.top > this._.margin) {
                return res;

            }
        },
        leftOf: function (target, elem, force) {
            var res = {
                left: target.left - elem.width,
                top: target.top + (target.height - elem.height) / 2
            };

            if (force || res.top > this._.margin && res.top + elem.height < window.innerHeight - this._.margin && res.left > this._.margin && res.left + elem.width < window.innerWidth - this._.margin) {
                return res;

            }
        },
        rightOf: function (target, elem, force) {
            var res = {
                left: target.right,
                top: target.top + (target.height - elem.height) / 2
            };

            if (force || res.top > this._.margin && res.top + elem.height < window.innerHeight - this._.margin && res.left + elem.width < window.innerWidth - this._.margin && res.left > this._.margin) {
                return res;

            }
        }
    });


    _context.register(DefaultPositioner, 'DefaultPositioner');

});
