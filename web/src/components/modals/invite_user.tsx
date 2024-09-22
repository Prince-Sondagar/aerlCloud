import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "@nextui-org/react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { Mail } from "react-feather";
import { useToast } from "../../hooks/toast";
import { invitationRoles } from "../../util";
import { DownArrow } from "../icons";
import CommonInput from "../CommonInput";

export function InviteUserModal({
  list,
  onClose,
  disabledRoles,
}: {
  list: any;
  onClose?: (isReload: boolean) => void;
  disabledRoles: Array<string>;
}) {
  const supabase = useSupabaseClient();
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const toast = useToast();

  async function add() {
    // Old invitation code:
    // This code has an issue where it doesn't work if the user doesn't already
    // have an account.
    // Peter wants this disabled temporarily and replaced with a system where
    // you can only invite people who have accounts as a hotfix.
    /*
    // subscribe for registration being added
    supabase
      .channel("any")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "org_invite",
        },
        close,
      )
      .subscribe();

    const auth = await supabase.auth.getSession();
    if (auth.error) {
      console.error(auth.error);
      setErrorText(auth.error.message);
      return;
    }

    // add a device request
    const { error } = await supabase.from("org_invite").insert({
      org_id: auth.data.session?.user.user_metadata.org.id,
      email: email.value,
    });

    if (error) {
      console.error(error);
      switch (error.code) {
        case "23505":
          setErrorText(
            `The email "${email.value}" has already been invited to this organization.`,
          );
          break;
        case "23514":
          setErrorText(`The email "${email.value}" is not valid.`);
          break;
        default:
          setErrorText(error.message);
      }
      return;
    }

    setLoading(true);
    */

    // New code
    setLoading(true);
    setErrorText("");

    const auth = await supabase.auth.getSession();

    try {
      if (auth.error) {
        throw Error(auth.error.message);
      }

      const isEmailAvailable = list.find((user: { email: string }) => user.email == email);

      if (!email || !selectedRole) {
        throw Error("Please fill in all the required fields.");
      } else if (isEmailAvailable) {
        throw Error("This user is already a member of this organization");
      } else {
        const { data, error } = await supabase.functions.invoke("temp-invite", {
          body: {
            organisationId: auth.data.session?.user.user_metadata.org.id,
            email: email,
            role: selectedRole,
          },
        });

        if (error) {
          throw Error("Error Contacting Server");
        }

        if (!data?.success) {
          throw Error(data?.error);
        } else {
          if (onClose) {
            onClose(true);
          }
          toast.add({
            message: "Invited Member",
            description: "Invitation request successfully sent!",
            severity: "success",
          });
        }
      }
    } catch (error: any) {
      setErrorText(error?.message);
      setLoading(false);
      return;
    }
    setLoading(false);
  }

  async function close() {
    setLoading(false);
    if (onClose) {
      onClose(false);
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={close}
      closeButton
      aria-labelledby="modal-title"
      className="bg-default max-w-[400px] m-0"
      placement="center"
    >
      <ModalContent className="pt-5">
        <ModalHeader>
          <p id="modal-title" className="text-lg text-textColor py-3 px-6 text-center w-full">
            Invite a Member
          </p>
        </ModalHeader>
        <ModalBody className="py-3">
          <CommonInput
            type="email"
            label={<></>}
            placeholder="person@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            startContent={<Mail size={24} className="text-2xl text-iconColor pointer-events-none flex-shrink-0 mr-2" />}
            style="!mt-0"
          />
          <div className="invite-dropdown">
            <Dropdown className="bg-default border border-border p-2 w-[252px]">
              <DropdownTrigger>
                <Button
                  variant="light"
                  className="capitalize border border-solid border-[#212121] w-full text-sm  text-textColor"
                >
                  {selectedRole ? selectedRole : "Select User Role"}
                  <DownArrow />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Single selection actions"
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={selectedRole ? new Set([selectedRole]) : undefined}
                onAction={(role) => setSelectedRole(role as string)}
                className="p-0 w-full h-auto rounded-[9px]"
                disabledKeys={disabledRoles}
              >
                <DropdownSection title="Organization Roles" className="mb-0 user-dropdown-sec-title">
                  {invitationRoles.map((r) => (
                    <DropdownItem key={r} className="dropdown hover:!bg-backgroundHover focus:!bg-backgroundHover hover:!text-blackHover text-textColor focus:!text-blackHover py-2 px-3 w-full duration-500 edit-dropdown">
                      <p >{r}</p>
                    </DropdownItem>
                  ))}
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </div>
          <p className="text-error">{errorText}</p>
        </ModalBody>
        <ModalFooter>
          <Button disabled={loading} onPress={add} className="bg-primaryLight text-primaryLightContrast font-medium px-5 gap-0 hover:bg-primaryLightHover m-1">
            {loading ? <Spinner color="current" size="sm" /> : "Send"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal >
  );
}
