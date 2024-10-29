<script type="text/javascript">
    const AFFILIATE_URL = '<?php echo esc_js($affiliateUrl); ?>';
    const GET_API_KEY_URL = '<?php echo esc_js($getApiKeyUrl); ?>';
    const AFFILATE_STATS_URL = '<?php echo esc_js($affiliateStatsUrl); ?>';
    const API_KEY = <?php echo ($apiKey === null) ? 'null' : "'" . esc_js($apiKey) . "'"; ?>;
</script>
<div class="aks-plugin_container">
    <?php require('include/header.php'); ?>
    <div class="aks-plugin_dashboard">
        <div class="aks-plugin_content-box grid-full">
            <h2><?php _e('Use of the plugin', 'aks-affiliate'); ?></h2>
            <p>
            <?php echo wp_kses(__('Allkeyshop is a website to compare price of digital video games with more than 3 million users every month.<br />Our affiliate program allows you to earn money for clicks your users make on a personalized and non-intrusive widget placed on your website.<br /><br />Everything is easy to use, the tools are designed to be customized to fit the look and content of your site.', 'aks-affiliate'), ['br' => []]); ?>
            </p>
            <?php if (!AllkeyshopAffiliate\Manager::hasPluginAccess()) : ?>
                <p>
                    <?php echo wp_kses(__('To join our affiliate program, you must register on <a href="https://affiliate.allkeyshop.com/">https://affiliate.allkeyshop.com</a>, once registered contact us on <a href="mailto:support@allkeyshop.com">support@allkeyshop.com</a> to validate the contract<br /><br />Finally, click on the button below to link your account', 'aks-affiliate'), ['a' => ['href' => []], 'br' => []]); ?>
                </p>
                <?php if ($successApiKey === false) : ?>
                    <div class="error">
                        <p><?php _e('An error appen during the validation. Please try again later', 'aks-affiliate'); ?></p>
                        <?php $linkAccountUrl = menu_page_url('allkeyshop-link-account', false); ?>
                        <p>
                            <?php echo sprintf( wp_kses( __( 'If the error persist, you can <a href="%s">link your account manually</a>', 'aks-affiliate' ), ['a' => ['href' => []]] ), $linkAccountUrl ); ?>
                        </p>
                    </div>
                <?php endif; ?>
                <div class="aks-plugin_text-center">
                    <a id="link-account-button" class="aks-plugin_button" href="javascript:;">
                        <span class="dashicons dashicons-admin-network"></span>
                        <span><?php _e('Link my account', 'aks-affiliate'); ?></span>
                    </a>
                    <form id="aks-plugin_link-account-form" method="POST">
                        <input type="hidden" name="apiKey" />
                    </form>
                </div>
            <?php else : ?>
                <p>
                    <?php echo wp_kses(__('It\'s recommanded to create your own templates on <a href="https://affiliate.allkeyshop.com/">https://affiliate.allkeyshop.com</a> to have a widget that fit your own needs', 'aks-affiliate'), ['br' => [], 'a' => ['href' => []]]); ?>
                </p>
                <p>
                    <?php
                        echo sprintf( wp_kses( __( 'You\'re currently linked to the key : <strong>%s</strong>', 'aks-affiliate' ), 'strong' ), $affiliateKey );
                    ?>
                </p>
            <?php endif; ?>
        </div>
        <?php if (AllkeyshopAffiliate\Manager::hasPluginAccess()) : ?>
            <div class="aks-plugin_content-box">
                <h3><?php echo wp_kses( __( 'Clicks <em>Last 28 days</em>', 'aks-affiliate' ), 'em' ); ?></h3>
                <div>
                    <strong id="stats-clicks-number">28</strong> 
                    <span><?php echo wp_kses( __( 'Validated Clicks', 'aks-affiliate' ), 'em' ); ?></span>
                    <em id="stats-clicks-rate"></em>
                </div>
                <canvas id="graph-click-per-day"></canvas>
            </div>
            <div class="aks-plugin_content-box">
                <h3><?php echo wp_kses( __( 'Clicks per game <em>Last 28 days</em>', 'aks-affiliate' ), 'em' ); ?></h3>
                <canvas id="graph-click-per-game"></canvas>
            </div>
        <?php endif; ?>
    </div>
</div>