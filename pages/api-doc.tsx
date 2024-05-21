import dynamic from "next/dynamic";

const RedocStandalone = dynamic(
  () => import("redoc").then((mod) => mod.RedocStandalone),
  { ssr: false }
);

const ApiDoc = () => {
  return <RedocStandalone specUrl="/api/openapi.yaml" />;
};

export default ApiDoc;
