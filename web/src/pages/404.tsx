import { Button } from "@nextui-org/react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Custom404() {
  const router = useRouter();

  const goBack = () => {
    router.back();
  };
  return (
    <div className="h-lvh flex justify-center">
      <h2 className="text-primaryLight/70 text-[170px] sm:text-[400px] self-center">
        404
      </h2>
      <div className="absolute top-[59%] sm:top-1/2 -translate-y-1/2 text-center">
        <h3 className="text-primaryLightContrast/90 text-2xl sm:text-5xl font-semibold">
          Page Not Found
        </h3>
        <p className="text-textColor text-xs sm:text-sm pt-2">
          Looks like an empty space.
        </p>
        <Button
          className="py-2 px-3 text-primaryLightContrast bg-primaryLight rounded-lg mt-8 hover:text-primaryLightContrast"
          onClick={goBack}
        >
          Go Back
        </Button>
      </div>
    </div>
  );
}
