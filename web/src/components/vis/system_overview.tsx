import { prometheus } from "@/api/prometheus";
import toFixedNumberString from "@/util/to_fixed_number_string";
import { Card, Badge, Spinner, CardBody, CardFooter } from "@nextui-org/react";
import { FC, useContext, useEffect, useState } from "react";
import { useCallback, CSSProperties } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Handle,
  Position,
  NodeProps,
  useReactFlow,
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
} from "reactflow";
import "reactflow/dist/style.css";
import { Battery, Charger, Generator, Load, Solar } from "../icons";
import { TimeContext } from "./time_context";
import { getThemes } from "../../util";
import calculatePowerPlusSOC from "../../util/calculate_powerplus_soc";

const OverviewBadge = ({
  value,
  prefix,
  unit,
  loading,
}: {
  value: string;
  prefix: string;
  unit: string;
  loading: boolean;
}) => {
  if (!value || value == "0" || value == "0.0") {
    return <></>;
  }
  return (
    <Badge variant="flat" size="md" color="primary" style={{ position: "inherit", border: 'none', backgroundColor: 'transparent', display: 'none' }}>
      {loading ? (
        <div className="bg-primaryLight px-1.5 pt-1.5 rounded-md inherit">
          <Spinner color="primary" size="sm" />
        </div>
      ) : (
        <div className="bg-primaryLight px-2.5 py-1 rounded-md inherit">
          <h2 className="text-primary font-semibold text-base blur-[0.5px] tracking-wide">
            {value} {prefix}
            {unit}
          </h2>
        </div>
      )}
    </Badge>
  );
};

