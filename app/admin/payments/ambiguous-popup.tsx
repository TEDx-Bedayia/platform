import { price } from "@/app/api/tickets/price/prices";
import { hidePopup } from "@/app/api/utils/generic-popup";
import { cross, group, onePerson, whiteCheck, whiteCross } from "@/app/icons";
import { getTicketTypeName, TicketType } from "@/app/ticket-types";
import { Poppins, Ubuntu } from "next/font/google";
import { useState } from "react";
import { customAlert } from "../custom-alert";
import { Applicant } from "../types/Applicant";
import styles from "./ambiguous-popup.module.css";
const title = Poppins({ weight: "700", subsets: ["latin"] });
const ubuntu = Ubuntu({ weight: ["300", "400", "700"], subsets: ["latin"] });

const formatDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  const formatter = new Intl.DateTimeFormat("en-EG", options);
  const parts = formatter.formatToParts(date);
  const ampm = date.getHours() >= 12 ? "PM" : "AM";
  const formattedDate = `${parts.find((p) => p.type === "day")?.value}/${
    parts.find((p) => p.type === "month")?.value
  }/${parts.find((p) => p.type === "year")?.value}, ${
    parts.find((p) => p.type === "hour")?.value
  }:${parts.find((p) => p.type === "minute")?.value} ${ampm}`;
  return formattedDate;
};

type Props = {
  applicant: Applicant;
  addID: (id: number) => void;
  removeID: (id: number) => void;
  isIDIncluded: (id: number) => boolean;
  groupMembers?: Applicant[];
  amountIn: number;
  getTotal: () => number;
};

const AmbiguousTicketCard: React.FC<Props> = ({
  applicant,
  groupMembers,
  addID,
  removeID,
  isIDIncluded,
  amountIn,
  getTotal,
}) => {
  const isGroup =
    applicant.ticket_type === TicketType.GROUP ||
    applicant.ticket_type === TicketType.EARLY_BIRD_GROUP;
  return (
    <div
      className={`${styles.applicantCard} ${
        isIDIncluded(applicant.id) ? styles.selected : ""
      }`}
      style={ubuntu.style}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "start",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", width: "32px", height: "32px" }}>
            {isGroup ? group : onePerson}
            <span
              style={{
                fontSize: ".5rem",
                fontWeight: 700,
                position: "absolute",
                width: isGroup ? "71.5%" : "100%",
                textAlign: "center",
                top: "20px",
              }}
            >
              {applicant.id}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
              gap: "0px",
            }}
          >
            <span className={styles.applicantName}>
              {applicant.full_name}
              {groupMembers &&
                ", " +
                  groupMembers.map((member) => member.full_name).join(", ")}
            </span>
            <div className="flex flex-row-reverse justify-center items-center gap-2">
              <span className={styles.applicantEmail}>{applicant.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "end",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <span style={{ fontSize: ".7rem" }}>
            +
            {applicant.phone.slice(0, 2) +
              " " +
              applicant.phone.slice(2, 5) +
              " " +
              applicant.phone.slice(5, 8) +
              " " +
              applicant.phone.slice(8)}
          </span>
          <span style={{ fontSize: ".7rem" }}>
            <span style={{ fontWeight: "700" }} className={styles.ticketType}>
              {getTicketTypeName(
                applicant.ticket_type as TicketType
              ).toUpperCase()}
            </span>
            <span>
              {" ("}
              <span style={{ fontWeight: 400 }}>
                {(applicant.ticket_type == TicketType.GROUP ? 4 : 1) *
                  price.getPrice(
                    applicant.ticket_type as TicketType,
                    applicant.payment_method
                  )}
              </span>
              {" EGP)"}
            </span>
            <span style={{ fontSize: ".5rem", marginLeft: ".25rem" }}>
              {formatDate(new Date(applicant.created_at))}
            </span>
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "12px",
          }}
        >
          <button
            className={`rounded-full w-10 h-10 text-white transition-all flex items-center justify-center ${
              !isIDIncluded(applicant.id)
                ? "bg-[#1f9c5a] hover:bg-[#147a43]"
                : "bg-[#b02a37] hover:bg-[#8f1f2b]"
            } ${
              getTotal() +
                (applicant.ticket_type == TicketType.GROUP ? 4 : 1) *
                  price.getPrice(
                    applicant.ticket_type as TicketType,
                    applicant.payment_method
                  ) >
                amountIn && !isIDIncluded(applicant.id)
                ? "opacity-50 cursor-not-allowed pointer-events-none"
                : ""
            }`}
            onClick={() => {
              if (isIDIncluded(applicant.id)) {
                removeID(applicant.id);
              } else {
                if (
                  getTotal() +
                    (applicant.ticket_type == TicketType.GROUP ? 4 : 1) *
                      price.getPrice(
                        applicant.ticket_type as TicketType,
                        applicant.payment_method
                      ) <=
                  amountIn
                ) {
                  addID(applicant.id);
                } else {
                  customAlert("Can't Add due to insufficient money.");
                }
              }
            }}
          >
            <div
              className={`scale-150 transition-all duration-150 ${
                isIDIncluded(applicant.id) ? "rotate-0" : "rotate-45"
              }`}
            >
              {whiteCross}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

