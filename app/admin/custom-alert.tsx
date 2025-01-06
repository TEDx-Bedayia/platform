import { a } from "framer-motion/client";

export function customAlert(txt: string, closeable = true, verified = false) {
  // Create a background overlay
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.zIndex = "1000";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.opacity = "0"; // Start with invisible
  overlay.style.transition = "opacity 0.3s ease"; // Opening/Closing animation
  overlay.style.color = "#333";

  // Create the alert box
  const alertBox = document.createElement("div");
  alertBox.style.backgroundColor = "white";
  alertBox.style.padding = "2rem";
  alertBox.style.borderRadius = "1rem";
  alertBox.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.1)";
  alertBox.style.textAlign = "center";
  alertBox.style.maxWidth = "400px";
  alertBox.style.width = "85%";
  alertBox.style.transform = "scale(0.9)"; // Start with a slightly smaller scale
  alertBox.style.transition = "transform 0.3s ease, opacity 0.3s ease"; // Animation on transform and opacity
  if (verified) alertBox.style.border = "#2BCB77 10px solid";
  alertBox.style.boxSizing = "border-box";
  // if (verified) alertBox.style.color = "white";

  // Create the message text
  const message = document.createElement("p");
  message.innerText = txt;
  message.style.fontSize = "1.2rem";
  if (closeable) message.style.marginBottom = "1.5rem";

  // Create the close button
  const closeButton = document.createElement("button");
  closeButton.innerText = "OK";
  closeButton.style.padding = "0.75rem 1.5rem";
  closeButton.style.backgroundColor = "#0070f3";
  closeButton.style.color = "white";
  closeButton.style.border = "none";
  closeButton.style.borderRadius = "5px";
  closeButton.style.cursor = "pointer";
  closeButton.style.fontSize = "1rem";
  // if (verified) closeButton.style.backgroundColor = "#2BCB77";

  // Add close button functionality
  closeButton.onclick = () => {
    // Start closing animation
    alertBox.style.transform = "scale(0.8)";
    alertBox.style.opacity = "0";
    overlay.style.opacity = "0";

    // Remove the overlay from the DOM after the animation completes
    setTimeout(() => {
      document.body.removeChild(overlay);
    }, 300); // Match the duration of the fade-out animation
  };

  // Append elements to the alert box
  alertBox.appendChild(message);
  if (closeable) alertBox.appendChild(closeButton);

  // Append alert box to the overlay
  overlay.appendChild(alertBox);

  // Append overlay to the body
  document.body.appendChild(overlay);

  // Trigger the opening animation (after the element is mounted in the DOM)
  setTimeout(() => {
    overlay.style.opacity = "1"; // Fade in the overlay
    alertBox.style.transform = "scale(1)"; // Scale to full size
    alertBox.style.opacity = "1"; // Make alert box fully visible
  }, 10); // Small timeout to ensure animation starts after element is in the DOM
}

