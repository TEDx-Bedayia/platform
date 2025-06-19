import { createRoot } from "react-dom/client";

export function showPopup(content: JSX.Element, elementID: string) {
  const popupContainer = document.createElement("div");
  popupContainer.id = elementID;
  popupContainer.className = "popupContainer";
  const root = createRoot(popupContainer);
  root.render(content);
  document.body.appendChild(popupContainer);

  // Trigger the opening animation (after the element is mounted in the DOM)
  setTimeout(() => {
    popupContainer.style.opacity = "1"; // Fade in the overlay
    popupContainer.getElementsByTagName("div")[0].style.transform = "scale(1)"; // Scale to full size
    popupContainer.getElementsByTagName("div")[0].style.opacity = "1"; // Make alert box fully visible
  }, 20); // Small timeout to ensure animation starts after element is in the DOM
}

export function hidePopup(elementID: string, callback?: () => void) {
  const popupContainer = document.getElementById(elementID);
  if (popupContainer) {
    popupContainer.style.opacity = "0"; // Fade out the overlay
    popupContainer.getElementsByTagName("div")[0].style.transform =
      "scale(0.8)"; // Scale down the alert box
    popupContainer.getElementsByTagName("div")[0].style.opacity = "0"; // Make alert box invisible

    // Remove the popup after the animation ends
    setTimeout(() => {
      popupContainer.remove();
      if (callback) callback();
    }, 300);
  }
}
