const {convertTimestampToDate} = require("./convertTimestampToDate");
const {getLocale} = require("../middlewares/setLocale");

exports.adminData = (admin, req) => {
    return {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        profileImg: admin.profileImg == null ? null : `${req.protocol}://${req.get("host")}/uploads/users/${admin.profileImg}`,
        address: admin.address ?? null,
        gender: admin.gender ?? null,
        role: "admin",
        roles: admin.roles,
    }
}

exports.allAdminData = (admins, req) => {
    return admins.map(admin => {
        return {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
            profileImg: admin.profileImg == null ? null : `${req.protocol}://${req.get("host")}/uploads/users/${admin.profileImg}`,
            address: admin.address ?? null,
            gender: admin.gender ?? null,
            roles: admin.roles,
        }
    });
}

exports.allSubscriptionPlansData = (subscriptionPlans, req) => {
    return subscriptionPlans.map(subscriptionPlan => {
        return {
            id: subscriptionPlan._id,
            name: subscriptionPlan.name[getLocale(req)] ?? req.__("undefinedData"),
            description: subscriptionPlan.description[getLocale(req)] ?? req.__("undefinedData"),
            price: subscriptionPlan.price,
            duration: subscriptionPlan.duration,
            coupon: subscriptionPlan.coupon,
        }
    });
}

exports.allSubscriptionPlansDataNoLang = (subscriptionPlans) => {
    return subscriptionPlans.map(subscriptionPlan => {
        return {
            id: subscriptionPlan._id,
            name: subscriptionPlan.name,
            description: subscriptionPlan.description,
            price: subscriptionPlan.price,
            duration: subscriptionPlan.duration,
            coupon: subscriptionPlan.coupon,
        }
    });
}

exports.userData = (user, req) => {
    return {
        id: user._id,
        name: user.name,
        phone: user.phone,
        profileImg: user.profileImg == null ? null : `${req.protocol}://${req.get("host")}/uploads/users/${user.profileImg}`,
        gender: user.gender ?? null,
        accountActive: user.accountActive,
        haveBlock: user.haveBlock,
        address: user.addresses.map(address => {
            return {
                addressId: address._id,
                street: address.street,
                city: address.city,
                buildNumber: address.buildNumber,
                main: address.main,
            }
        }),
        city: user.city == null ? null : {
            id: user.city._id,
            city: user.city.title[getLocale(req)]
        },
        birthday: user.birthday ?? null,
        interestedCategory: user.interestedCategory.map(category => {
            return {
                id: category._id,
                title: category.title[getLocale(req)] ?? req.__("undefinedData"),
                image: `${req.protocol}://${req.get("host")}/uploads/categories/${category.image}`,
            }
        }),
        subscription: {
            subscriptionId: user.subscription._id,
            subscriptionName: user.subscription.name[getLocale(req)] ?? req.__("undefinedData"),
            subscriptionDescription: user.subscription.description[getLocale(req)] ?? req.__("undefinedData"),
            subscriptionPrice: user.subscription.price,
            subscriptionDuration: user.subscription.duration,
            subscriptionCoupon: user.subscription.coupon,
        },
        subscriptionBegan: user.subscriptionBegan == null ? null : convertTimestampToDate(user.subscriptionBegan),
        subscriptionEnd: user.subscriptionEnd == null ? null : convertTimestampToDate(user.subscriptionEnd),
    }
}

exports.allUserData = (users, req) => {
    return users.map(user => {
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            profileImg: user.profileImg == null ? null : `${req.protocol}://${req.get("host")}/uploads/users/${user.profileImg}`,
            gender: user.gender ?? null,
            city: user.city == null ? null : {
                id: user.city._id,
                city: user.city.title[getLocale(req)]
            },
            accountActive: user.accountActive,
        }
    });
}

