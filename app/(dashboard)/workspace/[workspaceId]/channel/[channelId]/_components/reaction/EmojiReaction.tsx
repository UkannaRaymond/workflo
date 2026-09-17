import { Button } from "@/components/ui/button";
import {
  EmojiPicker,
  EmojiPickerContent,
  EmojiPickerFooter,
  EmojiPickerSearch,
} from "@/components/ui/emoji-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SmilePlus } from "lucide-react";
import { useState } from "react";

interface EmojiReactionProps {
  onSelect: (emoji: string) => void;
  disabled?: boolean;
}

export function EmojiReaction({ onSelect, disabled }: EmojiReactionProps) {
  const [open, setOpen] = useState(false);
  const handleEmojiSelect = (emoji: string) => {
    onSelect(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"ghost"}
          size={"icon"}
          className="size-6"
          disabled={disabled}
        >
          <SmilePlus className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0" align="start">
        <EmojiPicker
          className="h-85.5"
          onEmojiSelect={(e) => handleEmojiSelect(e.emoji)}
        >
          <EmojiPickerSearch />
          <EmojiPickerContent />
          <EmojiPickerFooter />
        </EmojiPicker>
      </PopoverContent>
    </Popover>
  );
}
