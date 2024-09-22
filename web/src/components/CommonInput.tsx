import { getThemes } from "@/util";
import { Button, Input } from "@nextui-org/react";
import { useState } from "react";
import { Eye, EyeOff } from "react-feather";

type InputProps = {
    type: string;
    label: JSX.Element;
    placeholder: string;
    value?: any;
    style?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    labelPlacement?: boolean
    startContent?: JSX.Element;
    endContent?: JSX.Element;
    disabled?: boolean;
    required?: boolean;
};

const CommonInput = ({
    type,
    label,
    placeholder,
    value,
    style,
    onChange,
    onKeyDown,
    labelPlacement,
    startContent,
    endContent,
    disabled,
    required
}: InputProps) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
    const { themeLabel } = getThemes();

    return (
        <Input
            type={(type === "password" && isPasswordVisible) ? "text" : type}
            label={label}
            labelPlacement="outside"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            startContent={startContent}
            endContent={
                type === "password" ? (
                    <Button className="px-0" onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
                        {isPasswordVisible ? (
                            <EyeOff className="text-xs h-4 pointer-events-none text-textColor" />
                        ) : (
                            <Eye className="text-xs h-4 pointer-events-none text-textColor" />
                        )}
                    </Button>
                ) : endContent
            }
            disabled={disabled}
            required={required}
            className={`common-input border border-border rounded-xl hover:border-textColor ${disabled && 'disabled-input'}  ${themeLabel}-input ${style}`}
        />
    );
};

export default CommonInput;
