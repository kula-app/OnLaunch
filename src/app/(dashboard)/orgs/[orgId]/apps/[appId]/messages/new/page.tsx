import Routes from "@/routes/routes";
import { authOptions } from "@/util/auth-options";
import type { NextPage } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
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
}> = async ({ params }) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    return redirect(
      Routes.login({
        redirect: Routes.createMessage({
          orgId: +params.orgId,
          appId: +params.appId,
        }),
      }),
    );
  }

  return <UI orgId={+params.orgId} appId={+params.appId} />;
};

export default page;
