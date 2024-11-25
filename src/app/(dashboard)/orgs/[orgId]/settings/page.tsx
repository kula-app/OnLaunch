import Routes from "@/routes/routes";
import prisma from "@/services/db";
import { authOptions } from "@/util/auth-options";
import type { NextPage } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UI } from "./ui";

export async function generateMetadata({
  params: { orgId },
}: {
  params: {
    orgId: string;
  };
}) {
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

const Page: NextPage<{
  params: {
    orgId: string;
  };
}> = async ({ params }) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    return redirect(
      Routes.login({
        redirect: Routes.org({
          orgId: +params.orgId,
        }),
      }),
    );
  }

  return <UI orgId={+params.orgId} />;
};

export default Page;