exports.authorData = (author, req) => {
    return {
        id: author._id,
        name: author.name,
        bio: author.bio,
        phone: author.phone,
        profileImg: author.profileImg == null ? null : `${req.protocol}://${req.get("host")}/uploads/users/${author.profileImg}`,
        gender: author.gender ?? null,
        accountActive: author.accountActive,
        address: author.addresses.map(address => {
            return {
                addressId: address._id,
                street: address.street,
                city: address.city,
                buildNumber: address.buildNumber,
            }
        }),
        birthday: author.birthday ?? null,
        balance: author.balance,
        role: "author",
    }
}

exports.allAuthorData = (authors, req) => {
    return authors.map(author => {
        return {
            id: author._id,
            name: author.name,
            bio: author.bio,
            phone: author.phone,
            profileImg: author.profileImg == null ? null : `${req.protocol}://${req.get("host")}/uploads/users/${author.profileImg}`,
            accountActive: author.accountActive,
            balance: author.balance,
        }
    });
}

// // todo: not update it yet
// exports.bannerData = (banners) => {
//     return banners.map(banner => {
//         return {
//             publicId: banner.public_id,
//             image: banner.secure_url,
//         }
//     });
// }

exports.allCategoryData = (categories, req) => {
    return categories.map(category => {
        return {
            id: category._id,
            title: category.title[getLocale(req)] ?? req.__("undefinedData"),
            image: `${req.protocol}://${req.get("host")}/uploads/categories/${category.image}`,
        }
    });
}

exports.allCategoryDataNoLang = (categories, req) => {
    return categories.map(category => {
        return {
            id: category._id,
            title: category.title,
            image: `${req.protocol}://${req.get("host")}/uploads/categories/${category.image}`,
        }
    });
}

exports.categoryData = (category, req) => {
    return {
        id: category._id,
        title: category.title[getLocale(req)] ?? req.__("undefinedData"),
        image: `${req.protocol}://${req.get("host")}/uploads/categories/${category.image}`,
    }
}

exports.categoryDataNoLang = (category, req) => {
    return {
        id: category._id,
        title: category.title,
        image: `${req.protocol}://${req.get("host")}/uploads/categories/${category.image}`,
    }
}

exports.allProductData = (products, req) => {
    return products.map((product) => {
        let pdfAudioValid = product.pdfAudio.toString() !== 'temp';
        return {
            id: product._id,
            title: product.title[getLocale(req)] ?? req.__("undefinedData"),
            description: product.description[getLocale(req)] ?? req.__("undefinedData"),
            category: product.category.title[getLocale(req)] ?? req.__("undefinedData"),
            categoryImage: `${req.protocol}://${req.get("host")}/uploads/categories/${product.category.image}`,
            coverImage: product.coverImage == null ? null : `${req.protocol}://${req.get("host")}/uploads/products/${product.coverImage}`,
            isAvailablePdf: product.isAvailablePdf,
            isAvailablePaper: product.isAvailablePaper,
            pricePdf: product.pricePdf ?? null,
            pdfAudio : pdfAudioValid ? "true" : "false",
            pricePaper: product.pricePaper ?? null,
            numberOfSalePdf: product.numberOfSalePdf,
            numberOfSalePaper: product.numberOfSalePaper,
            rate: product.rate,
            author: product.author == null ? null : {
                id: product.author._id,
                name: product.author.name,
                bio: product.author.bio,
                profileImg: product.author.profileImg == null ? null : `${req.protocol}://${req.get("host")}/uploads/users/${product.author.profileImg}`,
            },
        }
    });
}

