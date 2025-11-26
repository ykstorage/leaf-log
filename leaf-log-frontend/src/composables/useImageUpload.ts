import { ref } from 'vue';
import apiClient from '../api/config';

export function useImageUpload() {
  const uploading = ref(false);
  const error = ref<string | null>(null);

  const uploadImage = async (file: File): Promise<string | null> => {
    uploading.value = true;
    error.value = null;

    try {
      // 1. Get presigned URL from backend
      const { data } = await apiClient.post('/upload/presigned-url', {
        fileName: file.name,
        fileType: file.type,
      });

      const { uploadUrl, fileUrl } = data;

      // 2. Upload file directly to S3 using presigned URL
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      // 3. Return the final file URL
      return fileUrl;
    } catch (err: any) {
      error.value = err.message || 'Failed to upload image';
      return null;
    } finally {
      uploading.value = false;
    }
  };

  return {
    uploading,
    error,
    uploadImage,
  };
}
