import { LayoutProps } from "@/components/layouts";
import CardLayout from "@/components/layouts/card";
import {
  Button,
  Link,
  Spacer,
} from "@nextui-org/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { AuthMFAEnrollResponse } from "@supabase/supabase-js";
import CopyButton from "@/components/copy_button";
import NextLink from "next/link";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import CommonInput from "@/components/CommonInput";
import Image from "next/image";

export default function EnrollMFA(props: LayoutProps) {
  const count = useRef(0);
  const supabase = useSupabaseClient();
  const [factorId, setFactorId] = useState("");
  const [totpSecret, setTotpSecret] = useState<AuthMFAEnrollResponse["data"]>();
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [viewTotp, setViewTotp] = useState(false);
  const [loading, setLoading] = useState(true);

  const onEnableClicked = () => {
    setError("");
    (async () => {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) {
        setError(challenge.error.message);
        throw challenge.error;
      }

      const challengeId = challenge.data.id;

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: verifyCode,
      });
      if (verify.error) {
        // TOTP could not be verified
        setError(verify.error.message);
        console.error(verify.error);
        return;
      } else {
        // TOTP verified
        router.push("/account");
      }
    })();
  };

  useEffect(() => {
    const getFactors = async () => {
      setLoading(true);

      // Check if user has already enrolled
      const auth = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (auth.error) {
        setLoading(false);
        setError(auth.error.message);
        throw auth.error;
      }

      if (auth.data.nextLevel === "aal2") {
        // User has already setup mfa
        router.push("/account");
        return;
      }

      const mfa = await supabase.auth.mfa.enroll({ factorType: "totp" });

      if (mfa.error) {
        console.error(mfa.error);
        setError("Enrolled factors exceed the allowed limit, Please deactivate an unverified factor to continue.");
        setLoading(false);
        return;
      }

      setFactorId(mfa.data.id);
      setTotpSecret(mfa.data);
      setLoading(false);
    };

    getFactors();

  }, [supabase]);

  return (
    <CardLayout {...props} titleSuffix="Enroll in MFA" hideNav>
      <div>
        <h3 className="text-textColor text-center pb-2.5 text-2xl font-semibold tracking-tighter leading-9">Enroll in MFA</h3>
      </div>
      <div className="text-textColor tracking-tighter">
        <p>
          Please scan the following QR code using your authenticator app. For
          more information, please refer to the{" "}
          <Link href="https://docs.aerl.cloud/cloud/help-and-support/multi-factor-authentication">
            documentation
          </Link>
          .
        </p>
      </div>
      <Image
        alt="TOTP QR code"
        width={192}
        height={192}
        src={totpSecret?.totp.qr_code ?? ""}
        className="!text-textColor mx-auto"
      />
      {viewTotp ? (
        <>
          <div className="text-center">
            <CopyButton text={totpSecret?.totp.secret ?? ""} />
          </div>
          <Spacer y={0.5} />
        </>
      ) : (
        <>
          <Button onPress={() => setViewTotp(true)} className="text-primary font-medium">
            Can&apos;t scan the code?
          </Button>
        </>
      )}

      {error && <p className="text-error tracking-tighter leading-7 mb-0.5">{error}</p>}

      <CommonInput
        type="text"
        label={<span className="text-textColor">Authenticator Code</span>}
        placeholder=" "
        onChange={({ target }) => setVerifyCode(target.value)}
      />

      <Spacer y={5} />

      <div className="grid grid-cols-2 gap-3">
        <NextLink href="/account" className="w-full">
          <Button className="bg-primaryLight hover:bg-primaryLightHover text-primaryLightContrast w-full font-medium">
            Cancel
          </Button>
        </NextLink>
        <Button onPress={onEnableClicked} className="bg-primary text-white font-medium">
          Enable
        </Button>
      </div>
    </CardLayout>
  );
}
