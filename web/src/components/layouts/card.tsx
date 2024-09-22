import Layout, { LayoutProps } from "@/components/layouts/main";
import Links from "./links";
import { Card, Image, Spacer, CardBody, CardFooter } from "@nextui-org/react";
import { InstanceContext } from "../themes";
import { useContext } from "react";
import { useRouter } from "next/router";

interface CardProps extends LayoutProps { }

export default function CardLayout(props: CardProps) {
  const instance = useContext(InstanceContext);
  return (
    <Layout {...(props as LayoutProps)} hideNav>
      <div
        className="mt-[33.66px] bg-background flex justify-center items-center min-h-[90vh]"
      >
        <Card className="max-w-[450px] max-[458px]:w-[450px] w-full bg-backgroundContrast border border-border ">
          <CardBody className="px-7 pt-9 pb-5">
            <div className="flex justify-center mb-9 h-[3em] w-auto">
              <Image
                alt="Company logo"
                src={instance.logo}
                className="h-full rounded-none mx-auto"
                disableSkeleton={true}
              />
            </div>
            {props.children}
          </CardBody>
          <CardFooter>
            <div className="flex-end w-full me-4">
              <Links />
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
