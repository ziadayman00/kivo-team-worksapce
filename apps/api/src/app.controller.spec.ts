import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DATABASE_CONNECTION } from './database/database.constants';

describe('AppController', () => {
  let appController: AppController;
  const mockDb = {
    execute: jest.fn().mockResolvedValue([{ alive: 1 }]),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockDb,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return health payload with status ok and database connected', async () => {
      const res = await appController.getHealth();
      expect(res.status).toBe('ok');
      expect(res.service).toBe('kivo-api');
      expect(res.database).toBe('connected');
      expect(res.timestamp).toBeDefined();
    });
  });
});
