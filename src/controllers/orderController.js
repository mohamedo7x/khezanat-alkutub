const EventEmitter = require("events");

const axios = require('axios');

const asyncHandler = require("../middlewares/asyncHandler");
const {orderData, allOrderData, myOrderData, myAllOrderData} = require("../utils/responseModelData");
const {getLocale} = require("../middlewares/setLocale");
const apiSuccess = require("../utils/apiSuccess");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const CartModel = require("../models/cartModel");
const OrderModel = require("../models/orderModel");
const UserModel = require("../models/userModel");
const ProductModel = require("../models/productModel");
const AuthorModel = require("../models/authorModel");
const AppControlModel = require("../models/appControlModel");
const CommentModel = require("../models/commentModel");

const eventEmitter = new EventEmitter();

eventEmitter.on("calculateAuthorBalance", async (data) => {
    for (const productItem of data.products) {
        const product = await ProductModel.findById(productItem.product._id);
        if (!product) {
            throw new Error(`Product not found with id: ${productItem.product}`);
        }

        if (productItem.isAvailablePdf) {
            product.numberOfSalePdf = Number(product.numberOfSalePdf) + 1;
        }

        if (productItem.isAvailablePaper) {
            product.numberOfSalePaper = Number(product.numberOfSalePaper) + 1;

            if (Number(product["stock"]) === 1) {
                product.isAvailablePaper = false;
                product.pricePaper = 0.0;
            }
        }

        await product.save();

        if (product["author"]) {
            const appControl = await AppControlModel.findOne(
                {app: "khezanatalkutub"},
                "author"
            );

            const author = await AuthorModel.findById(product.author._id);

            author.balance +=
                (productItem["price"] * appControl["author"].salesPercentage) / 100;
            await author.save();
        }
    }
});

exports.createCashOrder = asyncHandler(async (req, res, next) => {
    const {cartId} = req.params;

    const cart = await CartModel.findById(cartId);

    const order = await OrderModel.create({
        user: req.loggedUser._id,
        shippingAddress: req.body.shippingAddress,
        cartItems: cart["cartItems"],
        totalProductPrice: cart["totalProductPrice"],
        shippingPrice: cart["shippingPrice"],
        totalOrderPrice: cart["totalCartPrice"],
        currency: "SAR",
    });

    if (!order) {
        return next(new ApiError("something happened when creating order, please try again", 500));
    }

    eventEmitter.emit("calculateAuthorBalance", {products: cart["cartItems"]});

    await CartModel.findByIdAndDelete(cartId);

    order.orderState = "confirmed";
    await order.save();

    await UserModel.findByIdAndUpdate(req.loggedUser._id, {allowUnsubscribe: false});

    return res.status(201).json(
        apiSuccess(
            res.__("successCreateCashOrder"),
            201,
            null,
        )
    );
});

exports.getMyOrders = asyncHandler(async (req, res) => {
    const orderCount = await OrderModel.countDocuments({user: req.loggedUser._id});

    const apiFeatures = new ApiFeatures(
        OrderModel.find({user: req.loggedUser._id}),
        req.query
    ).paginate(orderCount).filter();

    const {paginationResult, mongooseQuery} = apiFeatures;

    let orders = await mongooseQuery;

    const user = await UserModel.findById(req.loggedUser._id);

    orders = await Promise.all(
        orders.map(async (order) => {
            const address = user["addresses"].find((addr) =>
                addr._id.equals(order.shippingAddress)
            );
            order = order.toObject();
            order.shippingAddress = address;

            return order;
        })
    );

    return res.status(200).json(
        apiSuccess(
            res.__("successGetOrders"),
            200,
            {
                pagination: paginationResult,
                orders: myAllOrderData(orders, req),
            }
        ));
});

exports.getUserOrder = asyncHandler(async (req, res) => {
    const {orderId} = req.params;

    // Find the order by ID for the logged-in user
    const order = await OrderModel.findOne({_id: orderId, user: req.loggedUser._id});

    if (!order) {
        return res.status(404).json(apiError(res.__("orderNotFound"), 404));
    }

    // Find the user to get addresses
    const user = await UserModel.findById(req.loggedUser._id);

    if (!user) {
        return res.status(404).json(apiError(res.__("userNotFound"), 404));
    }

    // Enrich shipping address
    const address = user.addresses.find((addr) => addr._id.equals(order.shippingAddress));

    // Enrich cart items with comments
    const enrichedCartItems = await Promise.all(
        order.cartItems.map(async (item) => {
            const productComment = await CommentModel.findOne({product: item.product._id});
            const wishlist = user['wishlist'].some((product) => product._id.toString() === item.product._id);

            return {
                ...item.toObject(),
                product: {
                    ...item.product.toObject(),
                    wishlist: wishlist,
                    comments: productComment ? productComment.comments : [],
                },
            };
        })
    );

    // Return enriched order
    const enrichedOrder = {
        ...order.toObject(),
        shippingAddress: address || null,
        cartItems: enrichedCartItems,
    };

    return res.status(200).json(
        apiSuccess(
            res.__("successGetOrder"),
            200,
            {
                order: myOrderData(enrichedOrder, req),
            },
        )
    );
});

exports.getOrders = asyncHandler(async (req, res) => {
    const orderCount = await OrderModel.countDocuments();

    const apiFeatures = new ApiFeatures(OrderModel.find(), req.query).paginate(orderCount);


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
            res.__("successGetOrders"),
            200,
            {
                pagination: paginationResult,
                orders: allOrderData(orders, req)
            }
        ));
});

