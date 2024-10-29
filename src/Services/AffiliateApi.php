<?php
namespace AllkeyshopAffiliate\Services;

use AllkeyshopAffiliate\Manager;

class AffiliateApi
{
    public static $apiUrl;
    private static $_templates = [];

    public static function init() {
        self::$apiUrl = Manager::$affiliateUrl . '/api';
    }

    public static function getUrl() {
        return self::$apiUrl;
    }

    /**
     * Call the affiliate API
     * @param string $path
     * @param array $params
     * @return array
     */
    public static function call(string $path, array $params = [])
    {
        $formatParams = array_map(function($value) {
            if (is_array($value)) {
                return implode(',', $value);
            } else if (is_bool($value)) {
                return ($value ? 1 : 0);
            }
            return $value;
        }, $params);

        $stringParam = '';
        if (!empty($formatParams)) {
            $stringParam = '?' . implode('&', $formatParams);
        }

        $response = wp_remote_retrieve_body(wp_remote_get(self::$apiUrl . '/' . $path . $stringParam));
        $decode = json_decode($response, true);
        return $decode;
    }

    protected static function _hasLoadedTemplates(string $apiKey)
    {
        return isset(self::$_templates[$apiKey]);
    }

    protected static function _getTemplatesOfType(array $apiKeyTemplates, string $type = null)
    {
        if ($type !== null) {
            if (isset($apiKeyTemplates[$type])) {
                return $apiKeyTemplates[$type];
            }
            return [];
        }

        $allTemplates = [];
        foreach($apiKeyTemplates as $type => $typeTemplates) {
            foreach($typeTemplates as $id => $templateData) {
                $allTemplates[$id] = $templateData;
            }
        }
        return $allTemplates;
    }

    protected static function _getTemplates(string $apiKey, string $type = null)
    {
        if (isset(self::$_templates[$apiKey])) {
            return self::_getTemplatesOfType(self::$_templates[$apiKey], $type);
        }
        return [];
    }

    /**
     * Get all the templates for an API key
     * @param string $apiKey
     * @param string $type template type
     * @param bool $forceRefresh allow to bypass the cache
     * @return array
     */
    public static function loadTemplates(string $apiKey, string $type = null, bool $forceRefresh = false)
    {
        if (self::_hasLoadedTemplates($apiKey) && !$forceRefresh) {
            return self::_getTemplates($apiKey, $type);
        }
        $path = 'get-templates/' . $apiKey;
        $apiCall = self::call($path);
        $templates = [];
        if ($apiCall['success']) {
            foreach($apiCall['data'] as $templateData) {
                if (!isset($templates[$templateData['type']])) {
                    $templates[$templateData['type']] = [];
                }
                $templates[$templateData['type']][$templateData['id']] = $templateData;
            }
        }
        self::$_templates[$apiKey] = $templates;
        return self::_getTemplatesOfType(self::$_templates[$apiKey], $type);
    }

    public static function getTemplate(string $apiKey, $templateId)
    {
        $templates = self::loadTemplates($apiKey);
        if (isset($templates[$templateId])) {
            return $templates[$templateId];
        }
        return null;
    }

    /**
     * Check an API key
     * @param string $apiKey
     * @return array
     */
    public static function checkApiKey(string $apiKey)
    {
        $path = 'test-key/' . $apiKey;
        return self::call($path);
    }

    /**
     * Check the stats of an API key
     * @param string $apiKey
     * @return array
     */
    public static function getAffiliateStats(string $apiKey)
    {
        $path = 'affiliate-stats/' . $apiKey;
        return self::call($path);
    }
}