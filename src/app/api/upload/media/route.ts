import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { authorize, type AuthResult, type Role } from "@/lib/auth";
import { compressImageBuffer, getCompressedExtension, validateUploadSize, validateUploadType, isImageType, isVideoType } from "@/lib/compression/server";
import { AssetType, ASSET_CONFIG } from "@/lib/upload/types";

const REQUIRED_AUTH_ROLES: Record<AssetType, Role[]> = {
  portfolio: ["owner", "moderator"],
  nsfw: ["owner", "moderator"],
  "adoptable-main": ["owner", "moderator"],
  "adoptable-gallery": ["owner", "moderator"],
  "adoptable-before": ["owner", "moderator"],
  "adoptable-after": ["owner", "moderator"],
  site: ["owner", "moderator"],
  review: ["owner", "moderator"],
  "credit-avatar": ["owner", "moderator"],
  "commission-reference": ["owner", "moderator"],
};

function uniqueFilename(originalName: string): string {
  const ext = originalName.split(".").pop() || "bin";
  const id = crypto.randomUUID();
  return `${id}.${ext}`;
}

export async function POST(request: NextRequest) {
  try {
    const assetType = (await request.formData()).get("assetType") as string;
    const validTypes: AssetType[] = ["portfolio", "nsfw", "adoptable-main", "adoptable-gallery", "adoptable-before", "adoptable-after", "site", "review", "credit-avatar", "commission-reference"];
    if (!validTypes.includes(assetType as AssetType)) {
      return NextResponse.json({ error: "Invalid asset type", code: "INVALID_TYPE" }, { status: 400 });
    }

    const type = assetType as AssetType;
    const config = ASSET_CONFIG[type];
    const isPublic = type === "review" || type === "commission-reference";

    if (!isPublic) {
      const requiredRoles = REQUIRED_AUTH_ROLES[type];
      let auth: AuthResult | null = null;
      for (const role of requiredRoles) {
        auth = authorize(request, { role });
        if (auth.ok) break;
      }
      if (!auth || !auth.ok) return auth?.response!;
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server not configured", code: "CONFIG_ERROR" }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const metadataRaw = formData.get("metadata") as string | null;
    const metadata: Record<string, string | number | boolean | null> = metadataRaw ? JSON.parse(metadataRaw) : {};

    if (!file) {
      return NextResponse.json({ error: "No file provided", code: "NO_FILE" }, { status: 400 });
    }

    const typeValidation = validateUploadType(file.type);
    if (!typeValidation.valid) {
      return NextResponse.json({ error: typeValidation.error!.message, code: "INVALID_TYPE", category: typeValidation.error!.category }, { status: 400 });
    }

    const sizeValidation = validateUploadSize(file.size, file.type);
    if (!sizeValidation.valid) {
      return NextResponse.json({ error: sizeValidation.error!.message, code: "TOO_LARGE", category: sizeValidation.error!.category }, { status: 400 });
    }

    let uploadBuffer: Buffer = Buffer.from(await file.arrayBuffer());
    let fileExtension = file.name.split(".").pop() || "bin";
    const isGif = file.type === "image/gif";

    if (isImageType(file.type) && !isGif) {
      try {
        const compressed = await compressImageBuffer(uploadBuffer, file.type);
        uploadBuffer = compressed;
        fileExtension = getCompressedExtension(file.type);
      } catch {
        console.error("Compression failed, using original");
      }
    }

    const storageFilename = uniqueFilename(file.name);
    const storagePath = `${config.storagePrefix}/${storageFilename}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(config.bucket)
      .upload(storagePath, uploadBuffer, {
        cacheControl: "3600",
        upsert: true,
        contentType: isImageType(file.type) && !isGif ? "image/webp" : file.type,
      });

    if (uploadError || !uploadData) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed", code: "STORAGE_ERROR" }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from(config.bucket).getPublicUrl(storagePath);
    const url = urlData.publicUrl;

    let dbResult: any = null;
    const now = new Date().toISOString();

    try {
      switch (type) {
        case "portfolio": {
          const { data, error } = await supabaseAdmin.from("portfolio_images").insert([{ url, storage_path: storagePath, created_at: now, updated_at: now }]).select().single();
          if (error) throw error;
          dbResult = data;
          break;
        }
        case "nsfw": {
          const { data, error } = await supabaseAdmin.from("nsfw_portfolio_images").insert([{ url, storage_path: storagePath, created_at: now, updated_at: now }]).select().single();
          if (error) throw error;
          dbResult = data;
          break;
        }
        case "adoptable-main": {
          const { id } = metadata;
          if (!id) throw new Error("adoptableId is required");
          const { error } = await supabaseAdmin.from("adoptables").update({ main_image: url, main_image_path: storagePath, updated_at: now }).eq("id", id);
          if (error) throw error;
          dbResult = { id, url, storage_path: storagePath };
          break;
        }
        case "adoptable-gallery": {
          const { adoptableId, isNsfw } = metadata;
          if (!adoptableId) throw new Error("adoptableId is required");
          const { data, error } = await supabaseAdmin.from("adoptable_gallery").insert([{ adoptable_id: adoptableId, url, storage_path: storagePath, is_nsfw: isNsfw === true, created_at: now }]).select().single();
          if (error) throw error;
          dbResult = data;
          break;
        }
        case "adoptable-before":
        case "adoptable-after": {
          const { adoptableId, label } = metadata;
          if (!adoptableId) throw new Error("adoptableId is required");
          const isBefore = type === "adoptable-before";
          const { data, error } = await supabaseAdmin.from("adoptable_before_after").insert([{
            adoptable_id: adoptableId,
            before_url: isBefore ? url : null,
            after_url: isBefore ? null : url,
            before_path: isBefore ? storagePath : null,
            after_path: isBefore ? null : storagePath,
            label: label || null,
            created_at: now,
          }]).select().single();
          if (error) throw error;
          dbResult = data;
          break;
        }
        case "site": {
          const { key } = metadata;
          if (!key) throw new Error("key is required");
          const { data, error } = await supabaseAdmin.from("site_images").upsert({ key, url, storage_path: storagePath, updated_at: now }, { onConflict: "key" }).select().single();
          if (error) throw error;
          dbResult = data;
          break;
        }
        case "review": {
          const { display_name, review_text, rating } = metadata;
          if (!display_name || !review_text) throw new Error("display_name and review_text are required");
          const { data, error } = await supabaseAdmin.from("reviews").insert([{ display_name, review_text, rating: typeof rating === "number" ? rating : 5, status: "pending", image_url: url, created_at: now }]).select().single();
          if (error) throw error;
          dbResult = data;
          break;
        }
        case "credit-avatar": {
          const { creditId } = metadata;
          if (!creditId) throw new Error("creditId is required");
          const { error } = await supabaseAdmin.from("credits").update({ avatar_url: url, avatar_path: storagePath }).eq("id", creditId);
          if (error) throw error;
          dbResult = { id: creditId, url, storage_path: storagePath };
          break;
        }
        case "commission-reference": {
          dbResult = { id: storageFilename, url, storage_path: storagePath };
          break;
        }
      }
    } catch (dbErr: any) {
      console.error("DB insert error:", dbErr);
      await supabaseAdmin.storage.from(config.bucket).remove([storagePath]);
      return NextResponse.json({ error: "Database error", code: "DB_ERROR" }, { status: 500 });
    }

    return NextResponse.json({ id: dbResult?.id || storageFilename, url, path: storagePath });
  } catch (error: any) {
    console.error("Unified upload error:", error);
    return NextResponse.json({ error: "Upload failed", code: "INVALID_REQUEST" }, { status: 400 });
  }
}
