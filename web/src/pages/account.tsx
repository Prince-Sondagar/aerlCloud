import { MFASettings } from "@/components/settings/auth/mfa_settings";
import { useToast } from "@/hooks/toast";
import { UserMetadata } from "@/supabase/supabase";
import { Button, Card, CardBody, CardFooter, CardHeader, Spacer, Spinner } from "@nextui-org/react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { LayoutProps } from "framer-motion";
import { useEffect, useState } from "react";
import Layout from "@/components/layouts/main";
import CommonInput from "../components/CommonInput";


export default function Account(props: LayoutProps) {
  return (
    <>
      <Layout {...props}>
        <div className="xl:mx-[216px] px-6 mt-3 mb-10">
          <Spacer y={1} />
          <ContactDetails />
          <Spacer y={1} />
          <MFASettings />
        </div>
      </Layout>
    </>
  );
}

function ContactDetails() {
  const supabase = useSupabaseClient();
  const [userMeta, setUserMeta] = useState<UserMetadata>();
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const { add } = useToast();

  const save = async () => {
    setLoading(true);
    setErrorText("");

    // Get latest user data
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      setErrorText("Error setting user details");
      setLoading(false);
      console.error(error);
      return;
    }
    const metadata = data.user?.user_metadata as UserMetadata;

    // If metadata does not exist
    if (!metadata) {
      setErrorText("Error setting user details");
      console.error("Error retriveing metadata");
      setLoading(false);
      return;
    }
    const newMeta: UserMetadata = {
      ...metadata,
      full_name: name,
      phone: phone,
    };
    const updatedData = await supabase.auth.updateUser({ data: newMeta });
    // Handle errors
    if (updatedData.error) {
      setErrorText("Error setting user details");
      setLoading(false);
      return;
    }
    setUserMeta(updatedData?.data?.user?.user_metadata as UserMetadata);
    add({
      message: "Account Settings",
      description: "Account information updated successfully!",
      severity: "success",
    });
    setLoading(false);
  };

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) console.error(error);
      const metadata = data.user?.user_metadata as UserMetadata;
      if (metadata) setUserMeta(metadata);
      setName(metadata?.full_name ?? "");
      setEmail(data?.user?.email ?? "");
      setPhone(metadata?.phone ?? "");
    };

    load();
  }, [supabase]);

  return (
    <Card
      className="bg-backgroundContrast border border-border px-[0.5em] mt-6 "
    >
      <CardHeader>
        <h3 className="text-2xl text-textColor font-semibold tracking-tighter mb-3">Account Details</h3>
      </CardHeader>
      <CardBody className="py-5">
        {errorText && <h2 color="red">{errorText}</h2>}
        <CommonInput
          type="text"
          label={<span className="text-textColor">Full Name</span>}
          placeholder=" "
          value={name}
          onChange={({ target }) => setName(target.value)}
        />
        <Spacer y={5} />
        <CommonInput
          type="email"
          label={<span className="text-textColor">Email</span>}
          placeholder=" "
          value={email}
          onChange={({ target }) => setEmail(target.value)}
          disabled
        />
        <Spacer y={5} />
        <CommonInput
          type="tel"
          label={<span className="text-textColor">Phone</span>}
          placeholder=" "
          value={phone}
          onChange={({ target }) => setPhone(target.value)}
        />
      </CardBody>
      <CardFooter className="pb-[1.5em]">
        {/* @ts-ignore */}
        <Button
          className="bg-primaryLight text-primaryLightContrast px-5 disabled:bg-backgroundHover disabled:text-secondaryText"
          onPress={save}
          isDisabled={
            !(
              userMeta?.full_name !== name ||
              userMeta?.phone !== phone
            )
          }
        >
          {loading ? <Spinner /> : "Save"}
        </Button>
      </CardFooter>
    </Card>
  );
}
