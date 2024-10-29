/**
 * Class représentant le résultat d'un autocomplete
 * Il permet de définir le DOM d'une valeur, quand il est proposé dans la liste ou quand il est sélectionné
 */
class AutocompleteResult {
    constructor(type, value, text = null) {
        this.type = type;
        this.value = value;
        this.text = text;
        this.input = null;
        this.renderResultNode = null;
        this.renderValueNode = null;
        this.selected = false;
        this._createInput();
    }

    static createWithValue(type, value) {
        return new this(type, value);
    }

    /**
     * Indique qu'on a ajouté ce résultat aux valeur de l'autocomplete
     */
    added() {
        this.selected = true;
        this.getResultNode().classList.add('selected');
        return this;
    }

    /**
     * Indique qu'on a retiré ce résultat aux valeur de l'autocomplete
     */
    removed() {
        this.selected = false;
        this.getResultNode().classList.remove('selected');
        return this;
    }

    /**
     * Retourne le noeud affiché dans la liste des résultats
     */
    getResultNode() {
        if (this.renderResultNode === null) this.renderResult();
        return this.renderResultNode;
    }

    /**
     * Retourne le noeud affiché dans la liste des valeurs
     */
    getValueNode() {
        if (this.renderValueNode === null) this.renderValue();
        return this.renderValueNode;
    }

    /**
     * Créé le rendu complet pour l'affichage des résultat
     */
    renderResult() {
        this.renderResultNode = document.createElement('div');
        this.renderResultNode.className = 'autocomplete-result type-' + this.type;

        let resultDisplay = document.createElement('div');
        resultDisplay.className = 'autocomplete-result-display';
        resultDisplay.appendChild(this._renderResult());

        this.renderResultNode.appendChild(resultDisplay);

        return this.renderResultNode;
    }

    /**
     * Créé le rendu complet pour l'affichage des valeurs
     */
    renderValue() {
        this.renderValueNode = document.createElement('div');
        this.renderValueNode.className = 'autocomplete-value type-' + this.type;

        let removeNode = document.createElement('div');
        removeNode.className = 'autocomplete-value-remove';

        let valueContent = document.createElement('div');
        valueContent.className = 'autocomplete-value-content';
        valueContent.appendChild(this._renderValue());

        let valueDisplay = document.createElement('div');
        valueDisplay.className = 'autocomplete-value-display';

        valueDisplay.appendChild(this.input);
        valueDisplay.appendChild(valueContent);
        valueDisplay.appendChild(removeNode);

        this.renderValueNode.appendChild(valueDisplay);

        return this.renderValueNode;
    }

    /**
     * Retourne le noeud uniquement dédié à l'affichage du résultat
     */
    _renderResult() {
        let text = (this.text === null) ? this.value : this.text;
        let result = document.createElement('span');
        result.textContent = text;
        return result;
    }

    /**
     * Retourne le noeud uniquement dédié à l'affichage de la valeur
     */
    _renderValue() {
        return this._renderResult();
    }

    /**
     * Créer le noeud input qui contiendra la valeur
     */
    _createInput(forceRecreate) {
        if (forceRecreate || this.input === null) {
            this.input = document.createElement('input');
            this.input.setAttribute('type', 'hidden');
            this.input.value = this.value;
        }
        return this.input;
    }

    /**
     * Set le name de l'input
     */
    setInputName(name) {
        this.input.setAttribute('name', name);
        return this;
    }

    /**
     * Vérifie si ce résultat est équivalant à celui fourni
     * @param {AutocompleteResult} result 
     */
    isEqual(result) {
        return (this.type === result.type && this.value === result.value);
    }
}

class AutocompleteResultGame extends AutocompleteResult {
    constructor(gameId, gameName, gameImageUrl) {
        super('game', gameId);
        this.gameName = gameName;
        this.gameImageUrl = gameImageUrl;
    }

    _renderResult() {
        let imageNode = document.createElement('img');
        if (this.gameImageUrl !== null) {
            imageNode.src = this.gameImageUrl;
        }

        let gameNameNode = document.createElement('span');
        gameNameNode.textContent = this.gameName;

        let container = document.createElement('div');
        container.appendChild(imageNode);
        container.appendChild(gameNameNode);
        return container;
    }

