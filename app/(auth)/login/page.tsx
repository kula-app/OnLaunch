import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Routes from "@/routes/routes";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import UI from "./ui";

export const metadata = {
  title: "Login",
};

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect(Routes.DASHBOARD);
  }

  return <UI />;
}
