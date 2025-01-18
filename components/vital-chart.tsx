import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VitalChartProps {
  data: Array<{ timestamp: number; value: number }>;
  title: string;
  unit: string;
  color: string;
}

export function VitalChart({ data, title, unit, color }: VitalChartProps) {
  const formatXAxis = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatXAxis}
                stroke="#888888"
                fontSize={12}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickFormatter={(value) => `${value}${unit}`}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}${unit}`, title]}
                labelFormatter={(label) => formatXAxis(label as number)}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}