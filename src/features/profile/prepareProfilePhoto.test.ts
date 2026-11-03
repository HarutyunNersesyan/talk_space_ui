import { prepareProfilePhoto } from './prepareProfilePhoto';

test('rejects unsupported, empty and oversized files', async () => {
    await expect(prepareProfilePhoto(new File(['x'], 'photo.webp', { type: 'image/webp' }))).rejects.toThrow('JPG or PNG');
    await expect(prepareProfilePhoto(new File([], 'photo.jpg', { type: 'image/jpeg' }))).rejects.toThrow('5 MB');
    await expect(prepareProfilePhoto(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'photo.jpg', { type: 'image/jpeg' }))).rejects.toThrow('5 MB');
});

test('prepares a centred 4:3 preview that matches the saved photo', async () => {
    const originalImage = window.Image;
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    const drawImage = jest.fn();
    try {
        URL.createObjectURL = jest.fn(() => 'blob:test');
        URL.revokeObjectURL = jest.fn();
        window.Image = class {
            naturalWidth = 1200; naturalHeight = 1200;
            onload: (() => void) | null = null;
            set src(_url: string) { this.onload?.(); }
        } as unknown as typeof Image;
        jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ fillStyle: '', fillRect: jest.fn(), drawImage } as unknown as CanvasRenderingContext2D);
        jest.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(callback => callback(new Blob(['image'], { type: 'image/jpeg' })));
        const result = await prepareProfilePhoto(new File(['x'], 'photo.png', { type: 'image/png' }));
        expect(result.type).toBe('image/jpeg');
        expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 150, 1200, 900, 0, 0, 800, 600);
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
    } finally {
        window.Image = originalImage;
        URL.createObjectURL = originalCreate;
        URL.revokeObjectURL = originalRevoke;
        jest.restoreAllMocks();
    }
});
