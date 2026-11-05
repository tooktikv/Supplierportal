import { trackFile } from "@/lib/docs";
import { getLang, translate } from "@/lib/i18n";
import type { FileMeta } from "@/lib/types";

export const RESPONSE_STATUSES = ["Action Required", "Resubmission Required"];

export const kb = (size?: number) => ((size ?? 0) / 1024).toFixed(0);

const ALLOWED_MIME = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png"];
const ALLOWED_EXT = ["pdf", "docx", "jpg", "jpeg", "png"];

/** Validates picked files (10 MB, pdf/docx/jpg/png) and wraps the valid ones with trackFile. */
export function pickFiles(list: FileList | null, toast: (message: string) => void): FileMeta[] {
  const valid: FileMeta[] = [];
  for (const file of Array.from(list || [])) {
    if (file.size > 10 * 1024 * 1024) {
      toast(translate("{name} exceeds the 10 MB limit.", getLang(), { name: file.name }));
      continue;
    }
    const extension = (file.name.split(".").pop() ?? "").toLowerCase();
    if (!ALLOWED_MIME.includes(file.type) && !ALLOWED_EXT.includes(extension)) {
      toast(translate("{name} is not a supported file type.", getLang(), { name: file.name }));
      continue;
    }
    valid.push(trackFile(file, file.type || extension));
  }
  return valid;
}
