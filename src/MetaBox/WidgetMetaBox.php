<?php
namespace AllkeyshopAffiliate\Widget\MetaBox;

use AllkeyshopAffiliate\Manager;
use AllkeyshopAffiliate\Services\AffiliateApi;

class WidgetMetaBox
{
    const POST_TYPES = ['post', 'page'];
    const META_KEY_GAME = 'aks-plugin-game';
    const META_KEY_TEMPLATE = 'aks-plugin-template';

    public static function init(): void
    {
        foreach (self::POST_TYPES as $type) {
            add_action('save_post_'. $type, [self::class, 'onSave']);
        }

        add_action('add_meta_boxes', static function () {
            foreach (self::POST_TYPES as $type) {
                add_meta_box(
                    'aksa_plugin_widget_box',
                    'Allkeyshop Affiliate',
                    [self::class, 'render'],
                    $type
                );
            }
        });
    }

    protected static function _deletePostMeta(int $postId) 
    {
        delete_post_meta($postId, self::META_KEY_GAME);
        delete_post_meta($postId, self::META_KEY_TEMPLATE);
    }

    public static function onSave(int $postId): void
    {
        $idGame = intval($_POST[self::META_KEY_GAME]) ?? null;
        if ($idGame == null) {
            self::_deletePostMeta($postId);
        } else {
            update_post_meta($postId, self::META_KEY_GAME, $idGame);
            update_post_meta($postId, self::META_KEY_TEMPLATE, intval($_POST[self::META_KEY_TEMPLATE]));
        }
    }

    public static function render(\WP_Post $post): void
    {
        $data = [
            'affiliateKey' => get_option('allkeyshop_widget_affiliate_key', null),
            'game' => get_post_meta($post->ID, self::META_KEY_GAME, true),
            'template' => get_post_meta($post->ID, self::META_KEY_TEMPLATE, true)
        ];
 
        Manager::loadView('widgetMetaBox', $data);
    }
}
