import React, {ChangeEvent, KeyboardEvent, ReactNode, useState} from "react";
import {Chip, InputAdornment, InputProps, TextField, TextFieldProps} from "@mui/material";

type ChipInputProps<ChipType> = TextFieldProps & {
    value: ChipType[],
    InputProps?: InputProps,
    onChange?: (chips: ChipType[]) => void,
    onAdd?: (chip: ChipType) => void,
    onTextValueChange?: (text: string) => void,
    onDelete?: (index: number) => void,
    renderLabel?: (chip: ChipType) => ReactNode,
    getChipKey?: (chip: ChipType) => string
}

const defaultLabelRenderer = <ChipType extends {toString: () => string}>(chip: ChipType): ReactNode => chip.toString();

export const ChipInput = <ChipType extends {toString: () => string}>(props: ChipInputProps<ChipType>) => {
    const [rawText, setRawText] = useState("");
    const {
        value,
        onChange,
        onAdd,
        onDelete,
        onTextValueChange,
        renderLabel,
        getChipKey,
        ...rest
    } = props;

    const handleTextChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string): void => {
        if (onTextValueChange) {
            onTextValueChange(typeof event === "string" ? event : event.target.value);
        }

        setRawText(typeof event === "string" ? event : event.target.value);
    };

    const removeChip = (indexToRemove: number): void => {
        if (onDelete) {
            onDelete(indexToRemove);
        }

        if (onChange) {
            onChange(value.filter((_, index) => index !== indexToRemove));
        }
    }

    const handleTagsInputKeydown = (event: KeyboardEvent) => {
        if (rawText.trim().length !== 0) {
            if (event.key === "Enter") {
                if (onAdd) {
                    onAdd(rawText as unknown as ChipType);
                }

                if (onChange) {
                    onChange([...value, rawText as unknown as ChipType]);
                }

                handleTextChange("");
            }
        } else if (event.key === "Delete" || event.key === "Backspace") {
            removeChip(value.length - 1);
        }
    };

    const chips = value.map((chip, index) => (
        <Chip onDelete={() => removeChip(index)}
              label={renderLabel ? renderLabel(chip) : defaultLabelRenderer(chip)}
              key={getChipKey ? getChipKey(chip) : index}
        />
    ));

    return (
        <TextField value={rawText}
                   onChange={handleTextChange}
                   fullWidth
                   margin="dense"
                   InputProps={{
                       startAdornment: (
                           <InputAdornment position="start">
                               {chips}
                           </InputAdornment>
                       ),
                       onKeyDown: event => handleTagsInputKeydown(event)
                   }}
                   {...rest}
        />
    );
}