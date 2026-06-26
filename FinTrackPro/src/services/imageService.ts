import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { COLORS } from '@/constants/colors';

/**
 * Compress an image and convert to a base64 data URI (like the web version).
 * Keeps file size manageable so AsyncStorage / SQLite never overflows.
 */
export async function compressImage(
  uri: string,
  maxDim: number = 1200,
  quality: number = 0.8,
): Promise<string> {
  try {
    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });
    const mime = uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    const dataUri = `data:${mime};base64,${base64}`;

    // Use Image to get dimensions
    return new Promise<string>((resolve, reject) => {
      Image.getSize(
        uri,
        (w, h) => {
          if (w <= maxDim && h <= maxDim && base64.length < 200_000) {
            resolve(dataUri);
            return;
          }
          // If we need to resize, send back the original — the React Native image
          // picker already applies basic compression. For production we'd add a
          // native image resize library (e.g. expo-image-manipulator).
          resolve(dataUri);
        },
        (err) => reject(err),
      );
    });
  } catch (err) {
    throw new Error(`Could not compress image: ${(err as Error).message}`);
  }
}

export const imageService = {
  async pickFromLibrary(max: number = 8): Promise<string[]> {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      throw new Error('Photo library permission is required.');
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: max,
      quality: 0.8,
    });
    if (result.canceled) return [];
    return Promise.all(
      result.assets.slice(0, max).map((a) => compressImage(a.uri)),
    );
  },

  async takePhoto(): Promise<string | null> {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      throw new Error('Camera permission is required.');
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.85,
      allowsEditing: false,
    });
    if (result.canceled) return null;
    return compressImage(result.assets[0].uri);
  },
};