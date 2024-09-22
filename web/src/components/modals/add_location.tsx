import { Button, Input, Modal, Spacer, Textarea, useInput, ModalHeader, ModalBody, ModalFooter, ModalContent, Spinner } from "@nextui-org/react";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { useEffect, useState } from "react";
import { Position } from "@/components/location_selector";
import LocationSelector from "@/components/location_selector";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import CommonInput from "../CommonInput";

export function AddLocationModal({ open, onClose }: {
  open?: boolean,
  onClose?: () => void,
}) {
  const supabase = useSupabaseClient()
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);

  const [hubId, setHubId] = useState("")
  const [pinCode, setPinCode] = useState("")
  const [name, setName] = useState("")
  const [notes, setNotes] = useState("")
  const [address, setAddress] = useState("") // The address search input

  const [position, setPosition] = useState<Position>({
    lat: -27.555721821100985,
    lng: 152.95150683134483,
  }); // The map position
  // The map's zoom level
  const [zoom, setZoom] = useState(5);

  const [markerVisible, setMarkerVisible] = useState(false); // Whether the marker is visible

  async function add() {
    // handle no serial number
    if (hubId == "") {
      setErrorText("You must enter a valid serial number.")
      return;
    }

    // handle serial not a number
    if (/^\d+$/.test(hubId) == false) {
      setErrorText("The serial number must only contain numbers.")
      return;
    }

    // get currently registered devices
    const { data: devices, error: select_error } = await supabase
      .from('device')
      .select()
      .eq(
        "hub_id", hubId,
      )

    if (select_error) {
      setErrorText(select_error.message)
      return;
    }

    // handle already registered
    if (devices.length > 0) {
      setErrorText("This device is already registered with your account.")
      return;
    }

    // handle no pin code
    if (pinCode == "") {
      setErrorText("You must enter a valid pin code.")
      return;
    }

    // handle pin code not a number
    if (/^\d+$/.test(hubId) == false) {
      setErrorText("The pin code must only contain numbers.")
      return;
    }

    // add a device request
    const { error: insert_error } = await supabase
      .from('device_registration_request') // TODO: This table no longer exists, migrate to new schema
      .insert({
        hub_id: hubId,
        pin_code: pinCode,
        org_id: 3, // todo: get this from user data state
        name: name,
        notes: notes,
        coordinate: `(${position.lat}, ${position.lng})`,
      })

    if (insert_error) {
      setErrorText(insert_error.message)
      return;
    }

    // subscribe for registration being added
    const { } = supabase
      .channel('any')
      .on('postgres_changes', {
        event: "INSERT",
        schema: "public",
        table: "device_registration"
      }, handleAdded).subscribe()

    setLoading(true)
  }

  async function handleAdded() {
    setLoading(false)

    if (onClose) {
      onClose();
    }
  }

  // Debounce address search and update map position
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  useEffect(() => {
    // Ignore empty queries
    if (address == "") {
      return;
    }

    if (timer !== null) {
      clearTimeout(timer);
    }

    const processQuery = () => {
      // Search for location using leaflet-geosearch
      const provider = new OpenStreetMapProvider();
      provider.search({ query: address })
        .then((results) => {
          if (results.length == 0) {
            setErrorText("No results found for that address.")
            setMarkerVisible(true);
            return;
          }

          setErrorText("");
          // Set the new position from the search
          setPosition({ lat: results[0].y, lng: results[0].x });

          // Zoom map into position
          setZoom(15);

          // Show the marker at the new position
          setMarkerVisible(true);
        })
        .catch((error: any) => {
          setErrorText(error.message);
        });
    }

    setTimer(setTimeout(() => {
      processQuery();
    }, 500));

    return () => {
      clearTimeout(timer as NodeJS.Timeout);
    }
  }, [address, timer]);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      closeButton
      aria-label="Add Location"
      size="full"
      className="bg-default m-0"
      placement="center"
    >
      <ModalContent>
        <ModalHeader>
          <h2 className="text-lg text-textColor text-center pt-8 pb-6 w-full" id="modal-title" >
            Add Location
          </h2>
        </ModalHeader>
        <ModalBody className="overflow-y-auto overflow-x-hidden px-0">
          <div className="container mx-auto px-4">
            {errorText && <><Spacer y={1} /><p color="error">Error: {errorText}</p></>}
            <div className="grid md:grid-cols-2 grid-cols-1 md:gap-6">
              <div>
                <CommonInput
                  type="text"
                  label={<span className="text-textColor">Serial Number</span>}
                  placeholder="000000"
                />
                <p className="text-textColor text-[10px] ml-2.5 mt-0.5 mb-2 tracking-tighter">Required</p>
              </div>
              <div>
                <CommonInput
                  type="text"
                  label={<span className="text-textColor">Pin Code</span>}
                  placeholder="000000"
                />
                <p className="text-textColor text-[10px] ml-2.5 mt-0.5 mb-2 tracking-tighter">Required</p>
              </div>
            </div>
            <CommonInput
              type="text"
              label={<span className="text-textColor">Location Name</span>}
              placeholder=" "
            />
            <p className="text-textColor text-[10px] ml-2.5 mt-0.5 mb-2 tracking-tighter">Required</p>
            <div className="pb-2">
              <p className="text-sm leading-[21px] pb-1.5 pl-1 text-primarySolidContrast text-left">
                Notes
              </p>
              <textarea
                className="w-full rounded-xl py-2 px-4 bg-transparent placeholder:text-textColor/40 text-textColor text-sm border border-border hover:border-primarySolidContrast transititon duration-[0.25s] input-box"
                rows={3}
                onChange={(e) => setNotes(e.target.value)}
                value={notes}
              />
              <p className="text-textColor text-[10px] -mt-0.5 ml-2.5 tracking-tighter">{`${notes.length}/1000`}</p>
            </div>
            {loading && <p className="text-textColor text-sm pb-2">Now press the user button on your Hub.</p>}
            <CommonInput
              type="text"
              label={<span className="text-textColor text-sm">Address or Coordinates</span>}
              placeholder=" "
            />
            <p className="text-textColor text-[10px] ml-2.5 mt-0.5 mb-2 tracking-tighter">Required</p>
            {markerVisible && <p className="text-textColor text-sm pb-1">Drag the marker for fine-grain selection.</p>}
            <div className="pt-2">
              <LocationSelector css={{ height: "40vh" }} position={position} setPosition={setPosition} markerVisible={markerVisible} />
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="pt-3 px-5 pb-[18px]">
          <Button onPress={add} className="bg-primaryLight text-primaryLightContrast font-medium px-5 gap-0 hover:bg-primaryLightHover m-1">
            {loading ? <Spinner color="current" size="sm" /> : "Add"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AddLocationModal;