exports.allProductWithWishlistData = (products, wishlistProducts, req) => {
    return products.map((product) => {
        let isPdfHaveAudio = product.pdfAudio.toString() !== "temp";
        return {
            id: product._id,
            title: product.title[getLocale(req)] ?? req.__("undefinedData"),
            description: product.description[getLocale(req)] ?? req.__("undefinedData"),
            category: product.category.title[getLocale(req)] ?? req.__("undefinedData"),
            categoryImage: `${req.protocol}://${req.get("host")}/uploads/categories/${product.category.image}`,
            coverImage: product.coverImage == null ? null : `${req.protocol}://${req.get("host")}/uploads/products/${product.coverImage}`,
            isAvailablePdf: product.isAvailablePdf,
            isAvailablePaper: product.isAvailablePaper,
            pricePdf: product.pricePdf ?? null,
            pricePaper: product.pricePaper ?? null,
            pdfAudio : isPdfHaveAudio ? "true" : "false",
            numberOfSalePdf: product.numberOfSalePdf,
            numberOfSalePaper: product.numberOfSalePaper,
            rate: product.rate,
            wishlist: wishlistProducts.some(item => item._id.toString() === product._id.toString()),
            author: product.author == null ? null : {
                id: product.author._id,
                name: product.author.name,
                bio: product.author.bio,
                profileImg: product.author.profileImg == null ? null : `${req.protocol}://${req.get("host")}/uploads/users/${product.author.profileImg}`,
            },
        }
    });
}

exports.productData = (product, comments, req) => {
    return {
        id: product._id,
        title: product.title[getLocale(req)] ?? req.__("undefinedData"),
        description: product.description[getLocale(req)] ?? req.__("undefinedData"),
        category: product.category.title[getLocale(req)] ?? req.__("undefinedData"),
        categoryImage: `${req.protocol}://${req.get("host")}/uploads/categories/${product.category.image}`,
        coverImage: product.coverImage == null ? null : `${req.protocol}://${req.get("host")}/uploads/products/${product.coverImage}`,
        isAvailablePdf: product.isAvailablePdf,
        pricePdf: product.pricePdf ?? null,
        isAvailablePaper: product.isAvailablePaper,
        pricePaper: product.pricePaper ?? null,
        numberOfSalePdf: product.numberOfSalePdf,
        numberOfSalePaper: product.numberOfSalePaper,
        rate: product.rate,
        comments: comments.map(comment => {
            return {
                comment: comment.comment,
                rate: comment.rate,
                date: comment.date,
                user: {
                    id: comment.user._id,
                    name: comment.user.name,
                    profileImg: comment.user.profileImg == null ? null : `${req.protocol}://${req.get("host")}/uploads/users/${comment.user.profileImg}`,
                }
            }
        }),
        author: product.author == null ? null : {
            id: product.author._id,
            name: product.author.name,
            bio: product.author.bio,
            profileImg: product.author.profileImg == null ? null : `${req.protocol}://${req.get("host")}/uploads/users/${product.author.profileImg}`,
        },
    }
}

exports.productDataNoLang = (product, comments, req) => {
    return {
        id: product._id,
        title: product.title,
        description: product.description,
        category: {
            id: product.category._id,
            title: product.category.title,
            image: `${req.protocol}://${req.get("host")}/uploads/categories/${product.category.image}`,
        },
        coverImage: product.coverImage == null ? null : `${req.protocol}://${req.get("host")}/uploads/products/${product.coverImage}`,
        isAvailablePdf: product.isAvailablePdf,
        pricePdf: product.pricePdf ?? null,
        pdfFile: product.pdfFile == null ? null : `${req.protocol}://${req.get("host")}/uploads/products/pdfs/${product.pdfFile}`,
        isAvailablePaper: product.isAvailablePaper,
        pricePaper: product.pricePaper ?? null,
        stock: product.stock ?? null,
        numberOfSalePdf: product.numberOfSalePdf,
        numberOfSalePaper: product.numberOfSalePaper,
        rate: product.rate,
        comments: comments.map(comment => {
            return {
                comment: comment.comment,
                rate: comment.rate,
                date: comment.date,
                user: {
                    id: comment.user._id,
                    name: comment.user.name,
                    profileImg: comment.user.profileImg == null ? null : `${req.protocol}://${req.get("host")}/uploads/users/${comment.user.profileImg}`,
                }
            }
        }),
        author: product.author == null ? null : {
            id: product.author._id,
            name: product.author.name,
            bio: product.author.bio,
            profileImg: product.author.profileImg == null ? null : `${req.protocol}://${req.get("host")}/uploads/users/${product.author.profileImg}`,
        },
    }
}

