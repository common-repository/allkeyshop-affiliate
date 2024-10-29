document.addEventListener('DOMContentLoaded', () => {
    
    // Initialisation des autocompletes
    document.querySelectorAll('.aks-plugin_container .field input.autocomplete').forEach((inputNode) => {
        let multiple = inputNode.dataset.hasOwnProperty('multiple');
        let type = inputNode.dataset.type;
        let options = {};
        if (inputNode.dataset.hasOwnProperty('reset')) {
            options.reset = true;
        }
        if (inputNode.dataset.hasOwnProperty('max')) {
            options.max = inputNode.dataset.max;
        }
        if (inputNode.dataset.hasOwnProperty('platform')) {
            options.platform = inputNode.dataset.platform
        }
        if (inputNode.dataset.hasOwnProperty('region')) {
            options.region = inputNode.dataset.region
        }
        let autocomplete = new AutocompleteField(inputNode, type, multiple, options);
    });

    document.querySelectorAll('.aks-plugin_tabs-container').forEach((node) => {
        let tabsManager = new TabsManager(node);
    })
});

