const { z } = require('zod');

const paginationSchema = z.object({
  page: z.preprocess((val) => {
    const parsed = parseInt(val);
    return isNaN(parsed) || parsed < 1 ? 1 : parsed;
  }, z.number().int().positive().default(1)),
  limit: z.preprocess((val) => {
    const parsed = parseInt(val);
    if (isNaN(parsed) || parsed < 1) return 10;
    return Math.min(100, parsed);
  }, z.number().int().positive().max(100).default(10)),
});

module.exports = {
  paginationSchema,
};
