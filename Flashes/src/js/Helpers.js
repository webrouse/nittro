_context.invoke('Nittro.Flashes', function (DOM) {

    var Helpers = {
        hasFixedParent: function (elem) {
            do {
                if (DOM.getStyle(elem, 'position', false) === 'fixed') return true;
                elem = elem.offsetParent;

            } while (elem && elem !== document.documentElement && elem !== document.body);

            return false;

        },

        getRect: function (elem) {
            var rect = elem.getBoundingClientRect();

            return {
                left: rect.left,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                width: 'width' in rect ? rect.width : (rect.right - rect.left),
                height: 'height' in rect ? rect.height : (rect.bottom - rect.top)
            };
        },

        tryFloatingPosition: function (elem, target, placement, positioner) {
            DOM.addClass(elem, 'nittro-flash-floating');
            DOM.setStyle(elem, {
                position: 'absolute',
                opacity: 0
            });

            var fixed = Helpers.hasFixedParent(target),
                elemRect = Helpers.getRect(elem),
                targetRect = Helpers.getRect(target),
                style = {},
                order = positioner.getDefaultOrder(),
                force = false,
                position;

            if (fixed) {
                style.position = 'fixed';

            }

            if (placement) {
                var m = placement.match(/^(.+?)(!)?(!)?$/);

                if (!positioner.supports(m[1])) {
                    throw new Error("Placement '" + m[1] + "' isn't supported");
                }

                force = !!m[3];
                order = m[2] ? [m[1]] : [m[1]].concat(order);
            }

            for (var i = 0; i < order.length; i++) {
                placement = order[i];

                if (position = positioner[placement].call(positioner, targetRect, elemRect, force)) {
                    break;
                }
            }

            if (position) {
                style.left = position.left;
                style.top = position.top;

                if (!fixed) {
                    style.left += window.pageXOffset;
                    style.top += window.pageYOffset;
                }

                style.left += 'px';
                style.top += 'px';
                style.opacity = '';

                DOM.setStyle(elem, style);
                return placement;

            } else {
                DOM.removeClass(elem, 'nittro-flash-floating');
                DOM.setStyle(elem, {
                    position: '',
                    opacity: ''
                });

                return null;
            }
        }
    };

    _context.register(Helpers, 'Helpers');

}, {
    DOM: 'Utils.DOM'
});
