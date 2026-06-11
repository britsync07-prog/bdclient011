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
    const keys = Object.keys(settingsObj);
    if (keys.length === 0) return this.getAllSettings();

    const existingSettings = await prisma.siteSetting.findMany({
      where: { key: { in: keys } }
    });

    const existingMap = new Map(existingSettings.map(s => [s.key, s]));
    const toCreate = [];
    const toUpdate = [];

    for (const [key, value] of Object.entries(settingsObj)) {
      const existing = existingMap.get(key);
      if (existing) {
        if (existing.value !== value) {
          toUpdate.push(
            prisma.siteSetting.update({
              where: { id: existing.id },
              data: { value }
            })
          );
        }
      } else {
        toCreate.push({ key, value });
      }
    }

    const operations = [];
    if (toCreate.length > 0) {
      operations.push(prisma.siteSetting.createMany({ data: toCreate }));
    }
    if (toUpdate.length > 0) {
      operations.push(...toUpdate);
    }

    if (operations.length > 0) {
      await prisma.$transaction(operations);
    }

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
