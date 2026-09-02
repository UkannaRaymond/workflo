import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { ImageUploadModal } from "@/components/rich-text-editor/ImageUploadModal";
import { Button } from "@/components/ui/button";
import { useAttachmentUploadType } from "@/hooks/use-attachment-upload";
import { ImageIcon, Send } from "lucide-react";
import { AttachmentChip } from "./AttachmentChip";

interface iAppProps {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  upload: useAttachmentUploadType;
}

export function MessageComposer({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  upload,
}: iAppProps) {
  return (
    <>
      <RichTextEditor
        field={{ value, onChange }}
        sendButton={
          <Button
            disabled={isSubmitting}
            type="button"
            size={"sm"}
            onClick={onSubmit}
          >
            <Send className="size-4 mr-1" />
            Send
          </Button>
        }
        footerLeft={
          upload.stageUrl ? (
            <AttachmentChip url={upload.stageUrl} onRemove={upload.clear} />
          ) : (
            <Button
              onClick={() => upload.setOpen(true)}
              type="button"
              size="sm"
              variant="outline"
            >
              <ImageIcon className="size-4 mr-1" />
              Attach
            </Button>
          )
        }
      />

      <ImageUploadModal
        onUploaded={(url) => upload.onUploaded(url)}
        open={upload.isOpen}
        onOpenChange={upload.setOpen}
      />
    </>
  );
}
