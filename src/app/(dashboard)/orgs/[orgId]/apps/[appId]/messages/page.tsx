import Routes from "@/routes/routes";
import prisma from "@/services/db";
import { authOptions } from "@/util/auth-options";
import type { NextPage } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UI } from "./ui";

export async function generateMetadata({
  params: { orgId, appId },
}: {
  params: {
    orgId: string;
    appId: string;
  };
}) {
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

  return {
    title: user?.org.apps[0].name ?? "Messages",
  };
}

const Page: NextPage<{
  params: {
    orgId: string;
    appId: string;
  };
}> = async ({ params: { orgId, appId } }) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return redirect(
      Routes.login({
        redirect: Routes.app({ orgId: +orgId, appId: +appId }),
      }),
    );
  }

  return <UI orgId={+orgId} appId={+appId} />;
};

export default Page;
