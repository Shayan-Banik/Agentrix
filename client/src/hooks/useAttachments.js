import { useCallback, useEffect, useRef, useState } from "react";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 20 * 1024 * 1024;

function getFileKind(file) {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) return "pdf";
  return "ppt";
}

export default function useAttachments() {
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const attachmentsRef = useRef(attachments);

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(
    () => () => {
      attachmentsRef.current.forEach(
        (attachment) =>
          attachment.preview && URL.revokeObjectURL(attachment.preview),
      );
    },
    [],
  );

  const addFiles = useCallback((fileList) => {
    const incomingFiles = Array.from(fileList || []);
    if (!incomingFiles.length) return;
    setError("");

    setAttachments((currentAttachments) => {
      const nextAttachments = [...currentAttachments];
      let validationError = "";

      for (const file of incomingFiles) {
        const supported =
          file.type.startsWith("image/") ||
          file.type === "application/pdf" ||
          /\.(pdf|pptx?)$/i.test(file.name);
        if (!supported) {
          validationError = `${file.name}: only images, PDF and PPT/PPTX are supported.`;
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          validationError = `${file.name} is larger than 20 MB.`;
          continue;
        }
        if (nextAttachments.length >= MAX_FILES) {
          validationError = `You can attach up to ${MAX_FILES} files.`;
          break;
        }

        const kind = getFileKind(file);
        nextAttachments.push({
          id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
          file,
          kind,
          preview: kind === "image" ? URL.createObjectURL(file) : null,
        });
      }

      if (validationError) setError(validationError);
      return nextAttachments;
    });
  }, []);

  const removeAttachment = useCallback((id) => {
    setAttachments((currentAttachments) => {
      const attachment = currentAttachments.find((item) => item.id === id);
      if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
      return currentAttachments.filter((item) => item.id !== id);
    });
  }, []);

  const clearAttachments = useCallback(() => {
    attachments.forEach(
      (attachment) =>
        attachment.preview && URL.revokeObjectURL(attachment.preview),
    );
    setAttachments([]);
  }, [attachments]);

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  return {
    attachments,
    error,
    setError,
    dragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    addFiles,
    removeAttachment,
    clearAttachments,
  };
}
