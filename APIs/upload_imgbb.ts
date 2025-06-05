import axios from 'axios';
import RNFS from 'react-native-fs';

const API_KEY_IMGBB = '8c4f7e3077638667f7472db63018a6e1';
export async function uploadImagemParaImgBB(uri: string): Promise<string | null> {
  try {

    const base64 = await RNFS.readFile(uri, 'base64');


    const formData = new FormData();
    formData.append('key', API_KEY_IMGBB);
    formData.append('image', base64);

    const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.data.success) {
      console.log('✅ Upload para ImgBB feito! URL:', response.data.data.url);
      return response.data.data.url;
    } else {
      console.error('❌ Falha no ImgBB:', response.data);
      return null;
    }
  } catch (error: any) {
    console.error('🚨 Erro no upload ImgBB:', error.message, error.response?.data);
    return null;
  }
}

const IMGUR_CLIENT_ID = '64cc3190a577e0f73bd75ca7b82aa5d152cbb37e';

export async function uploadImagemParaImgur(uri: string): Promise<string | null> {
  try {
    const formData = new FormData();

    formData.append('image', {
      uri: uri,
      name: 'foto.jpg',
      type: 'image/jpeg',
    } as any);
    formData.append('type', 'file');

    

    const response = await axios.post('https://api.imgur.com/3/image', formData, {
      headers: {
        Authorization: `Bearer ${IMGUR_CLIENT_ID}`,
        'Content-Type': 'multipart/form-data',
      },

    });

    if (response.data.success) {
      console.log('✅ Upload feito! URL:', response.data.data.link);
      return response.data.data.link;
    } else {
      console.error('❌ Falha no upload:', response.data);
      return null;
    }
  } catch (err: any) {
    console.error('🚨 Erro no upload:', err.message, err.response?.data);
    return null;
  }
}
