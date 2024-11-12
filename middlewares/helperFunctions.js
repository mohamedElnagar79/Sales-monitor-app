const PDFDocument = require("pdfkit");
const fs = require("fs");

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

exports.truncateText = (text, length) => {
  if (text.length <= length) {
    return text;
  }
  return text.substr(0, length);
};

exports.generateInvoicePdf = (invoiceData, newInvoiceItems, clientName) => {
  const doc = new PDFDocument();

  // Create a write stream to save the PDF
  const writeStream = fs.createWriteStream(
    `./public/invoices/invoice_${invoiceData.id}.pdf`
  );
  doc.registerFont("Cairo", "./public/fonts/Cairo-Regular.ttf");
  doc.registerFont("Cairo-Bold", "./public/fonts/Cairo-Bold.ttf");
  doc.pipe(writeStream);

  // Invoice title
  doc.fontSize(25).text("Invoice", { align: "center" });
  doc.moveDown();

  // Add brand name at the top
  doc.fontSize(18).text(process.env.brand_logo, { align: "left" });
  doc.moveDown();

  // Define styles
  const headerColor = "#f0f0f0"; // Background color for the header
  const rowHeight = 30; // Height for both the header and rows
  const paddingLeft = 5; // Padding for the "Items" column

  // Dynamically calculate starting Y position to center the table vertically
  const totalTableHeight = rowHeight * (newInvoiceItems.length + 1); // Header + rows
  const pageHeight = doc.page.height;
  const startY = (pageHeight - totalTableHeight) / 2;

  // Invoice info with increased font size
  doc.fontSize(18).text(`Invoice ID: ${invoiceData.id}`);

  const isClientNameArabic = /[ء-ي]/u.test(clientName);

  // Apply padding and set text with reversed words if necessary
  if (isClientNameArabic) {
    const reversedWords = clientName.split(" ").reverse().join(" ");
    doc
      .font("Cairo")
      .fontSize(18)
      .text(`Customer Name: ${reversedWords}`, { align: "left" });
  } else {
    doc
      .font("Cairo")
      .fontSize(18)
      .text(`Customer Name: ${clientName}`, { align: "left" });
  }

  doc
    .fontSize(18)
    .text(`Date: ${new Date().toLocaleDateString()}`, { align: "left" });
  doc.fontSize(18).moveDown();

  // Column widths
  const productNameWidth = 200;
  const quantityWidth = 100;
  const priceWidth = 100;
  const totalWidth = 100;
  const tableWidth = productNameWidth + quantityWidth + priceWidth + totalWidth;

  // Draw table header
  doc.rect(50, startY, tableWidth, rowHeight).fill(headerColor);

  // Set header text style with correct vertical alignment
  doc.fontSize(14).fillColor("black");

  const headerHeight = doc.heightOfString("Product", {
    width: productNameWidth,
  });
  const headerYPosition = (rowHeight - headerHeight) / 2; // Calculate center of header text

  doc.text("Product", 50 + paddingLeft, startY + headerYPosition, {
    width: productNameWidth,
    align: "left",
  });
  doc.text(
    "Quantity",
    50 + productNameWidth + paddingLeft,
    startY + headerYPosition,
    { width: quantityWidth, align: "left" }
  );
  doc.text(
    "Price",
    50 + productNameWidth + quantityWidth + paddingLeft,
    startY + headerYPosition,
    { width: priceWidth, align: "left" }
  );
  doc.text(
    "Total",
    50 + productNameWidth + quantityWidth + priceWidth + paddingLeft,
    startY + headerYPosition,
    { width: totalWidth, align: "left" }
  );

  let y = startY + rowHeight; // Starting y position for the table rows

  // Loop through the items to add them to the table
  newInvoiceItems.forEach((item) => {
    // Draw a border for each row
    doc.rect(50, y, tableWidth, rowHeight).stroke();

    // Set row text style
    doc.fillColor("black").font("Cairo");

    // Measure the text height for each item
    const productHeight = doc.heightOfString(item.productName, {
      width: productNameWidth,
    });
    const quantityHeight = doc.heightOfString(item.quantity.toString(), {
      width: quantityWidth,
    });
    const priceHeight = doc.heightOfString(
      isNaN(item.piecePrice) ? "0.00" : item.piecePrice.toString(),
      { width: priceWidth }
    );
    const totalHeight = doc.heightOfString(
      isNaN(item.quantity * item.piecePrice)
        ? "0.00"
        : (item.quantity * item.piecePrice).toFixed(2),
      { width: totalWidth }
    );

    // Calculate Y position for vertically centering each item in the row
    const productYPosition = (rowHeight - productHeight) / 2;
    const quantityYPosition = (rowHeight - quantityHeight) / 2;
    const priceYPosition = (rowHeight - priceHeight) / 2;
    const totalYPosition = (rowHeight - totalHeight) / 2;

    // Check if the product name contains Arabic characters
    const isArabic = /[ء-ي]/u.test(item.productName);

    // Apply padding and set text with reversed words if necessary
    if (isArabic) {
      const reversedWords = item.productName.split(" ").reverse().join(" ");
      doc.text(reversedWords, 50 + paddingLeft, y + productYPosition, {
        width: productNameWidth,
        align: "left",
        direction: "rtl",
      });
    } else {
      doc.text(item.productName, 50 + paddingLeft, y + productYPosition, {
        width: productNameWidth,
        align: "left",
      });
    }

    // Align quantity, price, and total in their respective columns
    doc.text(
      item.quantity,
      50 + productNameWidth + paddingLeft,
      y + quantityYPosition,
      {
        width: quantityWidth,
        align: "left",
      }
    );
    doc.text(
      isNaN(item.piecePrice) ? "0.00" : parseFloat(item.piecePrice).toFixed(2),
      50 + productNameWidth + quantityWidth + paddingLeft,
      y + priceYPosition,
      { width: priceWidth, align: "left" }
    );
    doc.text(
      isNaN(item.quantity * item.piecePrice)
        ? "0.00"
        : (item.quantity * item.piecePrice).toFixed(2),
      50 + productNameWidth + quantityWidth + priceWidth + paddingLeft,
      y + totalYPosition,
      { width: totalWidth, align: "left" }
    );

    y += rowHeight; // Move to the next row
  });

  // Draw another horizontal line after the table
  doc
    .moveTo(50, y)
    .lineTo(50 + tableWidth, y)
    .stroke();

  // Draw border around the entire table
  doc.rect(50, startY, tableWidth, y - startY).stroke();

  // Calculate bottom margin, fit all elements within the last 15% of the page
  const bottomMarginY = pageHeight * 0.77; // Start at 77% down the page
  const spacing = 15; // Space between sections

  y = bottomMarginY;

  const labelX = 370; // X position for the titles (first column)
  const valueX = 450; // X position for the values (second column)
  const gridSpacing = 16; // Space between rows (1rem ~ 16px)

  // Add "Total" title and value in two columns aligned to the right
  doc.fontSize(14).text("Total:", labelX, y, { align: "left" });
  doc.text(`${invoiceData.total} EGP`, valueX, y, { align: "left" });
  y += gridSpacing;

  // Add "Paid" title and value in two columns aligned to the right
  doc.text("Paid:", labelX, y, { align: "left" });
  doc.text(`${invoiceData.amountPaid} EGP`, valueX, y, { align: "left" });
  y += gridSpacing;

  // Add "Remainder" title and value in two columns aligned to the right
  doc.text("Remainder:", labelX, y, { align: "left" });
  doc.text(`${invoiceData.total - invoiceData.amountPaid} EGP`, valueX, y, {
    align: "left",
  });

  // Add margin (2rem ~ 32px) before the horizontal line
  y += 32;

  // Add horizontal line after totals section
  doc
    .moveTo(50, y)
    .lineTo(50 + tableWidth, y)
    .stroke();

  // Add address after the horizontal line with small space
  y += spacing;
  doc.fontSize(12).text(process.env.address, 50, y);

  // Finalize PDF
  doc.end();

  writeStream.on("finish", () => {
    // console.log(`Invoice ${invoiceData.id} generated successfully.`);
  });

  return writeStream.path;
};
