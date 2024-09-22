import CommonInput from "@/components/CommonInput";
import { Card as CardLayout, LayoutProps } from "@/components/layouts";
import {
  Spacer,
  Input,
  Button,
  useInput,
  Spinner,
} from "@nextui-org/react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Phone, AtSign, Briefcase } from "react-feather";

export default function LoginForm(props: LayoutProps) {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [abn, setAbn] = useState("");

  const createOrg = async () => {
    const user_id = (await supabase.auth.getUser()).data?.user?.id;

    if (!user_id) {
      console.error("Error getting user id");
      return;
    }

    if (!name) {
      setErrorText("A business name must be entered.");
      return;
    }

    if (!phone) {
      setErrorText("A phone number must be entered.");
      return;
    }

    if (!email) {
      setErrorText("A billing email must be entered.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("org").insert({
      owner_id: user_id,
      instance_id: 1,
      name: name,
      billing_email: email,
      phone: phone,
      abn: abn != "" ? abn : null,
    });

    if (error) {
      if (error.code == "23514" && error.message.includes("org_abn_check")) {
        setErrorText(
          "ABN provided was not valid. Please correct this and try again.",
        );
      }

      console.error("Failed to create org", error);
    } else {
      router.push("/organization/switch");
    }

    setLoading(false);
  };

  return (
    <CardLayout {...props} titleSuffix="Organization Setup">
      <div>
        <p id="modal-title" className="text-textColor text-center text-lg	font-semibold">
          Create an Organization
        </p>
      </div>
      <Spacer y={5} />
      <CommonInput
        type="text"
        required
        label={<span className="text-textColor">Business Name *</span>}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder=" "
      />
      <Spacer y={5} />
      <CommonInput
        type="tel"
        required
        label={<span className="text-textColor">Billing Phone *</span>}
        startContent={<Phone size={20} className="text-2xl text-iconColor pointer-events-none flex-shrink-0 mr-2" />}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder=" "
      />
      <Spacer y={5} />
      <CommonInput
        type="email"
        required
        label={<span className="text-textColor">Billing Email *</span>}
        startContent={<AtSign className="text-2xl text-iconColor pointer-events-none flex-shrink-0 mr-2" />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder=" "
      />
      <Spacer y={5} />
      <CommonInput
        type="text"
        label={<span className="text-textColor">ABN</span>}
        placeholder=" "
        value={abn}
        onChange={(e) => setAbn(e.target.value)}
        startContent={<Briefcase className="text-2xl text-iconColor pointer-events-none flex-shrink-0 mr-2" />}
      />
      <p className="pl-2.5 text-[10px] text-textColor mt-0.5">Optional</p>
      <Spacer y={5} />
      <p className="text-error">{errorText}</p>
      <Spacer y={5} />
      <Button onPress={createOrg} className="bg-primaryLight text-primaryLightContrast font-medium">
        {!loading ? "Create" : <Spinner color="current" size="sm" />}
      </Button>
      <Spacer y={5} />
      <Link href="/organization/switch">
        <div className="flex items-center text-primaryLightContrast">
          <ArrowLeft />
          Back to Organizations
        </div>
      </Link>
    </CardLayout>
  );
}
