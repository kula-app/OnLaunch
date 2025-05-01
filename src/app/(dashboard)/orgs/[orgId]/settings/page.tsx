import { loadServerConfig } from "@/config/loadServerConfig";
import { Routes } from "@/routes/routes";
import prisma from "@/services/db";
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orgId } = await params;

  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      title: "Organization Settings",
    };
  }

  const user = await prisma.usersInOrganisations.findUnique({
    where: {
      orgId_userId: {
        orgId: +orgId,
        userId: +session.user.id,
      },
    },
    include: {
      org: {
        select: {
          name: true,
        },
      },
    },
  });
  if (!user) {
    return {
      title: "Organization Settings",
    };
  }

  return {
    title: `Organization Settings '${user.org.name}'`,
  };
}

const Page: NextPage<Props> = async ({ params }) => {
  const { orgId } = await params;

  const config = loadServerConfig();

  const session = await getServerSession(authOptions);
  if (!session) {
    return redirect(
      Routes.login({
        redirect: Routes.organization({
          orgId: +orgId,
        }),
      }),
    );
  }

  return (
    <UI orgId={+orgId} isBillingAvailable={config.stripeConfig.isEnabled} />
  );
};

export default Page;