export function customAlert2(displayName: string, callback: Function) {
  // Create a background overlay
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.zIndex = "1000";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.opacity = "0"; // Start with invisible
  overlay.style.transition = "opacity 0.3s ease"; // Opening/Closing animation
  overlay.style.color = "#333";

  // Create the alert box
  const alertBox = document.createElement("div");
  alertBox.style.backgroundColor = "white";
  alertBox.style.padding = "2rem";
  alertBox.style.borderRadius = "10px";
  alertBox.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.1)";
  alertBox.style.textAlign = "center";
  alertBox.style.maxWidth = "400px";
  alertBox.style.width = "100%";
  alertBox.style.transform = "scale(0.9)"; // Start with a slightly smaller scale
  alertBox.style.transition = "transform 0.3s ease, opacity 0.3s ease"; // Animation on transform and opacity

  // Create the message
  const message = document.createElement("div");
  const email_in = document.createElement("input");
  email_in.type = "text";
  email_in.id = "from";
  email_in.name = "from";
  email_in.value = "";
  email_in.placeholder = " ";
  email_in.required = true;
  email_in.onchange = () => {
    email_in.style.borderColor = "#0070f3";
  };
  const label = document.createElement("label");
  label.htmlFor = "from";
  label.innerText = displayName;

  // Style Input and Label
  label.style.position = "absolute";
  label.style.top = "50%";
  label.style.left = "0";
  label.style.paddingLeft = "10px";
  label.style.transform = "translateY(-50%)";
  label.style.fontSize = "1rem";
  label.style.color = "#aaa";
  label.style.transition = "all 0.2s ease-in-out";
  label.style.pointerEvents = "none";

  email_in.style.width = "100%";
  email_in.style.padding = "0.75rem 10px";
  email_in.style.fontSize = "1rem";
  email_in.style.border = "1px solid #ddd";
  email_in.style.borderRadius = "5px";
  email_in.style.backgroundColor = "#f9f9f9";
  email_in.style.transition = "border-color 0.3s ease";

  email_in.onfocus = () => {
    email_in.style.borderColor = "#0070f3";
    email_in.style.outline = "none";
    email_in.style.backgroundColor = "white";

    label.style.top = "0";
    label.style.transform = "translateY(-100%)";
    label.style.fontSize = "0.8rem";
    label.style.color = "#0070f3";
    label.style.paddingLeft = "5px";
  };

  email_in.onblur = () => {
    email_in.style.borderColor = "#ddd";
    if (email_in.value === "") {
      email_in.style.backgroundColor = "#f9f9f9";

      label.style.top = "50%";
      label.style.transform = "translateY(-50%)";
      label.style.fontSize = "1rem";
      label.style.color = "#aaa";
      label.style.paddingLeft = "10px";
    }
  };

  // Add
  message.appendChild(email_in);
  message.appendChild(label);

  // Style Main Input Frame
  message.style.fontSize = "1.2rem";
  message.style.marginBottom = "2rem";
  message.style.position = "relative";

  // Create the close button
  const closeButton = document.createElement("button");
  closeButton.innerText = "OK";
  closeButton.style.padding = "0.75rem 1.5rem";
  closeButton.style.backgroundColor = "#0070f3";
  closeButton.style.color = "white";
  closeButton.style.border = "none";
  closeButton.style.borderRadius = "5px";
  closeButton.style.cursor = "pointer";
  closeButton.style.fontSize = "1rem";

  let func = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      closeButton.click();
    }

    if (e.key === "Escape") {
      alertBox.style.transform = "scale(0.9)";
      alertBox.style.opacity = "0";
      overlay.style.opacity = "0";
      setTimeout(() => document.body.removeChild(overlay), 250);
      // stop listening for key down
      window.removeEventListener("keydown", func);
    }
  };
  window.addEventListener("keydown", func);

  // Add close button functionality
  closeButton.onclick = async () => {
    if (!(await callback(email_in.value))) {
      email_in.value = "";
      email_in.style.border = "1px solid red";
      return;
    }
    // Start closing animation
    alertBox.style.transform = "scale(0.9)";
    alertBox.style.opacity = "0";
    overlay.style.opacity = "0";

    // Remove the overlay from the DOM after the animation completes
    setTimeout(() => document.body.removeChild(overlay), 250);
    window.removeEventListener("keydown", func);
  };

  // Append elements to the alert box
  alertBox.appendChild(message);
  alertBox.appendChild(closeButton);

  // Append alert box to the overlay
  overlay.appendChild(alertBox);

  // Append overlay to the body
  document.body.appendChild(overlay);

  // Trigger the opening animation (after the element is mounted in the DOM)
  setTimeout(() => {
    overlay.style.opacity = "1"; // Fade in the overlay
    alertBox.style.transform = "scale(1)"; // Scale to full size
    alertBox.style.opacity = "1"; // Make alert box fully visible
  }, 10); // Small timeout to ensure animation starts after element is in the DOM
}
