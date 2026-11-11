import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceService } from './workspace.service';
import { IdentityService } from '../identity';
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
  orderBy: jest.Mock;
  insert: jest.Mock;
  values: jest.Mock;
  returning: jest.Mock;
  update: jest.Mock;
  set: jest.Mock;
  delete: jest.Mock;
  transaction: jest.Mock;
};

describe('WorkspaceService', () => {
  let service: WorkspaceService;
  let mockDb: MockDatabase;
  let mockIdentityService: { getAccountById: jest.Mock };

  beforeEach(async () => {
    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
      orderBy: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      transaction: jest.fn().mockImplementation(async (cb) => cb(mockDb)),
    };

    mockIdentityService = {
      getAccountById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceService,
        { provide: DATABASE_CONNECTION, useValue: mockDb },
        { provide: IdentityService, useValue: mockIdentityService },
      ],
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

      expect(result.id).toBe('ws_123');
      expect(result.role).toBe('OWNER');
      expect(result.slug).toBe('acme-corp');
    });
  });

  describe('getWorkspaceBySlug', () => {
    it('throws NotFoundException if workspace does not exist', async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      await expect(service.getWorkspaceBySlug('usr_1', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException if user is not an active member', async () => {
      mockDb.limit
        .mockResolvedValueOnce([{ id: 'ws_1', name: 'Ws 1', slug: 'ws-1', status: 'ACTIVE' }])
        .mockResolvedValueOnce([]); // no membership

      await expect(service.getWorkspaceBySlug('usr_1', 'ws-1')).rejects.toThrow(ForbiddenException);
    });

    it('returns workspace with membership role if valid member', async () => {
      const now = new Date();
      mockDb.limit
        .mockResolvedValueOnce([
          {
            id: 'ws_1',
            name: 'Ws 1',
            slug: 'ws-1',
            status: 'ACTIVE',
            createdAt: now,
            updatedAt: now,
          },
        ])
        .mockResolvedValueOnce([{ id: 'mem_1', role: 'ADMIN', status: 'ACTIVE' }]);

      const result = await service.getWorkspaceBySlug('usr_1', 'ws-1');
      expect(result.name).toBe('Ws 1');
      expect(result.role).toBe('ADMIN');
    });
  });

  describe('createInvitation', () => {
    it('throws ForbiddenException if caller has MEMBER role', async () => {
      // getWorkspaceBySlug returns MEMBER role
      jest.spyOn(service, 'getWorkspaceBySlug').mockResolvedValueOnce({
        id: 'ws_1',
        name: 'Workspace',
        slug: 'workspace',
        status: 'ACTIVE',
        role: 'MEMBER',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        service.createInvitation('usr_1', 'workspace', { email: 'colleague@example.com' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws ConflictException if invited email is already an active member', async () => {
      jest.spyOn(service, 'getWorkspaceBySlug').mockResolvedValueOnce({
        id: 'ws_1',
        name: 'Workspace',
        slug: 'workspace',
        status: 'ACTIVE',
        role: 'OWNER',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockDb.limit.mockResolvedValueOnce([{ id: 'existing_member' }]);

      await expect(
        service.createInvitation('usr_1', 'workspace', { email: 'existing@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('creates invitation and returns unhashed token when caller is OWNER', async () => {
      jest.spyOn(service, 'getWorkspaceBySlug').mockResolvedValueOnce({
        id: 'ws_1',
        name: 'Workspace',
        slug: 'workspace',
        status: 'ACTIVE',
        role: 'OWNER',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockDb.limit
        .mockResolvedValueOnce([]) // not existing member
        .mockResolvedValueOnce([]); // no existing pending invite

      const fakeInvite = {
        id: 'inv_123',
        email: 'newuser@example.com',
        role: 'MEMBER',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 1000000),
        createdAt: new Date(),
      };
      mockDb.returning.mockResolvedValueOnce([fakeInvite]);

      const result = await service.createInvitation('usr_1', 'workspace', {
        email: 'newuser@example.com',
      });

      expect(result.email).toBe('newuser@example.com');
      expect(result.status).toBe('PENDING');
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
    });
  });

  describe('acceptInvitation', () => {
    it('throws ForbiddenException if signed-in account email does not match invitation recipient', async () => {
      mockIdentityService.getAccountById.mockResolvedValueOnce({
        id: 'usr_signed_in',
        email: 'user_a@example.com',
      });

      const fakeRecord = {
        invitation: {
          id: 'inv_1',
          email: 'user_b@example.com', // different email
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 100000),
          role: 'MEMBER',
        },
        workspace: {
          id: 'ws_1',
          name: 'Workspace',
          slug: 'workspace',
        },
      };
      mockDb.limit.mockResolvedValueOnce([fakeRecord]);

      await expect(service.acceptInvitation('usr_signed_in', 'raw_token_xyz')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws ConflictException if invitation has already been accepted', async () => {
      mockIdentityService.getAccountById.mockResolvedValueOnce({
        id: 'usr_signed_in',
        email: 'user_a@example.com',
      });

      const fakeRecord = {
        invitation: {
          id: 'inv_1',
          email: 'user_a@example.com',
          status: 'ACCEPTED',
          expiresAt: new Date(Date.now() + 100000),
          role: 'MEMBER',
        },
        workspace: {
          id: 'ws_1',
          name: 'Workspace',
          slug: 'workspace',
        },
      };
      mockDb.limit.mockResolvedValueOnce([fakeRecord]);

      await expect(service.acceptInvitation('usr_signed_in', 'raw_token_xyz')).rejects.toThrow(
        ConflictException,
      );
    });

    it('creates membership and accepts invitation when valid', async () => {
      mockIdentityService.getAccountById.mockResolvedValueOnce({
        id: 'usr_signed_in',
        email: 'user_a@example.com',
      });

      const fakeRecord = {
        invitation: {
          id: 'inv_1',
          email: 'user_a@example.com',
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 100000),
          role: 'ADMIN',
          workspaceId: 'ws_1',
        },
        workspace: {
          id: 'ws_1',
          name: 'Workspace',
          slug: 'workspace',
        },
      };
      mockDb.limit
        .mockResolvedValueOnce([fakeRecord]) // fetch invite
        .mockResolvedValueOnce([]); // check existing membership inside transaction

      const result = await service.acceptInvitation('usr_signed_in', 'raw_token_xyz');

      expect(result.workspace.slug).toBe('workspace');
      expect(result.role).toBe('ADMIN');
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe('updateMember and sole owner protections', () => {
    it('throws BadRequestException if attempting to demote the sole owner of a workspace', async () => {
      jest.spyOn(service, 'getWorkspaceBySlug').mockResolvedValueOnce({
        id: 'ws_1',
        name: 'Workspace',
        slug: 'workspace',
        status: 'ACTIVE',
        role: 'OWNER',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const fakeTarget = {
        membership: { id: 'mem_owner', role: 'OWNER', status: 'ACTIVE', accountId: 'usr_1' },
        account: { id: 'usr_1', displayName: 'Owner User', email: 'owner@example.com' },
      };
      mockDb.limit.mockResolvedValueOnce([fakeTarget]).mockResolvedValueOnce([{ id: 'mem_owner' }]); // active owners count returns 1

      await expect(
        service.updateMember('usr_1', 'workspace', 'mem_owner', { role: 'MEMBER' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ForbiddenException if non-owner attempts to modify an owner', async () => {
      jest.spyOn(service, 'getWorkspaceBySlug').mockResolvedValueOnce({
        id: 'ws_1',
        name: 'Workspace',
        slug: 'workspace',
        status: 'ACTIVE',
        role: 'ADMIN', // caller is admin
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const fakeTarget = {
        membership: { id: 'mem_owner', role: 'OWNER', status: 'ACTIVE', accountId: 'usr_owner' },
        account: { id: 'usr_owner', displayName: 'Owner', email: 'owner@example.com' },
      };
      mockDb.limit.mockResolvedValueOnce([fakeTarget]);

      await expect(
        service.updateMember('usr_admin', 'workspace', 'mem_owner', { status: 'SUSPENDED' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('bootstrapWorkspace', () => {
    it('throws NotFoundException if workspace slug does not exist', async () => {
      mockDb.limit.mockResolvedValueOnce([]); // no workspace

      await expect(service.bootstrapWorkspace('usr_1', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ForbiddenException if account is not a member or is suspended', async () => {
      mockDb.limit
        .mockResolvedValueOnce([{ id: 'ws_1', name: 'Acme', slug: 'acme', status: 'ACTIVE' }]) // workspace found
        .mockResolvedValueOnce([{ role: 'MEMBER', status: 'SUSPENDED' }]); // suspended membership

      await expect(service.bootstrapWorkspace('usr_1', 'acme')).rejects.toThrow(ForbiddenException);
    });

    it('returns workspace bootstrap payload with counts and accessible workspaces', async () => {
      const now = new Date();
      const fakeWorkspace = {
        id: 'ws_1',
        name: 'Acme Corp',
        slug: 'acme-corp',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      };
      const fakeMembership = {
        role: 'OWNER',
        status: 'ACTIVE',
        createdAt: now,
      };

      mockDb.limit
        .mockResolvedValueOnce([fakeWorkspace]) // workspace
        .mockResolvedValueOnce([fakeMembership]); // membership

      // counts
      mockDb.where
        .mockReturnValueOnce(mockDb) // limit calls
        .mockReturnValueOnce(mockDb)
        .mockResolvedValueOnce([{ total: 3 }]) // member count
        .mockResolvedValueOnce([{ total: 1 }]); // pending invite count

      jest.spyOn(service, 'listUserWorkspaces').mockResolvedValueOnce([
        {
          id: 'ws_1',
          name: 'Acme Corp',
          slug: 'acme-corp',
          status: 'ACTIVE',
          role: 'OWNER',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'ws_2',
          name: 'Beta Labs',
          slug: 'beta-labs',
          status: 'ACTIVE',
          role: 'MEMBER',
          createdAt: now,
          updatedAt: now,
        },
      ]);

      const result = await service.bootstrapWorkspace('usr_1', 'acme-corp');

      expect(result.workspace.slug).toBe('acme-corp');
      expect(result.membership.role).toBe('OWNER');
      expect(result.membership.status).toBe('ACTIVE');
      expect(result.accessibleWorkspaces).toHaveLength(2);
      expect(result.accessibleWorkspaces[0]?.name).toBe('Acme Corp');
    });
  });
});
