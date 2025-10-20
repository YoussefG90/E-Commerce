import { AuthenticationGuard } from './authentication.guard';

describe('AuthenticationGuard', () => {
  it('should be defined', () => {
    const mockTokenService = {} as any;
    const mockReflector = {} as any;
    expect(new AuthenticationGuard(mockTokenService, mockReflector)).toBeDefined();
  });
});
