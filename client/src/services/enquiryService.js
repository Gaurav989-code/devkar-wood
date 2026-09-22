import api from "./api.js";

export const createGuestEnquiry = async (enquiryData, onUploadProgress) => {
  const response = await api.post("/enquiries", enquiryData, {
    onUploadProgress: (progressEvent) => {
      if (!progressEvent.total || typeof onUploadProgress !== "function") {
        return;
      }

      const percentage = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total,
      );

      onUploadProgress(percentage);
    },
  });

  return response.data;
};

export const trackGuestEnquiry = async (trackingData) => {
  const response = await api.post("/enquiries/track", trackingData);

  return response.data;
};
