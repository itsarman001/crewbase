import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword, generateToken, verifyToken } from "../lib/auth";
import { Role } from "../types";

test("Auth: Password hashing & verification", async () => {
  const password = "SuperSecretPassword123!";
  const hash = await hashPassword(password);

  assert.notEqual(hash, password);
  assert.equal(await verifyPassword(password, hash), true);
  assert.equal(await verifyPassword("wrongpassword", hash), false);
});

test("Auth: JWT token generation & verification", () => {
  const token = generateToken({
    userId: "usr_test123",
    role: Role.MANAGER,
  });

  assert.equal(typeof token, "string");
  assert.ok(token.length > 20);

  const decoded = verifyToken(token);
  assert.ok(decoded);
  assert.equal(decoded?.userId, "usr_test123");
  assert.equal(decoded?.sub, "usr_test123");
  assert.equal(decoded?.role, Role.MANAGER);

  // Invalid token check
  assert.equal(verifyToken("invalid.token.here"), null);
});
