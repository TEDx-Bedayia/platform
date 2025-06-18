"use client";
import Image from "next/image";
import React from "react";
import { createRoot } from "react-dom/client";

export function Loader() {
  // Inline styles for the loader container
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 99999,
        pointerEvents: "none",
      }}
    >
      <Image
        src="/loading.gif"
        unoptimized
        alt="Loading..."
        width={50}
        height={50}
      />
    </div>
  );
}

export function addLoader() {
  // Create a new div element to serve as a root for the loader
  const loaderContainer = document.createElement("div");
  loaderContainer.id = "loader-root"; // Assign a unique ID to the root container
  loaderContainer.style.position = "fixed";
  loaderContainer.style.top = "0";
  loaderContainer.style.left = "0";
  loaderContainer.style.width = "100%";
  loaderContainer.style.height = "100%";
  loaderContainer.style.zIndex = "9999";
  loaderContainer.style.pointerEvents = "auto"; // Ensure this container captures all pointer events
  loaderContainer.style.opacity = "0"; // Start with invisible
  loaderContainer.style.transition = "opacity 0.3s ease"; // Opening/Closing animation

  document.body.style.pointerEvents = "none"; // Disable pointer events on the body
  loaderContainer.focus(); // Focus on the loader container

  // Append the div to the body
  document.body.appendChild(loaderContainer);

  // Create a root and render the Loader component inside it
  const root = createRoot(loaderContainer);
  root.render(<Loader />);
  setTimeout(() => {
    loaderContainer.style.opacity = "1"; // Fade in the overlay
  }, 10); // Small timeout to ensure animation starts after element is in the DOM
}

export function removeLoader() {
  // Use the specific id to select the loader root container
  const loaderContainer = document.getElementById("loader-root");
  if (loaderContainer) {
    loaderContainer.style.opacity = "0";

    // Remove the overlay from the DOM after the animation completes
    setTimeout(() => {
      document.body.removeChild(loaderContainer);
    }, 300); // Match the duration of the fade-out animation
  }
  document.body.style.pointerEvents = "auto"; // Re-enable pointer events on the body
  document.body.focus();
}
