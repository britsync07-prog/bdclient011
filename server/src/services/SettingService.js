const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SettingService {
  /**
   * Get all site settings as a key-value object
   */
  static async getAllSettings() {
    const settings = await prisma.siteSetting.findMany();
    const settingsMap = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    return settingsMap;
  }

  /**
   * Update a specific setting
   */
  static async updateSetting(key, value) {
    return await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }

  /**
   * Update multiple settings
   */
  static async updateSettings(settingsObj) {
    const updates = [];
    for (const [key, value] of Object.entries(settingsObj)) {
      updates.push(
        prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value }
        })
      );
    }
    await prisma.$transaction(updates);
    return this.getAllSettings();
  }

  /**
   * Get all active banners ordered
   */
  static async getActiveBanners() {
    return await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
  }

  /**
   * Get all banners (for admin)
   */
  static async getAllBanners() {
    return await prisma.banner.findMany({
      orderBy: { order: 'asc' }
    });
  }

  /**
   * Add a new banner
   */
  static async addBanner(data) {
    return await prisma.banner.create({
      data
    });
  }

  /**
   * Update banner
   */
  static async updateBanner(id, data) {
    return await prisma.banner.update({
      where: { id: parseInt(id, 10) },
      data
    });
  }

  /**
   * Delete banner
   */
  static async deleteBanner(id) {
    return await prisma.banner.delete({
      where: { id: parseInt(id, 10) }
    });
  }
}

module.exports = SettingService;
