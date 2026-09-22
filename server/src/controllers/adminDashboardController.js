import Category from "../models/Category.js";
import Enquiry from "../models/Enquiry.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getStartOfToday = () => {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  return date;
};

const getMonthlyStartDate = () => {
  const date = new Date();

  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  date.setMonth(date.getMonth() - 5);

  return date;
};

const buildMonthlySales = (salesData) => {
  const salesMap = new Map(
    salesData.map((item) => [
      `${item._id.year}-${item._id.month}`,
      {
        revenue: item.revenue,
        orders: item.orders,
      },
    ]),
  );

  const monthlySales = [];
  const currentDate = new Date();

  for (let offset = 5; offset >= 0; offset -= 1) {
    const monthDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - offset,
      1,
    );

    const year = monthDate.getFullYear();
    const month = monthDate.getMonth() + 1;

    const key = `${year}-${month}`;
    const sales = salesMap.get(key);

    monthlySales.push({
      year,
      month,

      label: monthDate.toLocaleDateString("en-IN", {
        month: "short",
      }),

      revenue: sales?.revenue || 0,
      orders: sales?.orders || 0,
    });
  }

  return monthlySales;
};

/*
|--------------------------------------------------------------------------
| Get admin dashboard
|--------------------------------------------------------------------------
| GET /api/v1/admin/dashboard
| Admin only
|--------------------------------------------------------------------------
*/

export const getAdminDashboard = asyncHandler(async (req, res) => {
  const todayStart = getStartOfToday();
  const monthlyStart = getMonthlyStartDate();

  const paidOrderFilter = {
    paymentStatus: "paid",

    orderStatus: {
      $nin: ["cancelled", "returned"],
    },
  };

  const [
    totalProducts,
    activeProducts,
    draftProducts,
    outOfStockProducts,
    lowStockProducts,
    totalCategories,
    activeCategories,
    totalOrders,
    todayOrders,
    pendingOrders,
    paidOrders,
    revenueResult,
    orderStatusSummary,
    paymentMethodSummary,
    totalEnquiries,
    newEnquiries,
    quotedEnquiries,
    recentOrders,
    recentEnquiries,
    lowStockItems,
    monthlySalesResult,
  ] = await Promise.all([
    Product.countDocuments(),

    Product.countDocuments({
      status: "active",
    }),

    Product.countDocuments({
      status: "draft",
    }),

    Product.countDocuments({
      status: "active",
      trackInventory: true,
      stock: {
        $lte: 0,
      },
    }),

    Product.countDocuments({
      status: "active",
      trackInventory: true,
      stock: {
        $gt: 0,
      },

      $expr: {
        $lte: ["$stock", "$lowStockThreshold"],
      },
    }),

    Category.countDocuments(),

    Category.countDocuments({
      isActive: true,
    }),

    Order.countDocuments(),

    Order.countDocuments({
      createdAt: {
        $gte: todayStart,
      },
    }),

    Order.countDocuments({
      orderStatus: {
        $in: ["placed", "confirmed", "processing"],
      },
    }),

    Order.countDocuments(paidOrderFilter),

    Order.aggregate([
      {
        $match: paidOrderFilter,
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$pricing.total",
          },
          averageOrderValue: {
            $avg: "$pricing.total",
          },
        },
      },
    ]),

    Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]),

    Order.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          count: {
            $sum: 1,
          },
          revenue: {
            $sum: {
              $cond: [
                {
                  $eq: ["$paymentStatus", "paid"],
                },
                "$pricing.total",
                0,
              ],
            },
          },
        },
      },
    ]),

    Enquiry.countDocuments(),

    Enquiry.countDocuments({
      status: "new",
    }),

    Enquiry.countDocuments({
      status: "quoted",
    }),

    Order.find()
      .sort({
        createdAt: -1,
      })
      .limit(6)
      .select(
        [
          "orderNumber",
          "customer.name",
          "customer.email",
          "customer.phone",
          "pricing.total",
          "paymentMethod",
          "paymentStatus",
          "orderStatus",
          "createdAt",
        ].join(" "),
      )
      .lean(),

    Enquiry.find()
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .select(
        [
          "enquiryNumber",
          "customer.name",
          "carvingType",
          "status",
          "quotedAmount",
          "createdAt",
        ].join(" "),
      )
      .lean(),

    Product.find({
      status: "active",
      trackInventory: true,

      $expr: {
        $lte: ["$stock", "$lowStockThreshold"],
      },
    })
      .sort({
        stock: 1,
      })
      .limit(6)
      .select(
        ["name", "slug", "sku", "stock", "lowStockThreshold", "images"].join(
          " ",
        ),
      )
      .lean(),

    Order.aggregate([
      {
        $match: {
          ...paidOrderFilter,

          createdAt: {
            $gte: monthlyStart,
          },
        },
      },
      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },

            month: {
              $month: "$createdAt",
            },
          },

          revenue: {
            $sum: "$pricing.total",
          },

          orders: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]),
  ]);

  const revenue = revenueResult[0] || {
    totalRevenue: 0,
    averageOrderValue: 0,
  };

  const orderStatuses = orderStatusSummary.reduce((summary, item) => {
    summary[item._id] = item.count;

    return summary;
  }, {});

  const paymentMethods = paymentMethodSummary.reduce((summary, item) => {
    summary[item._id] = {
      orders: item.count,
      revenue: item.revenue,
    };

    return summary;
  }, {});

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        overview: {
          totalRevenue: revenue.totalRevenue || 0,

          averageOrderValue: revenue.averageOrderValue || 0,

          totalOrders,
          todayOrders,
          pendingOrders,
          paidOrders,

          totalProducts,
          activeProducts,
          draftProducts,
          lowStockProducts,
          outOfStockProducts,

          totalCategories,
          activeCategories,

          totalEnquiries,
          newEnquiries,
          quotedEnquiries,
        },

        orderStatuses,
        paymentMethods,

        monthlySales: buildMonthlySales(monthlySalesResult),

        recentOrders,
        recentEnquiries,
        lowStockItems,
      },
      "Admin dashboard fetched successfully",
    ),
  );
});
