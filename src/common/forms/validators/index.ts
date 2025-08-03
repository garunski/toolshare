export const emailValidator = (value: string): string | undefined => {
  if (!value) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return "Please enter a valid email address";
  return undefined;
};

export const passwordValidator = (value: string): string | undefined => {
  if (!value) return "Password is required";
  if (value.length < 8) return "Password must be at least 8 characters";
  if (!/(?=.*[a-z])/.test(value))
    return "Password must contain at least one lowercase letter";
  if (!/(?=.*[A-Z])/.test(value))
    return "Password must contain at least one uppercase letter";
  if (!/(?=.*\d)/.test(value))
    return "Password must contain at least one number";
  return undefined;
};

export const nameValidator = (value: string): string | undefined => {
  if (!value) return "Name is required";
  if (value.length < 2) return "Name must be at least 2 characters";
  if (value.length > 50) return "Name must be less than 50 characters";
  if (!/^[a-zA-Z\s'-]+$/.test(value))
    return "Name can only contain letters, spaces, hyphens, and apostrophes";
  return undefined;
};

export const requiredValidator = (value: string): string | undefined => {
  if (!value || !value.trim()) return "This field is required";
  return undefined;
};

export const minLengthValidator =
  (min: number) =>
  (value: string): string | undefined => {
    if (value && value.length < min)
      return `Must be at least ${min} characters`;
    return undefined;
  };

export const maxLengthValidator =
  (max: number) =>
  (value: string): string | undefined => {
    if (value && value.length > max)
      return `Must be less than ${max} characters`;
    return undefined;
  };

export const phoneValidator = (value: string): string | undefined => {
  if (!value) return "Phone number is required";
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ""))) {
    return "Please enter a valid phone number";
  }
  return undefined;
};

export const urlValidator = (value: string): string | undefined => {
  if (!value) return "URL is required";
  try {
    new URL(value);
    return undefined;
  } catch {
    return "Please enter a valid URL";
  }
};

export const numberValidator = (value: string): string | undefined => {
  if (!value) return "Number is required";
  if (isNaN(Number(value))) return "Please enter a valid number";
  return undefined;
};

export const positiveNumberValidator = (value: string): string | undefined => {
  const numberError = numberValidator(value);
  if (numberError) return numberError;
  if (Number(value) <= 0) return "Number must be positive";
  return undefined;
};