    static createWithValue(value) {
        return new this(value, 'Inconnu', null);
    }
}

class AutocompleteSearch {
    /**
     * Créer un objet contenant des fonction de recherche pour l'autocomplete
     * @param {Function} searchFromText la fonction qui permet à partir d'un texte de retourner une liste de AutocompleteResult
     * @param {Function} searchFromValue la fonction qui prend un tableau de value en paramètre
     *                                   et retourne un tableaux d'AutocompleteResult
     */
    constructor(searchFromText, searchFromValue) {
        this.searchFromText = searchFromText;
        this.searchFromValue = searchFromValue;
    }
}

/**
 * Class pour les input de type autocomplete
 */
class AutocompleteField {

    /**
     * Les objet de type AutocompleteSearch en rapport avec chaque type
     */
    static searches = {};

    /**
     * Ajoute un AutocompleteSearch pour matcher avec le type donné
     * @param {string} type 
     * @param {AutocompleteSearch} search 
     */
    static addSearch(type, search) {
        this.searches[type] = search;
    }

    /**
     * Retourne un AutocompleteSearch utlisé pour un type
     * @param {string} type 
     * @return {AutocompleteSearch} 
     */
    static getSearch(type) {
        if (this.searches.hasOwnProperty(type)) {
            return this.searches[type];
        }
        return null;
    }

    /**
     * 
     * @param {Node} inputNode le noeuf de l'input
     * @param {string} type le type de l'autocomplete
     * @param {boolean} multiple Indique si on souhaite recevoir une seule ou alors plusieurs valeurs
     * @param {Object} options les options supplémentaire de l'auto-complete
     */
    constructor(inputNode, type, multiple = false, options = {}) {
        this.DELAY_BEFORE_SEARCH = 300;
        this.loading = false;
        this.timeoutStartSearch = null;
        this.callNumber = 0;
        this.resetValueAfterChoose = (options.hasOwnProperty('reset')) ? options.reset : false;
        this.maxValues = (options.hasOwnProperty('max')) ? options.max : null;
        this.promiseWaitingInitialize = [];
        this.isIniliazing = true;

        this.searchOptions = {}
        if (options.hasOwnProperty('platform')) {
            this.searchOptions.platform = options.platform;
        }
        if (options.hasOwnProperty('region')) {
            this.searchOptions.region = options.region;
        }

        // On va enregistrer le name de l'input
        this.inputNode = inputNode;
        this.inputName = inputNode.getAttribute('name');
        this.type = type;
        this.multiple = multiple;
        this.required = inputNode.required;
        inputNode.required = false;

        // On set un name par défaut si l'input n'en a pas
        if (this.inputName === null) {
            this.inputName = this.type;
        }
        
        if (this.multiple) {
            this.inputName += '[]';
        }
        inputNode.removeAttribute('name');

        this.value = [];
        this.fieldNode = inputNode.closest('.field');

        this._createAutocompleteDOM();
        this._initEvents();

        // On ajoute une méthode a l'élément du DOM pour récupéré l'autocomplete
        this.inputNode.getAutocomplete = () => {
            return this;
        }
        this.inputNode.getValue = () => {
            return this.getInputValue();
        }

        this.inputNode.setValue = (value) => {
            this._addResultFromInputValue(value);
        }

        // Si l'input possède déjà une value, on va lui créer un autocomplete result contenant sa valeur
        let valueAttribute = this.inputNode.attributes.getNamedItem('value');
        let currentValue = (valueAttribute === null || valueAttribute.value === '') ? null : valueAttribute.value;

        this.inputNode.setAttribute('value', '');
        this._valueUpdated();

        if (currentValue !== null && currentValue !== '') {
            this._addResultFromInputValue(currentValue);
        } else {
            this._finishInitialization();
        }
    }

    _finishInitialization() {
        for(let i = 0, len = this.promiseWaitingInitialize.length; i < len; i++) {
            this.promiseWaitingInitialize[i]();
        }
        this.promiseWaitingInitialize = [];
        this.isIniliazing = false;
    }

