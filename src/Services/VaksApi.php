<?php
namespace AllkeyshopAffiliate\Services;

use AllkeyshopAffiliate\Manager;

class VaksApi
{
    public static $apiUrl;

    public static function init() {
        self::$apiUrl = Manager::$affiliateUrl . '/product-api';
    }

    /**
     * Execute un appel à l'API
     * @param array $params les paramètre GET de l'appel
     * @param string $action le type d'appel à effectuer
     * @return array
     */
    public static function call(string $action, array $params = [])
    {
        $stringParam = '?action=' . $action;
        foreach($params as $key => $value) {
            if (is_array($value)) {
                $value = implode(',', $value);
            } else if (is_bool($value)) {
                $value = ($value ? 1 : 0);
            }
            $stringParam .= '&' . $key . '=' . urlencode($value);
        }
        
        $response = wp_remote_retrieve_body(wp_remote_get(self::$apiUrl . $stringParam));

        $decode = json_decode($response, true);
        return $decode;
    }

    /**
     * Retourne le nom des jeux grâce à leur ids
     * @param int|array un ou plusieurs id de jeu
     * @return string|array Le nom du jeu si une seule valeur a été donné, un tableau avec les différents nom sinon
     */
    public static function getGamesTitle($games) {
        $sendOneResult = false;
        if (!is_array($games)) {
            $games = [$games];
            $sendOneResult = true;
        }
        $gameData = self::call('ids', ['ids' => $games]);
        if ($sendOneResult) {
            $gameData = array_pop($gameData);
            return $gameData['name'];
        }
        $returnData = [];
        foreach($gameData as $data) {
            $returnData[$data['id']] = $data['name'];
        }
        return $returnData;
    }
}