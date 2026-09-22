import api from "./api.js";

/*
|--------------------------------------------------------------------------
| Get all enquiries for admin
|--------------------------------------------------------------------------
| GET /api/v1/enquiries/admin/all
|
| Supported params may include:
| page
| limit
| search
| status
| carvingType
| preferredContactMethod
| sort
*/

export const getAdminEnquiries = async (params = {}) => {
  const response = await api.get("/enquiries/admin/all", {
    params,
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Get one enquiry
|--------------------------------------------------------------------------
| GET /api/v1/enquiries/admin/:id
|
| The backend may accept the MongoDB ID or enquiry number.
*/

export const getAdminEnquiryById = async (enquiryId) => {
  const response = await api.get(
    `/enquiries/admin/${encodeURIComponent(enquiryId)}`,
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Update enquiry status
|--------------------------------------------------------------------------
| PATCH /api/v1/enquiries/admin/:id/status
*/

export const updateAdminEnquiryStatus = async (
  enquiryId,
  { status, message = "" },
) => {
  const response = await api.patch(`/enquiries/admin/${enquiryId}/status`, {
    status,
    message,
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Update enquiry quotation
|--------------------------------------------------------------------------
| PATCH /api/v1/enquiries/admin/:id/quote
*/

export const updateAdminEnquiryQuote = async (
  enquiryId,
  {
    estimatedPrice,
    estimatedCompletionDays,
    quoteMessage = "",
    validUntil = "",
  },
) => {
  const payload = {
    estimatedPrice,
    estimatedCompletionDays,
    quoteMessage,
  };

  if (validUntil) {
    payload.validUntil = validUntil;
  }

  const response = await api.patch(
    `/enquiries/admin/${enquiryId}/quote`,
    payload,
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Update private admin note
|--------------------------------------------------------------------------
| PATCH /api/v1/enquiries/admin/:id/note
*/

export const updateAdminEnquiryNote = async (enquiryId, adminNote) => {
  const response = await api.patch(`/enquiries/admin/${enquiryId}/note`, {
    adminNote,
  });

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Update customer details
|--------------------------------------------------------------------------
| PATCH /api/v1/enquiries/admin/:id/customer
*/

export const updateAdminEnquiryCustomer = async (enquiryId, customerData) => {
  const response = await api.patch(
    `/enquiries/admin/${enquiryId}/customer`,
    customerData,
  );

  return response.data;
};
