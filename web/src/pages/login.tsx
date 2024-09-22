import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Card as CardLayout, LayoutProps } from "@/components/layouts";
import { Button, Spacer, Spinner } from "@nextui-org/react";
import Link from "next/link";
import { ArrowLeft, LogIn } from "react-feather";
import { Google, Microsoft } from "@/components/icons";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useSearchParams } from "next/navigation";
import CommonInput from "@/components/CommonInput";

export const getServerSideProps = async () => {
  return {
    props: {},
  };
};

function LoginForm(props: LayoutProps) {
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [activateText, setActivateText] = useState("");
  const [origin, setOrigin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostName = window.location.origin;
      setOrigin(hostName);
    }
    if (code) {
      setActivateText("Account activation was successful. You can now Login.");
      setTimeout(() => {
        setActivateText("");
      }, 3000);
    }
  }, []);

  async function signInWithEmail() {
    if (!email || !password) {
      setErrorText("Please fill in all the required fields.");
      return;
    }
    setLoading(true);

    const { error, data } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      if (error.message === "Email not confirmed") {
        setErrorText(
          "Looks like your account hasn't been activated yet. We've resent your confirmation email just in case you missed it."
        );
        await resendMail(email);
      } else {
        setErrorText(
          "That email or password don't seem to match our records. Please try again."
        );
      }
      setLoading(false);
    } else {
      if (!data.session.user?.user_metadata?.org)
        router.push("/organization/switch");
      if (redirect) {
        router.push(redirect ? (redirect as string) : "/");
      }
      else {
        const { error, data: user_orgs } = await supabase
          .from("org_member")
          .select("*")
          .eq("user_id", data.user.id)
          .eq("org_id", data.session.user?.user_metadata?.org?.id);
        if (!error) {
          if (!user_orgs.length) {
            await supabase.auth.updateUser({ data: { org: null } });
            await supabase.auth.refreshSession();
            router.push("/organization/switch");
          }
          else
            router.push(redirect ? (redirect as string) : "/");
        }
      }
    }
  }

  async function signInWithDemoAccount() {
    const { error } = await supabase.auth.signInWithPassword({
      email: "example@aerl.cloud",
      password: "example",
    });

    if (error) {
      setErrorText(error.message);
    } else {
      router.push("/?utm_campaign=demo");
    }
  }

  async function forgotPassword() {
    setErrorText("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://aerl.cloud/auth/change-password",
    });

    if (error) {
      setErrorText(
        "To reset your password, please ensure that an email has been entered above."
      );
      return;
    }

    router.push("/login?reset");
  }

  const resendMail = async (email: string) => {
    return await supabase.auth.resend({
      type: "signup",
      email: email,
    });
  };

  const showPasswordReset = router.query.reset == "";

  // Grid need to use

  return (
    <CardLayout {...props} titleSuffix="Log In" hideNav>
      <div>
        {!showPasswordReset ? (
          <>
            {origin === "https://aerl.cloud" ? (
              <>
                <div className="flex md:flex-row flex-col w-full md:gap-1 gap-3 px-1.5 md:ps-1.5 md:pe-0 pt-3">
                  <div className="w-full">
                    <Link
                      href={`/api/auth/google?redirectTo=${origin}/api/auth/callback`}
                      style={{
                        minWidth: "100%",
                        display: "flex",
                        width: "100%",
                      }}
                    >
                      <Button className="w-full bg-primaryLight hover:bg-primaryLightHover transititon duration-[0.25s]">
                        <Google />
                      </Button>
                    </Link>
                  </div>
                  <div className="w-full">
                    <Link
                      href={`/api/auth/azure?redirectTo=${origin}/api/auth/callback`}
                      style={{
                        minWidth: "100%",
                        display: "flex",
                        width: "100%",
                      }}
                    >
                      <Button className="w-full bg-primaryLight hover:bg-primaryLightHover transititon duration-[0.25s]">
                        <Microsoft />
                      </Button>
                    </Link>
                  </div>
                </div>
                <hr className="pb-[21.33px] mt-7 border-border" />
              </>
            ) : (
              <></>
            )}
            <CommonInput
              type="email"
              label={<span className="text-textColor">Email</span>}
              placeholder="your@email.com"
              onChange={({ target }) => setEmail(target.value)}
            />
            <Spacer y={5} />
            <CommonInput
              type="password"
              label={<span className="text-textColor">Password</span>}
              placeholder="••••••••"
              onChange={({ target }) => setPassword(target.value)}
              onKeyDown={(e) => {
                if (e.key == "Enter") signInWithEmail();
              }}
            />
            <div className="text-[red] text-base py-2 text-left">
              {errorText}
            </div>
            <div className="text-[green] text-base py-2 text-left">
              {activateText}
            </div>
            <div
              className="text-primary text-end leading-7 cursor-pointer tracking-tighter"
              onClick={forgotPassword}
            >
              Forgot your password?
            </div>
            <Button
              className="w-full my-[21.33px] bg-primaryLight hover:bg-primaryLightHover font-medium text-primaryLightContrast"
              isDisabled={loading}
              onClick={() => signInWithEmail()}
            >
              {!loading && <LogIn />}
              {!loading ? "Sign In" : <Spinner color="current" size="sm" />}
            </Button>
            <div className="text-end text-textColor font-normal leading-7 tracking-tighter">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-link">
                Sign Up
              </Link>
            </div>
            <hr className="mt-5 mb-8 border-border" />
            <Button
              className="w-full bg-primaryLight hover:bg-primaryLightHover font-medium text-primaryLightContrast"
              onClick={signInWithDemoAccount}
            >
              View Demo
            </Button>
          </>
        ) : (
          <>
            <div className="text-2xl text-textColor mb-2.5 font-semibold tracking-tighter">Check Your Email</div>
            <div className="text-base text-textColor tracking-tighter leading-7">
              We have sent you an email with instructions on how to reset your
              password.
            </div>
            <Spacer y={5} />
            <Link href="/login">
              <div className="flex items-center text-primaryLightContrast">
                <ArrowLeft />
                Back to Sign In
              </div>
            </Link>
          </>
        )}
      </div>
    </CardLayout >
  );
}

export default LoginForm;
