import "server-only";

import { GridFSBucket, ObjectId } from "mongodb";
import { getMongoDb } from "@/lib/mongodb";
import { MAX_BOOK_PDF_SIZE } from "@/lib/validations/book.schema";

const bucketName = "bookPdfs";

export type ParsedBookPdf = {
  name: string;
  size: number;
  data: Buffer;
};

function getBucket() {
  return new GridFSBucket(getMongoDb(), { bucketName });
}

export async function parseBookPdfUpload(
  value: FormDataEntryValue | null,
): Promise<{ pdf: ParsedBookPdf | null; error?: string }> {
  if (value === null || (typeof value === "string" && value.trim() === "")) {
    return { pdf: null };
  }
  if (typeof value === "string") {
    return { pdf: null, error: "Choose a PDF file." };
  }
  if (value.size === 0) {
    return { pdf: null, error: "The selected PDF is empty." };
  }
  if (value.size > MAX_BOOK_PDF_SIZE) {
    return { pdf: null, error: "PDF files must be 10 MB or smaller." };
  }
  if (!value.name.toLowerCase().endsWith(".pdf")) {
    return { pdf: null, error: "Choose a .pdf file." };
  }
  if (value.type && !["application/pdf", "application/x-pdf"].includes(value.type)) {
    return { pdf: null, error: "Choose a valid PDF file." };
  }

  const data = Buffer.from(await value.arrayBuffer());
  if (
    data.length > MAX_BOOK_PDF_SIZE ||
    data.subarray(0, 5).toString("ascii") !== "%PDF-"
  ) {
    return { pdf: null, error: "The selected file is not a valid PDF." };
  }

  const name = value.name.replace(/[\\/]/g, "_").replace(/[\r\n]/g, "_").slice(0, 255);
  return { pdf: { name, size: data.length, data } };
}

export async function deleteBookPdf(fileId: ObjectId) {
  await getBucket().delete(fileId);
}
