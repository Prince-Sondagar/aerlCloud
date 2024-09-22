import { LayoutProps } from "@/components/layouts";
import CardLayout from "@/components/layouts/card";
import { useState } from "react";
import {
  Button,
  Input,
  Spacer,
  Spinner,
} from "@nextui-org/react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useSearchParams } from "next/navigation";
import CommonInput from "@/components/CommonInput";

export default function Verify(props: LayoutProps) {
  const supabase = useSupabaseClient();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pinCode, setPinCode] = useState("");
  const [name, setName] = useState("");
  const searchParams = useSearchParams();

  const register = async () => {
    setLoading(true);

    const hub_id = searchParams.get("hub");

    const { data, error } = await supabase.functions.invoke("register/nexus", {
      body: {
        hub_id: hub_id,
        pin: pinCode,
        name: name,
      },
    });

    console.log(data, error);
    setLoading(false);
  };

  return (
    <CardLayout
      {...props}
      titleSuffix="Register Nexus"
      hideNav
    >
      <div>
        <div>
          <div>
            <div className="text-textColor text-2xl font-semibold text-center mb-3.5 tracking-tighter">
              Register your NeXus
            </div>
          </div>
        </div>
        <Spacer y={1} />

        <div>
          {error && (
            <div className="text-error text-base py-2 text-left">
              {error}
            </div>
          )}
        </div>
        {error && <Spacer y={1} />}

        {!loading && (
          <>
            <div>
              <Spacer y={4} />
              <CommonInput
                type="name"
                label={<></>}
                placeholder="Name your NeXus"
                onChange={({ target }) => setName(target.value)}
                onKeyDown={(e) => { if (e.key == 'Enter') register() }}
                style="!mt-0"
              />
            </div>
            <p className="text-base tracking-tighter leading-7 pb-1.5 pl-1 text-primarySolidContrast text-left mt-5 mb-1">Please enter the pin-code on the sticker on the side of your NeXus</p>
            <CommonInput
              type="pinCode"
              label={<></>}
              placeholder="Pin Code"
              onChange={({ target }) => setPinCode(target.value)}
              onKeyDown={(e) => { if (e.key == 'Enter') register() }}
              style="!mt-0"
            />
            <Spacer y={1} />
            <Button
              className="w-full mt-4 mb-5 bg-primaryLight hover:bg-primaryLightHover transition duration-[0.25s] text-primaryLightContrast"
              onPress={() => register()}
            >
              Register
            </Button>
          </>
        )}

        {loading && (
          <>
            <Spacer y={1} />
            <div>
              <Spinner color="white" size="lg" />
            </div>
          </>
        )}
        <Spacer y={1} />
      </div>
    </CardLayout>
  );
}
