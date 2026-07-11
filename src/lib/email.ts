import nodemailer from "nodemailer";
import { SITE_NAME } from "@/lib/constants";

const isSmtpConfigured =
  !!process.env.EMAIL_SERVER_HOST &&
  process.env.EMAIL_SERVER_HOST !== "smtp.example.com";

const transporter = isSmtpConfigured
  ? nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
      secure: Number(process.env.EMAIL_SERVER_PORT ?? 587) === 465,
      auth: process.env.EMAIL_SERVER_USER
        ? {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          }
        : undefined,
    })
  : null;

interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Gửi email qua SMTP. Nếu chưa cấu hình biến môi trường EMAIL_SERVER_HOST
 * (vẫn là giá trị mẫu trong .env.example) hoặc việc gửi thất bại, nội
 * dung email được in ra console thay vì làm hỏng luồng đăng ký/đặt lại
 * mật khẩu — giúp phát triển/test local không cần SMTP thật.
 */
export async function sendMail({ to, subject, html, text }: SendMailInput) {
  if (!transporter) {
    logToConsole(to, subject, text, "Chưa cấu hình SMTP (EMAIL_SERVER_HOST)");
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM ?? `"${SITE_NAME}" <no-reply@example.com>`,
      to,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error("[email] Gửi email thất bại:", error);
    logToConsole(to, subject, text, "Gửi SMTP thất bại, xem lỗi phía trên");
  }
}

function logToConsole(
  to: string,
  subject: string,
  text: string,
  reason: string,
) {
  console.log(
    `\n📧 [DEV EMAIL — ${reason}]\nGửi tới : ${to}\nTiêu đề : ${subject}\n${"-".repeat(50)}\n${text}\n${"-".repeat(50)}\n`,
  );
}

export function buildVerificationEmail(displayName: string, verifyUrl: string) {
  const subject = `Xác thực email — ${SITE_NAME}`;
  const text = `Xin chào ${displayName},

Cảm ơn bạn đã đăng ký tài khoản ${SITE_NAME}. Vui lòng bấm vào liên kết sau để xác thực địa chỉ email:

${verifyUrl}

Liên kết có hiệu lực trong 24 giờ. Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.`;

  const html = emailLayout(`
    <p>Xin chào <strong>${escapeHtml(displayName)}</strong>,</p>
    <p>Cảm ơn bạn đã đăng ký tài khoản <strong>${SITE_NAME}</strong>. Vui lòng bấm vào nút bên dưới để xác thực địa chỉ email của bạn:</p>
    <p style="text-align:center; margin: 32px 0;">
      <a href="${verifyUrl}" style="background:#1d7a6e;color:#ffffff;padding:12px 24px;border-radius:4px;text-decoration:none;font-weight:600;display:inline-block;">Xác thực email</a>
    </p>
    <p style="font-size:13px;color:#666;">Liên kết có hiệu lực trong 24 giờ. Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.</p>
  `);

  return { subject, text, html };
}

export function buildPasswordResetEmail(displayName: string, resetUrl: string) {
  const subject = `Đặt lại mật khẩu — ${SITE_NAME}`;
  const text = `Xin chào ${displayName},

Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản ${SITE_NAME} của bạn. Bấm vào liên kết sau để đặt mật khẩu mới:

${resetUrl}

Liên kết có hiệu lực trong 1 giờ. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này — mật khẩu hiện tại của bạn vẫn an toàn.`;

  const html = emailLayout(`
    <p>Xin chào <strong>${escapeHtml(displayName)}</strong>,</p>
    <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${SITE_NAME}</strong> của bạn. Bấm vào nút bên dưới để đặt mật khẩu mới:</p>
    <p style="text-align:center; margin: 32px 0;">
      <a href="${resetUrl}" style="background:#1d7a6e;color:#ffffff;padding:12px 24px;border-radius:4px;text-decoration:none;font-weight:600;display:inline-block;">Đặt lại mật khẩu</a>
    </p>
    <p style="font-size:13px;color:#666;">Liên kết có hiệu lực trong 1 giờ. Nếu bạn không yêu cầu, vui lòng bỏ qua email này — mật khẩu hiện tại vẫn an toàn.</p>
  `);

  return { subject, text, html };
}

function emailLayout(innerHtml: string) {
  return `<!DOCTYPE html>
<html lang="vi">
  <body style="margin:0;padding:0;background:#f2f5f3;font-family:Arial,Helvetica,sans-serif;color:#16211e;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #d7ddda;border-radius:6px;padding:32px;">
            <tr>
              <td style="font-size:18px;font-weight:700;color:#1d7a6e;padding-bottom:16px;">${SITE_NAME}</td>
            </tr>
            <tr>
              <td style="font-size:14px;line-height:1.6;">${innerHtml}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