exports.productWithWishlistData = (product, comments, wishlist, req) => {
    return {
        id: product._id,
        title: product.title[getLocale(req)] ?? req.__("undefinedData"),
        description: product.description[getLocale(req)] ?? req.__("undefinedData"),
        category: product.category.title[getLocale(req)] ?? req.__("undefinedData"),
        categoryImage: `${req.protocol}://${req.get("host")}/uploads/categories/${product.category.image}`,
        coverImage: product.coverImage == null ? null : `${req.protocol}://${req.get("host")}/uploads/products/${product.coverImage}`,
        isAvailablePdf: product.isAvailablePdf,
        // pdfFile: product.pdfFile == null ? null : `${req.protocol}://${req.get("host")}/uploads/products/pdfs/${product.pdfFile}`,
        pricePdf: product.pricePdf ?? null,
        isAvailablePaper: product.isAvailablePaper,
        pricePaper: product.pricePaper ?? null,
        numberOfSalePdf: product.numberOfSalePdf,
        numberOfSalePaper: product.numberOfSalePaper,
        rate: product.rate,
        wishlist: wishlist,
        comments: comments.map(comment => {
            return {
                comment: comment.comment,
                rate: comment.rate,
                date: comment.date,
                user: {
                    id: comment.user._id,
                    name: comment.user.name,
                    profileImg: comment.user.profileImg == null ? null : `${req.protocol}://${req.get("host")}/uploads/users/${comment.user.profileImg}`,
                }
            }
        }),
        author: product.author == null ? null : {
            id: product.author._id,
            name: product.author.name,
            bio: product.author.bio,
            profileImg: product.author.profileImg == null ? null : `${req.protocol}://${req.get("host")}/uploads/users/${product.author.profileImg}`,
        },
    }
}

exports.cartData = (cart, req) => {
    if (cart)
        return {
            id: cart._id,
            itemCount: cart.cartItems.length,
            totalProductPrice: cart.totalProductPrice,
            shippingPrice: cart.shippingPrice,
            totalCartPrice: cart.totalCartPrice,
            cartItems: cart.cartItems.map(item => {
                return {
                    product: {
                        id: item.product._id,
                        title: item.product.title[getLocale(req)] ?? req.__("undefinedData"),
                        description: item.product.description[getLocale(req)] ?? req.__("undefinedData"),
                        category: item.product.category.title[getLocale(req)] ?? req.__("undefinedData"),
                        categoryImage: `${req.protocol}://${req.get("host")}/uploads/categories/${item.product.category.image}`,
                        coverImage: item.product.coverImage == null ? null : `${req.protocol}://${req.get("host")}/uploads/products/${item.product.coverImage}`,
                        isAvailablePdf: item.product.isAvailablePdf,
                        isAvailablePaper: item.product.isAvailablePaper,
                        pricePdf: item.product.pricePdf ?? null,
                        pricePaper: item.product.pricePaper ?? null,
                        rate: item.product.rate,
                        author: item.product.author == null ? null : {
                            id: item.product.author._id,
                            name: item.product.author.name,
                            bio: item.product.author.bio,
                            profileImg: item.product.author.profileImg == null ? null : `${req.protocol}://${req.get("host")}/uploads/users/${item.product.author.profileImg}`,
                        },
                    },
                    price: item.price,
                    isAvailablePdf: item.isAvailablePdf,
                    isAvailablePaper: item.isAvailablePaper,
                };
            }),
        }
    else
        return null;
}

