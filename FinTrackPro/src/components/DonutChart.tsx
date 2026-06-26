import React, { useMemo } from 'react';
import { Dimensions, Text, View } from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import { COLORS, CATEGORY_COLORS } from '@/constants/colors';
import { useAppTheme } from '@/context/ThemeContext';

interface DonutChartProps {
  labels: string[];
  data: number[];
  currency?: string;
  height?: number;
  size?: number;
}

/**
 * Premium doughnut chart — pure SVG, smooth arcs, legend below.
 */
export function DonutChart({
  labels,
  data,
  currency = '$',
  size = 200,
  height = 260,
}: DonutChartProps) {
  const theme = useAppTheme();
  const total = useMemo(() => data.reduce((s, v) => s + v, 0), [data]);

  if (total === 0 || labels.length === 0) {
    return (
      <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: theme.textMuted, fontSize: 13 }}>No data yet</Text>
      </View>
    );
  }

  const radius = size / 2;
  const innerRadius = radius * 0.62;
  const center = radius;

  let cumulative = 0;
  const slices = data.map((v, i) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += v;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    const sx = center + radius * Math.cos(startAngle);
    const sy = center + radius * Math.sin(startAngle);
    const ex = center + radius * Math.cos(endAngle);
    const ey = center + radius * Math.sin(endAngle);

    const sxi = center + innerRadius * Math.cos(startAngle);
    const syi = center + innerRadius * Math.sin(startAngle);
    const exi = center + innerRadius * Math.cos(endAngle);
    const eyi = center + innerRadius * Math.sin(endAngle);

    const path = [
      `M ${sx} ${sy}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${ex} ${ey}`,
      `L ${exi} ${eyi}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${sxi} ${syi}`,
      'Z',
    ].join(' ');

    return {
      path,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      label: labels[i],
      value: v,
      percent: ((v / total) * 100).toFixed(0),
    };
  });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G>
          {slices.map((s, i) => (
            <Path
              key={i}
              d={s.path}
              fill={s.color}
              stroke={theme.card}
              strokeWidth={3}
            />
          ))}
          <Circle cx={center} cy={center} r={innerRadius - 1} fill={theme.card} />
          <SvgText
            x={center}
            y={center - 4}
            fontSize="22"
            fontWeight="700"
            fill={theme.text}
            textAnchor="middle"
          >
            {currency}
            {total.toFixed(0)}
          </SvgText>
          <SvgText
            x={center}
            y={center + 16}
            fontSize="11"
            fill={theme.textMuted}
            textAnchor="middle"
          >
            Total
          </SvgText>
        </G>
      </Svg>

      {/* Legend */}
      <View style={{ marginTop: 12, width: '100%', paddingHorizontal: 12 }}>
        {slices.slice(0, 6).map((s, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 4,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: s.color,
                  marginRight: 8,
                }}
              />
              <Text style={{ color: theme.text, fontSize: 12, fontWeight: '500' }} numberOfLines={1}>
                {s.label}
              </Text>
            </View>
            <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: '600' }}>
              {s.percent}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}