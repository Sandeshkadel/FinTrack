import React, { useState, useEffect } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';

interface ImageViewerProps {
  visible: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

const SCREEN = Dimensions.get('window');

/**
 * Full-screen image viewer with swipe between images and pinch-to-zoom gesture.
 */
export function ImageViewer({ visible, images, initialIndex = 0, onClose }: ImageViewerProps) {
  const [idx, setIdx] = useState(initialIndex);

  useEffect(() => {
    if (visible) setIdx(initialIndex);
  }, [visible, initialIndex]);

  if (!visible || images.length === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.95)" />
      <View style={styles.wrap}>
        <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
          <Ionicons name="close" size={32} color="#fff" />
        </Pressable>

        <View style={styles.counterWrap}>
          <Text style={styles.counter}>
            {idx + 1} / {images.length}
          </Text>
        </View>

        <ZoomableImage uri={images[idx]} key={idx} />

        {images.length > 1 && idx > 0 ? (
          <Pressable
            style={[styles.navBtn, { left: 12 }]}
            onPress={() => setIdx((i) => Math.max(0, i - 1))}
            hitSlop={10}
          >
            <Ionicons name="chevron-back" size={32} color="#fff" />
          </Pressable>
        ) : null}
        {images.length > 1 && idx < images.length - 1 ? (
          <Pressable
            style={[styles.navBtn, { right: 12 }]}
            onPress={() => setIdx((i) => Math.min(images.length - 1, i + 1))}
            hitSlop={10}
          >
            <Ionicons name="chevron-forward" size={32} color="#fff" />
          </Pressable>
        ) : null}
      </View>
    </Modal>
  );
}

function ZoomableImage({ uri }: { uri: string }) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, Math.min(4, savedScale.value * e.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = e.translationX;
        translateY.value = e.translationY;
      }
    })
    .onEnd(() => {
      if (scale.value <= 1) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const tap = Gesture.Tap().numberOfTaps(2).onEnd(() => {
    if (scale.value > 1) {
      scale.value = withSpring(1);
      savedScale.value = 1;
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    } else {
      scale.value = withSpring(2);
      savedScale.value = 2;
    }
  });

  const composed = Gesture.Simultaneous(pinch, pan, tap);

  const style = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.imageWrap, style]}>
        <Image source={{ uri }} style={styles.image} resizeMode="contain" />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  counterWrap: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  counter: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.6,
  },
  navBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
  },
  imageWrap: {
    width: SCREEN.width,
    height: SCREEN.height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});