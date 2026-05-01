/**
 * Server-side input validation utilities
 * All admin server actions must validate every field before touching the database.
 */

export type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};

function fail(field: string, message: string): ValidationResult {
  return { valid: false, errors: [{ field, message }] };
}

function ok(): ValidationResult {
  return { valid: true, errors: [] };
}

// --- Airport validation ---

const IATA_CODE_RE = /^[A-Z]{3}$/;
const US_STATE_RE = /^[A-Z]{2}$/;

export function validateAirportCode(code: unknown): ValidationResult {
  if (typeof code !== "string" || code.trim().length === 0) {
    return fail("code", "Airport code is required");
  }
  const trimmed = code.trim().toUpperCase();
  if (!IATA_CODE_RE.test(trimmed)) {
    return fail("code", "Airport code must be exactly 3 letters (e.g. LAX, JFK)");
  }
  return ok();
}

export function validateAirportName(name: unknown): ValidationResult {
  if (typeof name !== "string" || name.trim().length < 2) {
    return fail("name", "Airport name is required (at least 2 characters)");
  }
  if (name.trim().length > 200) {
    return fail("name", "Airport name must be under 200 characters");
  }
  return ok();
}

export function validateCity(city: unknown): ValidationResult {
  if (typeof city !== "string" || city.trim().length < 2) {
    return fail("city", "City is required (at least 2 characters)");
  }
  if (city.trim().length > 100) {
    return fail("city", "City must be under 100 characters");
  }
  return ok();
}

export function validateUSState(state: unknown): ValidationResult {
  if (typeof state !== "string" || state.trim().length === 0) {
    return fail("state", "State is required");
  }
  const trimmed = state.trim().toUpperCase();
  if (!US_STATE_RE.test(trimmed)) {
    return fail("state", "State must be a valid 2-letter US state code (e.g. CA, NY)");
  }
  return ok();
}

// --- Parking provider validation ---

const VALID_PARKING_TYPES = [
  "indoor", "outdoor", "covered", "valet", "shuttle", "economy", "premium",
  "outdoor valet", "outdoor self", "outdoor self park",
  "indoor valet", "indoor self", "indoor self park",
  "covered valet", "covered self", "covered self park",
];
const URL_RE = /^https?:\/\/.+/i;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PHONE_RE = /^[\d\s\-\(\)\+\.]{7,20}$/;
const COORDINATE_RE = /^-?\d{1,3}\.\d+$/;

export function validateId(id: unknown): ValidationResult {
  if (typeof id !== "string" || id.trim().length === 0) {
    return fail("id", "ID is required");
  }
  return ok();
}

export function validateParkingName(name: unknown): ValidationResult {
  if (typeof name !== "string" || name.trim().length < 2) {
    return fail("name", "Provider name is required (at least 2 characters)");
  }
  if (name.trim().length > 200) {
    return fail("name", "Provider name must be under 200 characters");
  }
  return ok();
}

export function validateAirportId(airportId: unknown): ValidationResult {
  if (typeof airportId !== "string" || airportId.trim().length === 0) {
    return fail("airportId", "Airport is required");
  }
  // Accept UUIDs (from DB) and non-empty fallback strings
  if (UUID_RE.test(airportId.trim()) || airportId.trim().length > 0) {
    return ok();
  }
  return fail("airportId", "Invalid airport ID format");
}

export function validateParkingType(type: unknown): ValidationResult {
  if (typeof type !== "string" || type.trim().length === 0) {
    return fail("type", "Parking type is required");
  }
  if (!VALID_PARKING_TYPES.includes(type.trim().toLowerCase())) {
    return fail("type", `Type must be one of: ${VALID_PARKING_TYPES.join(", ")}`);
  }
  return ok();
}

export function validatePricePerDay(price: unknown): ValidationResult {
  if (typeof price !== "number" || Number.isNaN(price)) {
    return fail("pricePerDay", "Price per day is required and must be a number");
  }
  if (price < 0) {
    return fail("pricePerDay", "Price per day cannot be negative");
  }
  if (price > 10000) {
    return fail("pricePerDay", "Price per day cannot exceed $10,000");
  }
  return ok();
}

export function validateDistance(distance: unknown): ValidationResult {
  if (typeof distance !== "string" || distance.trim().length === 0) {
    return fail("distance", "Distance is required");
  }
  if (distance.trim().length > 50) {
    return fail("distance", "Distance value is too long");
  }
  return ok();
}

export function validateStringField(value: unknown, field: string, maxLength: number): ValidationResult {
  if (value === undefined || value === null || value === "") {
    return ok(); // Optional fields are OK when empty
  }
  if (typeof value !== "string") {
    return fail(field, `${field} must be a string`);
  }
  if (value.length > maxLength) {
    return fail(field, `${field} must be under ${maxLength} characters`);
  }
  // Reject dangerous HTML/script tags
  if (/<script[\s>]/i.test(value) || /on\w+=/i.test(value)) {
    return fail(field, `${field} contains potentially unsafe content`);
  }
  return ok();
}

export function validateUrl(value: unknown, field: string): ValidationResult {
  if (value === undefined || value === null || value === "") {
    return ok();
  }
  if (typeof value !== "string") {
    return fail(field, `${field} must be a string`);
  }
  if (value.length > 2048) {
    return fail(field, `${field} URL is too long`);
  }
  if (!URL_RE.test(value.trim())) {
    return fail(field, `${field} must be a valid URL starting with http:// or https://`);
  }
  return ok();
}

export function validateNumberRange(value: unknown, field: string, min: number, max: number): ValidationResult {
  if (value === undefined || value === null) {
    return ok();
  }
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fail(field, `${field} must be a number`);
  }
  if (value < min || value > max) {
    return fail(field, `${field} must be between ${min} and ${max}`);
  }
  return ok();
}

export function validateBoolean(value: unknown, field: string): ValidationResult {
  if (value === undefined || value === null) {
    return ok();
  }
  if (typeof value !== "boolean" && ![0, 1].includes(value as number)) {
    return fail(field, `${field} must be true or false`);
  }
  return ok();
}

export function validatePhone(value: unknown, field: string): ValidationResult {
  if (value === undefined || value === null || value === "") {
    return ok();
  }
  if (typeof value !== "string") {
    return fail(field, `${field} must be a string`);
  }
  if (!PHONE_RE.test(value.trim())) {
    return fail(field, `${field} is not a valid phone number`);
  }
  return ok();
}

export function validateJSONString(value: unknown, field: string): ValidationResult {
  if (value === undefined || value === null || value === "") {
    return ok();
  }
  if (typeof value !== "string") {
    return fail(field, `${field} must be a JSON string`);
  }
  try {
    JSON.parse(value);
    return ok();
  } catch {
    return fail(field, `${field} is not valid JSON`);
  }
}

export function validateCoordinate(value: unknown, field: string): ValidationResult {
  if (value === undefined || value === null || value === "") {
    return ok();
  }
  if (typeof value !== "string") {
    return fail(field, `${field} must be a string`);
  }
  if (!COORDINATE_RE.test(value.trim())) {
    return fail(field, `${field} is not a valid coordinate`);
  }
  return ok();
}

// --- Batch validation helper ---

export function combineValidations(...results: ValidationResult[]): ValidationResult {
  const errors = results.flatMap((r) => r.errors);
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  return ok();
}
