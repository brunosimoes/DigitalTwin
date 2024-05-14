import React from "react";
import "./LoadingPage.css";

interface Props {
  text?: string;
  subtitle?: string;
  hideSpinner?: boolean;
}

/**
 * LoadingPage is a component that renders a loading spinner and text.
 * @param {LoadingPageProps} props - The props for the LoadingPage component.
 * @returns {JSX.Element} A JSX element representing a loading page with a spinner and text.
 */
const LoadingPage: React.FC<Props> = ({ text, subtitle, hideSpinner = false }) => {
  return (
    <div className="loading-page">
      {!hideSpinner && <div className="loading-spinner"></div>}
      <h2 style={{ maxWidth: "60%", textAlign: "center" }}>
        {text || "Hang tight! We're fetching your data."}
      </h2>
      <span>{subtitle}</span>
    </div>
  );
};

export default LoadingPage;
