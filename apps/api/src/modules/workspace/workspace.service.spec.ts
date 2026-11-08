import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceService } from './workspace.service';
import { DATABASE_CONNECTION } from '../../database/database.constants';
import {
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

type MockDatabase = {
  select: jest.Mock;
  from: jest.Mock;
  innerJoin: jest.Mock;
  where: jest.Mock;
  limit: jest.Mock;
  insert: jest.Mock;
  values: jest.Mock;
  returning: jest.Mock;
  update: jest.Mock;
  set: jest.Mock;
  transaction: jest.Mock;
};

describe('WorkspaceService', () => {
  let service: WorkspaceService;
  let mockDb: MockDatabase;

  beforeEach(async () => {
    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      transaction: jest.fn().mockImplementation(async (cb) => cb(mockDb)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkspaceService, { provide: DATABASE_CONNECTION, useValue: mockDb }],
    }).compile();

    service = module.get<WorkspaceService>(WorkspaceService);
  });

  describe('slugify', () => {
    it('generates a clean slug from name', () => {
      expect(service.slugify('Acme Corporation')).toBe('acme-corporation');
      expect(service.slugify('  My Product Team (2026)!  ')).toBe('my-product-team-2026');
      expect(service.slugify('---leading-trailing---')).toBe('leading-trailing');
    });
  });

  describe('createWorkspace', () => {
    it('throws BadRequestException if name is empty', async () => {
      await expect(service.createWorkspace('usr_1', { name: '   ' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException if custom slug has invalid format', async () => {
      await expect(
        service.createWorkspace('usr_1', { name: 'Acme', slug: 'invalid slug with spaces' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException if slug already exists', async () => {
      mockDb.limit.mockResolvedValueOnce([{ id: 'ws_existing' }]);

      await expect(
        service.createWorkspace('usr_1', { name: 'Acme', slug: 'acme' }),
      ).rejects.toThrow(ConflictException);
    });

    it('creates workspace and OWNER membership atomically', async () => {
      mockDb.limit.mockResolvedValueOnce([]); // no existing slug
      const fakeWorkspace = {
        id: 'ws_123',
        name: 'Acme Corp',
        slug: 'acme-corp',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const fakeMembership = {
        id: 'mem_123',
        workspaceId: 'ws_123',
        accountId: 'usr_1',
        role: 'OWNER',
        status: 'ACTIVE',
      };

      mockDb.returning
        .mockResolvedValueOnce([fakeWorkspace])
        .mockResolvedValueOnce([fakeMembership]);

      const result = await service.createWorkspace('usr_1', { name: 'Acme Corp' });

      expect(mockDb.transaction).toHaveBeenCalled();
      expect(result.id).toBe('ws_123');
      expect(result.role).toBe('OWNER');
      expect(result.slug).toBe('acme-corp');
    });
  });

  describe('listUserWorkspaces', () => {
    it('returns list of workspaces where user is active member', async () => {
      const fakeRows = [
        {
          id: 'ws_1',
          name: 'Workspace Alpha',
          slug: 'alpha',
          status: 'ACTIVE',
          role: 'OWNER',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockDb.where.mockResolvedValueOnce(fakeRows);

      const result = await service.listUserWorkspaces('usr_1');
      expect(result).toEqual(fakeRows);
    });
  });

  describe('getWorkspaceBySlug', () => {
    it('throws NotFoundException if workspace does not exist', async () => {
      mockDb.limit.mockResolvedValueOnce([]); // workspace not found

      await expect(service.getWorkspaceBySlug('usr_1', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException if user is not a member', async () => {
      mockDb.limit
        .mockResolvedValueOnce([{ id: 'ws_1', slug: 'alpha', status: 'ACTIVE' }]) // workspace exists
        .mockResolvedValueOnce([]); // user membership not found

      await expect(service.getWorkspaceBySlug('usr_1', 'alpha')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('returns workspace with user membership role', async () => {
      const fakeWorkspace = {
        id: 'ws_1',
        name: 'Alpha',
        slug: 'alpha',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const fakeMembership = {
        role: 'ADMIN',
      };

      mockDb.limit.mockResolvedValueOnce([fakeWorkspace]).mockResolvedValueOnce([fakeMembership]);

      const result = await service.getWorkspaceBySlug('usr_1', 'alpha');
      expect(result.id).toBe('ws_1');
      expect(result.role).toBe('ADMIN');
    });
  });

  describe('updateWorkspace', () => {
    it('throws ForbiddenException if caller has MEMBER role', async () => {
      // Mock getWorkspaceBySlug returning role MEMBER
      jest.spyOn(service, 'getWorkspaceBySlug').mockResolvedValueOnce({
        id: 'ws_1',
        name: 'Alpha',
        slug: 'alpha',
        status: 'ACTIVE',
        role: 'MEMBER',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.updateWorkspace('usr_1', 'alpha', { name: 'New Name' })).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('successfully updates workspace name for OWNER', async () => {
      jest.spyOn(service, 'getWorkspaceBySlug').mockResolvedValueOnce({
        id: 'ws_1',
        name: 'Alpha',
        slug: 'alpha',
        status: 'ACTIVE',
        role: 'OWNER',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const updatedWs = {
        id: 'ws_1',
        name: 'Alpha Renovated',
        slug: 'alpha',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDb.returning.mockResolvedValueOnce([updatedWs]);

      const result = await service.updateWorkspace('usr_1', 'alpha', { name: 'Alpha Renovated' });
      expect(result.name).toBe('Alpha Renovated');
      expect(result.role).toBe('OWNER');
    });
  });
});
