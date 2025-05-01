import { loadClientConfig } from "@/config/loadClientConfig";
import { Routes } from "@/routes/routes";
import { authOptions } from "@/util/auth-options";
import type { Metadata, NextPage } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UI } from "./ui";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: "Join Organization",
};

const Page: NextPage<Props> = async ({ searchParams }) => {
  const { directInviteTokenParam, inviteTokenParam } = await searchParams;

  const directInviteToken =
    directInviteTokenParam && Array.isArray(directInviteTokenParam)
      ? directInviteTokenParam[0]
      : directInviteTokenParam;
  const inviteToken =
    inviteTokenParam && Array.isArray(inviteTokenParam)
      ? inviteTokenParam[0]
      : inviteTokenParam;

  const config = loadClientConfig();

  const session = await getServerSession(authOptions);
  if (!session) {
    return redirect(
      Routes.login({
        redirect: directInviteToken
          ? Routes.getOrganizationDirectInvitationUrl({
              baseUrl: config.baseConfig.url,
              token: directInviteToken,
            })
          : inviteToken
            ? Routes.getOrganizationInvitationUrl({
                baseUrl: config.baseConfig.url,
                token: inviteToken,
              })
            : undefined,
      }),
    );
  }

  return <UI directInviteToken={directInviteToken} inviteToken={inviteToken} />;
};

export default Page;
