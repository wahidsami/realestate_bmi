export class HealthService {
  getStatus() {
    return {
      status: 'ok' as const,
      service: 'bina-realestate-api',
      timestamp: new Date().toISOString(),
    };
  }
}
