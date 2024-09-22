import { LayoutProps } from "@/components/layouts";
import CardLayout from "@/components/layouts/card";
import { Button, Spacer } from '@nextui-org/react'
import { useRouter } from "next/router";

export default function Verify(props: LayoutProps) {

  const router = useRouter()
  return (
    <CardLayout {...props} titleSuffix="Sucessful registration" hideNav>
      <div>
        <div>
          <div>
            <div className="text-textColor text-2xl font-semibold text-center mb-3.5 tracking-tighter">
              Successful registration
            </div>
          </div>
        </div>
        <Spacer y={1} />
        <div>
          <div>
            <p className="text-base tracking-tighter text-center leading-[21px] pb-1.5 pl-1 mt-[21.333px] text-primarySolidContrast text-left mt-4">Would you like to add your new NeXus to a location?</p>
          </div>
        </div>
        <Spacer y={1} />
        <div className="flex justify-center items-baseline gap-5">
          <Button
            className="w-full mt-4 mb-2 bg-primaryLight hover:bg-primaryLightHover transition duration-[0.25s] text-primaryLightContrast"
            onPress={() => { router.push('/locations') }}
          >
            Add a location
          </Button>
          <Button
            className="w-full mt-2 mb-5 bg-primaryLight hover:bg-primaryLightHover transition duration-[0.25s] text-primaryLightContrast"
            onPress={() => { router.push('/') }}
          >
            Home
          </Button>
        </div>
      </div>
    </CardLayout >
  )
}
