import api from "./api.js";

/*
|--------------------------------------------------------------------------
| Get all orders for admin
|--------------------------------------------------------------------------
| GET /api/v1/orders/admin/all
|
| Supported params:
| page
| limit
| search
| orderStatus
| paymentStatus
| paymentMethod
| sort
*/

export const getAdminOrders = async (params = {}) => {
  const response = await api.get("/orders/admin/all", {
    params,
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Get one order
|--------------------------------------------------------------------------
| GET /api/v1/orders/admin/:id
|
| The backend accepts either the MongoDB ID or order number.
*/

export const getAdminOrderById = async (orderId) => {
  const response = await api.get(
    `/orders/admin/${encodeURIComponent(orderId)}`,
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Update order status
|--------------------------------------------------------------------------
| PATCH /api/v1/orders/admin/:id/status
*/

export const updateAdminOrderStatus = async (
  orderId,
  { orderStatus, cancellationReason = "" },
) => {
  const response = await api.patch(`/orders/admin/${orderId}/status`, {
    orderStatus,
    cancellationReason,
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Update tracking information
|--------------------------------------------------------------------------
| PATCH /api/v1/orders/admin/:id/tracking
*/

export const updateAdminOrderTracking = async (
  orderId,
  { courierName, trackingNumber, trackingUrl = "" },
) => {
  const response = await api.patch(`/orders/admin/${orderId}/tracking`, {
    courierName,
    trackingNumber,
    trackingUrl,
  });

  return response.data;
};
