import { Body, Controller, Get, Post } from '@nestjs/common';
import { OnlineService } from './online.service';
import { IsString } from 'class-validator';

class PingDto {
    @IsString()
    fingerprint: string;
}

@Controller('online')
export class OnlineController {
    constructor(private readonly onlineService: OnlineService) {}

    /** POST /online/ping — client sends fingerprint every 60s */
    @Post('ping')
    ping(@Body() dto: PingDto) {
        this.onlineService.ping(dto.fingerprint);
        return { count: this.onlineService.count() };
    }

    /** GET /online/count — get current online visitor count */
    @Get('count')
    count() {
        return { count: this.onlineService.count() };
    }
}
