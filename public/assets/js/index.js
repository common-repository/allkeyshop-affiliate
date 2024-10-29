
let windowOpenedApiKey = null;
let isApiKeyTesting = false;

function loadAffiliateStats(callback) {
    if (API_KEY === null) {
        callback(null);
        return;
    }
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', AFFILATE_STATS_URL + '/' + API_KEY, true);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let response = JSON.parse(this.responseText);
            if (response.success) {
                callback(response.data);
            } else {
                callback(null);
            }
        } else if (this.readyState == 4 && this.status != 200) {
            callback(null);
        }
    };
    xhttp.send(); 
}

function initAffiliateStats() {
    loadAffiliateStats(fillAffiliateStats)
}

function fillAffiliateStats(stats) {
    if (stats === null) {
        return;
    }

    let clickNumberNode = document.getElementById('stats-clicks-number');
    clickNumberNode.textContent = stats.clickGeneral.clicks;
    let clickRateNode = document.getElementById('stats-clicks-rate');
    let iconRate = ''
    
    if (stats.clickGeneral.rate > 0) {
        clickRateNode.classList.add('aks-plugin_stats-good');
        iconRate = 'dashicons-arrow-up';
    } else if(stats.clickGeneral.rate < 0) {
        clickRateNode.classList.add('aks-plugin_stats-bad');
        iconRate = 'dashicons-arrow-down';
    } else {
        clickRateNode.classList.add('hide');
    }

    clickRateNode.innerHTML = '(<div class="dashicons ' + iconRate + '"></div>' + Math.round(stats.clickGeneral.rate * 100) + '% )';

    generateClicksPerDateStats(stats.clickGeneral)
    generateClicksPerGameStats(stats.clickGrouped.game)
}

function generateClicksPerDateStats(stats) {
    let clickLabels = Object.keys(stats.clicksPerDay).map((dateString) => {
        // DateString est au format YYYY-MM-DD
        const explodeDate = dateString.split('-');
        return explodeDate[2] + ' / ' + explodeDate[1];
    });
    let clickValues = Object.values(stats.clicksPerDay).map(function(clickData){ return parseInt(clickData.number); });
    let graphPerDayNode = document.getElementById('graph-click-per-day');
    let clickPerDayChart = new Chart(graphPerDayNode, {
        type: 'line',
        data: {
            labels: clickLabels,
            datasets: [{
                label: 'Clicks',
                fill: true,
                data: clickValues,
                tension : 0,
                backgroundColor: 'rgba(150, 150, 255, 0.3)',
                borderColor : 'rgba(150, 150, 255, 0.5)',
                pointRadius: 0
            }]
        },
        options : {
            responsive : true,
            maintainAspectRatio : false,
            scales: {
                yAxis: {
                    min: 0,
                    suggestedMax: 5
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function generateClicksPerGameStats(clicksPerGame) {
    let graphPerGameNode = document.getElementById('graph-click-per-game');

    let graphLabels = clicksPerGame.map((gameData) => {
        let gameName = gameData.data.name;
        if (gameName.length <= 20) {
            return gameName;
        }
        return gameName.substr(0, 18) + '...';
    });

    let graphValues = clicksPerGame.map((gameData) => {
        return gameData.click;
    });

    let clickPerGameChart = new Chart(graphPerGameNode, {
        type: 'pie',
        data: {
            labels: graphLabels,
            datasets: [{
                data: graphValues,
                backgroundColor: [
                    '#3b43ae',
                    '#434cbf',
                    '#565ec6',
                    '#6970cc',
                    '#7c82d3',
                    '#8f94d9',
                    '#a2a7e0',
                    '#b5b9e6',
                    '#dcddf3'
                ],
                borderWidth : 1,
                borderColor : 'rgb(55, 55, 55)',
            }]
        },
        options : {
            plugins: {
                legend: {
                    position: 'left',
                    fullWidth : false,
                    labels : {
                        fontColor: '#000',
                        boxWidth: 20
                    }
                },
                responsive : true,
                maintainAspectRatio : false,
            }
        }
    });
}

function onClickLinkAccount() {
    if (windowOpenedApiKey !== null && windowOpenedApiKey.closed === false) return;
    let popupHeight = 500;
    let popupWidth = 600;

    let left = (window.screen.width - popupWidth) / 2;
    let top = ((window.screen.height - popupHeight) / 2) - 100;
    windowOpenedApiKey = window.open(GET_API_KEY_URL, 'Affiliate - Login', "height=" + popupHeight + ",width=" + popupWidth +",top=" + top + ",left=" + left);
}

function onReceiveMessage(e) {
    if (windowOpenedApiKey === null) return;
    if (e.origin !== AFFILIATE_URL) return;
    if (e.data.type !== 'send-key') return;
    windowOpenedApiKey.close();
    let linkAccountButton = document.querySelector('#link-account-button');
    let overlay = document.createElement('div');
    overlay.className = 'aks-plugin_overlay aks-plugin_loading';
    linkAccountButton.appendChild(overlay);

    let apiKey = e.data.key
    let apiKeyForm = document.getElementById('aks-plugin_link-account-form');
    apiKeyForm.elements.apiKey.value = apiKey;
    apiKeyForm.submit();
}

document.addEventListener('DOMContentLoaded', () => {
    let linkAccountButton = document.querySelector('#link-account-button');
    if (linkAccountButton !== null) {
        linkAccountButton.addEventListener('click', () => onClickLinkAccount());
    }

    initAffiliateStats();

    window.addEventListener("message", onReceiveMessage, false);
});

