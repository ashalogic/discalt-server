import { Module } from '@nestjs/common';
import { VoiceRoomGateway } from 'src/voiceroom/voiceroom.gateway';

@Module({
  providers: [VoiceRoomGateway],
})
export class EventsModule {}
