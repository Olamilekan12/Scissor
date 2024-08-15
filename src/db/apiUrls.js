import { toast } from "react-toastify";
import supabase, { supabaseUrl } from "./supabase";

export async function getUrls(user_id) {
  const { data, error } = await supabase
    .from("urls")
    .select("*")
    .eq("user_id", user_id);

  if (error) {
    console.log(error.message);
    throw new Error("Unable to load URLs");
  }
  return data;
}

export async function getUrl({ id, user_id }) {
  const { data, error } = await supabase
    .from("urls")
    .select("*")
    .eq("id", id)
    .eq("user_id", user_id)
    .single();

  if (error) {
    console.log(error.message);
    throw new Error("Short URL not found");
  }
  return data;
}

export async function getLongUrl(id) {
  try {
    const { data: shortLinkData, error: shortLinkError } = await supabase
      .from("urls")
      .select("id, original_url")
      // or(`short_url.eq.${id}, custom_url.eq.${id}`)
      .eq("short_url", id)
      .single();

    if (shortLinkError && shortLinkError.code === "PGRST116") {
      // If no match found, try custom_url
      ({ data: shortLinkData, error: shortLinkError } = await supabase
        .from("urls")
        .select("id, original_url")
        .eq("custom_url", id)
        .single());
    }
    if (shortLinkError) {
      if (shortLinkError.code === "PGRST116") {
        console.log("No matching URL found");
        return null;
      } else {
        console.error("Error fetching short link:", shortLinkError);
        throw shortLinkError;
      }
    }

    return shortLinkData;
  } catch (error) {
    console.error("Unexpected error in getLongUrl:", error);
    throw error;
  }
}

export async function createUrl(
  { title, longUrl, customUrl, user_id },
  qrCode
) {
  const short_url = Math.random().toString(36).substring(2, 6);
  const fileName = `qr-${short_url}`;

  const { error: storageError } = await supabase.storage
    .from("qrs")
    .upload(fileName, qrCode);

  if (storageError) throw new Error(storageError.message);

  const qr = `${supabaseUrl}/storage/v1/object/public/qrs/${fileName}`;

  //making the api call to create the url
  const { data, error } = await supabase
    .from("urls")
    .insert([
      {
        title,
        original_url: longUrl,
        short_url: short_url,
        custom_url: customUrl || null,
        user_id,
        qr,
      },
    ])
    .select();

  if (error) {
    console.log(error.message);
    toast.error(error.message, {
      theme: "error",
    });
    throw new Error("Error creating short URL");
  }
  return data;
}

export async function deleteUrl(id) {
  const { data, error } = await supabase.from("urls").delete().eq("id", id);

  if (error) {
    console.log(error.message);
    throw new Error("Error deleting URLs");
  }
  return data;
}
