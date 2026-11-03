const MAX_SIZE = 5 * 1024 * 1024;

/** Produce exactly the image the user will see in the 4:3 card preview. */
export async function prepareProfilePhoto(file: File): Promise<File> {
    if (!['image/jpeg', 'image/png'].includes(file.type)) throw new Error('Please choose a JPG or PNG image.');
    if (!file.size || file.size > MAX_SIZE) throw new Error('The image must be smaller than 5 MB.');
    const objectUrl = URL.createObjectURL(file);
    try {
        const image = new Image();
        await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () => reject(new Error('This image could not be opened.'));
            image.src = objectUrl;
        });
        if (image.naturalWidth > 10000 || image.naturalHeight > 10000) throw new Error('Image dimensions must not exceed 10,000 pixels per side.');
        const cropWidth = Math.min(image.naturalWidth, image.naturalHeight * 4 / 3);
        const cropHeight = cropWidth * 3 / 4;
        if (cropWidth < 400 || cropHeight < 300) throw new Error('Choose an image large enough for a 400 × 300 crop.');
        const canvas = document.createElement('canvas');
        canvas.width = 800; canvas.height = 600;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Unable to prepare this image.');
        context.fillStyle = '#ffffff'; context.fillRect(0, 0, 800, 600);
        context.drawImage(image, (image.naturalWidth - cropWidth) / 2, (image.naturalHeight - cropHeight) / 2, cropWidth, cropHeight, 0, 0, 800, 600);
        const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error('Unable to prepare this image.')), 'image/jpeg', 0.9));
        return new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}