    waitingInitialize() {
        return new Promise((resolve) => {
            if (this.isIniliazing) {
                this.promiseWaitingInitialize.push(resolve);
            } else {
                resolve();
            }
        });
    }

    /**
     * Créer un autocompleteResult sans informations autre que la value
     * @param {*} value 
     */
     _addResultFromInputValue(value) {
        if (!(value instanceof Array)) {
            value = [value];
        }
        // On va utiliser les méthode de recherche par value pour créer un autocomplete result
        let searchObject = AutocompleteField.getSearch(this.type);
        if (searchObject !== null && typeof(searchObject.searchFromValue) !== 'undefined') {
            searchObject.searchFromValue(value).then((values) => {
                // On ajoute les valeurs à l'autocomplete
                values.forEach((value) => {
                    this.addValue(value, true);
                });
                this._finishInitialization();
            });
            return;
        }

        // Si la méthode de recherche par valeu n'existe pas, alors on créer u nautocomplete result incomplet
        let classObject = null;
        switch(this.type) {
            case 'game' : classObject = AutocompleteResultGame; break;
            default :;
        }

        if (classObject !== null) {
            let result = classObject.createWithValue(value);
            this.addValue(result, true);
        }
        this._finishInitialization();
    }

    /**
     * Créer tout le DOM pour faire fonctionner l'autocomplete
     */
    _createAutocompleteDOM() {
        this.dropdownNode = document.createElement('div');
        this.dropdownNode.className = 'autocomplete-dropdown-container';
        this.dropdownNode.innerHTML = '<div class="autocomplete-loading">Loading</div>';
        this.dropdownNode.innerHTML += '<div class="autocomplete-results"><div class="autocomplete-result-list"></div><div class="autocomplete-no-result">No result</div></div>';

        this.resultListNode = this.dropdownNode.querySelector('.autocomplete-result-list');

        let inputContainer = document.createElement('div');
        inputContainer.className = 'autocomplete-input';
                
        this.valueListNode = document.createElement('div');
        this.valueListNode.className = 'autocomplete-value-list';

        this.containerNode = document.createElement('div');
        this.containerNode.className = 'autocomplete-container type-' + this.type;

        this.containerNode.appendChild(this.valueListNode);
        this.containerNode.appendChild(inputContainer);

        if (this.multiple) {
            this.containerNode.classList.add('multiple');
        } else {
            this.containerNode.classList.add('no-multiple');
        }

        // On va ratacher tout le container au DOM
        this.inputNode.parentElement.appendChild(this.containerNode);

        // Puis on bouge la position de l'input pour le mettre la ou il faut
        inputContainer.appendChild(this.inputNode);
        inputContainer.appendChild(this.dropdownNode);
    }

    /**
     * Initialise les events de l'autocomplete
     */
    _initEvents() {
        this.inputNode.addEventListener('keyup', (e) => {
            // On attends d'avoir au moins 3 caractère pour commencer la recherche
            if (this.inputNode.value.length >= 3) {
                this.search(this.inputNode.value);
            } else {
                this.stopSearch();
            }
        });
    }

    /**
     * Commence une recherche pour une valeur donnée
     * la recherche possède un délai pour éviter de surcharger avec des appels inutile
     * @param {string} value 
     */
    search(value) {
        this._startLoading();
        this.callNumber++;
        let actuelCallNumber = this.callNumber;
        this.dropdownNode.classList.add('open');
        clearTimeout(this.timeoutStartSearch);
        this.timeoutStartSearch = setTimeout(async () => {
            // On vérifie qu'on est toujours sur le meme call, sinon on annule la recherche
            if (actuelCallNumber === this.callNumber) {
                let results = await this._executeSearch(value);
                this.addAllResults(results);
            }
        }, this.DELAY_BEFORE_SEARCH);
    }

    /**
     * Arrête la recherche en cours
     */
    stopSearch() {
        this.callNumber++;
        this.hideResultList();
        clearTimeout(this.timeoutStartSearch);
        this._stopLoading();
    }

