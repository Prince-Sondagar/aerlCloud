import { prometheus } from "@/api/prometheus"
import toFixedNumberString from "@/util/to_fixed_number_string";
import { Card, CardBody, Spacer, Spinner } from "@nextui-org/react"
import { useContext, useEffect, useState } from "react"
import wattHours from "@/util/calculate_watt_hours";
import { TimeContext } from "./time_context";

export default function GenKWH({ measurement, labelQuery, unit, selectedHubs, refetch }: {
  measurement: string,
  labelQuery?: string,
  unit?: string,
  selectedHubs: Set<string>
  refetch: boolean
}) {
  const time = useContext(TimeContext);
  const [value, setValue] = useState<number>(0);
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(true)
  const data = toFixedNumberString(value, 3);
  const step = Math.max(120, Math.floor((time.end - time.start) / 6000));

  const wattQuery = `sum(aerl_srx_pv_voltage{${labelQuery}} * aerl_srx_pv_current)`;

  const fetchData = async () => {
    setLoading(true);
    try {
      // Request data from Prometheus
      const wattResponse = await prometheus.queryRange(wattQuery, time.start, time.end, step);

      // Check if wattResponse.data.result exists and has at least one item
      if (!wattResponse?.data?.result?.length) {
        setFailed(true);
        setLoading(false);
        return;
      }

      const wh = wattHours(wattResponse.data.result[0].values, step);
      setValue(wh);
      setFailed(false);
    } catch (error) {
      console.error(error);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedHubs.size || !selectedHubs) fetchData();

    setTimeout(() => {
      if (selectedHubs.size === 0) {
        setLoading(false);
      }
    }, 3000);

  }, [time.end, labelQuery, step, wattQuery, selectedHubs])

  // refetch the data when location change
  useEffect(() => {
    setLoading(true)
    if (refetch && selectedHubs.size > 0) {
      fetchData();
    } else {
      setFailed(true);
      setValue(0);
    }
  }, [refetch, selectedHubs])

  return (
    <div className="xl:w-1/4 p-1.5">
      <Card className="bg-backgroundContrast shadow-none border border-border px-3 py-2  min-h-[118px]">
        <CardBody>
          <p className="text-lg text-secondaryText font-semibold text-center">{measurement}</p>
          <div className="mx-auto">
            {loading ? (
              <>
                <Spacer y={2.5} />
                <Spinner className="mt-1" size="sm" color="secondary" />
              </>
            ) : failed ? (
              <span className="text-textColor flex items-center text-[32px] font-semibold">
                --{" "}
                <p className="text-secondaryText text-2xl ps-2">{data.prefix}{unit}</p>
              </span>
            ) : (
              <span className="text-textColor text-[32px] font-semibold ps-2 flex items-center">
                {data.value}{" "}
                <p className="text-secondaryText text-2xl ps-2">
                  {data.prefix}
                  {unit}
                </p>
              </span>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
