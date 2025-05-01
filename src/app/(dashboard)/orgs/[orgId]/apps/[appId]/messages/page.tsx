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
    appId: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orgId, appId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      title: "Messages",
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
        include: {
          apps: {
            select: {
              name: true,
            },
            where: {
              id: +appId,
            },
          },
        },
      },
    },
  });
  if (!user?.org.apps[0].name) {
    return {
      title: "Messages",
    };
  }

  return {
    title: `Messages for ${user.org.apps[0].name}`,
  };
}

const Page: NextPage<Props> = async ({ params }) => {
  const { orgId, appId } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return redirect(
      Routes.login({
        redirect: Routes.app({
          orgId: +orgId,
          appId: +appId,
        }),
      }),
    );
  }

  return <UI orgId={+orgId} appId={+appId} />;
};

export default Page;
