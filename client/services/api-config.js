const LOCAL_API_URL = process.env.NEXT_PUBLIC_LOCAL_API_URL || process.env.LOCAL_API_URL || 'http://localhost:5000';
const DOCKER_API_URL = process.env.NEXT_PUBLIC_DOCKER_API_URL || process.env.DOCKER_API_URL || 'http://localhost:8080';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  (process.env.NEXT_PUBLIC_API_MODE === 'docker' ? DOCKER_API_URL : LOCAL_API_URL);

export const DESIGN_SERVICE_URL = process.env.NEXT_PUBLIC_DESIGN_SERVICE_URL || '';