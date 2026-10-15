import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { DocumentModule } from './modules/document/document.module';
import { AuthModule } from './modules/auth/auth.module';
import { NotificationsService } from './modules/notifications/notifications.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: Number(configService.get('DB_PORT', '5432')),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'document_manager'),
        autoLoadEntities: true,
        synchronize: configService.get('DB_SYNCHRONIZE', 'false') === 'true',
      }),
    }),
    UserModule,
    DocumentModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, NotificationsService],
})
export class AppModule {}
