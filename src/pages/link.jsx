import ShowQR from "@/components/showQR";
import { Button } from "@/components/ui/button";
import { UrlState } from "@/context";
import { getClicksForUrl } from "@/db/apiClicks";
import { deleteUrl, getUrl } from "@/db/apiUrls";
import useFetch from "@/hooks/use-fetch";
import { Copy, Download, Trash } from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BarLoader, BeatLoader } from "react-spinners";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DeviceStats from "@/components/deviceStats";
import Location from "@/components/locationStats";

const Link = () => {
  const { id } = useParams();
  const { user } = UrlState();
  const navigate = useNavigate();

  const {
    loading,
    data: url,
    fn,
    error,
  } = useFetch(getUrl, { id, user_id: user?.id });

  const {
    loading: loadingStats,
    data: stats,
    fn: fnStats,
  } = useFetch(getClicksForUrl, id);

  const { loading: loadingDelete, fn: fnDelete } = useFetch(deleteUrl, id);

  useEffect(() => {
    fn();
    fnStats();
  }, []);

  useEffect(() => {
    if (error) {
      navigate("/dashboard");
    }
  }, [error, navigate]);

  const link = url?.custom_url || url?.short_url || "";

  const openImageInNewTab = () => {
    const imageUrl = url?.qr;
    if (imageUrl) {
      window.open(imageUrl, "_blank");
    } else {
      console.error("Image URL is not available");
    }
  };

  const handleDelete = async () => {
    try {
      await fnDelete();
      navigate("/dashboard");
      toast.success("Link deleted successfully", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
        icon: <Trash className="text-red-500" />,
      });
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error("Failed to delete link", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(`https://scissor-9s9w.vercel.app/${url?.short_url}`)
      .then(() => {
        toast.success("Copied to clipboard", {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "dark",
          icon: <Copy className="text-blue-500" />,
        });
      })
      .catch((error) => {
        console.error("Failed to copy to clipboard:", error);
        toast.error("Failed to copy to clipboard", {
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      });
  };

  if (loading || loadingStats || loadingDelete) {
    return (
      <BarLoader className="w-full mb-4" width={"100%"} color={"#dadada"} />
    );
  }

  return (
    <>
      {(loading || loadingStats) && (
        <BarLoader classname="mb-4" width={"100%"} color="#36d7b7" />
      )}
      <div className="mt-6 flex flex-col sm:flex-row gap-6 justify-between w-full">
        <div className="flex flex-col sm:w-2/5 items-start gap-6 rounded-lg">
          <span className="text-4xl sm:text-6xl font-extrabold hover:underline cursor-pointer">
            {url?.title}
          </span>
          <a
            href={`https://scissor-9s9w.vercel.app/${link}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-2xl sm:text-4xl text-blue-400 font-bold hover:underline cursor-pointer"
          >
            https://scissor-9s9w.vercel.app/{link}
          </a>
          <a
            href={url?.original_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline cursor-pointer text-gray-400 text-sm sm:text-lg"
          >
            {url?.original_url}
          </a>
          <div>
            <ShowQR url={url} loading={loading} />
          </div>
          <div className="flex">
            <Button
              variant="ghost"
              className="hover:text-slate-400"
              onClick={openImageInNewTab}
            >
              <Download className="text-blue-500 hover:text-blue-300" />
            </Button>
            <Button variant="ghost" onClick={copyToClipboard}>
              <Copy className="text-white hover:text-gray-400" />
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                fnDelete().then(() => {
                  navigate("/dashboard");
                })
              }
              disable={loadingDelete}
            >
              {loadingDelete ? (
                <BeatLoader size={5} color="white" />
              ) : (
                <Trash />
              )}
            </Button>
          </div>
          <img
            src={url?.qr}
            className="w-full self-center sm:self-start ring ring-blue-500 p-1 object-contain"
            alt="qr code"
          />
          <span className="flex items-end text-gray-400 text-sm font-extralight">
            {new Date(url?.created_at).toLocaleString()}
          </span>
        </div>
        <Card className="sm:w-3/5">
          <CardHeader>
            <CardTitle className="text-4xl sm:text-4xl font-extrabold">
              Stats
            </CardTitle>
          </CardHeader>
          {stats && stats?.length ? (
            <CardContent className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{stats?.length}</p>
                </CardContent>
              </Card>

              <CardTitle>Location Data</CardTitle>
              <Location stats={stats} />
              <CardTitle>Device Info</CardTitle>
              <DeviceStats stats={stats} />
            </CardContent>
          ) : (
            <CardContent>
              {loadingStats === false
                ? "No Statistics yet"
                : "Loading Statistics.."}
            </CardContent>
          )}
        </Card>
      </div>
    </>
  );
};

export default Link;
