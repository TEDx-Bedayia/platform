import { sql } from "@vercel/postgres";
import argon2 from "argon2";

// To be called after verification of permissins
export async function createAccountHolder(
  username: string,
  password: string
): Promise<{ id?: number }> {
  try {
    // Hash the password
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3, // number of iterations
      parallelism: 1,
    });

    const result =
      await sql`INSERT INTO account_holders (username, hashed_password) VALUES (${username}, ${hashedPassword}) RETURNING id`;

    return {
      id: result.rows[0].id,
    };
  } catch (err) {
    console.error("Error creating user", err);
    return {};
  }
}

export async function addPaymentMethodsToAccountHolder(
  accountHolderId: number,
  paymentMethods: string[]
): Promise<boolean> {
  try {
    const query = `
      UPDATE account_holders
      SET allowed_methods = $1
      WHERE id = $2
    `;

    await sql.query(query, [paymentMethods, accountHolderId]);

    return true;
  } catch (err) {
    console.error("Error adding payment methods", err);
    return false;
  }
}

export async function getAccountHolderInfo(
  username: string,
  password: string
): Promise<object | undefined> {
  const result =
    await sql`SELECT * FROM account_holders WHERE username = ${username}`;
  const hashedPassword = result.rows[0]?.hashed_password;

  if (!hashedPassword) return;

  // Verify password
  if (await argon2.verify(hashedPassword, password)) {
    return {
      id: result.rows[0].id,
      username: result.rows[0].username,
      allowed_methods: result.rows[0].allowed_methods,
    };
  } else {
    return;
  }
}

export async function getAllAccountHolders(): Promise<
  { id: number; username: string; allowed_methods: string[] }[]
> {
  const result =
    await sql`SELECT id, username, allowed_methods FROM account_holders`;
  try {
    return result.rows.map((row) => ({
      id: row.id,
      username: row.username,
      allowed_methods: row.allowed_methods,
    }));
  } catch (err) {
    console.error("Error fetching account holders", err);
    return [];
  }
}
