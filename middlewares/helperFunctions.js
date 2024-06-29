exports.checkAttachmentType = (AttachmentEx) => {
  let extensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
  return extensions.some((extension) => {
    if (AttachmentEx.includes(extension)) {
      return true;
    }
    return false;
  });
};

exports.formatDate = (formattedDate) => {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  formattedDate = formattedDate
    .toLocaleString("en-US", options)
    .replace(",", "");
  return formattedDate;
};