    /**
     * Execute une recherche pour une valeur donnée
     * @param {string} value 
     */
    async _executeSearch(value) {
        let autocompleteSearch = AutocompleteField.getSearch(this.type);
        if (autocompleteSearch === null) {
            return [];
        }
        let results = await autocompleteSearch.searchFromText(value, this.searchOptions);
        return results;
    }

    /**
     * Indique que l'autocomplete est en cours de recherche
     */
    _startLoading() {
        this.loading = true;
        this.dropdownNode.classList.add('loading');
    }

    /**
     * Indique que l'autocomplete n'est plus en cours de recherche
     */
    _stopLoading() {
        this.loading = false;
        this.dropdownNode.classList.remove('loading');
    }

    /**
     * Ajoute un tableau d'AutocompleteResult à la liste des résulstats
     * @param {array<AutocompleteResult>} results 
     */
    addAllResults(results) {
        this._stopLoading();
        this.clearResults();
        results.forEach((result) => {
            this.addResultToTheResultList(result)
        });

        // On déclenche l'event pour indiquer que les resultats ont été trouvé
        let event = new CustomEvent('results', {detail : {autocomplete: this, results: results}});
        this.inputNode.dispatchEvent(event);
        return this;
    }

    /**
     * Ajoute un AutocompleteResult à la liste des résultats
     * @param {AutocompleteResult} result 
     */
    addResultToTheResultList(result) {
        // Si on a déjà choisi ce résultat, on l'indique
        if (this.hasValue(result)) {
            result.added();
        }
        result.setInputName(this.inputName);
        let render = result.getResultNode();
        render.addEventListener('click', () => {
            this.addValue(result);
        });
        this.resultListNode.appendChild(render);
        return this;
    }

    /**
     * Ajoute un AutocompleteResult à la liste des valeurs sélectionnées
     * @param {AutocompleteResult} result 
     */
    _addResultToTheValueList(result) {
        if (!this.multiple) {
            this.clearValues();
        }
        result.setInputName(this.inputName);
        let render = result.getValueNode();
        render.querySelector('.autocomplete-value-remove').addEventListener('click', () => {
            this.removeValue(result);
        });
        this.valueListNode.appendChild(render);
    }

    /**
     * Ajoute une valeur à l'autocomplete
     * Si la valeur existe déjà, elle ne sera pas ajouté
     * Si l'autocomplete a le nombre max de valeur, elle ne sera pas ajouté non plus
     * @param {AutocompleteResult} result la valeur à ajouter
     * @param {boolean} silent si "tru", les events ne serons pas déclenché
     */
    addValue(result, silent) {
        silent = (typeof(silent) === 'undefined') ? false : silent;
        if (this.hasValue(result)) return this;
        if (this.hasMaxValues()) return this;
        if (!this.multiple) {
            this.clearResults();
            this.hideResultList();
            this.value = [];
            this.inputNode.value = '';
        }
        if (this.resetValueAfterChoose) {
            this.clearResults();
            this.hideResultList();
            this.inputNode.value = '';
        }
        this.value.push(result);
        result.added();
        this._addResultToTheValueList(result);
        this._valueUpdated();

        if (!silent) {
            // On déclenche l'event d'ajout de valeur
            let event = new CustomEvent('add-value', {detail : {autocomplete: this, value: result}});
            this.inputNode.dispatchEvent(event);
            let changeEvent = new CustomEvent('change-value', {detail : {autocomplete: this}});
            this.inputNode.dispatchEvent(changeEvent);

            let changeEventVanilla = new Event('change');
            this.inputNode.dispatchEvent(changeEventVanilla);
            let form = this.inputNode.closest('form');
            if (form !== null) {
                form.dispatchEvent(changeEventVanilla);
            }
        }
        return this;
    }

    /**
     * Retire un AutocompleteResult à la liste des valeurs sélectionnées
     * @param {AutocompleteResult} result 
     */
    _removeResultToTheValueList(result) {
        result.getValueNode().remove();
    }

    /**
     * Supprime toute les valeur du champ
     */
    reset() {
        this.value.forEach((value) => {
            this.removeValue(value, true);
        });

        let changeEvent = new CustomEvent('change-value', {detail : {autocomplete: this}});
        this.inputNode.dispatchEvent(changeEvent);
    }

