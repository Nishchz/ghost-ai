/**
 * Quick Resend email test — run with:
 *   npx tsx scripts/test-email.ts
 */
import dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || "Ghost AI <onboarding@resend.dev>";

if (!apiKey) {
  console.error("❌ RESEND_API_KEY is not set in .env.local");
  process.exit(1);
}

console.log("🔑 Using API key:", apiKey.slice(0, 8) + "...");
console.log("📧 From:", fromEmail);

// ─── Edit this to your test recipient ────────────────────────────────────────
const TEST_TO = "ka65082647@gmail.com"; // ← the collaborator's email
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  console.log("\n📨 Sending test email to:", TEST_TO, "...");

  const result = await resend.emails.send({
    from: fromEmail,
    to: TEST_TO,
    subject: "Ghost AI — Test Invitation Email",
    html: `<h1>Test Email</h1><p>This is a test from Ghost AI. If you receive this, Resend is working correctly!</p>`,
    text: "Test email from Ghost AI. If you receive this, Resend is working correctly!",
  });

  if (result.error) {
    console.error("\n❌ Resend error:");
    console.error("   Name:", result.error.name);
    console.error("   Message:", result.error.message);
    console.error("   Full:", JSON.stringify(result.error, null, 2));
    console.error("\n🔍 Most likely causes:");
    console.error("   1. Free plan: 'onboarding@resend.dev' can ONLY send to your Resend account email");
    console.error("   2. Solution: Add TEST_TO email as a verified recipient OR verify your own domain");
    console.error("   3. See: https://resend.com/docs/send-with-nodejs#2-send-an-email");
  } else {
    console.log("\n✅ Email sent successfully!");
    console.log("   Email ID:", result.data?.id);
    console.log("   Check inbox of:", TEST_TO);
  }
}

main().catch(console.error);
