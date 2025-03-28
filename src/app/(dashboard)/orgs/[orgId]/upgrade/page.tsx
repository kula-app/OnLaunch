import { Routes } from "@/routes/routes";
import { authOptions } from "@/util/auth-options";
import type { Metadata, NextPage } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UI } from "./ui";

type Props = {
  params: Promise<{
    orgId: string;
  }>;
};

export async function generateMetadata({}: Props): Promise<Metadata> {
  return {
    title: "Upgrade",
  };
}

const Page: NextPage<Props> = async ({ params }) => {
  const { orgId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return redirect(
      Routes.login({
        redirect: Routes.upgradeOrganization({
          orgId: +orgId,
        }),
      }),
    );
  }

  return <UI orgId={+orgId} />;
};

export default Page;
