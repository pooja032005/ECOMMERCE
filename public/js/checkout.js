const checkoutForm = document.getElementById("checkout-form");

if (checkoutForm) {
  checkoutForm.addEventListener("submit", (event) => {
    const submitButton = checkoutForm.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Processing...";
    }

    // In a real Stripe flow, tokenization or payment-intent confirmation happens here.
    setTimeout(() => {
      checkoutForm.submit();
    }, 300);

    event.preventDefault();
  });
}
