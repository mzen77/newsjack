import assert from "node:assert/strict";
import test from "node:test";

import {
  createOpaqueToken,
  hashToken,
  normalizeEmail,
  sessionCookie,
} from "./auth-core.ts";

test("normalizes email addresses before identity lookup", () => {
  assert.equal(normalizeEmail("  MIKE@Example.COM "), "mike@example.com");
});

test("hashes opaque tokens without retaining the original value", async () => {
  const token = createOpaqueToken();
  const digest = await hashToken(token);

  assert.match(token, /^[A-Za-z0-9_-]{32,}$/);
  assert.match(digest, /^[a-f0-9]{64}$/);
  assert.notEqual(digest, token);
});

test("session cookie is secure and inaccessible to browser scripts", () => {
  const cookie = sessionCookie("session-token", true);

  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Path=\//);
  assert.doesNotMatch(cookie, /session-token;.*Domain=/);
});
