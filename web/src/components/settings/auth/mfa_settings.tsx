import {
  Button,
  Card,
  CardHeader,
  Spinner,
  CardBody,
  CardFooter,
  Chip,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { AlertCircle } from "react-feather";
import NextLink from "next/link";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Factor } from "@supabase/supabase-js";
import { ConfirmButton } from "@/components/confirm_button";

export function MFASettings() {
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [error, setError] = useState<String>(""); // holds an error message

  const populate = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.mfa.listFactors();
    setLoading(false);
    if (error) {
      setError("Error retrieving MFA information.");
      throw error;
    }

    setFactors(data?.all);
  };

  useEffect(() => {
    populate();
  }, []);

  return (
    <>
      {error && <h2 color="error">Error: {error}</h2>}
      {/*Loading skeleton*/}
      {loading && (
        <>
          <Card
            className="bg-backgroundContrast border-border px-[0.5em] min-h-60">
            <CardHeader className="block pb-0">
              <div className="flex items-center mb-[19px] gap-4">
                <h3 className="mb-0 text-textColor text-2xl font-semibold tracking-tighter">Multi-Factor Authentication</h3>{" "}
                <Spinner size="sm" color="secondary" />
              </div>
            </CardHeader>
          </Card>
        </>
      )}

      {/*Loaded content*/}
      {!loading && (
        <>
          {factors.filter((factor) => factor.status === 'verified').length === 0 ? (
            <>
              <UnenrolledMFACard />
            </>
          ) : (
            <></>
          )}
          {factors.length ? <EnrolledMFACard factors={factors} refresh={populate} /> : <></>}
        </>
      )}
    </>
  );
}

function UnenrolledMFACard() {
  return (
    <Card className="bg-backgroundContrast border border-border px-[0.5em] mt-4">
      <CardHeader className="block pb-0">
        <h3 className="mb-0 text-textColor text-2xl font-semibold tracking-tighter mb-[19px]">Multi-Factor Authentication</h3>
        <div className="items-center flex">
          <AlertCircle color="red" size={22} />
          <p className="text-base text-textColor tracking-tighter ps-0.5 leading-7">Your account does not have multi-factor authentication enabled.</p>
        </div>
      </CardHeader>
      <CardBody>
        <p className="text-base text-textColor tracking-tighter py-2.5 leading-7">
          Multi-factor authentication (MFA) provides an additional layer of
          security for your account. Once enabled, you will be prompted to enter
          a unique verification code either generated by your authenticator app
          or sent to your phone number when you sign in.
        </p>
      </CardBody>
      <CardFooter className="pb-[1.5em]">
        <NextLink href="/auth/mfa/enroll">
          <Button className="text-primary px-14 bg-primaryLight hover:bg-primaryLightHover text-primaryLightContrast font-medium">Enable MFA</Button>
        </NextLink>
      </CardFooter>
    </Card>
  );
}

function EnrolledMFACard({
  factors,
  refresh,
}: {
  factors: Factor[];
  refresh: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [loadingButtonIndex, setLoadingButtonIndex] = useState<number | null>(null);

  const supabase = useSupabaseClient();

  const removeMFA = async (factor: Factor, index: number) => {

    // setLoadingButtonIndex(index);
    setLoading(true);
    await supabase.auth.mfa.unenroll({ factorId: factor.id });

    // Refresh token such the MFA state is unenrolled.
    await supabase.auth.refreshSession();

    setLoading(false);
    setLoadingButtonIndex(null);

    // Refresh MFA settings
    refresh();
  };

  return (
    <Card className="bg-backgroundContrast border border-border px-[0.5em] mt-4">
      <CardHeader className="block pb-0">
        <h3 className="text-textColor text-2xl font-semibold tracking-tighter mb-2">Multi-Factor Authentication</h3>
      </CardHeader>
      <CardBody className="py-5">
        {factors.map((factor, index) => {
          return (
            <div
              key={index}
              className="flex items-center justify-between mt-[0.5rem]"
            >
              <p className="text-textColor">Authenticator App</p>
              <p className="text-textColor w-34">
                <Chip color={factor.status == "verified" ? "success" : "danger"} variant="flat">{factor.status == "verified" ? "Active" : factor.status}</Chip>
              </p>
              <p className="text-textColor w-50">
                <span className="text-textColor">{new Date(factor?.created_at).toLocaleString()}</span>
              </p>
              <div>
                <ConfirmButton
                  className="text-error border border-solid border-error px-5"
                  spinner={<Spinner size="sm" color="danger" />}
                  confirmationmessage={
                    loadingButtonIndex === index ? (
                      <Spinner size="sm" color="danger" />
                    ) : "Confirm"}
                  onPress={() => {
                    removeMFA(factor, index);
                    setLoadingButtonIndex(index);
                  }}
                  disabled={loadingButtonIndex === index}
                >
                  Deactivate
                </ConfirmButton>
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
