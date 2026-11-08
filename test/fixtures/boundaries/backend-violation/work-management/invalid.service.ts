// DELIBERATE BOUNDARY VIOLATION FIXTURE
// WorkManagement module illegally imports an internal persistence/secret file from Identity module
import { internalIdentitySecret } from '../identity/internal/secret';

export class InvalidWorkManagementService {
  getToken() {
    return internalIdentitySecret;
  }
}
