<div id="aks-plugin_meta-box" class="aks-plugin_container" data-key="<?php echo $affiliateKey ?>">
    <div class="field">
        <label for="aks-plugin_game-input"><?php _e('Select a game', 'aks-affiliate'); ?></label>
        <input type="text" id="aks-plugin_game-input" name="aks-plugin-game" class="autocomplete" data-type="game" placeholder="<?php _e('Type the name of a game', 'aks-affiliate'); ?>" value="<?php echo esc_attr($game) ?>"/>
    </div>
    <div class="aks-plugin_tabs-container">
        <div class="aks-plugin_tabs-header"></div>
        <div class="aks-inline-block ">
            <h2><?php _e('Options', 'aks-affiliate'); ?></h2>
            <div class="aks-plugin_tabs-content" data-tab="widget" data-title="<?php _e('Create Widget', 'aks-affiliate'); ?>" data-icon="welcome-widgets-menus">
                <div class="field">
                    <label for="aks-plugin_template-input"><?php _e('Select a template', 'aks-affiliate'); ?></label>
                    <?php AllkeyshopAffiliate\Services\ViewHelper::getTemplateSelect(['id' => 'aks-plugin_template-input', 'name' => 'aks-plugin-template', 'value' => $template], 'game-prices-comparison'); ?>
                </div>
                <div class="field">
                    <label for="aks-plugin_position-input"><?php _e('Select a position', 'aks-affiliate'); ?></label>
                    <select name="aks-plugin-position" id="aks-plugin_position-input">
                        <option value="top"><?php _e('At the top', 'aks-affiliate'); ?></option>
                        <option value="bottom"><?php _e('At the bottom', 'aks-affiliate'); ?></option>
                        <option value="cursor"><?php _e('At the cursor position', 'aks-affiliate'); ?></option>
                    </select>
                </div>
                <div class="button" id="aks-plugin_insert-widget"><?php _e('Insert Widget', 'aks-affiliate'); ?></div>
            </div>
            <div class="aks-plugin_tabs-content" data-tab="link" data-title="<?php _e('Create Link', 'aks-affiliate'); ?>" data-icon="admin-links">
                <div class="field">
                    <label for="aks-plugin_link-type-input"><?php _e('Link type', 'aks-affiliate'); ?></label>
                    <select name="aks-plugin-link-type" id="aks-plugin_link-type-input">
                        <option value="bestOffer"><?php _e('Redirect to the best offer', 'aks-affiliate'); ?></option>
                        <option value="comparator"><?php _e('Redirect to the comparator', 'aks-affiliate'); ?></option>
                    </select>
                </div>
                <div class="button" id="aks-plugin_insert-link"><?php _e('Insert Link', 'aks-affiliate'); ?></div>
            </div>
        </div>
    </div>
</div>