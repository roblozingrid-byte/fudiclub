import { describe, it, expect } from 'vitest';
import {
  validateEmailSyntax,
  isDisposableEmail,
  suggestEmailCorrection,
  validateAddress
} from '../src/email-validator.js';

describe('src/email-validator.js', () => {
  describe('validateEmailSyntax', () => {
    it('validates correct email formats', () => {
      expect(validateEmailSyntax('usuario@gmail.com').valid).toBe(true);
      expect(validateEmailSyntax('robles.ingrid+sub@fudiclub.shop').valid).toBe(true);
      expect(validateEmailSyntax('test_123@domain.com.ar').valid).toBe(true);
    });

    it('rejects invalid or malformed emails', () => {
      expect(validateEmailSyntax('').valid).toBe(false);
      expect(validateEmailSyntax('notanemail').valid).toBe(false);
      expect(validateEmailSyntax('user@').valid).toBe(false);
      expect(validateEmailSyntax('@domain.com').valid).toBe(false);
      expect(validateEmailSyntax('user@domain..com').valid).toBe(false);
      expect(validateEmailSyntax('user@domain.c').valid).toBe(false);
      expect(validateEmailSyntax('user domain@gmail.com').valid).toBe(false);
    });
  });

  describe('isDisposableEmail', () => {
    it('detects disposable and temporary domains', () => {
      expect(isDisposableEmail('test@mailinator.com')).toBe(true);
      expect(isDisposableEmail('burner@tempmail.com')).toBe(true);
      expect(isDisposableEmail('fake@yopmail.com')).toBe(true);
      expect(isDisposableEmail('hello@10minutemail.com')).toBe(true);
    });

    it('allows normal email providers', () => {
      expect(isDisposableEmail('user@gmail.com')).toBe(false);
      expect(isDisposableEmail('user@hotmail.com')).toBe(false);
      expect(isDisposableEmail('user@yahoo.com.ar')).toBe(false);
      expect(isDisposableEmail('contact@empresa.com')).toBe(false);
    });
  });

  describe('suggestEmailCorrection', () => {
    it('suggests correction for common typos', () => {
      expect(suggestEmailCorrection('usuario@gnail.com')).toBe('usuario@gmail.com');
      expect(suggestEmailCorrection('test@gamil.com')).toBe('test@gmail.com');
      expect(suggestEmailCorrection('pedro@hotmial.com')).toBe('pedro@hotmail.com');
      expect(suggestEmailCorrection('maria@outlok.com')).toBe('maria@outlook.com');
      expect(suggestEmailCorrection('lucas@yaho.com')).toBe('lucas@yahoo.com');
      expect(suggestEmailCorrection('ana@iclud.com')).toBe('ana@icloud.com');
    });

    it('returns null if there is no typo', () => {
      expect(suggestEmailCorrection('usuario@gmail.com')).toBeNull();
      expect(suggestEmailCorrection('test@hotmail.com')).toBeNull();
      expect(suggestEmailCorrection('random@customdomain.io')).toBeNull();
    });
  });

  describe('validateAddress', () => {
    it('accepts valid street addresses with numbers', () => {
      expect(validateAddress('Av. Santa Fe 1234').valid).toBe(true);
      expect(validateAddress('Corrientes 2450').valid).toBe(true);
      expect(validateAddress('Ruta 8 km 45').valid).toBe(true);
      expect(validateAddress('Mitre 45').valid).toBe(true);
    });

    it('rejects empty or too short addresses', () => {
      expect(validateAddress('').valid).toBe(false);
      expect(validateAddress('ab').valid).toBe(false);
      expect(validateAddress('Casa').valid).toBe(false);
    });

    it('rejects addresses without street number / height', () => {
      const res = validateAddress('Av. Corrientes');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('Falta el número o altura');

      expect(validateAddress('Calle San Martin').valid).toBe(false);
    });
  });
});
