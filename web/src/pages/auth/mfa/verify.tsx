import { LayoutProps } from "@/components/layouts";
import CardLayout from "@/components/layouts/card";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Spacer,
  Spinner,
} from "@nextui-org/react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import CommonInput from "@/components/CommonInput";

type AuthMethod = { id: string; status: string };
export default function Verify(props: LayoutProps) {
  const supabase = useSupabaseClient();
  const [error, setError] = useState("");
  const router = useRouter();
  const [totpCode, setTotpCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.mfa.getAuthenticatorAssuranceLevel().then((response) => {
      if (response.data?.currentLevel == "aal2") {
        router.push("/");
        return;
      }

      if (response.data?.nextLevel == "aal1") {
        router.push("/");
        return;
      }
    });

    supabase.auth.mfa.listFactors().then((response) => {
      if (!response.data?.totp[0]) router.push("/auth/mfa/enroll");
    });

    setLoading(false);
  }, []);

  const verifyOTP = async () => {
    const submitOTP = async () => {
      const factors = await supabase.auth.mfa.listFactors();
      if (factors.error) {
        throw factors.error;
      }

      const totpFactor = factors.data.totp[0];

      if (!totpFactor) {
        console.error("No TOTP factors found! Redirecting to enroll.");
        router.push("/auth/mfa/enroll");
      }

      const factorId = totpFactor.id;

      const challenge = await supabase.auth.mfa.challenge({ factorId });

      if (challenge.error) {
        throw challenge.error;
      }

      const challengeId = challenge.data.id;

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: totpCode,
      });

      if (verify.error) {
        throw verify.error;
      } else {
        router.push("/");
      }
    };

    setLoading(true);
    setError("");
    await submitOTP().catch((error) => {
      setError(error.message);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (totpCode.length == 6) verifyOTP();
  }, [totpCode]);

  return (
    <CardLayout {...props} titleSuffix="Sign Up" hideNav>
      <div>
        <div>
          <div>
            <h3 className="text-2xl text-textColor text-center mb-2.5 font-semibold">Welcome Back</h3>
          </div>
        </div>

        {loading && (
          <>
            <Spacer y={1} />
            <div>
              <Spinner color="white" size="sm" />
            </div>
          </>
        )}

        {!loading && (
          <>
            <div>
              <div>
                <p className="text-center text-textColor tracking-tighter	">Please enter the code from your authenticator app.</p>
              </div>
            </div>
            <Spacer y={5} />

            <div>
              {error && (
                <p className="text-error font-semibold">
                  {error}
                </p>
              )}
            </div>
            {error && <Spacer y={5} />}

            <div>
              <CommonInput
                type=""
                label={<></>}
                placeholder=""
                onChange={({ target }) => setTotpCode(target.value)}
                style="!border-2 !rounded-2xl !mt-0 py-1"
              />
            </div>
            <Spacer y={5} />

            <div>
              <Button onPress={verifyOTP} className="w-full bg-primaryLight text-primaryLightContrast font-medium px-5 gap-0 hover:bg-primaryLightHover">
                Submit
              </Button>
            </div>
          </>
        )}
      </div>
    </CardLayout>
  );
}
