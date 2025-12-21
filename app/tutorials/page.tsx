import { JSX } from "react";
import {
  backArrow,
  check,
  cross,
  destructiveIcon,
  devSearch,
  downArrow,
  emailIcon,
  forwardArrow,
  forwardArrowLg,
  gradCap,
  group,
  hashtag,
  keyIcon,
  onePerson,
  onePersonMd,
  onePersonSm,
  pencil,
  shieldLock,
  speakerTicketIcon,
  ticketIcon,
  trash,
  upArrow,
  whiteCheck,
  whiteCheckLg,
  whiteCross,
} from "../icons";

function entry(icon: JSX.Element, size: number, whiteIcon = false) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: 10,
        gap: 20,
        border: "1px solid lightgray",
        padding: 16,
        borderRadius: 8,
        height: 128,
      }}
    >
      <div
        style={{
          width: size * 2,
          height: size * 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 1000,
          scale: 2,
          backgroundColor: whiteIcon ? "black" : "lightgray",
        }}
      >
        {icon}
      </div>
      <div className="border-l border-black h-max bg-red-500" />
      <div
        style={{
          textAlign: "center",
          marginTop: 5,
          marginLeft: 10,
          fontSize: 24,
          fontWeight: "bold",
        }}
      >
        {size} x {size}
      </div>
    </div>
  );
}

export default function TutorialsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-20 text-center font-[poppins] space-y-4">
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Icons</h1>
      <h3>Welcome to the Icons page!</h3>
      <p>All dimensions are in pixels unless otherwise specified.</p>
      <br />
      <div className="grid grid-cols-6 gap-4">
        {entry(pencil, 16)}
        {entry(check, 16)}
        {entry(cross, 16)}
        {entry(whiteCheck, 16, true)}
        {entry(whiteCheckLg, 24, true)}
        {entry(whiteCross, 16, true)}
        {entry(onePerson, 32)}
        {entry(onePersonMd, 24)}
        {entry(onePersonSm, 16)}
        {entry(group, 32)}
        {entry(speakerTicketIcon, 24)}
        {entry(destructiveIcon, 24)}
        {entry(devSearch, 24, true)}
        {entry(backArrow, 16, true)}
        {entry(forwardArrow, 16, true)}
        {entry(forwardArrowLg, 24, true)}
        {entry(ticketIcon, 16)}
        {entry(trash, 16, true)}
        {entry(shieldLock, 16)}
        {entry(keyIcon, 16)}
        {entry(upArrow, 16)}
        {entry(downArrow, 16)}
        {entry(gradCap, 24)}
        {entry(emailIcon, 20)}
        {entry(hashtag, 16)}
      </div>
    </div>
  );
}
