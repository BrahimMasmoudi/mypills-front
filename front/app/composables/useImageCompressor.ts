export const useImageCompressor = () => {
    const compressImage = async (file: File, quality = 0.6, maxWidth = 1024): Promise<File> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize logic (keep aspect ratio)
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Convert back to file with lower quality (0.0 - 1.0)
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const newFile = new File([blob], file.name, {
                                    type: 'image/jpeg',
                                    lastModified: Date.now(),
                                });
                                resolve(newFile);
                            } else {
                                reject(new Error('Canvas is empty'));
                            }
                        },
                        'image/jpeg',
                        quality // <--- Compression Magic Here
                    );
                };
            };
            reader.onerror = (error) => reject(error);
        });
    };

    return { compressImage };
};