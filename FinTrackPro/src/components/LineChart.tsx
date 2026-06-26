import React, { useMemo } from 'react';
import { Dimensions, View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Path,
  Stop,
  Circle,
  Line,
  Text as SvgText,
  G,
} from 'react-native-svg';
import { COLORS } from '@/constants/colors';
import { useAppTheme } from '@/context/ThemeContext';

interface LineChartProps {
  labels: string[];
  data: { income: number[]; expense: number[] };
  width?: number;
  height?: number;
  currency?: string;
}

/**
 * Premium line chart — mirrors the Chart.js look (gradient fills, white points,
 * smooth curves). Pure SVG so we have full control and zero chart-library bloat.
 */
export function LineChart({
  labels,
  data,
  width,
  height = 220,
  currency = '$',
}: LineChartProps) {
  const theme = useAppTheme();
  const screenWidth = Dimensions.get('window').width;
  const W = width ?? Math.min(screenWidth - 32, 720);
  const H = height;
  const padX = 36;
  const padTop = 16;
  const padBottom = 28;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;

  const maxVal = useMemo(() => {
    const all = [...data.income, ...data.expense];
    return Math.max(1, ...all);
  }, [data]);

  const buildPath = (values: number[]) => {
    if (values.length === 0) return '';
    const stepX = innerW / Math.max(1, values.length - 1);
    let d = '';
    values.forEach((v, i) => {
      const x = padX + i * stepX;
      const y = padTop + innerH - (v / maxVal) * innerH;
      if (i === 0) {
        d += `M ${x} ${y}`;
      } else {
        const prevX = padX + (i - 1) * stepX;
        const prevY = padTop + innerH - (values[i - 1] / maxVal) * innerH;
        const cp1x = prevX + stepX / 2;
        const cp2x = prevX + stepX / 2;
        d += ` C ${cp1x} ${prevY}, ${cp2x} ${y}, ${x} ${y}`;
      }
    });
    return d;
  };

  const buildAreaPath = (values: number[]) => {
    if (values.length === 0) return '';
    const linePath = buildPath(values);
    const stepX = innerW / Math.max(1, values.length - 1);
    const lastX = padX + (values.length - 1) * stepX;
    const baselineY = padTop + innerH;
    return `${linePath} L ${lastX} ${baselineY} L ${padX} ${baselineY} Z`;
  };

  const yTicks = 4;
  const tickStep = maxVal / yTicks;

  const stepX = innerW / Math.max(1, labels.length - 1);

  // Sample x-labels so we don't overflow
  const xLabelStride = Math.max(1, Math.ceil(labels.length / 6));

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={W} height={H}>
        <Defs>
          <LinearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={COLORS.success} stopOpacity="0.35" />
            <Stop offset="100%" stopColor={COLORS.success} stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={COLORS.danger} stopOpacity="0.30" />
            <Stop offset="100%" stopColor={COLORS.danger} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Y-grid */}
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const v = (maxVal - tickStep * i);
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

        {/* Income area + line */}
        <Path d={buildAreaPath(data.income)} fill="url(#incomeFill)" />
        <Path
          d={buildPath(data.income)}
          stroke={COLORS.success}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
        {data.income.map((v, i) => {
          const x = padX + i * stepX;
          const y = padTop + innerH - (v / maxVal) * innerH;
          return (
            <Circle
              key={`i-${i}`}
              cx={x}
              cy={y}
              r={4}
              fill="#fff"
              stroke={COLORS.success}
              strokeWidth={2}
            />
          );
        })}

        {/* Expense area + line */}
        <Path d={buildAreaPath(data.expense)} fill="url(#expenseFill)" />
        <Path
          d={buildPath(data.expense)}
          stroke={COLORS.danger}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
        {data.expense.map((v, i) => {
          const x = padX + i * stepX;
          const y = padTop + innerH - (v / maxVal) * innerH;
          return (
            <Circle
              key={`e-${i}`}
              cx={x}
              cy={y}
              r={4}
              fill="#fff"
              stroke={COLORS.danger}
              strokeWidth={2}
            />
          );
        })}

        {/* X labels */}
        {labels.map((label, i) => {
          if (i % xLabelStride !== 0 && i !== labels.length - 1) return null;
          const x = padX + i * stepX;
          return (
            <SvgText
              key={`x-${i}`}
              x={x}
              y={H - 8}
              fontSize="10"
              fill={theme.textMuted}
              textAnchor="middle"
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}