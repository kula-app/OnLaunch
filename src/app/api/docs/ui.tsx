"use client";

import dynamic from "next/dynamic";

const RedocStandalone = dynamic(
  () => import("redoc").then((mod) => mod.RedocStandalone),
  { ssr: false },
);

const UI = () => {
  return (
    <div style={{ height: "100vh", width: "100vw", background: "white" }}>
      <RedocStandalone specUrl="/api/openapi.yaml" />;
    </div>
  );
};

export default UI;
