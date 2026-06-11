const request = require('supertest');
const express = require('express');
const adminCmsController = require('../adminCmsController');
const SettingService = require('../../services/SettingService');

// Mock the SettingService
jest.mock('../../services/SettingService');

const app = express();
app.use(express.json());

// Mock req.user for middleware simulation
app.use((req, res, next) => {
  req.user = { username: 'testadmin' };
  next();
});

app.get('/api/admin/cms/settings', adminCmsController.getSettings);
app.post('/api/admin/cms/settings', adminCmsController.updateSettings);
app.get('/api/admin/cms/banners', adminCmsController.getBanners);
app.post('/api/admin/cms/banners', adminCmsController.addBanner);
app.put('/api/admin/cms/banners/:id', adminCmsController.updateBanner);
app.delete('/api/admin/cms/banners/:id', adminCmsController.deleteBanner);

describe('adminCmsController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    it('should return settings successfully', async () => {
      const mockSettings = { siteName: 'PBBET', maintenance: 'false' };
      SettingService.getAllSettings.mockResolvedValue(mockSettings);

      const response = await request(app).get('/api/admin/cms/settings');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockSettings
      });
      expect(SettingService.getAllSettings).toHaveBeenCalledTimes(1);
    });

    it('should return 500 when SettingService throws an error', async () => {
      const errorMessage = 'Database error';
      SettingService.getAllSettings.mockRejectedValue(new Error(errorMessage));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const response = await request(app).get('/api/admin/cms/settings');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ success: false, message: errorMessage });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('updateSettings', () => {
    it('should update settings successfully', async () => {
      const newSettings = { siteName: 'New PBBET' };
      SettingService.updateSettings.mockResolvedValue(newSettings);

      const response = await request(app)
        .post('/api/admin/cms/settings')
        .send(newSettings);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: newSettings });
      expect(SettingService.updateSettings).toHaveBeenCalledWith(newSettings);
    });

    it('should return 500 when update fails', async () => {
      SettingService.updateSettings.mockRejectedValue(new Error('Update failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const response = await request(app)
        .post('/api/admin/cms/settings')
        .send({ key: 'val' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('getBanners', () => {
    it('should return banners successfully', async () => {
      const mockBanners = [{ id: 1, title: 'Banner 1' }];
      SettingService.getAllBanners.mockResolvedValue(mockBanners);

      const response = await request(app).get('/api/admin/cms/banners');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: mockBanners });
    });

    it('should return 500 when retrieval fails', async () => {
      SettingService.getAllBanners.mockRejectedValue(new Error('Retrieval failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const response = await request(app).get('/api/admin/cms/banners');

      expect(response.status).toBe(500);
      consoleSpy.mockRestore();
    });
  });

  describe('addBanner', () => {
    it('should add banner successfully', async () => {
      const bannerData = { title: 'New' };
      const createdBanner = { id: 2, ...bannerData };
      SettingService.addBanner.mockResolvedValue(createdBanner);

      const response = await request(app)
        .post('/api/admin/cms/banners')
        .send(bannerData);

      expect(response.status).toBe(201);
      expect(response.body.data).toEqual(createdBanner);
    });

    it('should return 500 when adding fails', async () => {
      SettingService.addBanner.mockRejectedValue(new Error('Add failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const response = await request(app)
        .post('/api/admin/cms/banners')
        .send({});

      expect(response.status).toBe(500);
      consoleSpy.mockRestore();
    });
  });

  describe('updateBanner', () => {
    it('should update banner successfully', async () => {
      const updatedBanner = { id: 1, title: 'Updated' };
      SettingService.updateBanner.mockResolvedValue(updatedBanner);

      const response = await request(app)
        .put('/api/admin/cms/banners/1')
        .send({ title: 'Updated' });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(updatedBanner);
    });
  });

  describe('deleteBanner', () => {
    it('should delete banner successfully', async () => {
      SettingService.deleteBanner.mockResolvedValue();

      const response = await request(app).delete('/api/admin/cms/banners/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Banner deleted');
    });
  });
});
