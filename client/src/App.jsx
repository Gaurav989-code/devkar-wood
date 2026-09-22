import { Navigate, Route, Routes } from "react-router-dom";

/*
|--------------------------------------------------------------------------
| Storefront layout
|--------------------------------------------------------------------------
*/

import StorefrontLayout from "./components/layouts/StorefrontLayout.jsx";

/*
|--------------------------------------------------------------------------
| Storefront pages
|--------------------------------------------------------------------------
*/

import Home from "./pages/storefront/Home.jsx";
import Collections from "./pages/storefront/Collections.jsx";
import Products from "./pages/storefront/Products.jsx";
import ProductDetails from "./pages/storefront/ProductDetails.jsx";
import Wishlist from "./pages/storefront/Wishlist.jsx";
import Cart from "./pages/storefront/Cart.jsx";
import Checkout from "./pages/storefront/Checkout.jsx";
import OrderSuccess from "./pages/storefront/OrderSuccess.jsx";
import TrackOrder from "./pages/storefront/TrackOrder.jsx";
import MyOrders from "./pages/storefront/MyOrders.jsx";
import About from "./pages/storefront/About.jsx";
import Contact from "./pages/storefront/Contact.jsx";
import TrackEnquiry from "./pages/storefront/TrackEnquiry.jsx";

import NotFound from "./pages/NotFound.jsx";

/*
|--------------------------------------------------------------------------
| Admin route protection and layout
|--------------------------------------------------------------------------
*/

import AdminGuestRoute from "./components/admin/AdminGuestRoute.jsx";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute.jsx";
import AdminLayout from "./components/layouts/AdminLayout.jsx";

/*
|--------------------------------------------------------------------------
| Admin pages
|--------------------------------------------------------------------------
*/

import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminCreateProduct from "./pages/admin/AdminCreateProduct.jsx";
import AdminEditProduct from "./pages/admin/AdminEditProduct.jsx";

import AdminCategories from "./pages/admin/AdminCategories.jsx";

import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails.jsx";

import AdminEnquiries from "./pages/admin/AdminEnquiries.jsx";
import AdminEnquiryDetails from "./pages/admin/AdminEnquiryDetails.jsx";

import AdminSettings from "./pages/admin/AdminSettings.jsx";
import Faq from "./pages/storefront/Faq.jsx";
import CareGuide from "./pages/storefront/CareGuide.jsx";
import ShippingReturns from "./pages/storefront/ShippingReturns.jsx";
import Privacy from "./pages/storefront/Privacy.jsx";
import Terms from "./pages/storefront/Terms.jsx";
import Gallery from "./pages/storefront/Gallery.jsx";

const App = () => {
  return (
    <Routes>
      {/*
      |--------------------------------------------------------------------------
      | Public storefront routes
      |--------------------------------------------------------------------------
      */}

      <Route element={<StorefrontLayout />}>
        <Route index element={<Home />} />

        <Route path="collections" element={<Collections />} />

        <Route path="products" element={<Products />} />

        <Route path="gallery" element={<Gallery />} />

        <Route path="products/:slug" element={<ProductDetails />} />

        <Route path="wishlist" element={<Wishlist />} />

        <Route path="cart" element={<Cart />} />

        <Route path="checkout" element={<Checkout />} />

        <Route path="order-success/:orderNumber" element={<OrderSuccess />} />

        <Route path="track-order" element={<TrackOrder />} />

        <Route path="my-orders" element={<MyOrders />} />

        <Route path="faq" element={<Faq />} />

        <Route path="about" element={<About />} />

        <Route path="care-guide" element={<CareGuide />} />

        <Route path="shipping" element={<ShippingReturns />} />

        <Route path="contact" element={<Contact />} />

        <Route path="track-enquiry" element={<TrackEnquiry />} />

        <Route path="privacy" element={<Privacy />} />

        <Route path="terms" element={<Terms />} />

        <Route path="*" element={<NotFound />} />
      </Route>

      {/*
      |--------------------------------------------------------------------------
      | Logged-out admin route
      |--------------------------------------------------------------------------
      */}

      <Route element={<AdminGuestRoute />}>
        <Route path="/admin/login" element={<AdminLogin />} />
      </Route>

      {/*
      |--------------------------------------------------------------------------
      | Protected admin routes
      |--------------------------------------------------------------------------
      */}

      <Route element={<ProtectedAdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          {/*
          |--------------------------------------------------------------------------
          | Admin index redirect
          |--------------------------------------------------------------------------
          */}

          <Route index element={<Navigate to="dashboard" replace />} />

          {/*
          |--------------------------------------------------------------------------
          | Dashboard
          |--------------------------------------------------------------------------
          */}

          <Route path="dashboard" element={<AdminDashboard />} />

          {/*
          |--------------------------------------------------------------------------
          | Products
          |--------------------------------------------------------------------------
          */}

          <Route path="products" element={<AdminProducts />} />

          <Route path="products/new" element={<AdminCreateProduct />} />

          <Route path="products/:id/edit" element={<AdminEditProduct />} />

          {/*
          |--------------------------------------------------------------------------
          | Categories
          |--------------------------------------------------------------------------
          */}

          <Route path="categories" element={<AdminCategories />} />

          {/*
          |--------------------------------------------------------------------------
          | Orders
          |--------------------------------------------------------------------------
          */}

          <Route path="orders" element={<AdminOrders />} />

          <Route path="orders/:id" element={<AdminOrderDetails />} />

          {/*
          |--------------------------------------------------------------------------
          | Custom-carving enquiries
          |--------------------------------------------------------------------------
          */}

          <Route path="enquiries" element={<AdminEnquiries />} />

          <Route path="enquiries/:id" element={<AdminEnquiryDetails />} />

          {/*
          |--------------------------------------------------------------------------
          | Settings
          |--------------------------------------------------------------------------
          */}

          <Route path="settings" element={<AdminSettings />} />

          {/*
          |--------------------------------------------------------------------------
          | Unknown admin route
          |--------------------------------------------------------------------------
          */}

          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
