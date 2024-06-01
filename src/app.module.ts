import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { UserController } from './user/user.controller';

@Module({
  imports: [EventsModule],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule {}
