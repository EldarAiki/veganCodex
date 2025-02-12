const asyncHandler = require('express-async-handler');

const getSystemStats = asyncHandler(async (req, res) => {
    const stats = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Product.countDocuments({ verified: false }),
      Comment.countDocuments(),
      Comment.countDocuments({ reportCount: { $gt: 0 } }),
      User.aggregate([
        {
          $group: {
            _id: null,
            totalCountries: { $addToSet: "$country" },
            totalProducts: { $sum: { $size: "$products" } }
          }
        },
        {
          $project: {
            totalUniqueCountries: { $size: "$totalCountries" },
            avgProductsPerUser: { 
              $divide: ["$totalProducts", { $size: "$totalCountries" }]
            }
          }
        }
      ])
    ]);
  
    res.json({
      totalUsers: stats[0],
      totalProducts: stats[1],
      unverifiedProducts: stats[2],
      totalComments: stats[3],
      reportedComments: stats[4],
      uniqueCountries: stats[5][0]?.totalUniqueCountries || 0,
      avgProductsPerUser: stats[5][0]?.avgProductsPerUser?.toFixed(1) || 0
    });
  });

module.exports = {
    getSystemStats
};