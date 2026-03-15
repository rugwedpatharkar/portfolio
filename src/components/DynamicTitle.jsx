import { useEffect, useRef } from "react";
import { personalInfo } from "../content";

const ORIGINAL_TITLE = `${personalInfo.fullName} | Portfolio`;
const AWAY_TITLE = `Come back! 👀 | ${personalInfo.fullName}`;
const RETURN_TITLE = "Welcome back! 🚀 | Portfolio";

const DynamicTitle = () => {
  const returnTimeout = useRef(null);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        document.title = AWAY_TITLE;
      } else {
        document.title = RETURN_TITLE;
        clearTimeout(returnTimeout.current);
        returnTimeout.current = setTimeout(() => {
          document.title = ORIGINAL_TITLE;
        }, 2000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      clearTimeout(returnTimeout.current);
      document.title = ORIGINAL_TITLE;
    };
  }, []);

  return null;
};

export default DynamicTitle;
