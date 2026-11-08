// DELIBERATE BOUNDARY VIOLATION FIXTURE
// Frontend UI illegally imports backend NestJS module directly instead of @kivo/api-client
import { AppModule } from '../../../../apps/api/src/app.module';

export const InvalidComponent = () => {
  return AppModule.name;
};
