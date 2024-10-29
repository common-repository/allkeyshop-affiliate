function getMetaBoxData() {
    let widgetMetaBoxNode = document.querySelector('#aks-plugin_meta-box');
    let affiliateKey = widgetMetaBoxNode.dataset.key;

    let gameInput = document.querySelector('#aks-plugin_game-input');
    let gameValue = gameInput.getAutocomplete().getValue();

    let templateInput = document.querySelector('#aks-plugin_template-input');
    let templateValue = templateInput.value;

    let positionInput = document.querySelector('#aks-plugin_position-input');
    let positionValue = positionInput.value;

    let linkInput = document.querySelector('#aks-plugin_link-type-input');
    let linkValue = linkInput.value;

    return {
        key : affiliateKey,
        game : gameValue,
        template: templateValue,
        position : positionValue,
        linkType : linkValue
    };
}

function isClassicEditor() {
    return tinymce.activeEditor !== null && tinymce.activeEditor.id === 'content';
}

function insertWidget(e) {
    e.preventDefault();
    let metaBoxData = getMetaBoxData();
    if (metaBoxData.game === null) return false;

    // Without Classic Editor
    if (!isClassicEditor()) {
        let insertedBlock = wp.blocks.createBlock('core/shortcode', {
            text: '[allkeyshop_widget_offers game="' + metaBoxData.game.value + '" template="' + metaBoxData.template + '"]',
        });
        let coreBlockEditor = wp.data.select( 'core/block-editor' );
        let blockPosition = 0;
        switch(metaBoxData.position) {
            case 'top' : blockPosition = 0; break;
            case 'bottom' : blockPosition = coreBlockEditor.getBlockCount(); break;
            case 'cursor' : blockPosition = coreBlockEditor.getBlockIndex(coreBlockEditor.getAdjacentBlockClientId()); break;
            default :;
        }
        wp.data.dispatch( 'core/block-editor' ).insertBlock(insertedBlock, blockPosition);
    } else { // With Classic Editor
        let insertedContent = '[allkeyshop_widget_offers game="' + metaBoxData.game.value + '" template="' + metaBoxData.template + '"]';
        switch(metaBoxData.position) {
            case 'top' : tinymce.activeEditor.setContent(insertedContent + tinymce.activeEditor.getContent()); tinymce.activeEditor.insertContent(''); break;
            case 'bottom' : tinymce.activeEditor.setContent(tinymce.activeEditor.getContent() + insertedContent); tinymce.activeEditor.insertContent(''); break;
            case 'cursor' : tinymce.activeEditor.insertContent(insertedContent); break;
            default :;
        }
    }
}

function insertLink(e) {
    e.preventDefault();
    let metaBoxData = getMetaBoxData();
    if (metaBoxData.game === null) return false;

    let gameLink = 'https://www.allkeyshop.com/redirection';
    let linkText = 'Link to ' + metaBoxData.game.gameName + ' offers';

    if (metaBoxData.linkType === 'comparator') {
        gameLink += '/comparator/' + metaBoxData.game.value;
    } else {
        gameLink += '/bestOffer/eur/' + metaBoxData.game.value;
        linkText = 'Link to ' + metaBoxData.game.gameName + ' best offer';
    }
    gameLink += '?apiKey=' + metaBoxData.key;

    if (isClassicEditor()) {
        let textSelection = tinymce.activeEditor.selection.getContent();
        if (textSelection === '') {
            textSelection = linkText;
        }
        tinymce.activeEditor.insertContent('<a rel="nofollow" target="_blank" href="' + gameLink + '">' + textSelection + '</a>');
    } else {
        let paragraphBlock = wp.blocks.createBlock('core/paragraph', {
            content: '<a href="' + gameLink + '" rel="nofollow" target="_blank">' + linkText + '</a>'
        });
        let coreBlockEditor = wp.data.select( 'core/block-editor' );
        let blockPosition = coreBlockEditor.getBlockIndex(coreBlockEditor.getAdjacentBlockClientId());
        wp.data.dispatch('core/block-editor').insertBlock(paragraphBlock, blockPosition);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let insertWidgetForm = document.querySelector('#aks-plugin_insert-widget');
    if (insertWidgetForm !== null) {
        insertWidgetForm.addEventListener('click', insertWidget);
    } 

    let insertLinkButton = document.querySelector('#aks-plugin_insert-link');
    if (insertLinkButton !== null) {
        insertLinkButton.addEventListener('click', insertLink);
    } 
});

