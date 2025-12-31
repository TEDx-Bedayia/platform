"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import "../mohamed/style.css";
import "./styles/globals.css";
import "./styles/hero.css";
import "./styles/info.css";
import "./styles/navigation.css";
import "./styles/theme.css";

import { Bungee, Ubuntu } from "next/font/google";
import Footer from "./global_components/footer";

const button = Bungee({ weight: "400", subsets: ["latin"] });
const ubuntu = Ubuntu({ weight: "400", subsets: ["latin"] });

import React, { useState } from "react";

// Import the ImageSlider component
import ImageSlider from "./components/ImageSlider";

const FAQComponent = () => {
  const faqData = [
    {
      question: "What is the date of the next event?",
      answer: "13th of February 2026",
    },
    {
      question: "How can I buy tickets?",
      answer:
        "You can buy the tickets through our website link either through telda, instapay, vodafone cash or Cash at our Bedayia High School Office",
    },
    {
      question: "How can I contact support?",
      answer:
        "For any support or inquiries, you can contact +20 10 13389776 or +20 10 08527016. Or you can send an email to tedxyouth@bedayia.com",
    },
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    // If clicking the one currently open, close it (set to null).
    // Otherwise, open the new one (set to index).
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="faq-container"
      style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>
        Frequently Asked Questions
      </h2>
      {faqData.map((item, index) => {
        const isOpen = activeIndex === index;

        return (
          <div
            key={index}
            className="faq-item"
            style={{ borderBottom: "1px solid #ddd", padding: "1rem 0" }}
          >
            {/* The Question Header */}
            <div
              className="faq-question"
              onClick={() => toggleFAQ(index)}
              style={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                outline: "none",
                border: "none",
                background: "none",
                fontSize: "1.1rem",
                textAlign: "left",
                width: "100%",
              }}
            >
              {item.question}

              {/* The Icon */}
              <span
                className="faq-icon"
                style={{
                  transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                  transition: "transform 0.3s ease", // Added for smooth rotation
                }}
              >
                +
              </span>
            </div>

            {isOpen && (
              <div
                className="faq-answer"
                style={{
                  display: "block",
                  paddingTop: "0.5rem",
                  color: "#555",
                }}
              >
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
};

function infoItem(text: string, svg: any) {
  return (
    <div className="flex flex-row items-center justify-center gap-2">
      {svg}
      <span
        className="font-[Sansation] text-[2em]/[2rem] max-phone:text-[1.25em]/[1.25rem]"
        style={{ fontWeight: 400 }}
      >
        {text}
      </span>
    </div>
  );
}

function infoLink(text: string, svg: any, link: string) {
  return (
    <div className="flex flex-row items-center justify-center gap-2">
      {svg}
      <Link
        href={link}
        className="font-[Sansation] text-[2em]/[2rem] text-secondary-200 underline max-phone:text-[1.25em]/[1.25rem]"
        style={{
          fontWeight: 400,
          textDecorationColor: "#007bff85",
          color: "#E0E0E0",
        }}
      >
        {text}
      </Link>
    </div>
  );
}

export default function Home() {
  return (
    <main className="wrapper" style={{ scrollBehavior: "smooth" }}>
      <center
        className="fixed top-0 z-[9999999] w-[100%] backdrop-blur-[5px]"
        style={{ background: "#33333323" }}
      >
        <section
          id="nav"
          className={`flex flex-row justify-between items-center max-phone:flex-col h-[5.5rem] px-[11rem] max-tablet:px-[6rem] max-phone:h-[6.625rem] max-phone:w-[80vw] max-phone:min-w-[80vw] max-phone:max-w-[80vw] max-phone:justify-center max-phone:px-0 max-phone:py-3`}
        >
          <a
            href="#"
            className="cursor-pointer hover:opacity-75 transition-opacity opacity-100 duration-200"
          >
            <Image
              width="448"
              height="36"
              className="h-9 w-[28rem] max-phone:h-[1.6875rem] max-phone:w-[21rem]"
              src="/main-logo.png"
              alt="Event's Logo"
            />
          </a>

          {/* Book a Ticket */}
          <button
            className={`flex flex-row items-center gap-2 btnColor px-6 py-2 transition-all max-phone:mt-4`}
            style={{ ...button.style, borderRadius: "0.5rem" }}
            onClick={() => (window.location.href = "/book")}
          >
            <div className="h-6 w-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                style={{ width: "100%", height: "100%" }}
              >
                <path
                  d="M10 14H7"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M13 17H7"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <rect
                  x="13"
                  y="7"
                  width="4"
                  height="4"
                  rx="1"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span
              className="font-navButton"
              style={{
                ...button.style,
                fontWeight: 500,
                fontStyle: "normal",
                letterSpacing: "0.3px",
              }}
            >
              BOOK A TICKET
            </span>
          </button>
        </section>
      </center>

      <center style={{ overflow: "hidden", maxWidth: "100vw" }}>
        <section
          id="hero"
          className="relative mx-0 mb-[4.5rem] w-[100%] max-w-[100vw] pt-[6.75rem] max-tablet:pt-[5rem] max-phone:bg-[length:80vh_100px] max-phone:pt-[10rem]"
        >
          <div>
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              transition={{ ease: "easeInOut", duration: 0.75 }}
            >
              <Image
                width="1440"
                height="358"
                className="w-[45rem] max-phone:w-[95vw]"
                src="/main-heading.png"
                alt="TEDxYouth Bedayia 2025"
              />
            </motion.div>
            <p
              className="w-[33.5rem] pt-4 text-center font-body text-text-gray-light max-tablet:mt-2 max-phone:mt-3 max-phone:w-[85vw]"
              style={ubuntu.style}
            >
              Step into a day packed with inspiring talks, powerful
              performances, and fresh perspectives. Together, we'll uncover
              ideas worth spreading, spark meaningful conversations, and
              celebrate the power of innovation. Join a community of curious
              minds hungry for change &ndash; this is where inspiration begins.{" "}
            </p>

            <div className="ml-2 mt-6 flex flex-row items-end justify-center gap-4 max-tablet:ml-0 max-phone:mt-[1.125rem] max-phone:flex-col max-phone:items-center max-phone:justify-center max-phone:gap-2">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 0 }}
                transition={{ ease: "easeInOut", duration: 0.75 }}
              >
                <button
                  className="primary hover:-translate-y-2 w-[16.25rem] shrink-0 items-center justify-center rounded-2xl btnColor py-6 text-center font-navButton max-phone:w-[16rem] max-phone:py-[1.125rem]"
                  style={{ ...button.style }}
                  onClick={() => (window.location.href = "/book")}
                >
                  Book a Ticket
                </button>
              </motion.div>

              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 0 }}
                transition={{ ease: "easeInOut", duration: 0.75 }}
              >
                <div className="secondary-wrapper relative mt-4 hover:-translate-y-2">
                  <div className="absolute right-0 top-0 z-10 flex items-center justify-center rounded-full bg-[#FBED0E] px-4 py-[0.375rem] max-phone:right-[-1rem] max-phone:top-[-1rem]">
                    <span className="font-special">15% OFF!</span>
                  </div>
                  <button
                    className="max-phone:border-3 absolute bottom-0 left-0 w-[16.25rem] shrink-0 items-center justify-center rounded-2xl border-4 border-solid border-[#FBED0E] bg-transparent py-5 text-center font-button max-phone:w-[16rem] max-phone:py-[0.9375rem]"
                    style={{ ...button.style }}
                    onClick={() => (window.location.href = "/book/group")}
                  >
                    Book a Group Ticket
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Image Slider Section */}
        <ImageSlider />
      </center>

      {/* <section>
        <div className="mb-6 font-title font-bold max-phone:text-[2.5em]">
          Total attendee count: 40000+
        </div>
      </section> */}

      <section className="testimonials">
        <div className="testimonial-slider">
          <div className="testimonial">
            <p className="testimonialText">
              &quot;TEDx hosts a beautiful culmination of knowledge and
              entertainment, curated to ensure you have the best of times&quot;
            </p>
            <p>- Kareem</p>
          </div>
          <div className="testimonial">
            <p className="testimonialText">
              &quot;I liked how TEDx had a diverse genre of topics that the
              speakers spoke about&quot;
            </p>
            <p>- Abdelrahman El-Kalla</p>
          </div>
          <div className="testimonial">
            <p className="testimonialText">
              &quot;The food tasted well and the speakers were fun&quot;
            </p>
            <p>- Ibrahim Dawood</p>
          </div>
          <div className="testimonial">
            <p className="testimonialText">
              &quot;The speaker lounge was perfect&quot;
            </p>
            <p>- Omar Emara</p>
          </div>
          <div className="testimonial">
            <p className="testimonialText">
              &quot;Very interactive audience, making the talks relatable&quot;
            </p>
            <p>- Jude Ahmed</p>
          </div>
          <div className="testimonial">
            <p className="testimonialText">
              &quot;Best event you&apos;ll ever go to&quot;
            </p>
            <p>- Omar Mohamed El-Mandooh</p>
          </div>
        </div>
      </section>

      <section
        id="theme"
        className="relative mx-0 mb-[4.5rem] mt-16 w-[100%] max-w-[100vw]"
      >
        <Image
          src="/theme-star.png"
          alt="TEDx Bedayia School Empowerment Inspiring Next Generation 2025 Cairo Egypt Event"
          width="120"
          height="120"
          className="absolute left-[16rem] top-4 max-phone:hidden"
        ></Image>
        <Image
          src="/theme-moon.png"
          alt="Echoes in Time TEDx Bedayia Cool Event"
          width="129"
          height="120"
          className="absolute right-[18rem] top-[20rem] rotate-12 max-phone:hidden max-tablet:right-[12rem] max-tablet:top-[18rem]"
        ></Image>
        <div>
          <center>
            <Image
              width="1440"
              height="540"
              src="/theme-title.png"
              alt="Inspiration Innovation Ideas Worth Spreading"
              className="w-[30rem] max-phone:w-[95vw]"
            ></Image>
            <p
              className="mt-4 w-[40rem] text-center font-body text-gray-200 max-tablet:mt-2 max-phone:mt-3 max-phone:w-[85vw]"
              style={{ lineHeight: "2rem", ...ubuntu.style }}
            >
              The{" "}
              <span
                className="align-start m-0 inline-flex w-max justify-start rounded-[0.75rem] bg-[#FE0000] py-1 pl-4 pr-2 font-bold"
                style={{ lineHeight: "1rem" }}
              >
                <span>
                  <span style={{ color: "#F9F9F9" }}>Flashpoint</span>
                </span>
                <Image
                  className="h-4 w-4"
                  src="/mini-stars-dreamscape.png"
                  height={28}
                  width={25}
                  alt="Impactful Unique TEDx Event and Ideas"
                ></Image>
              </span>{" "}
              is the precise moment when pressure, ideas, and forces converge —
              igniting change that cannot be undone. It is where silence breaks,
              movements begin, and the future shifts course. Flashpoint explores
              these critical moments of impact, when bold ideas challenge the
              status quo and spark transformation. These talks are not about
              gradual change, but about the instant when everything changes —
              urging us to recognize our own flashpoints and act with intention,
              courage, and clarity.
            </p>
          </center>
        </div>
      </section>

      <section
        id="info"
        className="max-phone:pt-[2rem] mx-0 mb-[4.5rem] mt-4 w-[100%] max-w-[100vw]"
      >
        <div
          id="info-title"
          className="mb-6 font-title font-bold max-phone:text-[2.5em]"
        >
          Event Information
        </div>
        <center className="flex w-screen shrink-0 flex-row justify-center gap-5 text-start max-phone:flex-col">
          <div className="flex w-full flex-col gap-4 text-center">
            {infoItem(
              "13th of February, 2026",
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="#333333"
              >
                <rect
                  x="6"
                  y="12"
                  width="36"
                  height="30"
                  rx="4"
                  stroke="white"
                  strokeWidth="2"
                />
                <path
                  d="M8 22H40"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M18 32H30"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M16 6L16 14"
                  stroke="#333333"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M32 6L32 14"
                  stroke="#333333"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
            {infoItem(
              "3:00 PM",
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="#333333"
              >
                <circle cx="24" cy="26" r="14" stroke="white" strokeWidth="2" />
                <path
                  d="M10 10L6 14"
                  stroke="#E0E0E0"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M38 10L42 14"
                  stroke="#E0E0E0"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M18 22L23.8093 25.8729C23.9172 25.9448 24.0622 25.9223 24.1432 25.821L28 21"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
            {infoLink(
              "Bedayia International School",
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="#333333"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M24.3981 39.8097C26.6803 38.6808 38 32.5493 38 22C38 14.268 31.732 8 24 8C16.268 8 10 14.268 10 22C10 32.5493 21.3197 38.6808 23.6019 39.8097C23.8572 39.936 24.1428 39.936 24.3981 39.8097ZM24 28C27.3137 28 30 25.3137 30 22C30 18.6863 27.3137 16 24 16C20.6863 16 18 18.6863 18 22C18 25.3137 20.6863 28 24 28Z"
                  fill="#E0E0E0"
                />
                <path
                  d="M24.3981 39.8097L23.9547 38.9134H23.9547L24.3981 39.8097ZM23.6019 39.8097L24.0453 38.9134H24.0453L23.6019 39.8097ZM37 22C37 26.8936 34.3766 30.8205 31.3621 33.7164C28.3515 36.6085 25.0528 38.3702 23.9547 38.9134L24.8415 40.7061C26.0256 40.1203 29.5279 38.2518 32.7477 35.1587C35.9636 32.0692 39 27.6557 39 22H37ZM24 9C31.1797 9 37 14.8203 37 22H39C39 13.7157 32.2843 7 24 7V9ZM11 22C11 14.8203 16.8203 9 24 9V7C15.7157 7 9 13.7157 9 22H11ZM24.0453 38.9134C22.9472 38.3702 19.6485 36.6085 16.6379 33.7164C13.6234 30.8205 11 26.8936 11 22H9C9 27.6557 12.0364 32.0692 15.2523 35.1587C18.4721 38.2518 21.9744 40.1203 23.1585 40.7061L24.0453 38.9134ZM23.9547 38.9134C23.9614 38.9101 23.9776 38.9045 24 38.9045C24.0224 38.9045 24.0386 38.9101 24.0453 38.9134L23.1585 40.7061C23.6932 40.9706 24.3068 40.9706 24.8415 40.7061L23.9547 38.9134ZM29 22C29 24.7614 26.7614 27 24 27V29C27.866 29 31 25.866 31 22H29ZM24 17C26.7614 17 29 19.2386 29 22H31C31 18.134 27.866 15 24 15V17ZM19 22C19 19.2386 21.2386 17 24 17V15C20.134 15 17 18.134 17 22H19ZM24 27C21.2386 27 19 24.7614 19 22H17C17 25.866 20.134 29 24 29V27Z"
                  fill="#E0E0E0"
                />
              </svg>,
              "https://maps.app.goo.gl/KjaRfqvMDMvuWBLu9"
            )}
            {infoItem(
              "Gate #2",
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="#333333"
              >
                <path
                  d="M12 10.5V26H21.382C21.6827 26 21.833 26 21.9538 26.0747C22.0747 26.1493 22.1419 26.2838 22.2764 26.5528L23.7236 29.4472C23.8581 29.7162 23.9253 29.8507 24.0462 29.9253C24.167 30 24.3173 30 24.618 30H35.5C35.7357 30 35.8536 30 35.9268 29.9268C36 29.8536 36 29.7357 36 29.5V14.5C36 14.2643 36 14.1464 35.9268 14.0732C35.8536 14 35.7357 14 35.5 14H24.618C24.3173 14 24.167 14 24.0462 13.9253C23.9253 13.8507 23.8581 13.7162 23.7236 13.4472L22.2764 10.5528C22.1419 10.2838 22.0747 10.1493 21.9538 10.0747C21.833 10 21.6827 10 21.382 10H12.5C12.2643 10 12.1464 10 12.0732 10.0732C12 10.1464 12 10.2643 12 10.5Z"
                  fill="#E0E0E0"
                  fillOpacity="0.25"
                />
                <path
                  d="M12 26V10.5C12 10.2643 12 10.1464 12.0732 10.0732C12.1464 10 12.2643 10 12.5 10H21.382C21.6827 10 21.833 10 21.9538 10.0747C22.0747 10.1493 22.1419 10.2838 22.2764 10.5528L23.7236 13.4472C23.8581 13.7162 23.9253 13.8507 24.0462 13.9253C24.167 14 24.3173 14 24.618 14H35.5C35.7357 14 35.8536 14 35.9268 14.0732C36 14.1464 36 14.2643 36 14.5V29.5C36 29.7357 36 29.8536 35.9268 29.9268C35.8536 30 35.7357 30 35.5 30H24.618C24.3173 30 24.167 30 24.0462 29.9253C23.9253 29.8507 23.8581 29.7162 23.7236 29.4472L22.2764 26.5528C22.1419 26.2838 22.0747 26.1493 21.9538 26.0747C21.833 26 21.6827 26 21.382 26H12ZM12 26V38"
                  stroke="#E0E0E0"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
        </center>
      </section>
      <FAQComponent />

      <Footer />
    </main>
  );
}
