// Small reusable validation helpers.
// Each function returns an error message (string) or "" if the value is fine.

export function validateEmail(email) {
  const value = email.trim();
  if (!value) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address.";
  return "";
}

// Indian mobile number: 10 digits starting with 6-9 (optional +91 / 0 prefix)
export function cleanPhone(phone) {
  return phone.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, "");
}

export function validatePhone(phone) {
  const digits = cleanPhone(phone);
  if (!digits) return "Phone number is required.";
  if (!/^[6-9]\d{9}$/.test(digits)) return "Enter a valid 10-digit Indian mobile number.";
  return "";
}

export function validateName(name) {
  if (name.trim().length < 3) return "Enter your full name (at least 3 letters).";
  if (name.trim().length > 80) return "Name is too long.";
  return "";
}

// Policy: at least 8 characters, with at least one letter and one number.
export function validatePassword(password) {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Password must contain at least one letter and one number.";
  }
  return "";
}

export function validateRegistration(form) {
  return (
    validateName(form.name) ||
    validateEmail(form.email) ||
    validatePhone(form.phone) ||
    validatePassword(form.password) ||
    (form.password !== form.confirmPassword ? "Passwords do not match." : "")
  );
}

// Checks a service form against the field list in data.js.
export function validateServiceForm(service, values) {
  for (const field of service.fields) {
    const value = (values[field.name] || "").trim();
    if (field.required && !value) return `${field.label} is required.`;
    if (value.length > 500) return `${field.label} is too long (max 500 characters).`;
  }
  return "";
}
