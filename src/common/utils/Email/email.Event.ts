import { EventEmitter } from "events";
import { sendEmail } from "./send.email";
import { emailTemplate } from "./designs/email.template";
import { restTemplate } from "./designs/rest.password"
import { twoFactorAuthenticationTemplate } from "./designs/TwoFactorAuthentication";
import { changeRoleTemplate } from "./designs/ChangeRole";
import { OtpEnum } from "src/common/enums";

export const emailEvent = new EventEmitter();

interface EmailEventData {
  to: string;
  otp: string;
  subject?: string;
}

const safeSendEmail = async (to: string, subject: string, html: string) => {
  try {
    await sendEmail({ to, subject, html });
  } catch (error) {
    console.error(`Fail To Send OTP TO ${to}`, error);
  }
};

emailEvent.on(OtpEnum.ConfirmEmail, async (data: EmailEventData) => {
  await safeSendEmail(
    data.to,
    data.subject || OtpEnum.ConfirmEmail,
    emailTemplate({ otp: data.otp })
  );
});

emailEvent.on(OtpEnum.ResetPassword, async (data: EmailEventData) => {
  await safeSendEmail(
    data.to,
    data.subject || OtpEnum.ResetPassword,
    restTemplate({ otp: data.otp })
  );
});


emailEvent.on(OtpEnum.RoleChanged, async (data: EmailEventData) => {
  await safeSendEmail(
    data.to,
    data.subject || OtpEnum.RoleChanged,
    changeRoleTemplate({ otp: data.otp })
  );
});

emailEvent.on(OtpEnum.TwoStepVerification, async (data: EmailEventData) => {
  await safeSendEmail(
    data.to,
    data.subject || OtpEnum.TwoStepVerification,
    twoFactorAuthenticationTemplate({ otp: data.otp })
  );
});