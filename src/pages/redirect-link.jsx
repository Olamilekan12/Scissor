import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { storeClicks } from "@/db/apiClicks";
import { getLongUrl } from "@/db/apiUrls";
import useFetch from "@/hooks/use-fetch";

const RedirectLink = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch the long URL based on the ID
  const { loading, data, error, fn } = useFetch(getLongUrl, id);
  
  // Fetch click stats after the long URL is fetched
  const { loading: loadingStats, fn: fnStats } = useFetch(storeClicks, {
    id: data?.id,
    originalUrl: data?.original_url,
  });

  // Fetch long URL when ID changes
  useEffect(() => {
    fn();
  }, [id, fn]);

  // Handle click stats and redirection once data is available and loading is complete
  useEffect(() => {
    if (!loading && data) {
      fnStats();
      if (data.original_url) {
        navigate(data.original_url, { replace: true });
      } else {
        console.error("No original_url found in data");
      }
    }
  }, [loading, data, fnStats, navigate]);

  // Display loading spinner while fetching data
  if (loading || loadingStats) {
    return (
      <>
        <BarLoader width={"100%"} color="#36d7b7" />
        <br />
        Redirecting...
      </>
    );
  }

  // Display error message if there was an issue fetching data
  if (error) {
    return <div>Error occurred while fetching data.</div>;
  }

  return null;
};

export default RedirectLink;