export class ValidationErrors {
    static readonly INVALID = 'VALIDATION-001';
    static readonly SHOULD_NOT_BE_EMPTY = 'VALIDATION-002';
    static readonly MUST_BE_STRING = 'VALIDATION-003';
    static readonly MUST_BE_EMAIL = 'VALIDATION-004';
    static readonly MUST_BE_BOOLEAN = 'VALIDATION-005';
    static readonly MUST_BE_INTEGER = 'VALIDATION-006';
    static readonly MUST_BE_NUMBER = 'VALIDATION-007';
    static readonly MUST_BE_MORE_THAN_MIN = 'VALIDATION-008';
    static readonly MUST_BE_LESS_THAN_MAX = 'VALIDATION-009';
    static readonly MUST_BE_MAXLENGTH_CHARACTER_OR_LESS = 'VALIDATION-010';
    static readonly MUST_BE_MINLENGTH_CHARACTER_OR_MORE = 'VALIDATION-012';
    static readonly MUST_MATCH = 'VALIDATION-012';
    static readonly MUST_BE_DISPOSABLE = 'VALIDATION-014';
    static readonly MUST_BE_WHITELISTED = 'VALIDATION-014';
    static readonly UNKNOWN_ERROR = 'VALIDATION-099';
}
