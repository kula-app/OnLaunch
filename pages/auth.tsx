import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import AuthForm from "../components/AuthForm";

export default function Auth() {
  

  return (
    <>
      <Navbar />
      <AuthForm />
    </>
  );
}
