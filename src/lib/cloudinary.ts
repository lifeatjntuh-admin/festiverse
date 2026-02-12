const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const uploadImage = async (file: File): Promise<string> => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        throw new Error('Cloudinary not configured')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    formData.append('folder', 'festiverse')

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
            method: 'POST',
            body: formData,
        }
    )

    const data = await response.json()
    return data.secure_url as string
}

export const getOptimizedImageUrl = (url: string, width: number = 800): string => {
    if (!url) return ''
    // Transform Cloudinary URLs for auto-optimization
    if (url.includes('cloudinary.com')) {
        return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`)
    }
    return url
}
