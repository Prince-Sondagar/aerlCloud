'use client';

import { prometheus } from "@/api/prometheus"
import toFixedNumberString from '@/util/to_fixed_number_string'
import { Card, CardHeader, CardBody, Spinner } from "@nextui-org/react"
import { useContext, useEffect, useState } from "react"
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts"
import { TimeContext } from "./time_context"
import { locationTimezone } from "../../util/location_timezone";
import { getThemes } from "@/util";

export interface DataPoint {
  time: string,
  value: number,
}

// Chart component
export default function Chart({
  title,
  unit,
  metric,
  syncMethodFunction,
  syncId,
  timezone,
  aspect,
  extents,
  selectedHubs,
  transform,
  refetch
}: {
  title?: string,
  unit?: string,
  metric: string,
  syncMethodFunction?: (_tooltipTicks: any, data: any, dataPoints: DataPoint[]) => number;
  syncId?: string | number | undefined,
  timezone?: string,
  aspect?: number,
  extents?: ("min" | "max" | "avg" | "peak")[]
  selectedHubs?: Set<string>;
  transform?: (arg0: number) => number,
  refetch?: boolean
}) {
  const time = useContext(TimeContext);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const { theme } = getThemes();

  // This is required (along with setting the domain manually) because of a bug
  // in recharts where it doesn't handle values above 1000 properly.
  const maxYValue = dataPoints
    ? Math.max(
      ...dataPoints.map((item) =>
        // handle float and undefined values
        item["value"] ? item["value"] : 0,
      ),
    )
    : 100;
  const maxValue = toFixedNumberString(maxYValue, 3);

  const minYValue = dataPoints
    ? Math.min(
      ...dataPoints.map((item) =>
        // handle float and undefined values
        item["value"] ? item["value"] : 0,
      ),
    )
    : 100;
  const minValue = toFixedNumberString(minYValue, 3);

  const averageYValue = (dataPoints ? dataPoints.reduce((sum, item) => {
    // handle float and undefined values
    const value = Math.round(item["value"] ? item["value"] : 0)
    return sum + value;
  }, 0) / dataPoints.length : 100);
  const averageValue = toFixedNumberString(averageYValue, 3)

  const lastValue = toFixedNumberString((dataPoints ? dataPoints[dataPoints.length - 1]?.value : 0), 3)


  const load = async () => {
    setLoading(true);
    try {
      const t_delta = time.end - time.start
      const days = Math.ceil(t_delta / 60 / 60 / 24)
      let step = days * 60

      // Increase step size if multiple hubs are selected
      if (selectedHubs && selectedHubs.size > 1) {
        // Adjust step to 5x step size for multiple simultaneous gateway queries.
        step *= 5;
      }

      const response = await prometheus.queryRange(metric, time.start, time.end, step)
      const data = response?.data?.result[0]?.values ?? []

      setDataPoints(
        data.map(([timestamp, value]: [number, string]) => {
          var date = new Date(timestamp * 1000);
          const timeZoneData = date.toLocaleString("en-us", {
            timeZone: timezone ?? locationTimezone(null),
          });

          const transformed_value: number = transform ? transform(parseFloat(value)) : parseFloat(value);

          return {
            time: timeZoneData ? timeZoneData : new Date(timestamp * 1000).toISOString(),
            value: Math.max(transformed_value, 0),
          };
        }),
      );
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }

  };

  useEffect(() => {
    if ((selectedHubs?.size && selectedHubs.size >= 0) || !selectedHubs) load();
    setTimeout(() => {
      if (!selectedHubs?.size) {
        setLoading(false);
      }
    }, 3000);
  }, [time.end, metric]);

  // refetch the data when location change
  useEffect(() => {
    setLoading(true)
    if (refetch && selectedHubs?.size !== undefined && selectedHubs.size > 0) {
      load();
    } else {
      setDataPoints([])
    }
  }, [refetch, selectedHubs]);

  return (
    <div className="w-full">
      <Card className="bg-backgroundContrast shadow-none m-1.5 min-h-[256px] border border-border justify-between">
        <CardHeader>
          <div>
            <div className="flex items-center">
              <p className="text-textColor font-semibold me-2">{title}</p>
              {loading && <Spinner size="sm" color="secondary" />}
            </div>
            {dataPoints.length == 0 ? (
              !loading && <p className="text-secondaryText tracking-tighter mt-0.5">No data available</p>
            ) : (
              <>
                {extents?.includes("peak") && <div>
                  <p className="text-secondaryText font-semibold">{maxValue.value} {maxValue.prefix}{unit} Peak</p>
                </div>}
                {extents?.includes("max") && <div>
                  <p className="text-secondaryText font-semibold">{maxValue.value} {maxValue.prefix}{unit} Max</p>
                </div>}
                {extents?.includes("min") && <div>
                  <p className="text-secondaryText font-semibold">{minValue.value} {minValue.prefix}{unit} Min</p>
                </div>}
                {extents?.includes("avg") && <div>
                  <p className="text-secondaryText font-semibold">{averageValue.value} {averageValue.prefix}{unit} Avg</p>
                </div>}
              </>
            )}
          </div>
        </CardHeader>
        <CardBody className="overflow-y-visible max-h-[122px] p-0 flex justify-end">
          <ResponsiveContainer width="100%" aspect={aspect || (6 / 1)}>
            <AreaChart data={dataPoints} syncId={syncId} syncMethod={(_tooltipTicks: any, data: any) => syncId && syncMethodFunction && syncMethodFunction(_tooltipTicks, data, dataPoints)} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
              <Area unit={unit}
                strokeWidth={2}
                type="basis"
                dataKey="value"
                fillOpacity={1}
                stroke={theme?.colors?.primary}
                fill={theme?.colors?.primaryLight}
                animationDuration={300} />
              <Tooltip wrapperStyle={{ zIndex: 1 }} content={<CustomTooltip />} />
            </AreaChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </div>
  )
}

// Custom tooltip component
const CustomTooltip = ({
  payload,
  active,
}: {
  payload?: Array<any>;
  label?: any;
  active?: any;
}) => {
  if (active && payload) {
    const value = toFixedNumberString(payload[0]?.value, 3);
    const time = payload[0]?.payload.time;

    return (
      <Card className="shadow-none border border-border bg-backgroundContrast px-1.5">
        <CardBody>
          <p className="font-[600] text-base pb-1 text-textColor">{value.value} {value.prefix}{payload[0]?.unit}</p>
          <p className="text-xs text-textColor">{new Date(time).toLocaleTimeString()} {new Date(time).toLocaleDateString()}</p>
        </CardBody>
      </Card>
    );
  }

  return null;
};
