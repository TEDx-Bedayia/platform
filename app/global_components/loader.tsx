"use client";
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
      <h1>Loading...</h1>
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

  document.body.style.pointerEvents = "none"; // Disable pointer events on the body

  // Append the div to the body
  document.body.appendChild(loaderContainer);

  // Create a root and render the Loader component inside it
  const root = createRoot(loaderContainer);
  root.render(<Loader />);
}

export function removeLoader() {
  // Use the specific id to select the loader root container
  const loaderContainer = document.getElementById("loader-root");
  if (loaderContainer) {
    loaderContainer.remove(); // Remove the entire loader root container
  }
  document.body.style.pointerEvents = "auto"; // Re-enable pointer events on the body
}
