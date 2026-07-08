export const ALLOWED_EMAIL_DOMAIN = "goingmerry.xyz";

export function isAllowedEmail(email: string | null | undefined) {
  return email?.toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`) ?? false;
}

export function unauthorizedDomainMessage() {
  return `Please sign in with your @${ALLOWED_EMAIL_DOMAIN} Google account.`;
}
