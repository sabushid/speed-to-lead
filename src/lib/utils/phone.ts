import { parsePhoneNumberFromString } from "libphonenumber-js";

export function formatE164(phone: string, defaultCountry = "US"): string {
  const parsed = parsePhoneNumberFromString(
    phone,
    defaultCountry as Parameters<typeof parsePhoneNumberFromString>[1]
  );
  if (!parsed || !parsed.isValid()) {
    throw new Error(`Invalid phone number: ${phone}`);
  }
  return parsed.format("E.164");
}

export function formatDisplay(phone: string): string {
  const parsed = parsePhoneNumberFromString(phone, "US");
  return parsed?.formatNational() ?? phone;
}