exports.orderData = (order, req) => {
    return {
        id: order._id,
        orderDate: convertTimestampToDate(order.createdAt),
        user: {
            id: order.user._id,
            name: order.user.name,
            phone: order.user.phone,
            profileImg: order.user.profileImg == null ? null : `${req.protocol}://${req.get("host")}/uploads/users/${order.user.profileImg}`,
        },
        shippingAddress: {
            street: order.shippingAddress.street,
            city: order.shippingAddress.city,
            buildNumber: order.shippingAddress.buildNumber,
        },
        cartItems: order.cartItems.map(item => {
            return {
                product: {
                    id: item.product._id,
                    title: item.product.title[getLocale(req)] ?? req.__("undefinedData"),
                    description: item.product.description[getLocale(req)] ?? req.__("undefinedData"),
                    category: item.product.category.title[getLocale(req)] ?? req.__("undefinedData"),
                    categoryImage: `${req.protocol}://${req.get("host")}/uploads/categories/${item.product.category.image}`,
                    coverImage: item.product.coverImage == null ? null : `${req.protocol}://${req.get("host")}/uploads/products/${item.product.coverImage}`,
                    pdfFile: item.product.pdfFile == null ? null : `${req.protocol}://${req.get("host")}/uploads/products/pdfs/${item.product.pdfFile}`,
                    isAvailablePdf: item.product.isAvailablePdf,
                    isAvailablePaper: item.product.isAvailablePaper,
                    pricePdf: item.product.pricePdf ?? null,
                    pricePaper: item.product.pricePaper ?? null,
                    rate: item.product.rate,
                    author: item.product.author == null ? null : {
                        id: item.product.author._id,
                        name: item.product.author.name,
                        bio: item.product.author.bio,
                        profileImg: item.product.author.profileImg == null ? null : `${req.protocol}://${req.get("host")}/uploads/users/${item.product.author.profileImg}`,
                    },
                },
                price: item.price,
                isAvailablePdf: item.isAvailablePdf,
                isAvailablePaper: item.isAvailablePaper,
            };
        }),
        totalProductPrice: order.totalProductPrice,
        shippingPrice: order.shippingPrice,
        totalPrice: order.totalOrderPrice,
        currency: order.currency,
        paymentMethodType: order.paymentMethodType,
        isPaid: order.isPaid,
        paidAt: order.paidAt ?? null,
        isDelivered: order.isDelivered,
        deliveredAt: order.deliveredAt ?? null,
        orderState: order.orderState,
    }
}

