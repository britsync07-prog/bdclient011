const SettingService = require('../services/SettingService');

exports.getSettings = async (req, res) => {
  try {
    const settings = await SettingService.getAllSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error(`[ADMIN_CMS_ERROR] [Admin: ${req.user.username}] Failed to retrieve settings: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const settings = req.body;
    const updated = await SettingService.updateSettings(settings);
    console.log(`[ADMIN_CMS_SETTINGS_UPDATE] [Admin: ${req.user.username}] Updated settings keys: ${Object.keys(settings).join(', ')}`);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error(`[ADMIN_CMS_SETTINGS_UPDATE_ERROR] [Admin: ${req.user.username}] Failed to update settings: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBanners = async (req, res) => {
  try {
    const banners = await SettingService.getAllBanners();
    res.json({ success: true, data: banners });
  } catch (error) {
    console.error(`[ADMIN_CMS_ERROR] [Admin: ${req.user.username}] Failed to retrieve banners: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addBanner = async (req, res) => {
  try {
    const banner = await SettingService.addBanner(req.body);
    console.log(`[ADMIN_CMS_BANNER_ADD] [Admin: ${req.user.username}] Added new banner: "${banner.title}" (ID: ${banner.id})`);
    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    console.error(`[ADMIN_CMS_BANNER_ADD_ERROR] [Admin: ${req.user.username}] Failed to add banner: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const banner = await SettingService.updateBanner(req.params.id, req.body);
    console.log(`[ADMIN_CMS_BANNER_UPDATE] [Admin: ${req.user.username}] Updated banner ID ${req.params.id} to title: "${banner.title}"`);
    res.json({ success: true, data: banner });
  } catch (error) {
    console.error(`[ADMIN_CMS_BANNER_UPDATE_ERROR] [Admin: ${req.user.username}] Failed to update banner ID ${req.params.id}: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    await SettingService.deleteBanner(req.params.id);
    console.log(`[ADMIN_CMS_BANNER_DELETE] [Admin: ${req.user.username}] Deleted banner ID ${req.params.id}`);
    res.json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    console.error(`[ADMIN_CMS_BANNER_DELETE_ERROR] [Admin: ${req.user.username}] Failed to delete banner ID ${req.params.id}: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};
