import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useState } from "react";

export default function ConfirmModel({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmButtonText,
}: {
  open?: boolean;
  onConfirm?: (e: any) => void;
  onCancel?: (e: any) => void;
  title?: string;
  description?: string | JSX.Element;
  confirmButtonText?: string;
}) {
  const [isOpen, setIsOpen] = useState(open ?? false);
  const [isLoading, setIsLoading] = useState(false);

  function cancel(e: any) {
    if (onCancel) {
      onCancel(e);
    }

    setIsOpen(false);
  }

  function confirm(e: any) {
    if (onConfirm) {
      setIsLoading(true);
      onConfirm(e);
      setIsLoading(false);
    }

    setIsOpen(false);
  }

  return (
    <Modal isOpen={isOpen} hideCloseButton aria-labelledby="modal-title" placement="center" className="bg-default max-w-[400px] m-0">
      <ModalContent>
        <ModalHeader className="pt-12">
          <h2 className="text-lg text-textColor text-center pt-[50px] pb-3 px-6 w-full" id="modal-title" >
            {title ? title : "Are you sure?"}
          </h2>
        </ModalHeader>
        <ModalBody className="py-3">
          <h2 className="text-primaryGray text-center  tracking-tighter leading-7">{description ? description : ""}</h2>
        </ModalBody>
        <ModalFooter className="pb-[50px] px-5 pt-3 flex justify-center gap-0">
          <Button onPress={cancel} className="bg-primaryLight text-primaryLightContrast font-medium px-5 gap-0 hover:bg-primaryLightHover m-1">Cancel</Button>
          <Button className="text-error bg-errorLight hover:bg-errorLightHover font-medium px-5 gap-0 m-1" disabled={isLoading} onPress={confirm}>
            {confirmButtonText ? confirmButtonText : "Submit"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
