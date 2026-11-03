import test from "node:test";
import assert from "node:assert/strict";
import { loginSchema, registerSchema } from "../lib/validations/auth";
import { createUserSchema, updateUserSchema, userQuerySchema } from "../lib/validations/user";
import { createTeamSchema } from "../lib/validations/team";
import { Role } from "../types";

test("Validation: loginSchema", () => {
  const valid = loginSchema.safeParse({
    email: "test@example.com",
    password: "Password@123",
  });
  assert.equal(valid.success, true);

  const invalidEmail = loginSchema.safeParse({
    email: "not-an-email",
    password: "Password@123",
  });
  assert.equal(invalidEmail.success, false);

  const emptyPassword = loginSchema.safeParse({
    email: "test@example.com",
    password: "",
  });
  assert.equal(emptyPassword.success, false);
});

test("Validation: registerSchema password rules", () => {
  // Password requires >= 8 chars, 1 letter, 1 number
  assert.equal(
    registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "pass",
    }).success,
    false
  );

  assert.equal(
    registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "onlyletterslong",
    }).success,
    false
  );

  assert.equal(
    registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "1234567890",
    }).success,
    false
  );

  assert.equal(
    registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "validPassword123",
    }).success,
    true
  );
});

test("Validation: createUserSchema and userQuerySchema", () => {
  assert.equal(
    createUserSchema.safeParse({
      name: "Alice",
      email: "alice@company.com",
      role: Role.MANAGER,
    }).success,
    true
  );

  assert.equal(
    updateUserSchema.safeParse({
      name: "Alice Updated",
      password: "NewPassword123!",
    }).success,
    true
  );

  const query = userQuerySchema.parse({
    page: "2",
    pageSize: "25",
    search: "Elena",
    role: "ADMIN",
  });
  assert.equal(query.page, 2);
  assert.equal(query.pageSize, 25);
  assert.equal(query.search, "Elena");
  assert.equal(query.role, "ADMIN");
});

test("Validation: createTeamSchema", () => {
  assert.equal(
    createTeamSchema.safeParse({
      name: "DevOps Squad",
      code: "DEVOPS",
      description: "Cloud ops",
    }).success,
    true
  );

  // Short code failure
  assert.equal(
    createTeamSchema.safeParse({
      name: "DevOps Squad",
      code: "D",
    }).success,
    false
  );
});
