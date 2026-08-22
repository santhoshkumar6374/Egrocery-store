const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

let loadPromise = null;

/**
 * Razorpay's Checkout widget is only distributed as a script tag (no npm
 * package for the client SDK), so we inject it once and reuse the same
 * promise on repeat calls.
 */
export function loadRazorpayScript() {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => {
      loadPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return loadPromise;
}