exports.myAllOrderData = (orders, req, userData) => {
    return orders.map(order => {
        if (order?.orderState !== 'completed') {
            return {};
        }

        const UserShippingDetails = userData["addresses"]?.find(address => address?._id?.toString() === order?.shippingAddress?._id?.toString()) || {};
        return {
            id: order?._id ?? null,
            orderDate: convertTimestampToDate(order?.createdAt) ?? "N/A",
            user: {
                id: order?.user?._id ?? null,
                name: order?.user?.name ?? "Unknown",
                phone: order?.user?.phone ?? "Unknown",
                profileImg: order?.user?.profileImg == null ? null : `${req.protocol}://${req.get("host")}/uploads/users/${order.user.profileImg}`,
            },
            shippingAddress: {
                street: UserShippingDetails?.street ?? "empty",
                city: UserShippingDetails?.city ?? "empty",
                buildNumber: UserShippingDetails?.buildNumber ?? "empty",
            },
            cartItems: order?.cartItems?.map(item => {
                const showPDF = order?.isPaid && item?.product?.isAvailablePdf && order?.orderState === 'completed' && req.query.isDelivered && req.query.isPaid && req.query.orderState;
                return {
                    product: {
                        id: item?.product?._id ?? null,
                        title: item?.product?.title?.[getLocale(req)] ?? req.__("undefinedData"),
                        description: item?.product?.description?.[getLocale(req)] ?? req.__("undefinedData"),
                        category: item?.product?.category?.title?.[getLocale(req)] ?? req.__("undefinedData"),
                        categoryImage: item?.product?.category?.image == null ? null : `${req.protocol}://${req.get("host")}/uploads/categories/${item.product.category.image}`,
                        coverImage: item?.product?.coverImage == null ? null : `${req.protocol}://${req.get("host")}/uploads/products/${item.product.coverImage}`,
                        pdfFile: showPDF ? (item?.product?.pdfFile == null ? null : `${req.protocol}://${req.get("host")}/uploads/products/pdfs/${item.product.pdfFile}`) : undefined,
                        pdfAudio: showPDF ? (item?.product?.pdfAudio === 'temp' ? null : `${req.protocol}://${req.get("host")}/uploads/products/audio/${item.product.pdfAudio}`) : undefined,
                        isAvailablePdf: item?.product?.isAvailablePdf ?? false,
                        isAvailablePaper: item?.product?.isAvailablePaper ?? false,
                        pricePdf: item?.product?.pricePdf ?? null,
                        pricePaper: item?.product?.pricePaper ?? null,
                        rate: item?.product?.rate ?? 0,
                        author: item?.product?.author == null ? null : {
                            id: item?.product?.author?._id ?? null,
                            name: item?.product?.author?.name ?? "Unknown",
                            bio: item?.product?.author?.bio ?? "No bio available",
                            profileImg: item?.product?.author?.profileImg == null ? null : `${req.protocol}://${req.get("host")}/uploads/users/${item.product.author.profileImg}`,
                        },
                    },
                    price: item?.price ?? 0,
                    isAvailablePdf: item?.isAvailablePdf ?? false,
                    isAvailablePaper: item?.isAvailablePaper ?? false,
                };
            }) ?? [],
            totalProductPrice: order?.totalProductPrice ?? 0,
            shippingPrice: order?.shippingPrice ?? 0,
            totalPrice: order?.totalOrderPrice ?? 0,
            currency: order?.currency ?? "USD",
            paymentMethodType: order?.paymentMethodType ?? "Unknown",
            isPaid: order?.isPaid ?? false,
            paidAt: order?.paidAt ?? null,
            isDelivered: order?.isDelivered ?? false,
            deliveredAt: order?.deliveredAt ?? null,
            orderState: order?.orderState ?? "Unknown",
        };
    });
};
exports.myOrderData = (order, req) => {
    return {
        id: order._id,
        orderDate: convertTimestampToDate(order.createdAt),
        user: {
            id: order.user._id,
            name: order.user.name,
            phone: order.user.phone,
            profileImg: order.user.profileImg == null ? null : `${req.protocol}://${req.get("host")}/uploads/users/${order.user.profileImg}`,
        },
        shippingAddress: {
            street: order.shippingAddress.street,
            city: order.shippingAddress.city,
            buildNumber: order.shippingAddress.buildNumber,
        },
        cartItems: order.cartItems.map(item => {
            const showPDF = order.orderState === 'completed';
            if(!showPDF) return {product}
            return {
                product: {
                    id: item.product._id,
                    title: item.product.title[getLocale(req)] ?? req.__("undefinedData"),
                    description: item.product.description[getLocale(req)] ?? req.__("undefinedData"),
                    category: item.product.category.title[getLocale(req)] ?? req.__("undefinedData"),
                    categoryImage: `${req.protocol}://${req.get("host")}/uploads/categories/${item.product.category.image}`,
                    coverImage: item.product.coverImage == null ? null : `${req.protocol}://${req.get("host")}/uploads/products/${item.product.coverImage}`,
                    pdfFile: showPDF ? item.product.pdfFile == null ? null : `${req.protocol}://${req.get("host")}/uploads/products/pdfs/${item.product.pdfFile}` : undefined,
                    isAvailablePdf: item.product.isAvailablePdf,
                    isAvailablePaper: item.product.isAvailablePaper,
                    pricePdf: item.product.pricePdf ?? null,
                    pricePaper: item.product.pricePaper ?? null,
                    rate: item.product.rate,
                    wishlist: item.product.wishlist,
                    comments: item.product.comments.map(comment => {
                        return {
                            comment: comment.comment,
                            rate: comment.rate,
                            date: comment.date,
                            user: {
                                id: comment.user._id,
                                name: comment.user.name,
                                profileImg: comment.user.profileImg == null ? null : `${req.protocol}://${req.get("host")}/uploads/users/${comment.user.profileImg}`,
                            }
                        }
                    }),
                    author: item.product.author == null ? null : {
                        id: item.product.author._id,
                        name: item.product.author.name,
                        bio: item.product.author.bio,
                        profileImg: item.product.author.profileImg == null ? null : `${req.protocol}://${req.get("host")}/uploads/users/${item.product.author.profileImg}`,
                    },
                },
                price: item.price,
                isAvailablePdf: item.isAvailablePdf,
                isAvailablePaper: item.isAvailablePaper,
            };
        }),
        totalProductPrice: order.totalProductPrice,
        shippingPrice: order.shippingPrice,
        totalPrice: order.totalOrderPrice,
        currency: order.currency,
        paymentMethodType: order.paymentMethodType,
        isPaid: order.isPaid,
        paidAt: order.paidAt ?? null,
        isDelivered: order.isDelivered,
        deliveredAt: order.deliveredAt ?? null,
        orderState: order.orderState,
    };
}

