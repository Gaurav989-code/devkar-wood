const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

let loadingPromise = null;

const loadRazorpay = () => {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve) => {
    const existingScript = document.querySelector(
      `script[src="${RAZORPAY_SCRIPT_URL}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => {
          resolve(Boolean(window.Razorpay));
        },
        {
          once: true,
        },
      );

      existingScript.addEventListener(
        "error",
        () => {
          loadingPromise = null;
          resolve(false);
        },
        {
          once: true,
        },
      );

      return;
    }

    const script = document.createElement("script");

    script.src = RAZORPAY_SCRIPT_URL;

    script.async = true;

    script.onload = () => {
      resolve(Boolean(window.Razorpay));
    };

    script.onerror = () => {
      loadingPromise = null;
      resolve(false);
    };

    document.body.appendChild(script);
  });

  return loadingPromise;
};

export default loadRazorpay;
