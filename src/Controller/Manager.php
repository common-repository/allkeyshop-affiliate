<?php
namespace AllkeyshopAffiliate;

use AllkeyshopAffiliate\Widget\MetaBox\WidgetMetaBox;
use AllkeyshopAffiliate\Services\AffiliateApi;
use AllkeyshopAffiliate\Services\VaksApi;

class Manager {

    public static $assetDir;
    public static $viewsDir;
    public static $affiliateUrl;
    public static $widgetUrl;
    public static $widgetJs;
    public static $apiKey = null;
    protected static $allowedLocales = ['en_GB', 'fr_FR', 'en_US', 'nl_NL', 'de_DE', 'it_IT', 'es_ES', 'pt_PT'];
    /**
     * Initialize the plugin
     */
    public static function init()
    {
        self::$assetDir = AKS_AFFILIATE_PLUGIN_PATH_ROOT . 'public/assets/';
        self::$viewsDir = self::$assetDir . 'views/';
        self::$affiliateUrl = defined('AKS_AFFILIATE_PLUGIN_ENV') ? 'http://aks.affiliate.local' : 'https://affiliate.allkeyshop.com';
        self::$widgetUrl = defined('AKS_AFFILIATE_PLUGIN_ENV') ? 'http://aks.affiliate.local' : 'https://widget.allkeyshop.com/lib';
        self::$widgetJs = self::$widgetUrl . '/assets/js/generate/iframe/widget.js';
        self::$apiKey = get_option('allkeyshop_widget_key', null);
        AffiliateApi::init();
        VaksApi::init();

        self::_createShortcode();
        self::loadDefaultAssets();
        
        if (self::hasPluginAccess()) {
            WidgetMetaBox::init();   
        }
    }

    /**
     * Trigger when the plugin is loaded
     */
    public static function pluginLoaded()
    {
        $pluginLanguagesPath = basename(AKS_AFFILIATE_PLUGIN_PATH_ROOT) . '/languages';
        load_plugin_textdomain('aks-affiliate', false, $pluginLanguagesPath);
    }

    /**
     * Create the plugin's menu
     */
    public static function addMenu()
    {
        add_menu_page(
            'Allkeyshop Affiliate',
            'Allkeyshop Affiliate',
            'manage_options',
            'allkeyshop-affiliate',
            function () {
                self::mainPage();
            },
            'dashicons-buddicons-buddypress-logo'
        );

        // Dashboard
        add_submenu_page(
            'allkeyshop-affiliate',
            'Allkeyshop Affiliate Dashboard',
            'Dashboard',
            'manage_options',
            'allkeyshop-affiliate',
            function () {
                self::mainPage();
            },
            'dashicons-buddicons-buddypress-logo'
        );

        // Link account page
        add_submenu_page(
            null,
            'Allkeyshop Affiliate Link Account',
            'Link Account',
            'manage_options',
            'allkeyshop-link-account',
            function () {
                self::linkAccountPage();
            }
        );

        /*add_submenu_page(
            'allkeyshop-affiliate',
            'Create Game Page',
            'Create Game Page',
            'manage_options',
            'create-game-page',
            function () {
                self::createGamePage();
            },
            'dashicons-media-text'
        );*/
    }

    /**
     * Initialize the shortcodes
     */
    protected static function _createShortcode()
    {
        // Game price comparison widget
        add_shortcode('allkeyshop_widget_offers', function ($attr) {
            if (!isset($attr['game']) || !isset($attr['template'])) return null;

            $gamesId = intval($attr['game']);
            $templateId = $attr['template'];
            if ($templateId !== 'none') {
                $templateId = intval($templateId);
            }
            
            $affiliateKey = get_option('allkeyshop_widget_affiliate_key', null);
            $srcUrl = self::$widgetJs . '?widgetType=game-prices-comparison&game=' . $gamesId . '&widgetTemplate=' . $templateId . '&apiKey=' . $affiliateKey;
            return '<script type="text/javascript" src="' . esc_url($srcUrl) . '"></script>';
        });

        // Game link widget
        add_shortcode('allkeyshop_link_offers', function ($attr) {
            if (!isset($attr['game'])) return null;

            $gameId = intval($attr['game']);
            $affiliateKey = get_option('allkeyshop_widget_affiliate_key', null);
            $locale = get_locale();
            if (!in_array($locale, self::$allowedLocales)) {
                $locale = self::$allowedLocales[0];
            }
            $hrefUrl = AKS_AFFILIATE_PLUGIN_CLICK_URL . 'comparator/' . $gameId . '?locale=' . $locale . '&apiKey=' . $affiliateKey;
            $textLink = $attr['text'];
            if (empty($attr['text'])) {
                $textLink = 'Link to the game offers';
            }
            return '<a href="' . $hrefUrl . '" rel="nofollow" target="_blank">' . $textLink . '</a>';
        });
    }

