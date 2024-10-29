/**
 * Class gérant les appel à l'API de AKS pour les jeux
 */

class AksApi {
    static url = null;

    /**
     * Initialise l'api en lui settant son endpoint
     * @param {string} url 
     */
    static init(url) {
        this.url = url;
    }

    static _ajaxCall(url) {
        return new Promise((resolve, reject) => {
            let xhttp = new XMLHttpRequest();
            xhttp.open('GET', url, true);
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    resolve(this.responseText);
                }
            };
            xhttp.send(); 
        });
    }

    static async call(action, params) {
        if (this.url === null) {
            throw 'API is not initialized';
        }
        let arrayParams = [];
        params['action'] = action;
        for (let name in params) {
            if (params[name] !== null) {
                arrayParams.push(name + '=' + params[name]);
            }
        }
        let urlParams = arrayParams.join('&');
        let url =  this.url + '?' + urlParams;
        let result = await this._ajaxCall(url)
        result = JSON.parse(result);
        return result;
    }

    /**
     * Execute une recherche de jeu sur leur nom
     * @param {string} text Le nom du jeu à chercher
     * @param {string} locale La locale à utiliser pour la recherche
     * @param {string} apiKey l'ID partenaire qui fait la recherche
     * @param {Object} filterParameters Filtres à ajouté pour la recherche
     *                                  - platform : N'afficher que les jeux d'une certaine console, valeurs acceptées : pc / playstation / xbox / nintendo
     *                                  - region : N'afficher que les jeux de la région souhaité (steam, epic, origin, ubisoft)
     * @returns 
     */
    static async searchGame(text, locale, apiKey, filterParameters) {
        filterParameters = (typeof(filterParameters) == 'undefined') ? {} : filterParameters;
        apiKey = (typeof(apiKey) === 'undefined') ? null : apiKey;

        let params = {
            locale : locale,
            currency : 'eur',
            apiKey : apiKey,
            q : encodeURIComponent(text)
        };

        let returnData = await this.call('search', params);
        if (returnData === null) return [];

        // Filtre sur la console de jeu
        if (filterParameters.hasOwnProperty('platform')) {
            let allowedConsoleRegexp = [new RegExp(filterParameters.platform, 'gi')];
            returnData = returnData.filter((product) => {
                for(let i = 0, len = allowedConsoleRegexp.length; i < len; i++) {
                    if (allowedConsoleRegexp[i].test(product.platformFamily)) {
                        return true
                    }
                }
                return false;
            });
        }

        // Filtre sur la région
        if (filterParameters.hasOwnProperty('region')) {
            returnData = returnData.filter((product) => {
                // On va vérifier chaque offre pour voir s'il appartient à la bonne région
                for(let i in product.offers) {
                    if (filterParameters.region === product.offers[i].drm) return true;
                }  
                return false
            });
        }
        
        // FIX TEMPORAIRE pour remplacer les apostrophe
        returnData.forEach(gamesData => {
            gamesData.name = gamesData.name.replace("&#039;", "´");
        });
        return returnData;
    }

    /**
     * Execute une recherche de jeu sur leur id
     * @param {array|number} ids le ou les ids à rechercher
     * @param {string} locale La locale à utiliser pour la recherche
     * @param {string} apiKey l'ID partenaire qui fait la recherche
     * @returns 
     */
    static async searchGameByIds(ids, locale, currency, apiKey) {
        apiKey = (typeof(apiKey) === 'undefined') ? null : apiKey;
        locale = (typeof(locale) === 'undefined') ? GLOBAL.locale : locale;
        currency = (typeof(currency) === 'undefined') ? GLOBAL.currency : currency;

        if (!(ids instanceof Array)) {
            ids = [ids];
        }
        let params = {
            locale : locale,
            currency : 'eur',
            apiKey : apiKey,
            ids : encodeURIComponent(ids.join(','))
        };
        let returnData = await this.call('ids', params);
        if (returnData === null) return [];
        return returnData;
    }

    /**
     * Retourne les données avec les offres d'un ou plusieurs jeux
     * @param {int|Array} games le ou les jeux
     * @param {string} locale la locale
     * @param {string} currency la devise
     * @param {string} apiKey l'api key
     * @return {Array}
     */
    static async getGamesData(games, locale, currency, apiKey) {
        apiKey = (typeof(apiKey) === 'undefined') ? null : apiKey;
        locale = (typeof(locale) === 'undefined') ? GLOBAL.locale : locale;
        currency = (typeof(currency) === 'undefined') ? GLOBAL.currency : currency;

        // Permet de vérifier si on a mis qu'un jeu aulieu d'un tableau de jeu en paramètre
        // afin de ne retourner que les données du jeu en question
        let oneGame = false;
        if (!(games instanceof Array)) {
            oneGame = true;
            games = [games];
        }

        let returnData = await this.searchGameByIds(games, locale, currency, apiKey);

        if (oneGame) {
            if(returnData === null) return null;
            if(returnData.length === 0) return null;
            return returnData[0];
        }
        if (returnData === null) return [];
        return returnData;
    }
}

AksApi.init('https://affiliate.allkeyshop.com/product-api');