import Routes from "@/routes/routes";
import { authOptions } from "@/util/auth-options";
import type { NextPage } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UI } from "./ui";

export async function generateMetadata() {
  return {
    title: "Upgrade",
  };
}

const Page: NextPage<{
  params: {
    orgId: string;
  };
}> = async ({ params }) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    return redirect(
      Routes.login({
        redirect: Routes.upgradeOrg({
          orgId: +params.orgId,
        }),
      }),
    );
  }

  return <UI orgId={+params.orgId} />;
};

export default Page;
