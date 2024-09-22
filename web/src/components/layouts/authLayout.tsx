import Layout, { LayoutProps } from "@/components/layouts/main";
import Links from "./links";
import { Card, CardBody, CardFooter, Image, Spacer } from "@nextui-org/react";
import { useContext } from "react";
import { InstanceContext } from "../themes";
import { useRouter } from "next/router";

interface CardProps extends LayoutProps {}

export default function AuthLayout(props: CardProps) {
  const instance = useContext(InstanceContext);
  const router = useRouter();

  return (
    <Layout {...(props as LayoutProps)} hideNav>
      <div className="flex justify-center items-center min-h-[90vh]">
        <Card>
          <CardBody>
            <Image alt="Company logo" src={instance.logo} height="3em" disableSkeleton={true}/>
            <Spacer y={2} />
            {props.children}
          </CardBody>
          <CardFooter>
            <div>
              <Links />
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
