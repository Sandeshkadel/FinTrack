import React, { useMemo } from 'react';
import { Dimensions, View, Text } from 'react-native';
import Svg, {
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
  Line,
} from 'react-native-svg';
import { COLORS } from '@/constants/colors';
import { useAppTheme } from '@/context/ThemeContext';

interface BarChartProps {
  // Two shapes supported:
  // 1. { data: { label: string; value: number; color: string }[] }
  // 2. { labels: string[]; datasets: { label: string; data: number[]; color: string }[] }
  data?: { label: string; value: number; color: string }[];
  labels?: string[];
  datasets?: { label: string; data: number[]; color: string }[];
  currency?: string;
  height?: number;
}

/**
 * Premium bar chart — rounded bars, gradient fills, side-by-side datasets.
 */
export function BarChart(props: BarChartProps) {
  const { data, labels, datasets, currency = '$', height = 240 } = props;
  const theme = useAppTheme();

  // Normalise both APIs into the {labels, datasets} shape
  const normLabels = useMemo(() => {
    if (data) return data.map((d) => d.label);
    return labels || [];
  }, [data, labels]);

  const normDatasets = useMemo(() => {
    if (data) {
      return [
        {
          label: 'value',
          data: data.map((d) => d.value),
          color: data[0]?.color || COLORS.primary,
        },
      ];
    }
    return datasets || [];
  }, [data, datasets]);

  const screenWidth = Dimensions.get('window').width;
  const W = Math.min(screenWidth - 32, 720);
  const H = height;
  const padX = 36;
  const padTop = 16;
  const padBottom = 36;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;

  const maxVal = useMemo(() => {
    const all = normDatasets.flatMap((d) => d.data);
    return Math.max(1, ...all);
  }, [normDatasets]);

  const yTicks = 4;
  const tickStep = maxVal / yTicks;

  const groupCount = normLabels.length || 1;
  const groupWidth = innerW / groupCount;
  const barWidth = Math.max(4, (groupWidth * 0.7) / normDatasets.length);

  const labelStride = Math.max(1, Math.ceil(normLabels.length / 6));

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={W} height={H}>
        <Defs>
          {normDatasets.map((d, i) => (
            <LinearGradient
              key={`g-${i}`}
              id={`barGrad-${i}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <Stop offset="0%" stopColor={d.color} stopOpacity={0.95} />
              <Stop offset="100%" stopColor={d.color} stopOpacity={0.6} />
            </LinearGradient>
          ))}
        </Defs>

        {/* Y grid */}
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const v = maxVal - tickStep * i;
          const y = padTop + (i / yTicks) * innerH;
          return (
            <G key={`grid-${i}`}>
              <Line
                x1={padX}
                x2={W - padX}
                y1={y}
                y2={y}
                stroke={COLORS.primary}
                strokeOpacity={0.06}
                strokeWidth={1}
              />
              <SvgText
                x={padX - 6}
                y={y + 4}
                fontSize="10"
                fill={theme.textMuted}
                textAnchor="end"
              >
                {currency}
                {Math.round(v).toLocaleString()}
              </SvgText>
            </G>
          );
        })}

        {/* Bars */}
        {normLabels.map((label, gi) => {
          const groupX = padX + gi * groupWidth;
          return (
            <G key={`g-${gi}`}>
              {normDatasets.map((d, di) => {
                const v = d.data[gi] ?? 0;
                const h = (v / maxVal) * innerH;
                const x = groupX + (groupWidth - barWidth * normDatasets.length) / 2 + di * barWidth;
                const y = padTop + innerH - h;
                return (
                  <Rect
                    key={di}
                    x={x}
                    y={y}
                    width={barWidth - 2}
                    height={h}
                    rx={6}
                    fill={`url(#barGrad-${di})`}
                  />
                );
              })}
            </G>
          );
        })}

        {/* X labels */}
        {normLabels.map((label, i) => {
          if (i % labelStride !== 0 && i !== normLabels.length - 1) return null;
          const x = padX + i * groupWidth + groupWidth / 2;
          return (
            <SvgText
              key={`x-${i}`}
              x={x}
              y={H - 16}
              fontSize="10"
              fill={theme.textMuted}
              textAnchor="middle"
            >
              {label.length > 8 ? `${label.slice(0, 7)}…` : label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}
