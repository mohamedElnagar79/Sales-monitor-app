exports.checkAttachmentType = (AttachmentEx) => {
  let extensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
  return extensions.some((extension) => {
    if (AttachmentEx.includes(extension)) {
      return true;
    }
    return false;
  });
};
