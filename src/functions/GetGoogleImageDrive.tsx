import { GoogleDriveImageUrls } from '../components/types';
import axios from 'axios';

const getGoogleDriveImageUrls = async (
  apiKey: string,
  folderId: string,
  imageIds: string[],
): Promise<GoogleDriveImageUrls> => {
  try {
    // Add a query for specific file names
    const fileNameQueries = imageIds.map((imageId) => `name = '${imageId}.jpg'`);
    const fileNameQuery = fileNameQueries.join(' or ');

    let url = `https://www.googleapis.com/drive/v3/files?q=mimeType='image/jpeg' and trashed = false and '${folderId}' in parents and (${fileNameQuery})&fields=nextPageToken, files(id, name)&key=${apiKey}`;

    const response = await axios.get(url);


    if (response.data && response.data.files) {
      const imageUrls = response.data.files.reduce(
        (acc: { [key: string]: string }, file: any) => {
          const imageId = file.name as string;
          acc[imageId] = `https://drive.google.com/uc?id=${file.id}`;
          return acc;
        },
        {}
      );
      return { imageUrls, nextPageToken: response.data.nextPageToken };
    }
  } catch (error: any) {
    console.error('API Error:', error);
    console.error('API Error Response:', error.response);
    return { imageUrls: {} };
  }
  return { imageUrls: {} };
};

export default getGoogleDriveImageUrls;
