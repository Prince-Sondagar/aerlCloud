import App, { AppProps, AppInitialProps, AppContext } from "next/app";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { NextUIProvider } from "@nextui-org/react";
import { ToastContextProvider } from "@/hooks/toast";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { Database } from "@/supabase/types";
import Script from "next/script";
import Head from "next/head";
import '../components/global.css'
import {
  InstanceContext,
  getInstanceFromDomain,
  Instance,
} from "@/components/themes";
import { FullScreenProvider } from "../components/vis/fullscreen";

MyApp.getInitialProps = async (
  context: AppContext
): Promise<{ instance: Instance } & AppInitialProps> => {
  const ctx = await App.getInitialProps(context);

  const domain = context.ctx.req?.headers?.host;

  return { ...ctx, instance: getInstanceFromDomain(domain) };
};

export default function MyApp({ Component, pageProps, instance }: AppProps & { instance: Instance }) {
  const router = useRouter();
  const [instanceValue] = useState(instance);
  const [supabase] = useState(() =>
    createPagesBrowserClient<Database>({
      cookieOptions: {
        sameSite: "strict",
      },
    })
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      switch (event) {
        case "SIGNED_OUT":
          router.push("/login");
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <NextUIProvider>
      <SessionContextProvider
        supabaseClient={supabase}
        initialSession={pageProps.initialSession}
      >
        <NextThemesProvider attribute="class" defaultTheme={instanceValue?.themeName}>
          <InstanceContext.Provider value={instanceValue}>
            <ToastContextProvider>
              <FullScreenProvider>
                <Head>
                  <title>{instance.company} Cloud</title>
                </Head>
                <Component {...pageProps} />
                <Script
                  defer
                  data-domain="aerl.cloud"
                  src="https://plausible.io/js/script.js"
                />
              </FullScreenProvider>
            </ToastContextProvider>
          </InstanceContext.Provider>
        </NextThemesProvider>
      </SessionContextProvider>
    </NextUIProvider>
  );
}