    /**
     * Load the global JS and CSS files
     */
    public static function loadDefaultAssets()
    {
        wp_enqueue_script('aks-affiliate-plugin-aks-api', AKS_AFFILIATE_PLUGIN_URL_ROOT . 'public/assets/js/plugin/aks-api.js');
        wp_enqueue_style('aks-affiliate-plugin-autocomplete', AKS_AFFILIATE_PLUGIN_URL_ROOT .'public/assets/css/plugin/autocomplete.css');
        wp_enqueue_script('aks-affiliate-plugin-autocomplete', AKS_AFFILIATE_PLUGIN_URL_ROOT .'public/assets/js/plugin/autocomplete.js');
        wp_enqueue_style('aks-affiliate-plugin-tabs-manager', AKS_AFFILIATE_PLUGIN_URL_ROOT .'public/assets/css/plugin/tabs-manager.css');
        wp_enqueue_script('aks-affiliate-plugin-tabs-manager', AKS_AFFILIATE_PLUGIN_URL_ROOT .'public/assets/js/plugin/tabs-manager.js');
        self::loadJs('main');
        self::loadcss('main');
    }

    /**
     * Load a JS file
     * @param string $fileName the JS filename
     */
    public static function loadJs($fileName)
    {
        $fileName .= '.js';
        $fileName = sanitize_file_name($fileName);
        $file = AKS_AFFILIATE_PLUGIN_URL_ROOT . 'public/assets/js/' . $fileName;
        $filePath = self::$assetDir . 'js/' . $fileName;
        if (file_exists($filePath)) {
            wp_enqueue_script('aks-affiliate-plugin-' . $fileName, $file, [], null, true);
        }
    }

    /**
     * Load a CSS file
     * @param string $fileName the CSS filename
     */
    public static function loadCss($fileName)
    {
        $fileName .= '.css';
        $fileName = sanitize_file_name($fileName);
        $file = AKS_AFFILIATE_PLUGIN_URL_ROOT . 'public/assets/css/' . $fileName;
        $filePath = self::$assetDir . 'css/' . $fileName;
        if (file_exists($filePath)) {
            wp_enqueue_style('aks-affiliate-plugin-' . $fileName, $file);
        }
    }

    /**
     * Load a view with the CSS and JS
     * @param string $viewName the name of the view
     * @param array $viewParams the view parameters
     */
    public static function loadView($viewName, $viewParams = [])
    {
        self::loadJs($viewName);
        self::loadCss($viewName);

        // On créer les variables qui vont être utilisé dans la vue
        foreach ($viewParams as $key => $value) {
            ${$key} = $value;
        }
        require_once(self::$viewsDir . $viewName . '.php');
    }

    /**
     * Check if the user has access to the plugin
     */
    public static function hasPluginAccess() {
        return self::$apiKey !== null;
    }

    /**
     * Save the api key and the affiliate key
     * @param string $apiKey
     */
    protected static function _saveApiKey($apiKey, $affiliateKey) {
        update_option('allkeyshop_widget_key', $apiKey);
        update_option('allkeyshop_widget_affiliate_key', $affiliateKey);
        self::$apiKey = $apiKey;
    }

