import {
  Button,
  Input,
  Spacer,
  Spinner,
} from "@nextui-org/react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext, useState } from "react";
import { Edit, Eye, EyeOff } from "react-feather";
import { Card as CardLayout } from "@/components/layouts";
import NextLink from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import { InstanceContext } from "../components/themes";
import CommonInput from "@/components/CommonInput";

export default function SignUpForm() {
  const instance = useContext(InstanceContext);
  const supabase = useSupabaseClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [recaptchaStatus, setRecaptchaStatus] = useState<string | null>("");
  const [errorText, setErrorText] = useState("");
  const router = useRouter();

  async function signUpWithEmail() {
    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      setErrorText("Please fill in all the required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorText("Hmm, your passwords don't seem to match.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      phone: phone,
      email: email,
      password: password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (error) {
      setErrorText(error.message);
      setLoading(false);
    } else {
      if (
        data?.user &&
        Array.isArray(data.user.identities) &&
        !(data.user.identities.length > 0)
      ) {
        setErrorText(
          "Oops! It looks like a user with that email address already exists."
        );
        setLoading(false);
      } else {
        router.push("/signup?complete");
      }
    }
  }

  return (
    <CardLayout titleSuffix="Sign Up" hideNav>
      <div>
        {router.query.complete === "" ? (
          <>
            <div className="text-textColor text-2xl font-semibold text-center mb-3.5 tracking-tighter">
              Thanks for signing up!
            </div>
            <div className="text-textColor text-base text-center tracking-tighter">
              Check your inbox for a confirmation email.
            </div>
            <Spacer y={2} />
            <div className="flex justify-center w-full">
              <NextLink href="/login">
                <Button className="bg-primaryLight hover:bg-primaryLightHover transition duration-[0.25s] text-primaryLightContrast px-12 mt-9">
                  Return to Login
                </Button>
              </NextLink>
            </div>
          </>
        ) : (
          <>
            <CommonInput
              type="name"
              label={<span className="text-textColor">Full Name</span>}
              placeholder=" "
              onChange={({ target }) => setName(target.value)}
            />
            <Spacer y={5} />
            <CommonInput
              type="email"
              label={<span className="text-textColor">Email</span>}
              placeholder=" "
              onChange={({ target }) => setEmail(target.value)}
            />
            <Spacer y={5} />
            <CommonInput
              type="tel"
              label={<span className="text-textColor">Phone</span>}
              placeholder=" "
              onChange={({ target }) => setPhone(target.value)}
            />
            <Spacer y={5} />
            <CommonInput
              type="password"
              label={<span className="text-textColor">Password</span>}
              placeholder=" "
              onChange={({ target }) => setPassword(target.value)}
            />
            <Spacer y={5} />
            <CommonInput
              type="password"
              label={<span className="text-textColor">Confirm Password</span>}
              placeholder=" "
              onChange={({ target }) => setConfirmPassword(target.value)}
            />
            <div className="text-[red] text-base py-2 text-left">
              {errorText}
            </div>
            <Spacer y={5} />
            <ReCAPTCHA
              theme={instance?.theme?.type as "dark" | "light"}
              className="recaptcha"
              sitekey={`6LeyLiApAAAAAPrUAXjoSgSyJ14HGJ3CnmkSpIPW`}
              onChange={(value: string | null) => setRecaptchaStatus(value)}
            />
            <Button
              className="signup-btn w-full mt-8 mb-5 bg-primaryLight hover:bg-primaryLightHover font-medium text-primaryLightContrast"
              onClick={() => signUpWithEmail()}
              isDisabled={!recaptchaStatus}
            >
              {!loading && <Edit />}
              {!loading ? "Sign Up" : <Spinner color="current" size="sm" />}
            </Button>
            <div className="text-end text-textColor font-normal leading-7">
              Already have an account? <Link href="/login" className="text-link">Sign In</Link>
            </div>
          </>
        )}
      </div>
    </CardLayout >
  )
}
