import Routes from "@/routes/routes";
import { authOptions } from "@/util/auth-options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import UI from "./ui";

export const metadata = {
  title: "Sign Up",
};

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect(Routes.DASHBOARD);
  }

  return <UI />;
}