type AmbiguityResolverProps = {
  found: Applicant[];
  groupMembers: { [key: string]: Applicant[] };
  amountIn: number;
  callback: (idList: number[]) => void;
};

const AmbiguityResolver: React.FC<AmbiguityResolverProps> = ({
  found,
  groupMembers,
  callback,
  amountIn,
}) => {
  const [selectedIDList, setSelectedIDList] = useState<number[]>([]);

  function calculateTotalPrice() {
    return selectedIDList.reduce((total, id) => {
      const applicant = found.find((app) => app.id === id);
      const isGroup = applicant
        ? applicant.ticket_type === TicketType.GROUP ||
          applicant.ticket_type === TicketType.EARLY_BIRD_GROUP
        : false;
      return (
        total +
        (applicant
          ? (isGroup ? 4 : 1) *
            price.getPrice(
              applicant.ticket_type as TicketType,
              applicant.payment_method
            )
          : 0)
      );
    }, 0);
  }

  return (
    <div
      className={
        "p-8 pt-6 rounded-3xl w-[50rem] max-h-[90vh] overflow-y-scroll relative " +
        styles.ambiguousPopup
      }
    >
      <div
        className="absolute right-2 -translate-x-full scale-150 origin-top-right cursor-pointer opacity-75 hover:opacity-100 transition-opacity duration-100"
        onClick={() => hidePopup("ambiguity-popup-container")}
      >
        {cross}
      </div>
      <h2 style={{ ...title.style, fontWeight: 700 }}>
        Multiple Tickets Found
      </h2>
      <h4>Please select the tickets you want to pay the {amountIn} EGP for.</h4>
      <br />
      <div className="flex flex-col gap-4">
        {found.map((applicant) => (
          <AmbiguousTicketCard
            key={applicant.id}
            applicant={applicant}
            amountIn={amountIn}
            addID={(id: number) => {
              if (!selectedIDList.includes(id))
                setSelectedIDList((prev) => [...prev, id]);
            }}
            removeID={(id: number) => {
              setSelectedIDList((prev) => prev.filter((item) => item !== id));
            }}
            isIDIncluded={(id: number) => selectedIDList.includes(id)}
            getTotal={calculateTotalPrice}
            groupMembers={groupMembers[applicant.id]}
          />
        ))}
        <div className="flex flex-row justify-between px-8">
          <span className="py-1">Total Price: {calculateTotalPrice()} EGP</span>
          <div
            className={
              "flex flex-row gap-8 items-center justify-center " +
              styles.popupButtonsContainer
            }
          >
            <button
              style={{ color: "#fff" }}
              className={styles.confirmButton}
              onClick={() =>
                hidePopup("ambiguity-popup-container", () => {
                  callback(selectedIDList);
                })
              }
            >
              {whiteCheck} <span className="ml-1 mr-1">Confirm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmbiguityResolver;
