# TIENDA-INTELIGENTE

GINGER/
│
├── node_modules/
│
├── public/
│   │
│   ├── index.html
│   │
│   ├── locales/
│   │
│   ├── css/
│   │   │
│   │   ├── animations/
|   |   |   └── animations.css
│   │   │
│   │   ├── base/
|   |   |   ├── reset.css
|   |   |   ├── utilities.css
|   |   |   └── variables.css
│   │   │
│   │   ├── components/
|   |   |   ├── preloader.css
|   |   |   ├── modals.css
|   |   |   ├── buttons.css
|   |   |   ├── cards.css
|   |   |   ├── navbar.css
|   |   |   └── notifications.css
│   │   │
│   │   ├── layouts/
|   |   |   └── main/layout.css
│   │   │
│   │   ├── pages/
|   |   |   ├── admin/
|   |   |   │   ├── admin.css
|   |   |   ├── auth.css
|   |   |   ├── benefits.css
|   |   |   ├── blog.css
|   |   |   ├── cart.css
|   |   |   ├── home.css
|   |   |   ├── checkout.css
|   |   |   ├── orders.css
|   |   |   ├── profile.css
|   |   |   ├── shop.css
|   |   |   ├── orders.css
|   |   |   └── orderTracking.css
│   │   │
│   │   ├── themes/
│   │   │
│   │   ├── responsive/
│   │   │
│   │   └── main.css
│   │
│   └── assets/
│       ├── images/
│       │   ├── products/
│       │   ├── banners/
│       │   └── icons/
│       └── fonts/
│
├── src/
│   │
│   ├── frontend/
│   │   │
│   │   ├── app.js
│   │   ├── authGuard.js
│   │   ├── config.js
│   │   ├── router.js
│   │   ├── store.js
│   │   │
│   │   ├── modules/
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── blog/
│   │   │   │   │   ├── adminBlog.js
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── adminDashboard.js
│   │   │   │   ├── orders/
│   │   │   │   │   ├── adminOrders.js
│   │   │   │   ├── products/
│   │   │   │   │   ├── adminProducts.js
│   │   │   │   ├── banners/
│   │   │   │   ├── reports/
│   │   │   │   └── users/
│   │   │   │       ├── adminUsers.js
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── login.js
│   │   │   │   ├── register.js
│   │   │   │
│   │   │   ├── benefits/
│   │   │   │   ├── beneficios.js
│   │   │   │
│   │   │   ├── blog/
│   │   │   │   ├── blog.js
│   │   │   │
│   │   │   ├── cart/
│   │   │   │   ├── core/
│   │   │   │   ├── modals/
│   │   │   │   └── cart.js
│   │   │   │
│   │   │   ├── checkout/
│   │   │   │   ├── core/
│   │   │   │   ├── payment/
│   │   │   │   ├── validation/
│   │   │   │   └── checkout.js
│   │   │   │
│   │   │   ├── errors/
│   │   │   │   ├── notFound.js
│   │   │   │
│   │   │   ├── home/
│   │   │   │   ├── home.js
│   │   │   │
│   │   │   ├── products/
│   │   │   │   ├── core/
│   │   │   │   ├── filters/
│   │   │   │   └── modals/
│   │   │   │
│   │   │   ├── inventory/
│   │   │   │   ├── core/
│   │   │   │   ├── alerts/
│   │   │   │   └── reports/
│   │   │   │
│   │   │   ├── navbar/
│   │   │   │   ├── navbar.js
│   │   │   │
│   │   │   ├── notifications/
│   │   │   │   ├── notifications.js
│   │   │   │
│   │   │   ├── orders/
│   │   │   │   ├── core/
│   │   │   │   ├── tracking/
│   │   │   │   │   └── orderTracking.js
│   │   │   │   ├── history/
│   │   │   │   └── orders.js
│   │   │   │
│   │   │   ├── products/
│   │   │   │   ├── core/
│   │   │   │   ├── filters/
│   │   │   │   ├── productDetail.js
│   │   │   │   └── shop.js
│   │   │   │
│   │   │   ├── promotions/
│   │   │   │   ├── core/
│   │   │   │   ├── coupons/
│   │   │   │   └── offers/
│   │   │   │
│   │   │   ├── recommendations/
│   │   │   │   ├── core/
│   │   │   │   └── ai/
│   │   │   │
│   │   │   ├── suscripcion/
│   │   │   │   ├── suscripcion.js
│   │   │   │
│   │   │   └── users/
│   │   │       ├── profile/
│   │   │       │   ├── profile.js
│   │   │       ├── addresses/
│   │   │       └── preferences/
│   │   │
│   │   ├── services/
│   │   │   ├── api/
│   │   │   ├── websocket/
│   │   │   └── storage/
│   │   │
│   │   ├── utils/
│   │   │
│   │   ├── hooks/
│   │   │
│   │   └── components/
│   │       ├── common/
│   │       ├── forms/
│   │       └── layout/
│   │
│   └── backend/
│       │
│       ├── config/
│       │
│       ├── controllers/
│       │   ├── uploadController.js
│       │   ├── auth/
│       │   │   ├── authController.js
│       │   ├── products/
│       │   │   ├── productController.js
│       │   ├── blog/
│       │   │   ├── postController.js
│       │   ├── orders/
│       │   │   ├── ordersController.js
│       │   ├── cart/
│       │   ├── inventory/
│       │   ├── users/
│       │   ├── promotions/
│       │   ├── payments/
│       │   ├── recommendations/
│       │   └── admin/
│       │
│       ├── middleware/
│       │   ├── auth.js
│       │
│       ├── models/
│       │   ├── Product.js
│       │   ├── Post.js
│       │   ├── User.js
│       │   ├── Order.js
│       │
│       ├── services/
│       │   ├── payment/
│       │   ├── email/
│       │   ├──   ├── emailService.js
│       │   ├──   ├── emailServiceBrevo.js
│       │   ├── inventory/
│       │   └── recommendation/
│       │
│       └── routes/
│           ├── authRoutes.js
│           ├── api/
│           │   ├── adminRoutes.js
│           │   ├── blogRoutes.js
│           │   ├── productRoutes.js
│           │   ├── geocodeRoutes.js
│           │   ├── orderRoutes.js
│           │   ├── userRoutes.js
│           └── webhooks/
│
├── server.js
├── package.json
├── .env
└── README.md