exports.getOrder = asyncHandler(async (req, res) => {
    const {orderId} = req.params;

    let order = await OrderModel.findById(orderId);

    const user = await UserModel.findById(order["user"]);

    const address = user["addresses"].find((addr) =>
        addr._id.equals(order.shippingAddress)
    );
    order = order.toObject();
    order.shippingAddress = address;

    return res.status(200).json(
        apiSuccess(
            res.__("successGetOrder"),
            200,
            {order: orderData(order, req)}
        ));
});

exports.updateOrderToPaid = asyncHandler(async (req, res) => {
    const {orderId} = req.params;

    await OrderModel.findOneAndUpdate(
        {_id: orderId},
        {
            isPaid: true,
            paidAt: Date.now(),
        },
        {new: true}
    );

    return res.status(200).json(
        apiSuccess(
            res.__("successUpdateOrderToPaid"),
            200,
            null
        ));
});

exports.updateOrderToDelivered = asyncHandler(async (req, res) => {
    const {orderId} = req.params;

    await OrderModel.findOneAndUpdate(
        {_id: orderId},
        {
            isDelivered: true,
            deliveredAt: Date.now(),
        },
        {new: true}
    );

    return res.status(200).json(
        apiSuccess(
            res.__("successUpdateOrderToDelivered"),
            200,
            null
        ));
});

exports.updateOrderState = asyncHandler(async (req, res) => {
    const {state} = req.body;
    const {orderId} = req.params;

    await OrderModel.findOneAndUpdate(
        {_id: orderId},
        {
            orderState: state,
            isDelivered: state === "completed",
            deliveredAt: state === "completed" ? Date.now() : undefined,
        },
        {new: true}
    );

    return res.status(200).json(
        apiSuccess(
            `${res.__("successUpdateOrderState")} ${state}`,
            200,
            null
        ));
});

exports.getAuthorOrders = asyncHandler(async (req, res) => {
    const authorId = req.loggedUser._id;

    const authorProducts = await ProductModel.find({author: authorId}).select("_id");
    const productIds = authorProducts.map((product) => product._id);

    const filter = {"cartItems.product": {$in: productIds}};
    const orderCount = await OrderModel.countDocuments(filter);
    const apiFeatures = new ApiFeatures(OrderModel.find(filter), req.query).paginate(orderCount);

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
            res.__("successGetOrders"),
            200,
            {
                pagination: paginationResult,
                orders: allOrderData(orders, req)
            }
        ));
});

exports.createCheckout = asyncHandler(async (req, res) => {
    const {cartId} = req.params;

    const cart = await CartModel.findById(cartId);
    const user = await UserModel.findById(req.loggedUser._id);

    const address = user["addresses"].find((addr) =>
        addr._id.equals(req.body.shippingAddress)
    );

    const shippingPriceForItem = cart["shippingPrice"] /  cart.cartItems.length;

    // const InvoiceItems = cart.cartItems.map((item) => {
    //     return {ItemName: item.product.title[getLocale(req)], Quantity: 1, UnitPrice: (item.price + shippingPriceForItem)}
    // });
    const InvoiceItems = cart.cartItems.map((item) => {
        return {ItemName: item.product.title[getLocale(req)], Quantity: 1, UnitPrice: 1}
    });

    // const requestURL = 'https://apitest.myfatoorah.com/v2/SendPayment'; for testing 
    const requestURL = 'https://api-sa.myfatoorah.com/v2/SendPayment'; 
    const requestHeader = {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${process.env.PAYMENT_TOKEN_LIVE}`,
            'Content-Type': 'application/json'
        }
    }
    const requestBody = {
        CustomerName: cart["user"]["name"],
        // InvoiceValue: cart["totalCartPrice"],
        InvoiceValue: 1,
        NotificationOption: 'ALL',
        DisplayCurrencyIso: 'EGP',
        MobileCountryCode: '+20',
        CustomerMobile: cart["user"]["phone"],
        CustomerEmail: cart["user"]["email"] ?? 'test@gmail.com',
        // CallBackUrl: 'https://google.com',
        // ErrorUrl: 'https://youtube.com',
        Language: getLocale(req),
        CustomerCivilId: 12345678,
        CustomerAddress: {
            Street: address.street,
            HouseBuildingNo: address.buildNumber,
            Address: address.city,
        },
        InvoiceItems: InvoiceItems,
    }

    const checkout = await axios.post(requestURL, requestBody, requestHeader);

    return res.status(200).json(
        apiSuccess(
            "Checkout Success",
            200,
            {checkout: checkout.data.Data},
        )
    );
});

exports.orderWebhookCheckout = asyncHandler(async (req, res) => {
    const signature = req.headers['x-myfatoorah-signature']; // Replace with actual header key if different
    const payload = JSON.stringify(req.body);

    // Validate the signature
    const computedSignature = crypto
        .createHmac('sha256', process.env.PAYMENT_TOKEN_LIVE)
        .update(payload)
        .digest('hex');

    if (computedSignature !== signature) {
        console.error('Invalid signature');
        return res.status(401).send('Invalid signature');
    }

    // Process the webhook payload
    const event = req.body;
    console.log('Webhook received:', event);

    console.log(event.EventName)

    // Example: Handle payment success
    if (event.EventName === 'TransactionsStatusChanged') {
        console.log('Payment successful for invoice:', event.Data.InvoiceId);
        // Perform actions like updating order status in the database
        console.log('Payment successful:', event.Data);
    }

    res.status(200).send('Webhook received');
});