import { Controller, Get } from '@nestjs/common';

@Controller()
export class UserController {
  @Get('testuser')
  getHello(): string {
    return 'dds';
  }
}