exports.allOrderData = (orders, req) => {
    return orders.map(order => {
        return {
            id: order._id,
            orderDate: convertTimestampToDate(order.createdAt),
            user: {
                id: order.user?._id ?? null,
                name: order.user?.name ?? null,
                phone: order.user?.phone ?? null,
                profileImg: order.user?.profileImg 
                    ? `${req.protocol}://${req.get("host")}/uploads/users/${order.user.profileImg}` 
                    : null,
            },
            shippingAddress: {
                street: order.shippingAddress?.street ?? null,
                city: order.shippingAddress?.city ?? null,
                buildNumber: order.shippingAddress?.buildNumber ?? null,
            },
            cartItems: order.cartItems?.map(item => {
                return {
                    product: {
                        id: item.product?._id ?? null,
                        title: item.product?.title?.[getLocale(req)] ?? req.__("undefinedData"),
                        description: item.product?.description?.[getLocale(req)] ?? req.__("undefinedData"),
                        category: item.product?.category?.title?.[getLocale(req)] ?? req.__("undefinedData"),
                        categoryImage: item.product?.category?.image
                            ? `${req.protocol}://${req.get("host")}/uploads/categories/${item.product.category.image}`
                            : null,
                        coverImage: item.product?.coverImage 
                            ? `${req.protocol}://${req.get("host")}/uploads/products/${item.product.coverImage}` 
                            : null,
                        isAvailablePdf: item.product?.isAvailablePdf ?? false,
                        isAvailablePaper: item.product?.isAvailablePaper ?? false,
                        pricePdf: item.product?.pricePdf ?? null,
                        pricePaper: item.product?.pricePaper ?? null,
                        rate: item.product?.rate ?? null,
                        author: item.product?.author 
                            ? {
                                id: item.product.author._id ?? null,
                                name: item.product.author.name ?? null,
                                bio: item.product.author.bio ?? null,
                                profileImg: item.product.author.profileImg 
                                    ? `${req.protocol}://${req.get("host")}/uploads/users/${item.product.author.profileImg}` 
                                    : null,
                            } 
                            : null,
                    },
                    price: item.price ?? 0,
                    isAvailablePdf: item.isAvailablePdf ?? false,
                    isAvailablePaper: item.isAvailablePaper ?? false,
                };
            }) ?? [],
            totalProductPrice: order.totalProductPrice ?? 0,
            shippingPrice: order.shippingPrice ?? 0,
            totalPrice: order.totalOrderPrice ?? 0,
            currency: order.currency ?? "USD",
            paymentMethodType: order.paymentMethodType ?? null,
            isPaid: order.isPaid ?? false,
            paidAt: order.paidAt ?? null,
            isDelivered: order.isDelivered ?? false,
            deliveredAt: order.deliveredAt ?? null,
            orderState: order.orderState ?? null,
        }
    });
};

