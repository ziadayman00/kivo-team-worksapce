import { Module } from '@nestjs/common';

/**
 * ActivityModule
 * Owns Transactional Outbox Publishing, Background Outbox Worker,
 * and the Authorized Shared Activity Feed.
 * Boundary: SD-13 / ADR-009
 */
@Module({})
export class ActivityModule {}
