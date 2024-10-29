<select id="<?php echo esc_attr($attrs['id']); ?>" name="<?php echo esc_attr($attrs['name']); ?>">
    <option value="none"><?php _e('Default', 'aks-affiliate'); ?></option>
    <?php foreach ($attrs['templates'] as $templateId => $templateData) : ?>
        <option value="<?php echo esc_attr($templateId); ?>" <?php echo ($attrs['value'] == $templateId) ? 'selected' : ''?> ><?php echo esc_html($templateData['label']); ?></option>
    <?php endforeach; ?>
</select>