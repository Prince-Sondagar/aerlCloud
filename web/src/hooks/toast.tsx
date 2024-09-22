import { Button, Card, Progress, CardBody, CardHeader, CardFooter } from "@nextui-org/react";
import { createContext, useContext, useEffect, useState } from "react";
import { Database } from "@/supabase/types";
import { XSquare } from "react-feather";

type Severity = Database["public"]["Enums"]["severity"] | "success";

type Toast = {
  id: number;
  message: string;
  description?: string;
  severity?: Severity;
};

function ToastCard({ toast }: { toast: Toast }) {
  let [timer, setTimer] = useState(100);
  const t = useToast();

  useEffect(() => {
    let interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 0.5);
    }, 15);

    if (timer <= 0) {
      t.remove(toast.id);
    }

    return () => {
      clearInterval(interval);
    };
  }, [timer, toast.id, t]);

  const color = toast.severity == "information" ? "primary" : toast.severity === "error" ? "danger" : toast.severity;

  return (
    <Card
      className="border py-1 mt-4 border-border bg-backgroundContrast shadow-lg"
    >
      <CardHeader
        className="m-0 font-bold"
      >
        <div
          className="w-full flex justify-between items-center text-textColor"
        >
          {toast.message}
          <Button
            aria-label="Dismiss notification"
            size="sm"
            className="mr-[5px] opacity-50 min-w-0 p-0"
            onPress={() => t.remove(toast.id)}
          >
            <XSquare  className="text-textColor"/>
          </Button>
        </div>
      </CardHeader>
      <CardBody className="py-[5px] px-3 text-textColor">{toast.description}</CardBody>
      <CardFooter>
        <Progress
          disableAnimation={true}
          color={color}
          size="sm"
          value={timer}
          className="bg-backgroundHover rounded-full"
        />
      </CardFooter>
    </Card>
  );
}

type NewToast = {
  message: string;
  description?: string;
  severity?: Severity;
};

type Context = {
  notifications: Toast[];
  add: (toast: NewToast) => { id: number };
  remove: (id: number) => void;
};

export const ToastContext = createContext<Context>({
  notifications: [],
  add: (toast: NewToast) => {
    return { id: 0 };
  },
  remove: (id: number) => { },
});

export function ToastContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Toast[]>([]);

  const value = {
    notifications: notifications,
    add: (toast: NewToast) => {
      const rng = Math.random() * 100000;

      setNotifications((notifications) => [
        {
          id: rng,
          message: toast.message,
          description: toast.description,
          severity: toast.severity,
        },
        ...notifications,
      ]);

      return { id: rng };
    },
    remove: (id: number) => {
      setNotifications((notifications) =>
        notifications.filter((n) => n.id != id),
      );
    },
  };

  useEffect(() => { }, []);

  return (
    <ToastContext.Provider value={value}>
      <div className="fixed bottom-4 left-4 right-4 z-50 sm:w-[400px] max-w-[400px] p-0"
      >
        {
          notifications.map((toast) => (
            <ToastCard key={toast.id} toast={toast} />
          ))
        }
      </div>
      {children}
    </ToastContext.Provider >
  );
}

export const useToast = () => useContext(ToastContext);
