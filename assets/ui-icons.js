// UI icons (non-item emoji used by the interface): [icon id, current emoji, meaning]
(function (FSI) {
  FSI.uiList = [
    ['ui_money', '💰', 'Money'], ['ui_sell', '💸', 'Sold / income'], ['ui_market', '💱', 'Market'],
    ['ui_warehouse', '📦', 'Warehouse; also "stock target reached"'], ['ui_testkitchen', '🧪', 'Test Kitchen'],
    ['ui_cookbook', '📖', 'Cookbook'], ['ui_codex', '🔎', 'Codex / search'], ['ui_orders', '📋', 'Orders'],
    ['ui_goals', '🎯', 'Goals'], ['ui_settings', '⚙️', 'Menu: save, load, help'], ['ui_flows', '🔗', 'Flows overlay'],
    ['ui_plan', '🗺️', 'Plan production'], ['ui_help', '❓', 'Help'], ['ui_unknown', '❔', 'Undiscovered / unknown'],
    ['ui_close', '✕', 'Close'], ['ui_cancel', '❌', 'Cancel / failed'], ['ui_check', '✅', 'Done'],
    ['ui_time', '⏱', 'Time / duration'], ['ui_warning', '⚠️', 'Missing input'], ['ui_idle', '💤', 'Idle'],
    ['ui_pause', '⏸', 'Pause'], ['ui_play', '▶', 'Normal speed'], ['ui_fast', '⏩', 'Fast'], ['ui_faster', '⏭', 'Very fast'],
    ['ui_build', '🏗️', 'Build'], ['ui_repair', '🔧', 'Settings / tools'], ['ui_tip', '💡', 'Tip / hint'],
    ['ui_celebrate', '🎉', 'Discovery / celebration'], ['ui_trophy', '🏆', 'Goal reached'], ['ui_delete', '🗑', 'Demolish'],
    ['ui_save', '💾', 'Save'], ['ui_load', '📂', 'Load'], ['ui_new', '🆕', 'New game'], ['ui_world', '🌍', 'Origin'],
    ['ui_arrow', '➜', 'Becomes / leads to'], ['ui_chain', '⛓️', 'Supply chain'], ['ui_point', '👉', 'Pointer / next step'],
    ['ui_shop', '🛒', 'Shop (no longer used)'], ['ui_cuisines', '🍽️', 'Cuisines: stages and cuisines'],
    ['ui_toque', '🎩', 'Toques (second currency)'], ['ui_wholesaler', '🚚', 'Wholesaler'], ['ui_academy', '🎓', 'Culinary Academy'], ['ui_blueprint', '📐', 'Blueprints'], ['ui_town', '🏙️', 'Town: restaurants'], ['ui_restaurant', '🍴', 'Restaurant'], ['ui_journal', '📰', 'Farm journal'], ['ui_lock', '🔒', 'Locked'], ['ui_unlock', '🔓', 'Unlocked'],
    ['ui_sound', '🔊', 'Sound on'], ['ui_mute', '🔇', 'Sound off'], ['ui_music', '🎵', 'Music'],
    ['ui_chef', '👩‍🍳', 'Cook / kitchen'], ['ui_factory', '🏭', 'Processing'], ['ui_sprout', '🌱', 'Farming'],
    ['season_spring', '🌸', 'Spring'], ['season_summer', '☀️', 'Summer'], ['season_autumn', '🍂', 'Autumn'], ['season_winter', '❄️', 'Winter'],
    ['weather_sunny', '☀️', 'Sunny'], ['weather_rain', '🌧️', 'Rain'], ['weather_showers', '🌦️', 'Showers'], ['weather_drought', '🏜️', 'Drought'],
    ['weather_frost', '🥶', 'Late frost'], ['weather_storm', '⛈️', 'Storm'], ['weather_snow', '🌨️', 'Snow'],
    ['ui_star', '⭐', 'Special order; dish mastery'], ['ui_near', '📍', 'Nearby saving (proximity)'], ['ui_bank', '🏦', 'Bank'],
    ['ui_heart', '❤️', 'Regular customers'], ['ui_postcard', '💌', 'Recipe postcard'], ['ui_letter', '📨', 'Offer letter'],
    ['ui_party', '🥂', 'Party menu'], ['ui_sparkle', '✨', 'Something new / unlocked'], ['ui_crown', '👑', 'The Legacy'],
    ['ui_critic', '🕵️', 'Food critics'], ['ui_medal_1', '🥇', 'Gold'], ['ui_medal_2', '🥈', 'Silver'], ['ui_medal_3', '🥉', 'Bronze'],
    ['ui_todo', '⬜', 'Not done yet'], ['ui_angry', '😠', 'Guest turned away'], ['ui_harbour', '⚓', 'The Harbour'],
    ['ui_oldtown', '🏛️', 'The Old Town'], ['ui_permit', '📜', 'Permit'], ['ui_dice', '🎲', 'Surprise me'], ['ui_rival', '⚔️', 'Rivals'],
    ['ui_edit', '✏️', 'Rename'], ['ui_buildings', '🏘️', 'All buildings'], ['ui_info', 'ℹ️', 'About'], ['ui_hourglass', '⏳', 'Contract; waiting'],
    ['ui_move', '↔', 'Move a building'], ['ui_rotate', '↻', 'Rotate'], ['ui_download', '⬇️', 'Download'], ['ui_stop', '⏹', 'Stop'],
    ['ui_books', '📚', 'Train'], ['ui_leave', '👋', 'Let go'],
    ['ui_inventory', '🛖', 'Inventory: stock, import, wholesaler, bank'], ['ui_import', '🚢', 'Import'],
  ];
  // Other emoji that show the same icon as one above (a different code point for the same thing).
  FSI.uiAlias = [['👨‍🍳', 'ui_chef'], ['🔍', 'ui_codex'], ['🚛', 'ui_wholesaler'], ['🌾', 'wheat']];
})(FSI);
