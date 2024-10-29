<div class="aks-plugin_container">
    <?php require('include/header.php'); ?>
    <div class="aks-plugin_box">
        <?php if ($success === false) :?>
            <div class="error">
                <p><?php _e('An error occured during while linking your account. Your API key is not a valid key.', 'aks-affiliate'); ?></p>
            </div>
        <?php elseif ($success === true) : ?>
            <div class="updated">
                <p><?php _e('Your account has been successfully linked.', 'aks-affiliate'); ?></p>
            </div>
            <a id="aks-plugin-home-link" href="<?php menu_page_url('allkeyshop-affiliate') ?>">
                <span class="dashicons dashicons-admin-home"></span>
                <span><?php _e('Back to your dashboard', 'aks-affiliate'); ?></span>
            </a>
        <?php endif; ?>
        <?php if ($success !== true) : ?>
            <div>
                <?php if ($apiKey !== null && $affiliateKey !== null) : ?>
                    <div class="updated">
                        <?php echo sprintf( wp_kses( __( 'You\'re currently linked to the key : <strong>%s</strong>', 'aks-affiliate' ), 'strong' ), $affiliateKey ); ?>
                    </div>
                <?php endif; ?>
                <form method="POST" action="" id="form-api-key">
                    <ol>
                        <li>
                            <a rel="external" target="_blank" href="<?php echo $affiliateUrl . '/show-api-key'; ?>"><?php _e('Get your API Key here', 'aks-affiliate'); ?></a>
                        </li>
                        <li>
                            <div class="field">
                                <label for="input-api-key"><?php _e('Insert your API Key', 'aks-affiliate'); ?></label>
                                <input type="text" id="input-api-key" placeholder="Your API Key" size="70" maxlength="50" name="apiKey" value="<?php echo $apiKey ?>"/>
                            </div> 
                            <div class="field-submit">   
                                <button class="button button-primary" id="save-api-key-button"><?php _e('Save Your API Key', 'aks-affiliate'); ?></button>
                            </div>
                        </li>
                    </ol>
                </form>
            </div>
        <?php endif; ?>
    </div>
</div>