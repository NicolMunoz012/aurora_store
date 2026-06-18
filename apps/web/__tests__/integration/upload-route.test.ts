// Feature: web-app-layer, Task 9.2
// Integration tests for upload route handler
// Validates: Requirements 16.4, 16.5

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/upload/route';
import { auth } from '@/lib/auth';
import { getUploadProvider } from '@/lib/upload/get-upload-provider';

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

// Mock upload provider
vi.mock('@/lib/upload/get-upload-provider', () => ({
  getUploadProvider: vi.fn(),
}));

describe('POST /api/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 for unauthenticated requests', async () => {
    // Arrange
    vi.mocked(auth).mockResolvedValue(null);
    const formData = new FormData();
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    formData.append('file', mockFile);

    const request = new Request('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    // Act
    const response = await POST(request);
    const json = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(json).toEqual({
      error: 'No autenticado',
    });
  });

  it('returns 401 for non-admin users', async () => {
    // Arrange
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-123', role: 'CLIENT' },
      expires: new Date().toISOString(),
    });
    const formData = new FormData();
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    formData.append('file', mockFile);

    const request = new Request('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    // Act
    const response = await POST(request);
    const json = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(json).toEqual({
      error: 'No autorizado',
    });
  });

  it('returns 422 for missing file', async () => {
    // Arrange
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-123', role: 'ADMIN' },
      expires: new Date().toISOString(),
    });
    const formData = new FormData();

    const request = new Request('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    // Act
    const response = await POST(request);
    const json = await response.json();

    // Assert
    expect(response.status).toBe(422);
    expect(json).toEqual({
      error: 'No se recibió ningún archivo',
    });
  });

  it('returns 422 for disallowed file types', async () => {
    // Arrange
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-123', role: 'ADMIN' },
      expires: new Date().toISOString(),
    });
    const formData = new FormData();
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    formData.append('file', mockFile);

    const request = new Request('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    // Act
    const response = await POST(request);
    const json = await response.json();

    // Assert
    expect(response.status).toBe(422);
    expect(json).toEqual({
      error: 'Tipo de archivo no permitido. Solo se aceptan: image/jpeg, image/png, image/webp',
    });
  });

  it('returns 422 for files exceeding 2 MB', async () => {
    // Arrange
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-123', role: 'ADMIN' },
      expires: new Date().toISOString(),
    });
    const formData = new FormData();
    // Create a file larger than 2 MB (2 * 1024 * 1024 + 1 bytes)
    const largeContent = new Uint8Array(2 * 1024 * 1024 + 1);
    const mockFile = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
    formData.append('file', mockFile);

    const request = new Request('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    // Act
    const response = await POST(request);
    const json = await response.json();

    // Assert
    expect(response.status).toBe(422);
    expect(json).toEqual({
      error: 'El archivo excede el tamaño máximo permitido de 2 MB',
    });
  });

  it('returns 200 with { url, key } for valid upload', async () => {
    // Arrange
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-123', role: 'ADMIN' },
      expires: new Date().toISOString(),
    });

    const mockUploadProvider = {
      upload: vi.fn().mockResolvedValue({
        url: 'https://storage.example.com/uploads/test.jpg',
        key: 'uploads/test.jpg',
      }),
    };
    vi.mocked(getUploadProvider).mockReturnValue(mockUploadProvider);

    const formData = new FormData();
    const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    formData.append('file', mockFile);

    const request = new Request('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    // Act
    const response = await POST(request);
    const json = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(json).toEqual({
      url: 'https://storage.example.com/uploads/test.jpg',
      key: 'uploads/test.jpg',
    });
    expect(mockUploadProvider.upload).toHaveBeenCalledWith(mockFile);
  });
});
