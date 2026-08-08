import { Resend } from "resend";

interface InviteEmailOptions {
  recipientEmail: string;
  inviterName: string;
  inviterEmail: string;
  projectName: string;
  projectId: string;
  projectUrl: string;
}

interface InvitationAcceptedEmailOptions {
  ownerEmail: string;
  acceptorName: string;
  acceptorEmail: string;
  projectName: string;
  projectId: string;
  projectUrl: string;
}

export async function sendProjectInviteEmail({
  recipientEmail,
  inviterName,
  inviterEmail,
  projectName,
  projectId,
  projectUrl,
}: InviteEmailOptions): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Ghost AI <onboarding@resend.dev>";

  const subject = `${inviterName || inviterEmail} invited you to collaborate on "${projectName}"`;

  const acceptUrl = `${projectUrl}${projectUrl.includes("?") ? "&" : "?"}acceptInvite=true`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #080809; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f0f0f4;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #080809; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #111114; border: 1px solid #2a2a30; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
          <!-- Header Branding -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #2a2a30; background: linear-gradient(180deg, rgba(0, 200, 212, 0.08) 0%, rgba(17, 17, 20, 0) 100%);">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 700; color: #00c8d4; letter-spacing: -0.5px;">Ghost AI</span>
                    <span style="display: block; font-size: 12px; color: #808090; margin-top: 2px;">Real-Time System Design Architecture</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="font-size: 20px; font-weight: 600; color: #f0f0f4; margin: 0 0 16px 0; line-height: 1.4;">
                Project Collaboration Invitation
              </h1>
              
              <p style="font-size: 15px; color: #c0c0cc; line-height: 1.6; margin: 0 0 20px 0;">
                <strong style="color: #f0f0f4;">${inviterName || inviterEmail}</strong> (${inviterEmail}) has invited you to collaborate in real-time on the architecture canvas for <strong style="color: #00c8d4;">"${projectName}"</strong>.
              </p>

              <!-- Project Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #18181c; border: 1px solid #3a3a42; border-radius: 12px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #808090; font-weight: 600;">Project Workspace</span>
                    <div style="font-size: 16px; font-weight: 600; color: #f0f0f4; margin-top: 4px;">${projectName}</div>
                    <div style="font-size: 12px; color: #505060; margin-top: 2px; font-family: monospace;">ID: ${projectId}</div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 28px 0;">
                <tr>
                  <td align="center" style="border-radius: 10px; background-color: #00c8d4;">
                    <a href="${acceptUrl}" target="_blank" style="font-size: 14px; font-weight: 600; color: #080809; text-decoration: none; display: inline-block; padding: 12px 28px; border-radius: 10px; border: 1px solid #00c8d4;">
                      Accept Invitation & Join Canvas &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; color: #808090; line-height: 1.5; margin: 0 0 8px 0;">
                If the button above does not work, copy and paste this link into your browser:
              </p>
              <p style="font-size: 12px; color: #00c8d4; word-break: break-all; margin: 0; font-family: monospace;">
                <a href="${acceptUrl}" style="color: #00c8d4; text-decoration: underline;">${acceptUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0d0d10; border-top: 1px solid #2a2a30; text-align: center;">
              <p style="font-size: 12px; color: #505060; margin: 0;">
                Ghost AI System Design Workspace &bull; Real-time Multiplayer Architecture
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const textContent = `
Ghost AI Project Invitation

${inviterName || inviterEmail} (${inviterEmail}) has invited you to collaborate in real-time on "${projectName}".

Accept Invitation: ${acceptUrl}

Workspace ID: ${projectId}
  `.trim();

  if (!apiKey) {
    console.log("--------------------------------------------------");
    console.log("[Invite Email - SIMULATED LOG]");
    console.log(`To: ${recipientEmail}`);
    console.log(`From: ${inviterEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Accept Link: ${acceptUrl}`);
    console.log("Set RESEND_API_KEY in .env.local to send live emails.");
    console.log("--------------------------------------------------");
    return { success: true, simulated: true };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      subject,
      html: htmlContent,
      text: textContent,
    });

    if (result.error) {
      console.error("❌ [Resend] Delivery failed:");
      console.error("   To:", recipientEmail);
      console.error("   From:", fromEmail);
      console.error("   Error name:", result.error.name);
      console.error("   Error message:", result.error.message);
      console.error("   Full error:", JSON.stringify(result.error, null, 2));
      return { success: false, error: `${result.error.name}: ${result.error.message}` };
    }

    console.log("✅ [Resend] Invitation email sent to:", recipientEmail, "| ID:", result.data?.id);
    return { success: true };
  } catch (error) {
    console.error("❌ [Resend] Exception sending invitation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

export async function sendInvitationAcceptedEmail({
  ownerEmail,
  acceptorName,
  acceptorEmail,
  projectName,
  projectId,
  projectUrl,
}: InvitationAcceptedEmailOptions): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Ghost AI <onboarding@resend.dev>";

  const subject = `${acceptorName || acceptorEmail} accepted your invitation to collaborate on "${projectName}"`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #080809; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f0f0f4;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #080809; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #111114; border: 1px solid #2a2a30; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
          <!-- Header Branding -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #2a2a30; background: linear-gradient(180deg, rgba(52, 211, 153, 0.12) 0%, rgba(17, 17, 20, 0) 100%);">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 700; color: #34d399; letter-spacing: -0.5px;">Ghost AI</span>
                    <span style="display: block; font-size: 12px; color: #808090; margin-top: 2px;">Invitation Accepted</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="font-size: 20px; font-weight: 600; color: #f0f0f4; margin: 0 0 16px 0; line-height: 1.4;">
                Invitation Accepted! 🎉
              </h1>
              
              <p style="font-size: 15px; color: #c0c0cc; line-height: 1.6; margin: 0 0 20px 0;">
                <strong style="color: #f0f0f4;">${acceptorName || acceptorEmail}</strong> (${acceptorEmail}) has accepted your invitation and joined your project workspace <strong style="color: #34d399;">"${projectName}"</strong>.
              </p>

              <!-- Project Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #18181c; border: 1px solid #3a3a42; border-radius: 12px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #808090; font-weight: 600;">Project Workspace</span>
                    <div style="font-size: 16px; font-weight: 600; color: #f0f0f4; margin-top: 4px;">${projectName}</div>
                    <div style="font-size: 12px; color: #34d399; margin-top: 4px; font-weight: 500;">Status: Active Collaborator</div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 28px 0;">
                <tr>
                  <td align="center" style="border-radius: 10px; background-color: #34d399;">
                    <a href="${projectUrl}" target="_blank" style="font-size: 14px; font-weight: 600; color: #080809; text-decoration: none; display: inline-block; padding: 12px 28px; border-radius: 10px; border: 1px solid #34d399;">
                      Open Canvas & Collaborator Workspace &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; color: #808090; margin: 0;">
                Link: <a href="${projectUrl}" style="color: #34d399; text-decoration: underline;">${projectUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0d0d10; border-top: 1px solid #2a2a30; text-align: center;">
              <p style="font-size: 12px; color: #505060; margin: 0;">
                Ghost AI System Design Workspace &bull; Real-time Multiplayer Architecture
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const textContent = `
Ghost AI - Invitation Accepted!

${acceptorName || acceptorEmail} (${acceptorEmail}) has accepted your invitation to collaborate on "${projectName}".

Open Workspace: ${projectUrl}
  `.trim();

  if (!apiKey) {
    console.log("--------------------------------------------------");
    console.log("[Invitation Accepted Email - SIMULATED LOG]");
    console.log(`To Owner: ${ownerEmail}`);
    console.log(`Accepted By: ${acceptorEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Link: ${projectUrl}`);
    console.log("Set RESEND_API_KEY in .env.local to send live emails.");
    console.log("--------------------------------------------------");
    return { success: true, simulated: true };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: fromEmail,
      to: ownerEmail,
      subject,
      html: htmlContent,
      text: textContent,
    });

    if (result.error) {
      console.error("❌ [Resend] Accepted-email delivery failed:");
      console.error("   To (owner):", ownerEmail);
      console.error("   From:", fromEmail);
      console.error("   Error name:", result.error.name);
      console.error("   Error message:", result.error.message);
      console.error("   Full error:", JSON.stringify(result.error, null, 2));
      return { success: false, error: `${result.error.name}: ${result.error.message}` };
    }

    console.log("✅ [Resend] Acceptance email sent to owner:", ownerEmail, "| ID:", result.data?.id);
    return { success: true };
  } catch (error) {
    console.error("❌ [Resend] Exception sending acceptance email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}
