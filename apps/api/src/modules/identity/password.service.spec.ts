import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('hashes password with Argon2id algorithm', async () => {
    const password = 'CorrectHorseBatteryStaple123!';
    const hash = await service.hash(password);

    expect(hash).toBeDefined();
    expect(hash.startsWith('$argon2id$')).toBe(true);
  });

  it('successfully verifies correct password against hash', async () => {
    const password = 'SuperSecretPassword!';
    const hash = await service.hash(password);

    const isValid = await service.verify(hash, password);
    expect(isValid).toBe(true);
  });

  it('rejects incorrect password against hash', async () => {
    const password = 'SuperSecretPassword!';
    const wrongPassword = 'WrongPassword!';
    const hash = await service.hash(password);

    const isValid = await service.verify(hash, wrongPassword);
    expect(isValid).toBe(false);
  });
});
