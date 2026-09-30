/**
 * Email validation and typo detection utilities for Fudi Club.
 */

// Common disposable email domains
export const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'guerrillamail.biz',
  'guerrillamail.de',
  'guerrillamail.net',
  'guerrillamail.org',
  'sharklasers.com',
  'yopmail.com',
  'yopmail.net',
  'trashmail.com',
  'dispostable.com',
  'getnada.com',
  'inboxkitten.com',
  'throwawaymail.com',
  'mohmal.com',
  'fakeinbox.com',
  'fakemailgenerator.com',
  'burnermail.io',
  'crazymailing.com',
  'trashmail.net'
]);

// Common domain typos mapped to their correct equivalents
export const DOMAIN_TYPOS = {
  // Gmail typos
  'gnail.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmaik.com': 'gmail.com',
  'gmail.es': 'gmail.com',
  'gemail.com': 'gmail.com',
  'gmaio.com': 'gmail.com',
  'gmaul.com': 'gmail.com',

  // Hotmail typos
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmali.com': 'hotmail.com',
  'hormail.com': 'hotmail.com',
  'hotmail.con': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'hotmsil.com': 'hotmail.com',

  // Outlook typos
  'outlok.com': 'outlook.com',
  'outllok.com': 'outlook.com',
  'outlook.con': 'outlook.com',
  'ootlook.com': 'outlook.com',
  'outloock.com': 'outlook.com',

  // Yahoo typos
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  'yaho.com.ar': 'yahoo.com.ar',
  'yahooo.com.ar': 'yahoo.com.ar',

  // iCloud typos
  'iclud.com': 'icloud.com',
  'icould.com': 'icloud.com',
  'icloud.con': 'icloud.com',

  // Live typos
  'live.con': 'live.com'
};

// RFC 5322 compliant simplified regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validates the basic syntax of an email address.
 * @param {string} email 
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateEmailSyntax(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, reason: 'Por favor ingresá tu correo electrónico.' };
  }

  const trimmed = email.trim();
  if (trimmed.length > 254) {
    return { valid: false, reason: 'El correo electrónico es demasiado largo.' };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, reason: 'El formato del correo electrónico no es válido.' };
  }

  const [localPart, domain] = trimmed.split('@');
  if (!localPart || !domain) {
    return { valid: false, reason: 'El formato del correo electrónico no es válido.' };
  }

  if (domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) {
    return { valid: false, reason: 'El dominio del correo contiene puntos consecutivos o inválidos.' };
  }

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2) {
    return { valid: false, reason: 'La extensión del correo (ej. .com) no es válida.' };
  }

  return { valid: true };
}

/**
 * Checks if the email domain belongs to a disposable/temporary provider.
 * @param {string} email 
 * @returns {boolean}
 */
export function isDisposableEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return false;
  return DISPOSABLE_DOMAINS.has(parts[1]);
}

/**
 * Suggests a typo correction for common domains (e.g. gnail.com -> gmail.com).
 * @param {string} email 
 * @returns {string|null} The corrected full email address, or null if no typo detected.
 */
export function suggestEmailCorrection(email) {
  if (!email || typeof email !== 'string') return null;
  const trimmed = email.trim().toLowerCase();
  const atIndex = trimmed.lastIndexOf('@');
  if (atIndex === -1 || atIndex === 0 || atIndex === trimmed.length - 1) return null;

  const localPart = email.trim().substring(0, atIndex);
  const domain = trimmed.substring(atIndex + 1);

  if (DOMAIN_TYPOS[domain]) {
    return `${localPart}@${DOMAIN_TYPOS[domain]}`;
  }

  return null;
}

/**
 * Validates street address format for delivery (requires street name and number).
 * @param {string} address 
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateAddress(address) {
  if (!address || typeof address !== 'string') {
    return { valid: false, reason: 'Por favor ingresá tu dirección (calle y número).' };
  }

  const trimmed = address.trim();
  if (trimmed.length < 5) {
    return { valid: false, reason: 'La dirección es demasiado corta. Ingresá calle y altura (ej: Av. Corrientes 1500).' };
  }

  // Must contain at least one digit for street number (altura)
  if (!/\d+/.test(trimmed)) {
    return { valid: false, reason: 'Falta el número o altura de la calle (ej: Av. Corrientes 1500).' };
  }

  return { valid: true };
}

/**
 * Validates full name (requires at least first name and last name).
 * @param {string} name 
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateFullName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, reason: 'Por favor ingresá tu nombre y apellido.' };
  }

  const trimmed = name.trim();
  if (trimmed.length < 4) {
    return { valid: false, reason: 'Por favor ingresá tu nombre y apellido completo (ej: Juan Pérez).' };
  }

  if (/\d/.test(trimmed)) {
    return { valid: false, reason: 'El nombre no puede contener números.' };
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length < 2) {
    return { valid: false, reason: 'Por favor ingresá tu nombre y apellido (ej: Juan Pérez).' };
  }

  if (parts[0].length < 2 || parts[1].length < 2) {
    return { valid: false, reason: 'Por favor ingresá un nombre y apellido válidos.' };
  }

  return { valid: true };
}


