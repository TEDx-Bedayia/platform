
const options = document.querySelectorAll(".option");
const instructionsBox = document.querySelector(".instructions p");

const instructions = {
  vodafone: "Send 400 EGP to Vodafone Cash number 0100-XXXXXXX and share the transaction screenshot.",
  telda: "Transfer 400 EGP via Telda to @TEDxBedayia and confirm payment in chat.",
  orange: "Use Orange Cash app to send 400 EGP to 0120-XXXXXXX.",
  instapay: "Send 400 EGP using Instapay to tedxbedayia@instapay.",
};

options.forEach((btn) => {
  btn.addEventListener("click", () => {
    options.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const method = btn.dataset.method;
    instructionsBox.textContent = instructions[method];
  });
});