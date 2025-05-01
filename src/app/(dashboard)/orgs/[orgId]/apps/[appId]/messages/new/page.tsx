import { Routes } from "@/routes/routes";
import { authOptions } from "@/util/auth-options";
import type { Metadata, NextPage } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UI } from "./ui";

type Props = {
  params: Promise<{
    orgId: string;
    appId: string;
  }>;
};

export const metadata: Metadata = {
  title: "New Message",
};

const page: NextPage<Props> = async ({ params }) => {
  const { orgId, appId } = await params;

  const session = await getServerSession(authOptions);
  if (!session) {
    return redirect(
      Routes.login({
        redirect: Routes.createMessage({
          orgId: +orgId,
          appId: +appId,
        }),
      }),
    );
  }

  return <UI orgId={+orgId} appId={+appId} />;
};

export default page;
