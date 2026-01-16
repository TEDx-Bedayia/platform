import crypto from "crypto";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const secret = process.env.JWT_SECRET;

type Unit =
  | "Years"
  | "Year"
  | "Yrs"
  | "Yr"
  | "Y"
  | "Weeks"
  | "Week"
  | "W"
  | "Days"
  | "Day"
  | "D"
  | "Hours"
  | "Hour"
  | "Hrs"
  | "Hr"
  | "H"
  | "Minutes"
  | "Minute"
  | "Mins"
  | "Min"
  | "M"
  | "Seconds"
  | "Second"
  | "Secs"
  | "Sec"
  | "s"
  | "Milliseconds"
  | "Millisecond"
  | "Msecs"
  | "Msec"
  | "Ms";

type UnitAnyCase = Unit | Uppercase<Unit> | Lowercase<Unit>;
type StringValue =
  | `${number}`
  | `${number}${UnitAnyCase}`
  | `${number} ${UnitAnyCase}`;

export enum UserRole {
  ADMIN = "admin",
  MARKETING_HEAD = "marketing_head",
  PAYMENT_HANDLER = "payment_handler",
  SCHOOL_OFFICE = "school_office",
}

export enum ProtectedResource {
  SUPER_ADMIN = "super_admin",
  TICKET_DASHBOARD = "ticket_dashboard",
  MARKETING_DASHBOARD = "marketing_dashboard",
  PAYMENT_DASHBOARD = "payment_dashboard",
  PAYMENT_LOGS = "payment_logs",
  QUERY_TICKETS = "query_tickets",
  INVITATIONS = "invitations",
  MANAGE_ACCOUNT_HOLDERS = "manage_account_holders",
}

export function signToken(
  payload: object,
  expiresIn: StringValue = "7d"
): string {
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string) {
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error("Invalid token");
  }
}

function hasAccess(userRole: UserRole, resource: ProtectedResource): boolean {
  const accessControl: Record<ProtectedResource, UserRole[]> = {
    [ProtectedResource.TICKET_DASHBOARD]: [UserRole.ADMIN],
    [ProtectedResource.MARKETING_DASHBOARD]: [
      UserRole.ADMIN,
      UserRole.MARKETING_HEAD,
    ],
    [ProtectedResource.PAYMENT_DASHBOARD]: [
      UserRole.ADMIN,
      UserRole.PAYMENT_HANDLER,
      UserRole.SCHOOL_OFFICE,
    ],
    [ProtectedResource.PAYMENT_LOGS]: [UserRole.ADMIN],
    [ProtectedResource.SUPER_ADMIN]: [UserRole.ADMIN],
    [ProtectedResource.QUERY_TICKETS]: [UserRole.ADMIN, UserRole.SCHOOL_OFFICE],
    [ProtectedResource.INVITATIONS]: [UserRole.ADMIN],
    [ProtectedResource.MANAGE_ACCOUNT_HOLDERS]: [UserRole.ADMIN],
  };

  return accessControl[resource].includes(userRole);
}

export function canUserAccess(
  req: NextRequest,
  resource: ProtectedResource,
  method?: string
): boolean {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return false;
  }

  try {
    const decoded = verifyToken(token) as {
      role: UserRole;
      methods?: string[];
      additionalScopes?: ProtectedResource[];
    };
    if (!decoded.role) return false;

    if (decoded.role === UserRole.ADMIN) return true;

    if (decoded.additionalScopes?.includes(resource)) return true;

    if (
      resource === ProtectedResource.QUERY_TICKETS &&
      decoded.methods?.includes("CASH")
    ) {
      return true;
    }

    return (
      hasAccess(decoded.role, resource) &&
      (method ? (decoded.methods?.includes(method) ?? true) : true)
    );
  } catch (error) {
    if (process.env.NODE_ENV !== "production")
      console.error("Token verification failed:", error);
    return false;
  }
}

export function getMarketingMemberPass(username: string) {
  if (!process.env.MARKETING_MEMBER_PASSWORD_GEN) {
    throw new Error("MARKETING_MEMBER_PASSWORD_GEN is not defined");
  }
  const hash = crypto
    .createHmac("sha256", process.env.MARKETING_MEMBER_PASSWORD_GEN)
    .update(username)
    .digest("hex");
  return parseInt(hash.slice(0, 8), 16).toString(36).slice(0, 8);
}
