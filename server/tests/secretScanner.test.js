import { describe, it, expect } from "vitest";
import { scanFileForSecrets } from "../lib/secretScanner.js";

describe("scanFileForSecrets", () => {
  it("flags a hardcoded AWS key", () => {
    const code = `const awsKey = "AKIAIOSFODNN7EXAMPLE";`;
    const findings = scanFileForSecrets(code, "config.js");
    expect(findings).toHaveLength(1);
    expect(findings[0].type).toBe("AWS Access Key");
  });

    it("flags a hardcoded Stripe live key", () => {
    const fakeKey = "sk_live_" + "0".repeat(24); // deliberately fake, still matches the pattern
    const code = `const stripeSecret = "${fakeKey}";`;
    const findings = scanFileForSecrets(code, "billing.js");
    expect(findings).toHaveLength(1);
    expect(findings[0].type).toBe("Stripe Live Key");
    });

  it("does NOT flag env var references", () => {
    const code = `const apiKey = process.env.API_KEY;`;
    const findings = scanFileForSecrets(code, "config.js");
    expect(findings).toHaveLength(0);
  });

  it("does NOT flag legitimate auth-related variable names without real secret values", () => {
    const code = `
      const clientSecret = process.env.OAUTH_CLIENT_SECRET;
      const tokenHash = bcrypt.hashSync(token, 10);
      function generateToken() { return jwt.sign(payload, secretKey); }
    `;
    const findings = scanFileForSecrets(code, "auth.service.ts");
    expect(findings).toHaveLength(0);
  });

  it("does NOT flag placeholder values", () => {
    const code = `const apiKey = "your-api-key-here";`;
    const findings = scanFileForSecrets(code, "config.example.js");
    expect(findings).toHaveLength(0);
  });
});