exports.allRequestBooksData = (requestBooks, req) => {
    return requestBooks.map(requestBook => {
        return {
            id: requestBook._id,
            title: requestBook.title,
            author: requestBook.author,
            publisher: requestBook.publisher,
            DateOfPublication: requestBook.DateOfPublication,
            image: requestBook.image == null ? null : `${req.protocol}://${req.get("host")}/uploads/requestBook/${requestBook.image}`,
            user: {
                id: requestBook.user._id,
                name: requestBook.user.name,
                phone: requestBook.user.phone,
                profileImg: requestBook.user.profileImg == null ? null : `${req.protocol}://${req.get("host")}/uploads/users/${requestBook.user.profileImg}`,
            }
        }
    });
}

exports.allAuthorFormData = (authors, req) => {
    return authors.map(author => {
        return {
            id: author._id,
            name: author.name,
            bio: author.bio,
            phone: author.phone,
            birthday: author.birthday,
            gender: author.gender,
            profileImg: author.profileImg == null ? null : `${req.protocol}://${req.get("host")}/uploads/users/authorForm/${author.profileImg}`,
        }
    });
}

exports.allNotificationsData = (notifications) => {
    return notifications.map(notification => {
        return {
            id: notification._id,
            title: notification.title,
            content: notification.content,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
        }
    });
}

exports.privacyPolicyData = (privacyPolicy, req) => {
    return req.query.dashboard ? privacyPolicy : privacyPolicy[getLocale(req)] ?? req.__("undefinedData");
}

exports.termsAndConditionsData = (termsAndConditions, req) => {
    return req.query.dashboard ? termsAndConditions : termsAndConditions[getLocale(req)] ?? req.__("undefinedData");
}

exports.aboutUsData = (aboutUs, req) => {
    return {
        title: req.query.dashboard ? aboutUs.title : aboutUs.title[getLocale(req)] ?? req.__("undefinedData"),
        description: req.query.dashboard ? aboutUs.description : aboutUs.description[getLocale(req)] ?? req.__("undefinedData"),
        footerDescription: req.query.dashboard ? aboutUs.footerDescription : aboutUs.footerDescription[getLocale(req)] ?? req.__("undefinedData"),
        location: aboutUs.location,
        workDate: aboutUs.workDate,
        linkVideo: aboutUs.linkVideo,
        email: aboutUs.email,
        phone: aboutUs.phone,
    }
}

exports.cityData = (cities, req) => {
    console.log(cities)
    return cities.map((city) => {
        return {
            id: city._id,
            title: req.query.dashboard ? city.title : city.title[getLocale(req)] ?? req.__("undefinedData"),
        }
    });
}

exports.homeBannerData = (homeBanner, req) => {
    return {
        title: req.query.dashboard ? homeBanner.title : homeBanner.title[getLocale(req)] ?? req.__("undefinedData"),
        image: `${req.protocol}://${req.get("host")}/uploads/app/${homeBanner.image}`,
    }
}

exports.featureItemsData = (featureItems, req) => {
    return featureItems.map((featureItem) => {
        return {
            id: featureItem._id,
            title: req.query.dashboard ? featureItem.title : featureItem.title[getLocale(req)] ?? req.__("undefinedData"),
            subTitle: req.query.dashboard ? featureItem.subTitle : featureItem.subTitle[getLocale(req)] ?? req.__("undefinedData"),
            image: `${req.protocol}://${req.get("host")}/uploads/app/${featureItem.image}`,
        }
    });
}