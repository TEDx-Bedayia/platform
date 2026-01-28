import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { EVENT_DESC, HOST, PHONE, YEAR } from "../metadata";

interface TicketEmailProps {
  name: string;
  uuid: string;
}

export const TicketEmail: React.FC<TicketEmailProps> = ({ name, uuid }) => {
  return (
    <Html lang="en">
      <Head>
        <title>{`TEDxBedayia${YEAR} eTicket`}</title>
        <style>{`
          @media only screen and (max-width: 600px) {
            .responsive-content { padding: 8px 24px 24px !important; }
            .responsive-header { padding: 32px 24px 28px !important; }
            .responsive-img { width: 200px !important; height: 200px !important; }
          }
        `}</style>
      </Head>
      <Preview>
        Your TEDxBedayia ticket is here! Get ready for an inspiring experience.
      </Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header Section */}
          <Section style={styles.header} className="responsive-header">
            <Text style={styles.headerEyebrow}>YOU'RE INVITED TO</Text>
            <Heading as="h1" style={styles.headerTitle}>
              TEDxBedayia'{YEAR}
            </Heading>
          </Section>

          {/* Main Content */}
          <Section style={styles.content} className="responsive-content">
            <Text style={styles.ticketTitle}>{name}'s Ticket</Text>

            <Text style={styles.introText}>
              Get ready for an unforgettable experience filled with{" "}
              <span style={styles.highlightText}>inspiring ideas</span> and{" "}
              <span style={styles.highlightText}>meaningful conversations</span>
              . Your journey begins with a single scan.
            </Text>

            {/* QR Section */}
            <Section style={styles.qrSection} align="center">
              <Text style={styles.qrLabel}>YOUR ENTRY PASS</Text>

              <center>
                <Img
                  src={`cid:ticket-qr-${uuid}`}
                  width="280"
                  height="280"
                  alt="Your eTicket QR Code"
                  style={styles.qrImage}
                  className="responsive-img"
                />
              </center>

              <Text style={styles.qrFallback}>
                Can't see the code?{" "}
                <Link
                  href={`${HOST}/api/qr?uuid=${uuid}`}
                  style={styles.qrFallbackLink}
                >
                  Tap here
                </Link>{" "}
                to view it directly.
              </Text>
            </Section>

            {/* Info Cards */}
            <Section style={styles.infoSection}>
              {/* Card 1: Location */}
              <div style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>📍 EVENT DETAILS</Text>
                <Text style={styles.infoCardText}>
                  {EVENT_DESC}{" "}
                  <Link
                    href="https://maps.google.com/?q=Bedayia+International+School"
                    style={styles.linkRed}
                  >
                    Open in Maps →
                  </Link>
                </Text>
              </div>

              {/* Card 2: Help */}
              <div style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>💬 NEED HELP?</Text>
                <Text style={styles.infoCardText}>
                  Reach us on WhatsApp at <strong>{PHONE}</strong>.<br />
                  Ticket ID: <span style={styles.ticketId}>{uuid}</span>
                </Text>
              </div>

              {/* Card 3: Warning */}
              <div style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>⚠️ IMPORTANT</Text>
                <Text style={styles.infoCardText}>
                  This QR code is unique to you and grants{" "}
                  <strong>one entry only</strong>. Keep it safe!
                </Text>
              </div>
            </Section>

            {/* Sign Off */}
            <Section style={styles.signoff}>
              <Text style={styles.signoffText}>
                We can't wait to see you there! ✨
                <span style={styles.teamName}>
                  — The TEDxYouth@BedayiaSchool'{YEAR} Team
                </span>
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Row style={{ marginBottom: "16px" }}>
              <Column align="center">
                <Link
                  href="https://www.tedxbedayia.com"
                  style={styles.footerButton}
                >
                  🌐 Website
                </Link>
                <Link
                  href="https://www.instagram.com/tedxyouthbedayiaschool/"
                  style={{ ...styles.footerButton, marginLeft: "8px" }}
                >
                  📸 Instagram
                </Link>
              </Column>
            </Row>
            <Text style={styles.footerCopyright}>
              © 2024-20{YEAR} TEDxYouth@BedayiaSchool · Crafted by Aly Mohamed
              Salah
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles Object
const styles = {
  body: {
    backgroundColor: "#eef2f8",
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", Arial, sans-serif',
    margin: "0",
    padding: "0",
    color: "#1e293b",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "40px auto",
    borderRadius: "24px",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 20px 50px -12px rgba(0, 0, 0, 0.12)",
    overflow: "hidden",
    maxWidth: "580px",
    border: "1px solid #e2e8f0",
  },
  header: {
    background:
      "linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%)",
    color: "#ffffff",
    textAlign: "center" as const,
    padding: "40px 32px 12px",
    marginBottom: "24px",
    position: "relative" as const,
  },
  headerEyebrow: {
    fontSize: "11px",
    fontWeight: "bold", // Changed from 700
    letterSpacing: "2.5px",
    textTransform: "uppercase" as const,
    opacity: "0.9",
    marginBottom: "8px",
    marginTop: "0",
  },
  headerTitle: {
    margin: "0 0 24px",
    fontSize: "28px",
    fontWeight: "bold", // Changed from 800
    lineHeight: "1.2",
    letterSpacing: "-0.3px",
  },
  content: {
    padding: "8px 36px 28px",
    textAlign: "center" as const,
  },
  ticketTitle: {
    display: "inline-block",
    background: "#fef2f2",
    color: "#dc2626",
    fontSize: "18px",
    fontWeight: "bold", // Changed from 700
    padding: "10px 24px",
    borderRadius: "50px",
    margin: "0 0 20px",
    border: "1px solid #fecaca",
  },
  introText: {
    fontSize: "15px",
    lineHeight: "1.75",
    color: "#475569",
    margin: "0 0 8px",
  },
  highlightText: {
    color: "#0f172a",
    fontWeight: "bold", // Changed from 600
  },
  qrSection: {
    margin: "28px 0",
    padding: "28px 24px",
    backgroundColor: "#f8fafc",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    textAlign: "center" as const,
  },
  qrLabel: {
    fontSize: "11px",
    fontWeight: "bold", // Changed from 700
    letterSpacing: "1.5px",
    textTransform: "uppercase" as const,
    color: "#64748b",
    marginBottom: "16px",
    marginTop: "0",
    display: "block",
  },
  qrImage: {
    display: "block",
    margin: "0 auto", // Kept for web clients
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
  },
  qrFallback: {
    marginTop: "16px",
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "0",
  },
  qrFallbackLink: {
    color: "#dc2626",
    fontWeight: "bold", // Changed from 600
    textDecoration: "none",
    padding: "2px 8px",
    backgroundColor: "#fef2f2",
    borderRadius: "4px",
    borderBottom: "1px solid #fecaca",
  },
  infoSection: {
    textAlign: "left" as const,
    marginTop: "24px",
  },
  infoCard: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "18px 20px",
    marginBottom: "14px",
  },
  infoCardTitle: {
    fontSize: "12px",
    fontWeight: "bold", // Changed from 700
    letterSpacing: "0.5px",
    textTransform: "uppercase" as const,
    color: "#64748b",
    margin: "0 0 4px",
    display: "block",
  },
  infoCardText: {
    fontSize: "14px",
    lineHeight: "1.65",
    color: "#334155",
    margin: "0",
  },
  linkRed: {
    color: "#dc2626",
    fontWeight: "bold", // Changed from 600
    textDecoration: "none",
  },
  ticketId: {
    fontFamily: '"SF Mono", Monaco, monospace',
    fontSize: "12px",
    backgroundColor: "#f1f5f9",
    padding: "2px 6px",
    borderRadius: "4px",
    color: "#475569",
    border: "1px solid #e2e8f0",
  },
  signoff: {
    textAlign: "center" as const,
    marginTop: "28px",
    paddingTop: "24px",
    borderTop: "1px solid #e2e8f0",
  },
  signoffText: {
    fontSize: "15px",
    lineHeight: "1.7",
    color: "#475569",
    margin: "0",
  },
  teamName: {
    fontWeight: "bold", // Changed from 700
    color: "#dc2626",
    marginTop: "12px",
    display: "block",
  },
  footer: {
    textAlign: "center" as const,
    padding: "24px 28px 28px",
    backgroundColor: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
  },
  footerButton: {
    color: "#dc2626",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "bold", // Changed from 600
    padding: "8px 16px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    display: "inline-block",
  },
  footerCopyright: {
    fontSize: "11px",
    color: "#94a3b8",
    margin: "16px 0 0",
  },
};
