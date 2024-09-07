import { Metadata, NextPage } from "next";
import { UI } from "./ui";

export const metadata: Metadata = {
  title: "Verify Account",
};

const Page: NextPage = async () => {
  return <UI />;
};

export default Page;
