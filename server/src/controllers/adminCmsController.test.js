const adminCmsController = require('./adminCmsController');
const SettingService = require('../services/SettingService');

jest.mock('../services/SettingService');

describe('adminCmsController.deleteBanner', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { id: '1' },
      user: { username: 'testadmin' }
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();

    // Silence console logs during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  it('should delete a banner successfully', async () => {
    SettingService.deleteBanner.mockResolvedValue();

    await adminCmsController.deleteBanner(req, res);

    expect(SettingService.deleteBanner).toHaveBeenCalledWith('1');
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Banner deleted' });
  });

  it('should return 500 if SettingService.deleteBanner fails', async () => {
    const errorMessage = 'Database error';
    SettingService.deleteBanner.mockRejectedValue(new Error(errorMessage));

    await adminCmsController.deleteBanner(req, res);

    expect(SettingService.deleteBanner).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: errorMessage });
  });
});
