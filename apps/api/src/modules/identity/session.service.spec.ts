import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from './session.service';
import { DATABASE_CONNECTION } from '../../database/database.constants';
import * as crypto from 'crypto';

type MockDatabase = {
  insert: jest.Mock;
  values: jest.Mock;
  select: jest.Mock;
  from: jest.Mock;
  innerJoin: jest.Mock;
  where: jest.Mock;
  limit: jest.Mock;
  update: jest.Mock;
  set: jest.Mock;
  returning: jest.Mock;
};

describe('SessionService', () => {
  let service: SessionService;
  let mockDb: MockDatabase;

  beforeEach(async () => {
    mockDb = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockResolvedValue(undefined),
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  describe('hashToken', () => {
    it('should compute consistent SHA-256 hash', () => {
      const token = 'sample-token-1234567890abcdef';
      const expectedHash = crypto.createHash('sha256').update(token).digest('hex');

      expect(service.hashToken(token)).toBe(expectedHash);
    });

    it('should produce different hashes for different tokens', () => {
      const hash1 = service.hashToken('token-a');
      const hash2 = service.hashToken('token-b');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('createSession', () => {
    it('should generate a 64-character hex raw token and store hash in database', async () => {
      const accountId = 'acc_123';
      const result = await service.createSession(accountId, {
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        ttlDays: 7,
      });

      expect(result.rawToken).toHaveLength(64);
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          id: service.hashToken(result.rawToken),
          accountId,
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent',
        }),
      );
    });
  });

  describe('validateSession', () => {
    it('should return null for empty or invalid raw token without database query', async () => {
      const result = await service.validateSession('');
      expect(result).toBeNull();
      expect(mockDb.select).not.toHaveBeenCalled();
    });

    it('should return record if active session is found', async () => {
      const fakeRecord = {
        account: { id: 'acc_123', email: 'test@example.com', status: 'ACTIVE' },
        session: { id: 'hash_123', accountId: 'acc_123', revokedAt: null },
      };
      mockDb.limit.mockResolvedValueOnce([fakeRecord]);

      const result = await service.validateSession('raw_token_xyz');
      expect(result).toEqual(fakeRecord);
    });

    it('should return null if session is not found or expired', async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      const result = await service.validateSession('unknown_token');
      expect(result).toBeNull();
    });
  });

  describe('revokeSession', () => {
    it('should return false for invalid token', async () => {
      const result = await service.revokeSession('');
      expect(result).toBe(false);
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it('should update revokedAt and return true when session is found', async () => {
      mockDb.returning.mockResolvedValueOnce([{ id: 'revoked_hash' }]);

      const result = await service.revokeSession('raw_token_123');
      expect(result).toBe(true);
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
    });

    it('should return false if token was already revoked or not found', async () => {
      mockDb.returning.mockResolvedValueOnce([]);

      const result = await service.revokeSession('raw_token_123');
      expect(result).toBe(false);
    });
  });

  describe('revokeAllUserSessions', () => {
    it('should revoke all active sessions for user', async () => {
      mockDb.returning.mockResolvedValueOnce([{ id: 'h1' }, { id: 'h2' }]);

      const count = await service.revokeAllUserSessions('acc_123');
      expect(count).toBe(2);
    });
  });
});
