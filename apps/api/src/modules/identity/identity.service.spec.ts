import { Test, TestingModule } from '@nestjs/testing';
import { IdentityService } from './identity.service';
import { PasswordService } from './password.service';
import { SessionService } from './session.service';
import { DATABASE_CONNECTION } from '../../database/database.constants';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

type MockDatabase = {
  select: jest.Mock;
  from: jest.Mock;
  where: jest.Mock;
  limit: jest.Mock;
  innerJoin: jest.Mock;
  insert: jest.Mock;
  values: jest.Mock;
  returning: jest.Mock;
  transaction: jest.Mock;
};

describe('IdentityService', () => {
  let service: IdentityService;
  let mockDb: MockDatabase;
  let mockPasswordService: Partial<PasswordService>;
  let mockSessionService: Partial<SessionService>;

  beforeEach(async () => {
    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
      innerJoin: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([]),
      transaction: jest.fn().mockImplementation(async (callback) => {
        return callback(mockDb);
      }),
    };

    mockPasswordService = {
      hash: jest.fn().mockResolvedValue('$argon2id$mock-hash'),
      verify: jest.fn().mockResolvedValue(true),
    };

    mockSessionService = {
      createSession: jest.fn().mockResolvedValue({
        rawToken: 'mock-raw-session-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }),
      revokeSession: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdentityService,
        { provide: DATABASE_CONNECTION, useValue: mockDb },
        { provide: PasswordService, useValue: mockPasswordService },
        { provide: SessionService, useValue: mockSessionService },
      ],
    }).compile();

    service = module.get<IdentityService>(IdentityService);
  });

  describe('register', () => {
    it('should throw ConflictException if account email already exists', async () => {
      mockDb.limit.mockResolvedValueOnce([{ id: 'existing-id' }]);

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'Password123!',
          displayName: 'Test User',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create account and credentials within a transaction', async () => {
      mockDb.limit.mockResolvedValueOnce([]); // no existing account
      const fakeAccount = {
        id: 'acc_new',
        email: 'test@example.com',
        displayName: 'Test User',
        createdAt: new Date(),
      };
      mockDb.returning.mockResolvedValueOnce([fakeAccount]);

      const result = await service.register({
        email: 'Test@example.com ',
        password: 'Password123!',
        displayName: ' Test User ',
      });

      expect(mockPasswordService.hash).toHaveBeenCalledWith('Password123!');
      expect(mockDb.transaction).toHaveBeenCalled();
      expect(result).toEqual({
        id: fakeAccount.id,
        email: fakeAccount.email,
        displayName: fakeAccount.displayName,
        createdAt: fakeAccount.createdAt,
      });
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if account not found or inactive', async () => {
      mockDb.limit.mockResolvedValueOnce([]); // account not found

      await expect(
        service.login({
          email: 'missing@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password verification fails', async () => {
      mockDb.limit.mockResolvedValueOnce([
        {
          account: { id: 'acc_1', email: 'test@example.com', status: 'ACTIVE' },
          credential: { passwordHash: '$argon2id$mock-hash' },
        },
      ]);
      (mockPasswordService.verify as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return account and session token on successful authentication', async () => {
      const fakeAccount = {
        id: 'acc_1',
        email: 'test@example.com',
        displayName: 'Test User',
        avatarUrl: null,
        status: 'ACTIVE',
      };
      mockDb.limit.mockResolvedValueOnce([
        {
          account: fakeAccount,
          credential: { passwordHash: '$argon2id$mock-hash' },
        },
      ]);
      (mockPasswordService.verify as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.account.id).toBe(fakeAccount.id);
      expect(result.account.email).toBe(fakeAccount.email);
      expect(result.sessionToken).toBe('mock-raw-session-token');
      expect(result.expiresAt).toBeDefined();
    });
  });

  describe('logout', () => {
    it('should delegate session revocation to SessionService', async () => {
      const res = await service.logout('raw-token');
      expect(mockSessionService.revokeSession).toHaveBeenCalledWith('raw-token');
      expect(res).toBe(true);
    });
  });
});
