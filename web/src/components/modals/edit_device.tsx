import { Tables } from "@/supabase/types";
import {
  Button,
  Dropdown,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  DropdownSection,
  DropdownItem,
  DropdownMenu,
  ModalContent,
  DropdownTrigger,
  Spinner,
  Input,
} from "@nextui-org/react";
import { MouseEvent, useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { DownArrow } from "../icons";
import CommonInput from "../CommonInput";

type Location = Tables<"location">;
type Gateways = Tables<"gateways">;

type GatewaysType = Gateways & {
  location?: Location;
};

export default function EditDeviceModal({ gateways, open, onSave, onCancel, confirmButtonText }: {
  gateways: GatewaysType,
  open?: boolean,
  onSave?: (e: MouseEvent) => void,
  onCancel?: () => void,
  confirmButtonText: string
}) {

  const supabase = useSupabaseClient();

  const [notes, setNotes] = useState(gateways.notes ?? "");
  const [tag, setTag] = useState(gateways.tag ?? "")
  const [selectedLocation, setSelectedLocation] = useState<number>();
  const [locationList, setLocationList] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(false)


  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('location').select('*');
      setSelectedLocation(gateways?.location?.id)
      setLocationList(data as Location[])
    }

    load()
  }, [supabase])

  const update = async () => {
    const { error } = await supabase
      .from('gateways')
      .update({ tag: tag, notes: notes, location_id: selectedLocation })
      .eq('id', gateways.id);

    if (error) {
      setLoading(false)
      console.error(error)
    }
  }

  const save = async (e: any) => {
    setLoading(true)
    await update()
    if (onSave) onSave(e)
    setLoading(false)
  }

  return (
    <Modal
      isOpen={open ?? true}
      closeButton
      onClose={() => {
        onCancel && onCancel();
      }}
      aria-labelledby="modal-title"
      className="bg-default max-w-[400px] m-0"
      placement="center"
    >
      <ModalContent className="pt-5">
        <ModalHeader className="">
          <h2 className="text-lg text-textColor py-3 px-6 text-center w-full" id="modal-title">
            Edit Gateway
          </h2>
        </ModalHeader>
        <ModalBody className="py-3 gap-4">
          <CommonInput
            type="text"
            label={<span className="text-textColor">Tag</span>}
            placeholder=" "
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          />
          <div className="mb-2">
            <p className="text-sm leading-[21px] pb-1.5 pl-1 text-primarySolidContrast text-left">
              Notes
            </p>
            <textarea
              className="w-full rounded-xl py-2 px-4 bg-transparent placeholder:text-textColor/40 text-textColor text-sm border border-border hover:border-primarySolidContrast transititon duration-[0.25s] input-box"
              rows={3}
              onChange={(e) => setNotes(e.target.value)}
              value={notes}
            />
            <p className="text-textColor text-[10px] -mt-0.5 ml-2.5">{`${notes.length}/1000`}</p>
          </div>
          <Dropdown className="bg-default border border-border p-2 w-[252px]">
            <DropdownTrigger>
              <Button variant="light" className="capitalize border border-solid border-[#212121] w-full text-sm  text-textColor" >
                {selectedLocation ? locationList?.find((l: Location) => l?.id == selectedLocation)?.name : "Assign to Location"}
                <DownArrow />
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              className="p-0 w-full h-auto rounded-[9px]"
              aria-label="Single selection actions"
              disallowEmptySelection
              selectionMode="single"
              selectedKeys={selectedLocation ? new Set([selectedLocation]) : undefined}
              onAction={(location) => {
                setSelectedLocation(location as number)
              }}
            >
              <DropdownSection items={locationList} className="mb-0">
                {locationList?.map((location) => (
                  <DropdownItem key={location?.id} className="dropdown hover:!bg-backgroundHover focus:!bg-backgroundHover hover:!text-blackHover text-textColor focus:!text-blackHover py-2 px-3 w-full duration-500 edit-dropdown">
                    {location?.name}
                  </DropdownItem>
                ))}
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </ModalBody>
        <ModalFooter className="px-5 pb-[18px] pt-3">
          <Button onPress={save} className="bg-primaryLight text-primaryLightContrast font-medium px-5 gap-0 hover:bg-primaryLightHover m-1">
            {loading ? <Spinner color="primary" size="sm" /> : confirmButtonText ? confirmButtonText : "Save changes"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal >
  );
}
