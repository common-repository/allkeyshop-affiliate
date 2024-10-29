<?php
/*
 * Plugin Name:       Allkeyshop Affiliate
 * Description:       Earn money by adding game prices comparison widgets
 * Version:           1.0.9
 * Requires at least: 5.9
 * Requires PHP:      7.0
 * Author:            Allkeyshop
 * License:           GPL v2 or later
 * Text Domain:       aks-affiliate
 * Domain Path:       /languages
 */

namespace AllkeyshopAffiliate;

define('AKS_AFFILIATE_PLUGIN_PATH_ROOT', plugin_dir_path( __FILE__ ));
define('AKS_AFFILIATE_PLUGIN_URL_ROOT', plugin_dir_url( __FILE__ ));
define('AKS_AFFILIATE_PLUGIN_CLICK_URL', 'https://www.allkeyshop.com/redirection/');

require_once __DIR__ .'/src/Services/AffiliateApi.php';
require_once __DIR__ .'/src/Services/VaksApi.php';
require_once __DIR__ .'/src/Services/ViewHelper.php';
require_once __DIR__ .'/src/Controller/Manager.php';
require_once __DIR__ .'/src/MetaBox/WidgetMetaBox.php';

add_action('plugins_loaded', [Manager::class, 'pluginLoaded']);
add_action('init', [Manager::class, 'init']);

add_action('admin_menu', [Manager::class, 'addMenu']);
add_action('wp_ajax_test_api_key', [Manager::class, 'testApiKey']);