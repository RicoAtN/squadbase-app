import nodemailer from "nodemailer";

/**
 * Sends sign-in and invite emails through Zoho Mail (SMTP via nodemailer).
 * Requires SMTP_HOST, SMTP_USER and SMTP_PASS (Zoho App Password).
 * Outside production, without credentials, the link is logged to the console.
 * Every send function resolves to `true` when the mail was accepted by the SMTP server.
 */

type MailPayload = { from: string; to: string; subject: string; text: string; html: string };

async function deliver(mail: MailPayload, devLabel: string, devLink: string): Promise<boolean> {
  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      await transporter.sendMail(mail);
      return true;
    } catch (err) {
      console.error("[mail:smtp] Verzenden via Zoho/SMTP mislukt:", err);
      if (process.env.NODE_ENV !== "production") {
        console.log(`\n[dev fallback] ${devLabel}:\n${devLink}\n`);
        return true;
      }
      return false;
    }
  }

  if (process.env.NODE_ENV !== "production") {
    console.log(`\n[dev] ${devLabel}:\n${devLink}\n`);
    return true;
  }
  console.error("[mail] Geen e-mailconfiguratie gevonden (stel SMTP_HOST, SMTP_USER en SMTP_PASS in).");
  return false;
}

function getSmtpTransporter() {
  const host = process.env.SMTP_HOST; // bijv. smtppro.zoho.eu of smtp.zoho.eu of smtp.zoho.com
  const user = process.env.SMTP_USER; // bijv. info@squadbase.nl
  const pass = process.env.SMTP_PASS; // Zoho App Password
  const port = Number(process.env.SMTP_PORT || 465);

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true voor poort 465 SSL, false voor 587 TLS
    auth: {
      user,
      pass,
    },
    // Fail fast so a slow SMTP server can't hang the login request.
    connectionTimeout: 8_000,
    greetingTimeout: 8_000,
    socketTimeout: 12_000,
  });
}

function emailWrapper(title: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0b1b30 0%, #122c4f 100%); padding: 28px 32px; text-align: left; border-bottom: 3px solid #c49e4b;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-block; background: rgba(196, 158, 75, 0.15); border: 1px solid rgba(196, 158, 75, 0.35); border-radius: 12px; padding: 6px 12px; margin-bottom: 8px;">
                      <span style="font-size: 13px; font-weight: 800; color: #f5d688; letter-spacing: 0.5px; text-transform: uppercase;">🛡️ Squadbase</span>
                    </div>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; line-height: 1.3;">${title}</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; line-height: 1.6; font-size: 15px; color: #334155;">
              ${contentHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0 0 4px 0;">Squadbase — Het digitale clubhuis voor jouw amateurvoetbalteam.</p>
              <p style="margin: 0;">Heb je dit niet aangevraagd? Dan kun je deze e-mail veilig negeren.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendLoginEmail(to: string, link: string): Promise<boolean> {
  const from = process.env.MAIL_FROM ?? (process.env.SMTP_USER ? `Squadbase <${process.env.SMTP_USER}>` : "Squadbase <login@squadbase.nl>");
  const plainText = `Klik op de link om direct in te loggen bij Squadbase (24 uur geldig, eenmalig te gebruiken):\n\n${link}\n\nHeb je dit niet aangevraagd? Dan kun je deze e-mail negeren.`;
  const html = emailWrapper(
    "Inloggen bij Squadbase",
    `<p style="margin-top: 0;">Hallo,</p>
     <p>Gebruik de onderstaande knop om veilig in te loggen op je Squadbase account. Geen wachtwoord nodig!</p>
     <div style="text-align: center; margin: 32px 0;">
       <a href="${link}" style="background-color: #122c4f; border: 1px solid #c49e4b; color: #ffffff; font-weight: 700; font-size: 15px; padding: 14px 28px; text-decoration: none; border-radius: 12px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(18, 44, 79, 0.2);">
         Direct Inloggen &rarr;
       </a>
     </div>
     <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
       <em>Deze inloglink is <strong>24 uur geldig</strong> en kan eenmalig gebruikt worden.</em>
     </p>
     <div style="margin-top: 20px; padding: 12px; background: #f1f5f9; border-radius: 8px; font-size: 11px; word-break: break-all; color: #64748b;">
       Werkt de knop niet? Kopieer dan deze link in je browser:<br>
       <a href="${link}" style="color: #122c4f;">${link}</a>
     </div>`
  );

  return deliver(
    { from, to, subject: "Je inloglink voor Squadbase", text: plainText, html },
    `Login link for ${to}`,
    link,
  );
}

export async function sendTeamInviteEmail({
  to,
  managerName,
  teamName,
  subdomain,
  link,
}: {
  to: string;
  managerName: string;
  teamName: string;
  subdomain: string;
  link: string;
}): Promise<boolean> {
  const from = process.env.MAIL_FROM ?? (process.env.SMTP_USER ? `Squadbase <${process.env.SMTP_USER}>` : "Squadbase <login@squadbase.nl>");
  const subject = `Je bent uitgenodigd als beheerder van ${teamName} op Squadbase`;
  const plainText = `Hallo ${managerName},\n\nEr is een Squadbase omgeving klaargezet voor ${teamName} (${subdomain}.squadbase.nl).\n\nKlik op de onderstaande link om direct in te loggen en je teamomgeving in te stellen (7 dagen geldig, eenmalig te gebruiken):\n\n${link}\n\nMet sportieve groet,\nHet Squadbase Team`;

  const html = emailWrapper(
    `Welkom bij Squadbase, ${managerName}!`,
    `<p style="margin-top: 0;">Hallo <strong>${managerName}</strong>,</p>
     <p>Er is zojuist een officiële Squadbase teamomgeving aangemaakt voor <strong>${teamName}</strong>!</p>
     
     <div style="background-color: #f1f6fc; border: 1px solid #c49e4b; border-radius: 12px; padding: 14px 18px; margin: 20px 0;">
       <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #8f6a1a; letter-spacing: 0.5px;">Jouw Teampagina</div>
       <div style="font-size: 16px; font-weight: 700; color: #122c4f; margin-top: 2px;">
         ${subdomain}.squadbase.nl
       </div>
     </div>

     <p>Klik op de onderstaande knop om direct in te loggen in het Team Beheerpaneel. Hier kun je de teamkleuren aanpassen, spelers toevoegen en de boetepot bijhouden.</p>

     <div style="text-align: center; margin: 32px 0;">
       <a href="${link}" style="background-color: #122c4f; border: 1px solid #c49e4b; color: #ffffff; font-weight: 700; font-size: 15px; padding: 14px 28px; text-decoration: none; border-radius: 12px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(18, 44, 79, 0.2);">
         Inloggen & Team Beheren &rarr;
       </a>
     </div>

     <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
       <em>Deze uitnodiging is <strong>7 dagen geldig</strong> en kan eenmalig gebruikt worden om in te loggen.</em>
     </p>
     <div style="margin-top: 20px; padding: 12px; background: #f1f5f9; border-radius: 8px; font-size: 11px; word-break: break-all; color: #64748b;">
       Werkt de knop niet? Kopieer dan deze link in je browser:<br>
       <a href="${link}" style="color: #122c4f;">${link}</a>
     </div>`
  );

  return deliver(
    { from, to, subject, text: plainText, html },
    `Team Invite for ${managerName} (${to}) for ${teamName} (${subdomain})`,
    link,
  );
}

