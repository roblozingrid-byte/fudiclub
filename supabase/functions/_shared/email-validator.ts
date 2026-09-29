// Shared Email Validation for Supabase Edge Functions (Deno)

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

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export interface EmailValidationResult {
  valid: boolean;
  reason?: string;
  domain?: string;
}

/**
 * Validates an email address passively:
 * 1. Syntax check
 * 2. Disposable/temporary domain blocklist
 * 3. DNS MX record check (with RFC 'A' record fallback and safe timeout)
 */
export async function validateEmail(email: string): Promise<EmailValidationResult> {
  if (!email || typeof email !== 'string') {
    return { valid: false, reason: 'El correo electrónico es requerido.' };
  }

  const trimmed = email.trim();
  if (trimmed.length > 254) {
    return { valid: false, reason: 'El correo electrónico es demasiado largo.' };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, reason: 'El formato del correo electrónico no es válido.' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { valid: false, reason: 'El formato del correo electrónico no es válido.' };
  }

  const localPart = parts[0];
  const domain = parts[1].toLowerCase();

  if (!localPart || !domain) {
    return { valid: false, reason: 'El formato del correo electrónico no es válido.' };
  }

  if (domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) {
    return { valid: false, reason: 'El dominio del correo contiene puntos inválidos.' };
  }

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2) {
    return { valid: false, reason: 'La extensión del dominio del correo no es válida.' };
  }

  // Check disposable email providers
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, reason: 'No se permiten correos temporales o desechables.' };
  }

  // Check DNS records via Deno.resolveDns
  if (typeof Deno !== 'undefined' && typeof Deno.resolveDns === 'function') {
    try {
      const dnsCheckPromise = async () => {
        try {
          const mxRecords = await Deno.resolveDns(domain, 'MX');
          if (mxRecords && mxRecords.length > 0) {
            return true;
          }
        } catch (_err) {
          // If MX lookup fails, check A record as RFC 5321 fallback
          try {
            const aRecords = await Deno.resolveDns(domain, 'A');
            if (aRecords && aRecords.length > 0) {
              return true;
            }
          } catch (_aErr) {
            return false;
          }
        }
        return false;
      };

      // 2000ms timeout race to ensure zero lag / fail-safe
      const timeoutPromise = new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), 2000));
      const result = await Promise.race([dnsCheckPromise(), timeoutPromise]);

      if (result === false) {
        return {
          valid: false,
          reason: 'El dominio del correo no existe o no tiene un servidor de correo configurado.'
        };
      }
    } catch (dnsErr) {
      console.warn('[validateEmail] DNS check error, failing open:', dnsErr);
    }
  }

  return { valid: true, domain };
}