    /**
     * Supprime une valeur à l'autocomplete
     * @param {AutocompleteResult} result la valeur à supprimer
     * @param {boolean} silent si "tru", les events ne serons pas déclenché
     */
    removeValue(result, silent) {
        silent = (typeof(silent) === 'undefined') ? false : silent;
        this.value = this.value.filter((value) => {
            return !value.isEqual(result);
        });
        result.removed();
        this._removeResultToTheValueList(result);
        this._valueUpdated();

        if (!silent) {
            // On déclenche l'event de suppression de valeur
            let event = new CustomEvent('remove-value', {detail : {autocomplete: this, value: result}});
            this.inputNode.dispatchEvent(event);
            let changeEvent = new CustomEvent('change-value', {detail : {autocomplete: this}});
            this.inputNode.dispatchEvent(changeEvent);

            let changeEventVanilla = new Event('change');
            this.inputNode.dispatchEvent(changeEventVanilla);

            let form = this.inputNode.closest('form');
            if (form !== null) {
                form.dispatchEvent(changeEventVanilla);
            }
        }
        return this;
    }

    /**
     * Indique que la valeur a été modifié, permet d'effectuer des traitement post-changement
     */
    _valueUpdated() {
        // On va ajouter / retirer la class "is-full"
        if (this.hasMaxValues()) {
            this.valueListNode.classList.add('is-full');
            this.inputNode.value = '';
            this.clearResults();
        } else {
            this.valueListNode.classList.remove('is-full');
        }

        // On va mettre à jour la validité du champ
        if (this.required && this.value.length === 0) {
            this.inputNode.setCustomValidity('You must choose a game');
        } else {
            this.inputNode.setCustomValidity('');
        }
    }

    /**
     * Vérifie si l'autocomplete possède déjà le nombre max de valeur
     * ne fonctionne que sur les autocomplete de type "multiple"
     * @returns {boolean}
     */
    hasMaxValues() {
        if (this.multiple) {
            if (this.maxValues === null) return false;
            return this.value.length >= this.maxValues;
        }
        return false;
    }

    /**
     * Vérifie si un résultat est déjà présent dans la liste des valeurs
     * @param {AutocompleteResult} result 
     */
    hasValue(result) {
        for(let i = 0, len = this.value.length; i < len; i++) {
            if (this.value[i].isEqual(result)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Retourne la valeur de l'autocomplete
     * @returns AutocompleteValue
     */
    getValue() {
        if (!this.multiple) {
            if (this.value.length === 0) return null;
            return this.value[0];
        }
        return this.value;
    }

    /**
     * Retourne la valeur de l'autocomplete qui va être envoyé au formulaire
     * @returns any
     */
    getInputValue() {
        if (this.value.length === 0) {
            return (this.multiple) ? [] : null;
        }
        return this.value.map((value) => {
            return value.value;
        });
    }

    /**
     * Vide la liste des valeurs
     */
    clearValues() {
        this.valueListNode.innerHTML = '';
    }

    /**
     * Vide la liste des résultats
     */
    clearResults() {
        this.resultListNode.innerHTML = '';
        return this;
    }

    /**
     * Cache la liste des résultat
     */
    hideResultList() {
        this.dropdownNode.classList.remove('open');
    }
}

// Recherche de jeu par text
let searchGameFromText = async function(text, searchOptions) {
    let games = await AksApi.searchGame(text, 'en_GB', null, searchOptions);

    return games.map((rawProduct) => {
        return new AutocompleteResultGame(rawProduct.id, rawProduct.name, rawProduct.thumbnail);
    });
}

// Recherche de jeu par id
let searchGameFromId = async function(ids) {
    if (typeof(ids) === 'string') {
        ids = ids.split(',');
    }
    let games = await AksApi.searchGameByIds(ids, 'en_GB', null);

    return games.map((rawProduct) => {
        return new AutocompleteResultGame(rawProduct.id, rawProduct.name, rawProduct.thumbnail);
    });
}

// On fais matcher la fonction de recherche avec le type qu'on souahite
let autocompleteGameSearch = new AutocompleteSearch(searchGameFromText, searchGameFromId);
AutocompleteField.addSearch('game', autocompleteGameSearch);