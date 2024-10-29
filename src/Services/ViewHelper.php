<?php
namespace AllkeyshopAffiliate\Services;

class ViewHelper
{
    static protected function _getDir()
    {
        return \AllkeyshopAffiliate\Manager::$viewsDir . 'helper/';
    }

    static protected function _loadHelper(string $viewName,array $attrs = [])
    {
        $viewName = sanitize_file_name($viewName);
        require(self::_getDir() . $viewName . '.php');
    }

    static public function getTemplateSelect(array $attrs, ?string $type)
    {
        $attrs = $attrs + ['id' => '', 'name' => 'template', 'value' => ''];
        $templates = AffiliateApi::loadTemplates(\AllkeyshopAffiliate\Manager::$apiKey, $type);
        $attrs['templates'] = $templates;
        self::_loadHelper('select-template', $attrs);
    }

}