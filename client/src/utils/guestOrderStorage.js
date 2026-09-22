const GUEST_ORDERS_KEY = "devkar_guest_orders";
const MAX_SAVED_ORDERS = 20;

const readStoredOrders = () => {
  try {
    const savedOrders = localStorage.getItem(GUEST_ORDERS_KEY);

    if (!savedOrders) {
      return [];
    }

    const parsedOrders = JSON.parse(savedOrders);

    return Array.isArray(parsedOrders) ? parsedOrders : [];
  } catch {
    return [];
  }
};

export const getSavedGuestOrders = () => {
  return readStoredOrders();
};

export const saveGuestOrder = ({
  orderNumber,
  email,
  phone,
  savedAt = new Date().toISOString(),
}) => {
  if (!orderNumber || !email || !phone) {
    return;
  }

  const normalizedOrder = {
    orderNumber: orderNumber.trim().toUpperCase(),
    email: email.trim().toLowerCase(),
    phone: phone.replace(/\D/g, ""),
    savedAt,
  };

  const existingOrders = readStoredOrders();

  const remainingOrders = existingOrders.filter(
    (order) => order.orderNumber !== normalizedOrder.orderNumber,
  );

  const updatedOrders = [normalizedOrder, ...remainingOrders].slice(
    0,
    MAX_SAVED_ORDERS,
  );

  localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(updatedOrders));
};

export const removeSavedGuestOrder = (orderNumber) => {
  const updatedOrders = readStoredOrders().filter(
    (order) => order.orderNumber !== orderNumber,
  );

  localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(updatedOrders));

  return updatedOrders;
};

export const clearSavedGuestOrders = () => {
  localStorage.removeItem(GUEST_ORDERS_KEY);
};
