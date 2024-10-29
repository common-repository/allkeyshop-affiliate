<div class="aks-plugin_container">
    <?php require('include/header.php'); ?>
    <h2>Create game page</h2>
    <?php if (isset($url) && $url !== null) : ?>
        <div class="updated">
            <p>
                The game page was created ! <a href="<?php echo esc_url($url); ?>">Go to the page edition</a>
            </p>
        </div>
    <?php endif; ?>
    <form action="" method="POST">
        <div class="field">
            <label for="aks-plugin_game-input">Select your game</label>
            <input type="text" id="aks-plugin_game-input" name="game" class="autocomplete" data-type="game" placeholder="Type the name of a game" required/>
        </div>
        <div class="field">
            <div>
                <label for="aks-plugin_template-input">Widget Template</label>
                <?php AllkeyshopAffiliate\Services\ViewHelper::getTemplateSelect(['id' => 'aks-plugin_template-input', 'name' => 'template'], 'game-prices-comparison'); ?>
            </div>
        </div>
        <div class="field">
            <div>
                <label for="aks-plugin_title-input">Page title<span class="optional-text-label">(optional)</span></label>
                <input type="text" id="aks-plugin_title-input" name="title" />
            </div>
        </div>
        <input type="submit" class="button button-primary" value="Create" />
    </form>
</div>