const adminCmsController = require('../adminCmsController');
const SettingService = require('../../services/SettingService');

jest.mock('../../services/SettingService');

describe('adminCmsController.addBanner', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        title: 'New Banner',
        imageUrl: 'http://example.com/image.jpg',
        linkUrl: 'http://example.com'
      },
      user: {
        username: 'admin'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  it('should add a new banner and return 201', async () => {
    const mockBanner = { id: 1, ...req.body };
    SettingService.addBanner.mockResolvedValue(mockBanner);

    await adminCmsController.addBanner(req, res);

    expect(SettingService.addBanner).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockBanner
    });
  });

  it('should handle errors and return 500', async () => {
    const errorMessage = 'Database error';
    SettingService.addBanner.mockRejectedValue(new Error(errorMessage));

    await adminCmsController.addBanner(req, res);

    expect(SettingService.addBanner).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: errorMessage
    });
  });
});
