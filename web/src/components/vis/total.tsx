import { prometheus } from "@/api/prometheus";
import toFixedNumberString from "@/util/to_fixed_number_string";
import {
  Card,
  CardBody,
  Spacer,
  Spinner,
} from "@nextui-org/react";
import { useContext, useEffect, useState } from "react";
import getTimeOptions from "../../util/time_options";
import { TimeContext } from "./time_context";



export default function Total({
  measurement,
  query,
  unit,
  selectedHubs,
  transform,
  refetch
}: {
  measurement: string;
  query?: string;
  unit?: string;
  selectedHubs: Set<string>;
  transform?: (arg0: number) => number;
  refetch: boolean;
}) {
  const time = useContext(TimeContext);
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(true);

  const data = toFixedNumberString(value, 2);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!query) {
        throw new Error("Query is blank");
      }
      if (time.uid !== "today") {
        throw new Error("Data is displayed only for today's dashboard time.")
      }
      const response = await prometheus.query(query ?? "", time.end);
      if (response?.data?.result.length == 0) {
        setValue(0);
        setFailed(true);
        setLoading(false);
      } else {
        const resultValue = response?.data?.result[0].value[1];
        const result = parseFloat(resultValue);
        if (!isNaN(result)) {
          const transformed_value: number = transform ? transform(result) : result;
          setValue(transformed_value);
          setFailed(false);
        } else {
          setValue(0); // or any default value
          setFailed(true);
        }

        setLoading(false);
      }
    } catch (error) {
      setValue(0); // or any default value
      setFailed(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    var cancelled = false;

    if (selectedHubs.size || !selectedHubs) {
      fetchData();
    }

    setTimeout(() => {
      if (!selectedHubs.size) {
        setLoading(false);
      }
    }, 3000);

    return () => {
      cancelled = true;
    };
  }, [time.end, query]);

  // refetch the data when location change
  useEffect(() => {
    setLoading(true)
    if (refetch && selectedHubs.size > 0) {
      fetchData();
    } else {
      setFailed(true);
      setValue(0);
    }
  }, [refetch, selectedHubs]);

  return (
    <div className="xl:w-1/4 p-1.5">
      <Card className="bg-backgroundContrast shadow-none border border-border px-3 py-2 min-h-[118px]">
        <CardBody>
          <p className="text-lg text-secondaryText font-semibold text-center">
            {measurement}
          </p>
          <div className="gap-4 mx-auto">
            {loading ? (
              <>
                <Spacer y={1} />
                <Spinner className="mt-1" size="sm" color="secondary" />
              </>
            ) : failed ? (
              <span className="text-textColor flex items-center text-[32px] font-semibold">
                --{" "}
                <p className="text-secondaryText text-2xl ps-2">
                  {data.prefix}
                  {unit}
                </p>
              </span>
            ) : (
              <span className="text-textColor flex items-center text-[32px] font-semibold">
                {data.value}{" "}
                <p className="text-secondaryText text-2xl ps-2">
                  {data.prefix}{unit}
                </p>
              </span>
            )}
          </div>
        </CardBody>
      </Card>
    </div >
  );
}
