import type { Metadata, NextPage } from "next";
import UI from "./ui";

type Props = {};

export const metadata: Metadata = {
  title: "Recover Account",
};

const Page: NextPage<Props> = async () => {
  return <UI />;
};

export default Page;