const CustomNode: FC<NodeProps> = ({
  data,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom,
}: NodeProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [value, setValue] = useState<number>(0);
  const time = useContext(TimeContext);

  data.query = data.query ?? "";

  useEffect(() => {
    var cancelled = false;

    const executeLabelQuery = async () => {
      if (data.query == "" || data.type == "") {
        setLoading(false);
        return;
      }

      //console.log('Querying Prometheus');

      setLoading(true);
      const response = await prometheus.query(data.query ?? "", time.end);

      if (response.error) {
        console.error(response.error);
        setLoading(true);
      }

      if (cancelled) return;

      if (response?.data?.result.length == 0) {
        setValue(0); // Device is offline => 0 kW
        setLoading(false);
      } else {
        let result = parseFloat(response?.data?.result[0].value[1]);
        
        // Apply transformation if battery type is 'inview_x', 'generic', or undefined.
        if (data.type === "inview_x") {
          result = calculatePowerPlusSOC(result);
        }
        setValue(!isNaN(result) ? result : 0);
        setLoading(false);
      }
    };

    // only calls executeLabelQuery function when selected dashboard-time is today.
    if (time.uid === "today") {
      executeLabelQuery();
    } else {
      setValue(0);
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [time, data.query]);

  return (
    <>
      <Card className="bg-backgroundContrast shadow-none border border-border w-[130px] h-[130px] blur-[0.5px]">
        <Handle
          style={{ visibility: "hidden" }}
          id="a"
          type="target"
          position={targetPosition}
        />
        {data.inverter && (
          <Handle
            style={{ visibility: "hidden" }}
            type="target"
            id="b"
            position={Position.Left}
          />
        )}
        <CardBody className="p-0 w-full h-auto overflow-auto">
          {data.icon}
        </CardBody>
        <CardFooter className="bg-backgroundColor text-textColor font-semibold flex justify-center text-base px-1.5 py-1">
          <div>
            <p>{data?.label}</p>
          </div>
        </CardFooter>
        <Handle
          type="source"
          style={{ visibility: "hidden" }}
          position={sourcePosition}
        />
      </Card>
      {data.query != "" && (
        <div
          style={{
            paddingTop: "0.5em",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {/*Quick hack to make voltage have a decimal. Will have to change later */}
          <OverviewBadge
            value={value.toFixed(0)}
            prefix={""}
            loading={loading}
            unit={data.unit}
          />
        </div>
      )}
    </>
  );
};

const CustomEdge: FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 15,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [value, setValue] = useState<number>(0);
  const [active, setActive] = useState<boolean>(data.active ?? true);
  const time = useContext(TimeContext);
  const { theme } = getThemes();
  data.query = data.query ?? "";
  data.showLabel = data.showLabel ?? false;
  const processedValue = toFixedNumberString(value, 2);

  let transformStyle = '';
  const defaultHorizontalOffset = '-175%';
  const verticalLabelOffset = data?.horizontal ? "-100" : "-280";

  if (id === 'e1-5') {
    // Special position for edge e1-5
    transformStyle = `translate(+60%, ${verticalLabelOffset}%) translate(${labelX}px,${labelY}px)`;
  } else {
    // Default position for other edges
    transformStyle = `translate(${defaultHorizontalOffset}, ${verticalLabelOffset}%) translate(${labelX}px,${labelY}px)`;
  }

  const activeStyles: CSSProperties = active
    ? { stroke: theme.colors.primary }
    : { animation: "none", stroke: "#ccc", opacity: 0.5 };

  useEffect(() => {
    const fetchData = async () => {

      var cancelled = false;

      if (data.query == "") {
        setLoading(false);
        return;
      }

      setLoading(true);
      prometheus
        .query(data.query ?? "", time.end)
        .then((response) => {
          if (cancelled) return;
          if (response?.data?.result.length == 0) {
            setValue(0); // Device is offline => 0 kW
            setActive(false);
            setLoading(false);
          } else {
            const result = Math.round(response?.data?.result[0].value[1]);
            setValue(!isNaN(result) ? result : 0);
            setActive(!isNaN(result) ? true : false);
            setLoading(false);
          }
        })
        .catch((error) => {
          console.error(error);
          setLoading(true); // If query fails, don't show label
        });

      return () => {
        cancelled = true;
      };
    }

    // only calls when selected dashboard-time is today otherwise set chartFlow inActive.
    if (time.uid === "today") {
      fetchData();
    } else {
      setValue(0);
      setActive(false);
      setLoading(false);
    }

  }, [time, data.query]);

  return (
    <>
      <BaseEdge
        id={id}
        markerEnd={markerEnd}
        path={edgePath}
        style={{ ...activeStyles, strokeWidth: 4 }}
      />
      {data.showLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: transformStyle,
            }}
          >
            <OverviewBadge
              value={processedValue.value}
              prefix={processedValue.prefix}
              loading={loading}
              unit={"W"}
            />
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

const nodeTypes = {
  powerNode: CustomNode,
};

const edgeTypes = {
  label: CustomEdge,
};

export default function SystemOverview({
  labelQuery,
  socQuery,
  batType,
  powerQuery,
  invType,
}: {
  labelQuery?: string;
  socQuery?: string;
  batType?: string;
  powerQuery?: string;
  invType?: string;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const proOptions = { hideAttribution: true };

  const defaultEdgeOptions = {
    style: { strokeWidth: 4, stroke: "rgba(246, 173, 55, 0.4)" },
    type: "smoothstep",
  };

  // Listen for window resize events
  const [width, setWidth] = useState(0); // default width, detect on server.

  useEffect(() => {
    // Set nodes with updates queries
    setNodes([
      {
        id: "1",
        position: { x: 20, y: 100 },
        targetPosition: Position.Bottom,
        sourcePosition: Position.Bottom,
        type: "powerNode",
        data: {
          label: "Solar",
          icon: <Solar />,
        },
      },
      {
        id: "2",
        position: { x: 300, y: 320 },
        type: "powerNode",
        targetPosition: Position.Left,
        sourcePosition: Position.Top,
        data: {
          label: "Charger",
          icon: <Charger />,
        },
      },
      {
        id: "3",
        position: { x: 300 + 280, y: 100 },
        type: "powerNode",
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        data: {
          label: "Battery",
          icon: <Battery />,
          query: `avg(${socQuery}{${labelQuery}}) < 100000`,
          type: batType,
          unit: "%",
        },
      },
      {
        id: "4",
        position: { x: 300 + 280, y: 320 },
        type: "powerNode",
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        data: {
          label: "Generator",
          icon: <Generator />,
        },
      },
      {
        id: "5",
        position: { x: 300 + 280 + 280, y: 320 },
        type: "powerNode",
        targetPosition: Position.Top,
        sourcePosition: Position.Right,
        data: {
          label: "Inverter",
          icon: <Charger />,
          inverter: true,
        },
      },
      {
        id: "6",
        position: { x: 280 + 280 + 280 + 280, y: 100 },
        type: "powerNode",
        targetPosition: Position.Bottom,
        sourcePosition: Position.Bottom,
        data: {
          label: "Load",
          icon: <Load />,
        },
      },
    ]);

    // On page load the labelquery is undefined, so don't set edges
    if (labelQuery?.includes("undefined")) return;

    // Set edges with updated queries
    setEdges([
      {
        id: "e1-2",
        source: "1",
        target: "2",
        animated: true,
        type: "label",
        data: {
          showLabel: true,
          active: false,
          query: `sum(aerl_srx_pv_voltage{${labelQuery}} * aerl_srx_pv_current)`,
        },
      },
      {
        id: "e1-3",
        source: "2",
        target: "3",
        animated: true,
        type: "label",
        data: {
          showLabel: false,
          active: false,
          query: `sum(aerl_srx_pv_voltage{${labelQuery}} * aerl_srx_pv_current)`,
        },
      },
      {
        id: "e1-4",
        source: "3",
        target: "5",
        animated: true,
        type: "label",
        data: {
          showLabel: false,
          active: false,
          query: invType === "inview_x" ? `avg(${powerQuery}{${labelQuery}}) * 1` : `avg(${powerQuery}{${labelQuery}}) * 1000`,
        },
      },
      {
        id: "e1-5",
        source: "5",
        target: "6",
        animated: true,
        type: "label",
        data: {
          showLabel: true,
          active: false,
          query: invType === "inview_x" ? `avg(${powerQuery}{${labelQuery}}) * 1` : `avg(${powerQuery}{${labelQuery}}) * 1000`,
        },
      },
      {
        id: "e1-6",
        source: "4",
        target: "5",
        animated: true,
        type: "label",
        targetHandle: "b",
        data: {
          showLabel: false,
          horizontal: true,
          active: false,
        },
      },
    ]);
  }, [socQuery, powerQuery, labelQuery, setEdges, setNodes]);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setWidth]);

  // If the window is resized, resize the graph to fit the new window size.
  const reactFlowInstance = useReactFlow();
  useEffect(() => {
    const timeout = setTimeout(() => {
      reactFlowInstance.fitView();
    }, 50);
    return () => clearTimeout(timeout);
  }, [reactFlowInstance, width]);


  return (
    <div>
      <ReactFlow
        className="min-h-[24em] h-full w-full mt-4 xl:flex hidden"
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        zoomOnPinch={false}
        panOnScroll={false}
        panOnDrag={false}
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        proOptions={proOptions}
        defaultEdgeOptions={defaultEdgeOptions}
        draggable={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        preventScrolling={false}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      ></ReactFlow>
    </div>
  );
}
