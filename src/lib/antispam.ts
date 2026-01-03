/**
 * AntiSpam Validation Library
 * Client-side validation for spam protection
 */

interface AntiSpamResult {
  valid: boolean;
  error?: string;
  errorType?: 'math' | 'honeypot' | 'timing' | 'unknown';
}

interface ValidationOptions {
  minTimeSeconds?: number;
  lang?: 'en' | 'fr';
}

const errorMessages = {
  en: {
    math: 'Incorrect answer to the security question. Please try again.',
    honeypot: 'Form submission blocked.',
    timing: 'Please take a moment to fill out the form properly.',
    unknown: 'Security validation failed. Please refresh and try again.',
  },
  fr: {
    math: 'Réponse incorrecte à la question de sécurité. Veuillez réessayer.',
    honeypot: 'Soumission du formulaire bloquée.',
    timing: 'Veuillez prendre le temps de remplir le formulaire correctement.',
    unknown: 'Échec de la validation de sécurité. Veuillez rafraîchir et réessayer.',
  },
};

/**
 * Validates the anti-spam fields in a form
 * @param formData - FormData object from the form
 * @param options - Validation options
 * @returns Validation result with error message if invalid
 */
export function validateAntiSpam(
  formData: FormData,
  options: ValidationOptions = {}
): AntiSpamResult {
  const { minTimeSeconds = 3, lang = 'en' } = options;
  const messages = errorMessages[lang];

  // 1. Check honeypot field (should be empty)
  const honeypot = formData.get('website_url');
  if (honeypot && String(honeypot).trim() !== '') {
    console.warn('AntiSpam: Honeypot triggered');
    return {
      valid: false,
      error: messages.honeypot,
      errorType: 'honeypot',
    };
  }

  // 2. Check time-based validation
  const timestamp = formData.get('antispam_timestamp');
  if (timestamp) {
    const loadTime = parseInt(String(timestamp), 10);
    const now = Date.now();
    const elapsedSeconds = (now - loadTime) / 1000;

    if (elapsedSeconds < minTimeSeconds) {
      console.warn(`AntiSpam: Too fast submission (${elapsedSeconds.toFixed(1)}s)`);
      return {
        valid: false,
        error: messages.timing,
        errorType: 'timing',
      };
    }
  }

  // 3. Validate math challenge
  const answer = formData.get('antispam_answer');
  const expectedEncoded = formData.get('antispam_expected');

  if (!answer || !expectedEncoded) {
    return {
      valid: false,
      error: messages.unknown,
      errorType: 'unknown',
    };
  }

  try {
    const expected = parseInt(atob(String(expectedEncoded)), 10);
    const provided = parseInt(String(answer), 10);

    if (provided !== expected) {
      console.warn('AntiSpam: Math challenge failed');
      return {
        valid: false,
        error: messages.math,
        errorType: 'math',
      };
    }
  } catch (e) {
    return {
      valid: false,
      error: messages.unknown,
      errorType: 'unknown',
    };
  }

  // All checks passed
  return { valid: true };
}

/**
 * Removes anti-spam fields from form data before submission
 * (so they don't get sent to the backend)
 */
export function cleanFormData(formData: FormData): FormData {
  const cleaned = new FormData();

  for (const [key, value] of formData.entries()) {
    // Skip anti-spam fields
    if (
      key === 'antispam_answer' ||
      key === 'antispam_expected' ||
      key === 'antispam_timestamp' ||
      key === 'website_url'
    ) {
      continue;
    }
    cleaned.append(key, value);
  }

  return cleaned;
}

/**
 * Shows error message for a specific anti-spam field
 */
export function showAntiSpamError(formId: string, message: string): void {
  const errorEl = document.getElementById(`antispam-error-${formId}`);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }

  // Highlight the input
  const inputEl = document.getElementById(`antispam-${formId}`) as HTMLInputElement;
  if (inputEl) {
    inputEl.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500/20');
    inputEl.focus();
  }
}

/**
 * Clears anti-spam error display
 */
export function clearAntiSpamError(formId: string): void {
  const errorEl = document.getElementById(`antispam-error-${formId}`);
  if (errorEl) {
    errorEl.classList.add('hidden');
  }

  const inputEl = document.getElementById(`antispam-${formId}`) as HTMLInputElement;
  if (inputEl) {
    inputEl.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500/20');
  }
}