    /**
     * Main page
     */
    public static function mainPage()
    {
        $successApiKey = null;
        if (isset($_POST['apiKey'])) {
            $apiKey = sanitize_text_field($_POST['apiKey']);
            $success = self::_testApiKey($apiKey);
        }

        $data = [
            'successApiKey'     => $successApiKey,
            'apiKey'            => self::$apiKey,
            'affiliateUrl'      => self::$affiliateUrl,
            'affiliateStatsUrl' => self::$affiliateUrl . '/api/affiliate-stats',
            'getApiKeyUrl'      => self::$affiliateUrl . '/get-api-key',
            'affiliateKey'      => get_option('allkeyshop_widget_affiliate_key')
        ];
        wp_enqueue_script('aks-affiliate-plugin-chart-js', AKS_AFFILIATE_PLUGIN_URL_ROOT . '/node_modules/chart.js/dist/chart.min.js', [], null, true);
        self::loadView('index', $data);
    }

    /**
     * Game Page creation
     */
    public static function createGamePage()
    {
        $data = ['error' => null];
        if(isset($_POST['game']) && is_numeric($_POST['game'])) {
            $gameId = intval($_POST['game']);
            $template = (!empty($_POST['template'])) ? intval($_POST['template']) : null;
            if ($template === 0) {
                $template = null;
            }
            $title = (!empty($_POST['title'])) ? sanitize_text_field($_POST['title']) : null;

            $idPage = self::_createGamePage($gameId, ['template' => $template, 'title' => $title], $errors);
            $data['error'] = $errors;

            if ($idPage !== null) {
                $data['url'] = get_edit_post_link($idPage);
            }
        }
        self::loadView('createGamePage', $data);
    }

    /**
     * Create a game page
     * @param int $gameId
     * @param array $options array for some specific options :
     *                       - template : template of the widget
     *                       - title: Change the title of the page
     * @param array $errors allow to retrieve the errors when the game page creation fail
     */
    protected static function _createGamePage($gameId, $options = [], &$errors = null) 
    {
        ob_start();
        require_once(self::$viewsDir . 'gamePageContent.php');
        $postContent = ob_get_contents();
        ob_end_clean();

        $gameTitle = VaksApi::getGamesTitle($gameId);
        $gamePageData = [
            'post_title'    => $gameTitle,
            'post_status'   => 'publish',
            'post_type'     => 'page',
            'post_content'  => $postContent,
            'post_author'   => get_current_user_id()
        ];

        foreach($options as $optionName => $optionValue) {
            self::_manageGamePageOption($gamePageData, $optionName, $optionValue);
        }
           
        $return = wp_insert_post($gamePageData, true);
        if (is_wp_error($return)) {
            $errors = $return;
            return null;
        }
        return $return;
    }

    /**
     * Manage the options for the game page creation
     */
    protected static function _manageGamePageOption(&$currentPageData, $optionName, $optionValue) {
        if ($optionName == 'slug' && $optionValue !== null) {
            $currentPageData['post_name'] = $optionValue;
        } elseif ($optionName == 'title' && $optionValue !== null) {
            $currentPageData['post_title'] = $optionValue;
        }
    }

    public static function testApiKey() {
        if (!isset($_POST['apiKey'])) {
            wp_send_json_error();
        }
        $apiKey = sanitize_text_field($_POST['apiKey']);
        $successs = self::_testApiKey($apiKey);
        if ($success) {
            wp_send_json_success();
        }
        wp_send_json_error();
    }


    protected static function _testApiKey($apiKey) {
        $data = AffiliateApi::checkApiKey($apiKey);
        if ($data['success'] === true) {
            self::_saveApiKey($apiKey, $data['data']['affiliateKey']);
            return true;
        }
        return false;
    }

    public static function linkAccountPage() {
        $data = [
            'success'       => null,
            'access'        => self::hasPluginAccess(),
            'affiliateKey'  => get_option('allkeyshop_widget_affiliate_key'),
            'affiliateUrl'  => self::$affiliateUrl
        ];
        if(isset($_POST['apiKey'])) {
            $apiKey = sanitize_text_field($_POST['apiKey']);
            $data['success'] = self::_testApiKey($apiKey);
        }
        $data['apiKey'] = self::$apiKey;
        self::loadView('apiKey', $data);
    }
}
