import { IsBoolean, IsIn, IsObject, IsOptional } from 'class-validator';

export const TEMPLATE_IDS = [
    'minimal-light',
    'minimal-dark',
    'warm',
    'corporate',
    'french-classic',
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

export class UpsertResumeDto {
    @IsOptional()
    @IsIn(TEMPLATE_IDS)
    templateId?: TemplateId;

    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;

    @IsOptional()
    @IsObject()
    data?: Record<string, unknown>;
}
