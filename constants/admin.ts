export const ADMIN_EMAILS = [
  'colerightnow@gmail.com',
];

export const isAdminEmail = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
};
