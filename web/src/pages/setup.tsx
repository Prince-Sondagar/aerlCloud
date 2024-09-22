import CommonInput from "@/components/CommonInput";
import { LayoutProps } from "@/components/layouts";
import CardLayout from "@/components/layouts/card";
import {
    Input,
    Spacer,
    Button,
    Image,
    Spinner,
} from "@nextui-org/react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import NextLink from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useState, useCallback } from "react";
import { Eye, EyeOff } from "react-feather";

// Example url: localhost:3000/setup?serial=23230004&password=alchemy21toad99

export default function Setup(props: LayoutProps) {
    const [loading, setLoading] = useState(false);
    const [errorText, setErrorText] = useState<string | null>();
    const supabase = useSupabaseClient();
    const searchParams = useSearchParams();
    const [serial, setSerial] = useState(searchParams.get("serial") ?? "");
    const [password, setPassword] = useState(searchParams.get("password") ?? "");
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
    const router = useRouter();

    const register = useCallback(async () => {
        setLoading(true);

        const auth = await supabase.auth.getSession();
        if (auth.error) {
            console.error(auth.error);
            setErrorText(auth.error.message);
            return;
        }

        // trim any whitespace
        let serial_value = serial.replaceAll(" ", "");

        const { error, data } = await supabase.rpc("add_device", {
            serial: serial_value,
            password: password,
            org_id: auth.data.session?.user.user_metadata.org.id,
        });

        if (error) {
            console.error(error);
            if (
                error.message ==
                'duplicate key value violates unique constraint "device_hub_id_key"'
            ) {
                setErrorText(
                    "The hub with this serial number is already registered. Please contact support if think this is a mistake."
                );
            } else {
                setErrorText("An error occurred. Please try again.");
            }
            setLoading(false);
            return;
        }
        if (data == true) {
            router.push("/locations");
        } else {
            setErrorText("Failed to add device. Please try again.");
            setLoading(false);
            return;
        }
    }, [serial, password, supabase, router]);

    return (
        <CardLayout {...props} hideNav>
            <h3 className="text-textColor text-center pt-1 font-semibold tracking-tighter text-2xl mb-2.5">Register your Gateway</h3>
            <p className="text-textColor leading-7 tracking-tighter">
                You can find the serial number and password on the back of your device.
            </p>
            <Spacer y={5} />
            <Image
                alt="Nexus information label"
                src="/images/nexus-label.png"
                style={{ borderRadius: "0.5em" }}
            />
            <Spacer y={10} />

            <CommonInput
                type=" "
                label={<></>}
                placeholder=" "
                onChange={(e) => setSerial(e.target.value)}
                startContent={<p className="text-iconColor pointer-events-none flex-shrink-0 mr-2.5 text-sm">Serial</p>}
                style="!mt-0"
            />
            <Spacer y={5} />

            <CommonInput
                type="password"
                label={<></>}
                placeholder=" "
                onChange={(e) => setPassword(e.target.value)}
                startContent={<p className="text-iconColor pointer-events-none flex-shrink-0 mr-2.5 text-sm">Password</p>}
                style="!mt-0"
            />
            <Spacer y={5} />
            <p className="text-error">{errorText}</p>
            <Spacer y={5} />
            <div className="grid grid-cols-2 gap-2">
                <NextLink href={"/gateways"}>
                    <Button className="w-full bg-primaryLight hover:bg-primaryLightHover text-primaryLightContrast">Back</Button>
                </NextLink>
                <Button onPress={register} className="bg-primaryLight hover:bg-primaryLightHover text-primaryLightContrast">
                    {loading ? <Spinner size="sm" /> : "Register"}
                </Button>
            </div>
        </CardLayout>
    );
}
