import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useAppTheme } from '@/context/ThemeContext';
import { ImageViewer } from './ImageViewer';

interface ImageGalleryProps {
  images: string[];
  onRemove?: (index: number) => void;
  onAdd?: () => void;
  readonly?: boolean;
  max?: number;
  size?: number;
  showCount?: boolean;
}

/**
 * Image gallery with thumb grid + remove buttons.
 * Tap any thumb to open the full-screen lightbox (ImageViewer).
 */
export function ImageGallery({
  images,
  onRemove,
  onAdd,
  readonly,
  max = 8,
  size,
  showCount = true,
}: ImageGalleryProps) {
  const theme = useAppTheme();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const screen = Dimensions.get('window');
  const thumbSize = size ?? Math.max(72, (screen.width - 80) / 5);

  return (
    <>
      <View style={styles.row}>
        {images.map((src, idx) => (
          <Pressable
            key={`${src}-${idx}`}
            onPress={() => setLightboxIndex(idx)}
            style={[styles.thumb, { width: thumbSize, height: thumbSize, borderColor: theme.inputBorder }]}
          >
            <Image source={{ uri: src }} style={styles.image} />
            {!readonly && onRemove ? (
              <Pressable
                hitSlop={6}
                onPress={() => onRemove(idx)}
                style={styles.removeBtn}
              >
                <Ionicons name="close" size={11} color="#fff" />
              </Pressable>
            ) : null}
            {showCount && idx === 0 && images.length > 1 ? (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>+{images.length - 1}</Text>
              </View>
            ) : null}
          </Pressable>
        ))}
        {!readonly && onAdd && images.length < max ? (
          <Pressable
            onPress={onAdd}
            style={[
              styles.addBtn,
              {
                width: thumbSize,
                height: thumbSize,
                borderColor: theme.inputBorder,
                backgroundColor: theme.input,
              },
            ]}
          >
            <Ionicons name="add" size={24} color={theme.textMuted} />
            <Text style={{ color: theme.textMuted, fontSize: 10, fontWeight: '600' }}>Add</Text>
          </Pressable>
        ) : null}
      </View>

      <ImageViewer
        visible={lightboxIndex !== null}
        images={images}
        initialIndex={lightboxIndex ?? 0}
        onClose={() => setLightboxIndex(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  thumb: {
    borderRadius: 10,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  addBtn: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  countText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
});