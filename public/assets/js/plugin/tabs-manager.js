class TabsManager {
    constructor(nodeContainer) {
        this.nodeContainer = nodeContainer;
        this.nodeHeader = nodeContainer.querySelector('.aks-plugin_tabs-header');
        this.nodeContents = nodeContainer.querySelectorAll('.aks-plugin_tabs-content');

        this.currentTab = null;

        this.tabs = {}
        this._generateHeaders();
        
        // first tab activation
        let firstTabName = Object.keys(this.tabs)[0];
        this.activeTab(firstTabName);
    }

    _generateHeader(title, icon) {
        let node = document.createElement('div');
        node.className = 'button';
        if (icon !== null) {
            let iconNode = document.createElement('span');
            iconNode.className = ' dashicons dashicons-' + icon;
            node.appendChild(iconNode);
        }
        let textNode = document.createElement('span');
        textNode.textContent = title;

        node.appendChild(textNode);
        return node;
    }

    getCurrentTabData() {
        if (this.currentTab === null) return null;
        return this.tabs[this.currentTab];
    }

    _generateHeaders() {
        this.nodeContents.forEach((node) => {
            let title = node.dataset.title;
            let name = node.dataset.tab;
            let icon = node.dataset.icon || null;

            let nodeTabHeader = this._generateHeader(title, icon);

            this.tabs[name] = {
                title : title,
                name : name,
                icon : icon,
                content : node,
                header : nodeTabHeader
            };

            nodeTabHeader.addEventListener('click', () => {
                this.activeTab(name);
            });
            this.nodeHeader.appendChild(nodeTabHeader);
        });
    }

    _hideTab(name) {
        let tabData = this.tabs[name];
        if (tabData !== null) {
            tabData.content.classList.remove('aks-plugin_tab-show')
            tabData.header.classList.remove('aks-plugin_tab-active')
        }
    }

    _showTab(name) {
        let tabData = this.tabs[name];
        if (tabData !== null) {
            tabData.content.classList.add('aks-plugin_tab-show')
            tabData.header.classList.add('aks-plugin_tab-active')
        }
    }

    activeTab(name) {
        if (name === this.currentTab) return;
        if (this.currentTab !== null) {
            this._hideTab(this.currentTab);
        }
        this.currentTab = name;
        this._showTab(this.currentTab);
    }
}