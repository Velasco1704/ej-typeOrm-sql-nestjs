import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModule } from './posts/posts.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: AppModule.host,
      port: AppModule.port,
      username: AppModule.username,
      password: AppModule.password,
      database: AppModule.database,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UsersModule,
    PostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  static host: string;
  static port: number;
  static username: string;
  static password: string;
  static database: string;

  constructor(private readonly configService: ConfigService) {
    AppModule.host = this.configService.get('DB_HOST');
    AppModule.port = +this.configService.get('DB_PORT');
    AppModule.username = this.configService.get('DB_USERNAME');
    AppModule.password = this.configService.get('DB_PASSWORD');
    AppModule.database = this.configService.get('DB_DATABASE');
  }
}
