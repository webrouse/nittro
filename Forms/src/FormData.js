_context.invoke('Nittro.Forms', function(undefined) {

    var FormData = _context.extend(function() {
        this._ = {
            dataStorage: [],
            upload: false
        };
    }, {
        append: function(name, value) {
            if (value === undefined || value === null) {
                return this;

            }

            if (this._isFile(value)) {
                this._.upload = true;

            } else if (typeof value === 'object' && 'valueOf' in value && /string|number|boolean/.test(typeof value.valueOf()) && !arguments[2]) {
                return this.append(name, value.valueOf(), true);

            } else if (!/string|number|boolean/.test(typeof value)) {
                throw new Error('Only scalar values and File/Blob objects can be appended to FormData, ' + (typeof value) + ' given');

            }

            this._.dataStorage.push({ name: name, value: value });

            return this;

        },

        isUpload: function() {
            return this._.upload;

        },

        _isFile: function(value) {
            return window.File !== undefined && value instanceof window.File || window.Blob !== undefined && value instanceof window.Blob;

        },

        mergeData: function(data) {
            for (var i = 0; i < data.length; i++) {
                this.append(data[i].name, data[i].value);

            }

            return this;

        },

        exportData: function(forcePlain) {
            if (!forcePlain && this.isUpload() && window.FormData !== undefined) {
                var fd = new window.FormData(),
                    i;

                for (i = 0; i < this._.dataStorage.length; i++) {
                    if (typeof this._.dataStorage[i].value === 'boolean') {
                        fd.append(this._.dataStorage[i].name, this._.dataStorage[i].value ? 1 : 0);
                    } else {
                        fd.append(this._.dataStorage[i].name, this._.dataStorage[i].value);
                    }
                }

                return fd;

            } else {
                return this._.dataStorage.filter(function(e) {
                    return !this._isFile(e.value);

                }, this);

            }
        }
    });

    _context.register(FormData, 'FormData');

});
