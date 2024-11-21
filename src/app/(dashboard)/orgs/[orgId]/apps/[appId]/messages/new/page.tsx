import type { NextPage } from "next";
import { UI } from "./ui";

export function generateMetadata() {
  return {
    title: "New Message",
  };
}

const page: NextPage<{
  params: {
    orgId: string;
    appId: string;
  };
}> = ({ params }) => {
  return <UI orgId={Number(params.orgId)} appId={Number(params.appId)} />;
};

export default page;
