import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.schema';
import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IdentityModule } from './modules/identity/identity.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { AuthorizationModule } from './modules/authorization/authorization.module';
import { WorkManagementModule } from './modules/work-management/work-management.module';
import { CollaborationModule } from './modules/collaboration/collaboration.module';
import { ActivityModule } from './modules/activity/activity.module';
import { NotificationModule } from './modules/notification/notification.module';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    DatabaseModule,
    IdentityModule,
    WorkspaceModule,
    AuthorizationModule,
    WorkManagementModule,
    CollaborationModule,
    ActivityModule,
    NotificationModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
