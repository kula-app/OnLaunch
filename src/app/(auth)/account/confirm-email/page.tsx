import type { Metadata, NextPage } from "next";
import { UI } from "./ui";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: "Change Email",
};

const Page: NextPage<Props> = async ({ searchParams }) => {
  const token = (await searchParams)["token"] as string;

  return <UI token={token} />;
};

export default Page;
