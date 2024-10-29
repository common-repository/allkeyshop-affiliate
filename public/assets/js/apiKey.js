(function() {
    const PHASE_TEST = 0;
    const PHASE_SAVE = 1;

    let isApiKeyTesting = false;

    /**
     * Vérifie la validité uen clef API via une requete AJAX
     * @param {string} apiKey 
     */
    async function testApiKey(apiKey) {
        if (isApiKeyTesting) return;
        apiKeyInput.readOnly = true;
        currentPhase = PHASE_TEST;
        saveButton.disabled = true;
        apiKeySuccessNode.classList.add('hide');
        apiKeyErrorNode.classList.add('hide');
        isApiKeyTesting = true;
        testButton.classList.add('loading')
        
        let xhttp = new XMLHttpRequest();
        xhttp.open('GET', API_URL + '/' + apiKey, true);
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                testButton.classList.remove('loading');
                let response = JSON.parse(this.responseText);
                if (response.success) {
                    apiKeySuccess(response.data)
                } else {
                    apiKeyFail()
                }
                isApiKeyTesting = false;
                apiKeyInput.readOnly = false;
            }
        };
        xhttp.send(); 
    }

    /**
     * Appellé après la vérification de la clef API quand celle ci est valide
     * @param {Object} data 
     */
    function apiKeySuccess(data) {
        apiKeySuccessNode.classList.remove('hide');
        apiKeySuccessNode.querySelector('#api-key-account').textContent = data.mail;
        apiKeySuccessNode.querySelector('#api-key-affiliate').textContent = data.affiliateKey;
        saveButton.disabled = false;
        currentPhase = PHASE_SAVE;
    }

    /**
     * Appellé après la vérification de la clef API quand celle ci n'est pas valide
     * @param {Object} data 
     */
    function apiKeyFail() {
        apiKeyErrorNode.classList.remove('hide');
    }

    let currentPhase = PHASE_TEST;

    let form = document.getElementById('form-api-key');
    // Si le form n'existe pas, on quitte l'éxécution du script
    if (form === null) { return; }
    let apiKeyInput = document.getElementById('input-api-key');
    let testButton = document.getElementById('test-api-key-button');
    let saveButton = document.getElementById('save-api-key-button');

    const API_URL = testButton.dataset.url;

    let apiKeySuccessNode = document.getElementById('aks-api-key-success');
    let apiKeyErrorNode = document.getElementById('aks-api-key-error');

    apiKeyInput.addEventListener('change', function() {
        currentPhase = PHASE_TEST;
        saveButton.disabled = true;
    });

    form.addEventListener('submit', function(e) {
        if (currentPhase === PHASE_TEST) {
            testApiKey(apiKeyInput.value);
            e.preventDefault();
        }
    });

    if (testButton !== null) {
        testButton.addEventListener('click', function(e) {
            testApiKey(apiKeyInput.value);
            e.preventDefault();
        });
    }
})();

