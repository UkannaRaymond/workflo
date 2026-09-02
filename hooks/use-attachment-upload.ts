"use client";

import { useCallback, useMemo, useState } from "react";

export function useAttachmentUpload() {
  const [isOpen, setOpen] = useState(false);
  const [stageUrl, setStageUrl] = useState<null | string>(null);
  const [isUploading, setUploading] = useState(false);

  const onUploaded = useCallback((url: string) => {
    setStageUrl(url);
    setUploading(false);
    setOpen(false);
  }, []);

  const clear = useCallback(() => {
    setStageUrl(null);
    setUploading(false);
  }, []);

  return useMemo(
    () => ({
      isOpen,
      setOpen,
      onUploaded,
      stageUrl,
      isUploading,
      clear,
    }),
    [isOpen, setOpen, onUploaded, stageUrl, isUploading, clear],
  );
}

export type useAttachmentUploadType = ReturnType<typeof useAttachmentUpload>;
