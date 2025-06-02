import { ApiHeader } from '@nestjs/swagger';

export function RecaptchaApiHeaderProperty(action: string) {
    return ApiHeader({
        name: 'X-Recaptcha-Token',
        description: `Action is ${action}`,
        required: true,
    });
}
