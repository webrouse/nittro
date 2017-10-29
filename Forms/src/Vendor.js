_context.invoke('Nittro.Forms', function () {

    if (!window.Nette || !window.Nette.validators) {
        throw new Error('netteForms.js asset from Nette/Forms has not been loaded');
    }

    _context.register(window.Nette, 'Vendor');

});
