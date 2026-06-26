import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInRight,
  FadeInUp,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/Button';

const { width } = Dimensions.get('window');

interface Slide {
  title: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
  tag: string;
}

const SLIDES: Slide[] = [
  {
    title: 'Take Control of Your Money',
    desc: 'Track every dollar, every goal, every milestone. FinTrack Pro gives you the clarity you deserve.',
    icon: 'wallet',
    gradient: ['#8b5cf6', '#6366f1'],
    tag: 'Welcome',
  },
  {
    title: 'Smart Insights & Reports',
    desc: 'Beautiful charts reveal where your money goes. Spot trends, plan ahead, save more — automatically.',
    icon: 'stats-chart',
    gradient: ['#ec4899', '#f43f5e'],
    tag: 'Analytics',
  },
  {
    title: 'Snap Receipts with OCR',
    desc: 'Photograph any receipt — we extract the amount, date, and merchant instantly. No typing required.',
    icon: 'camera',
    gradient: ['#10b981', '#059669'],
    tag: 'Productivity',
  },
  {
    title: 'Goals That Move With You',
    desc: 'Set savings goals, build budgets, and watch your progress with smooth animations and confetti rewards.',
    icon: 'trophy',
    gradient: ['#f59e0b', '#d97706'],
    tag: 'Motivation',
  },
  {
    title: 'Bank-Grade Security',
    desc: 'Your data stays on your device — encrypted with Face ID, Touch ID, or PIN. Private. Always.',
    icon: 'shield-checkmark',
    gradient: ['#06b6d4', '#0891b2'],
    tag: 'Security',
  },
  {
    title: "Let's Get Started",
    desc: 'Join thousands building better financial futures. Your journey to financial freedom starts now.',
    icon: 'rocket',
    gradient: ['#8b5cf6', '#ec4899'],
    tag: 'Ready',
  },
];

interface Props {
  onDone: () => void;
}

export function OnboardingScreen({ onDone }: Props) {
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);
  const { markOnboardingDone } = useApp();

  const finish = async () => {
    await markOnboardingDone();
    onDone();
  };

  const next = () => {
    if (index < SLIDES.length - 1) {
      const nextIdx = index + 1;
      listRef.current?.scrollToIndex({ index: nextIdx, animated: true });
      setIndex(nextIdx);
    } else {
      finish();
    }
  };

  const skip = () => {
    finish();
  };

  const slide = SLIDES[index];

  return (
    <View style={styles.root}>
      <View style={styles.skipRow}>
        {index < SLIDES.length - 1 ? (
          <Pressable onPress={skip} hitSlop={12}>
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        ) : (
          <View />
        )}
      </View>

      <View style={styles.slideWrap}>
        <Animated.View
          key={index}
          entering={FadeIn.duration(450)}
          style={[styles.iconWrap, { backgroundColor: slide.gradient[0] }]}
        >
          <View style={[styles.iconBlob, { backgroundColor: slide.gradient[1] }]} />
          <Ionicons name={slide.icon} size={84} color="#fff" />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(120).duration(450)} style={styles.tagWrap}>
          <Text style={[styles.tag, { color: slide.gradient[0] }]}>{slide.tag.toUpperCase()}</Text>
        </Animated.View>

        <Animated.Text entering={FadeInUp.delay(180).duration(450)} style={styles.title}>
          {slide.title}
        </Animated.Text>

        <Animated.Text entering={FadeInUp.delay(240).duration(450)} style={styles.desc}>
          {slide.desc}
        </Animated.Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  width: i === index ? 26 : 8,
                  backgroundColor: i === index ? COLORS.primary : 'rgba(0,0,0,0.15)',
                },
              ]}
            />
          ))}
        </View>

        <Button
          title={index === SLIDES.length - 1 ? "Let's Go" : 'Next'}
          onPress={next}
          iconRight={index === SLIDES.length - 1 ? 'arrow-forward' : 'chevron-forward'}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  skipRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  skip: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '600',
  },
  slideWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 200,
    height: 200,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
  },
  iconBlob: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    top: -40,
    right: -40,
    opacity: 0.6,
  },
  tagWrap: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 14,
  },
  tag: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  desc: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 6,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});