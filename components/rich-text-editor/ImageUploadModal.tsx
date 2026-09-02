import { UploadDropzone } from "@/lib/uploadthing";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "sonner";

interface ImageUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: (url: string) => void;
}

export function ImageUploadModal({
  onOpenChange,
  open,
  onUploaded,
}: ImageUploadModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>
        <UploadDropzone
          className="ut-uploading:opacity-90
          ut-ready:bg-card ut-ready:border-border
          ut-ready:text-foreground
          ut-uploading:bg-muted
          ut-uploading:border-border
          ut-uploading:text-muted-foreground
          ut-label:text-sm
          ut-label:text-muted-foreground
          ut-allowed-content:text-xs
          ut-allowed-content:text-muted-foreground
          ut-button:bg-primary ut-button:text-primary-foreground rounded-lg border
          ut-button:hover:bg-primary/90"
          appearance={{
            container: "bg-card",
            label: "text-muted-foreground",
            allowedContent: "text-xs text-muted-foreground",
            button: "bg-primary text-primary-foreground hover:bg-primary/90",
            uploadIcon: "text-muted-foreground",
          }}
          endpoint={"imageUploader"}
          onClientUploadComplete={(res) => {
            const url = res[0].ufsUrl;
            toast.success("Image upload successfully");
            onUploaded(url);
          }}
          onUploadError={(error) => {
            toast.error(error.message);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
