const asyncHandler = require("../middlewares/asyncHandler");
const {allOrderData, cityData} = require("../utils/responseModelData");
const apiSuccess = require("../utils/apiSuccess");
const ApiFeatures = require("../utils/apiFeatures");
const CategoryModel = require("../models/categoryModel");
const ProductModel = require("../models/productModel");
const UserModel = require("../models/userModel");
const AuthorModel = require("../models/authorModel");
const AdminModel = require("../models/adminModel");
const OrderModel = require("../models/orderModel");
const AppControlModel = require("../models/appControlModel");
const {getLocale} = require("../middlewares/setLocale");


exports.getAnalysisDashboard = asyncHandler(async (req, res, next) => {
    const {startAt, endAt} = req.body;

    let dateFilter = {};
    if (startAt && endAt) {
        dateFilter = {createdAt: {$gte: `${startAt}T00:00:00Z`, $lte: `${endAt}T23:59:59Z`}};
    }

    const [categoriesCount, productsCount, usersCount, authorsCount, adminsCount, ordersCount] = await Promise.all([
        CategoryModel.countDocuments(dateFilter),
        ProductModel.countDocuments(dateFilter),
        UserModel.countDocuments(dateFilter),
        AuthorModel.countDocuments(dateFilter),
        AdminModel.countDocuments(dateFilter),
        OrderModel.countDocuments(dateFilter)
    ]);

    const apiFeatures = new ApiFeatures(OrderModel.find(dateFilter), req.query).paginate(ordersCount);


    const {paginationResult, mongooseQuery} = apiFeatures;
    let orders = await mongooseQuery;

    orders = await Promise.all(
        orders.map(async (order) => {
            const user = await UserModel.findById(order.user);
            if (user) {
                const address = user["addresses"].find((addr) =>
                    addr._id.equals(order.shippingAddress)
                );
                order = order.toObject();
                order.shippingAddress = address;
            }
            return order;
        })
    );

    return res.status(200).json(
        apiSuccess(
            'analysis',
            200,
            {
                categoriesCount,
                productsCount,
                usersCount,
                authorsCount,
                adminsCount,
                orders: {
                    ordersCount,
                    pagination: paginationResult,
                    orders: allOrderData(orders, req),
                }
            },
        ));
});

exports.getDiagramsProducts = asyncHandler(async (req, res, next) => {
    const currentDate = new Date(); // Today's date
    const tenMonthsAgo = new Date();
    tenMonthsAgo.setMonth(currentDate.getMonth() - 9); // Start 10 months ago

    // Generate the last 10 months
    const months = [];
    for (let d = new Date(tenMonthsAgo); d <= currentDate; d.setMonth(d.getMonth() + 1)) {
        months.push({
            month: d.toISOString().substring(0, 7), // Format YYYY-MM
            numberOfSalePdf: 0,
            numberOfSalePaper: 0,
        });
    }

    // Perform aggregation for product sales
    const salesAnalysis = await ProductModel.aggregate([
        {
            // Filter products updated in the last 10 months
            $match: {
                updatedAt: { $gte: tenMonthsAgo, $lte: currentDate },
            },
        },
        {
            // Add a field for month and year
            $addFields: {
                yearMonth: {
                    $dateToString: { format: "%Y-%m", date: "$updatedAt" },
                },
            },
        },
        {
            // Group by month
            $group: {
                _id: "$yearMonth",
                numberOfSalePdf: { $sum: "$numberOfSalePdf" },
                numberOfSalePaper: { $sum: "$numberOfSalePaper" },
            },
        },
        {
            // Transform data into the desired format
            $project: {
                month: "$_id",
                _id: 0,
                numberOfSalePdf: 1,
                numberOfSalePaper: 1,
            },
        },
    ]);

    // Merge months with aggregated data
    const lastTenMonthsAnalysis = months.map((monthData) => {
        const matchingMonth = salesAnalysis.find(
            (sale) => sale.month === monthData.month
        );
        return matchingMonth || monthData; // Use aggregated data if available, otherwise default data
    });

    // Fetch cities from appControl
    const appControl = await AppControlModel.findOne(
        { app: "khezanatalkutub" },
        "cities"
    );

    // Perform aggregation for top cities
    const topCities = await UserModel.aggregate([
        { $match: { city: { $ne: null } } },
        { $group: { _id: "$city", userCount: { $sum: 1 } } },
        { $sort: { userCount: -1 } },
        { $limit: 5 },
    ]);

    // Map top cities with city details from appControl
    const topCitiesMapped = topCities.map((topCity) => {
        const cityDetails = appControl.cities.find(
            (city) => city.id.toString() === topCity._id.toString()
        );
        console.log(cityDetails)
        return {
            cityId: cityDetails?.id || topCity._id,
            cityName: cityDetails?.title[getLocale(req)] ?? req.__("undefinedData"),
            cityShippingPrice: cityDetails?.shippingPrice,
            userCount: topCity.userCount,
        };
    });

    return res.status(200).json(
        apiSuccess("diagrams", 200, {
            fullYearAnalysis: lastTenMonthsAnalysis,
            topCities: topCitiesMapped,
        })
    );
});
