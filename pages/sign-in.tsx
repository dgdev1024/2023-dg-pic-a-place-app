/**
 * @file pages / sign-in.tsx
 */

import SignInForm from "@com/sign-in";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";

const SignInPage = () => {
  return (
    <section className="section">
      <div className="container containerLeftDesktop">
        <SignInForm />
      </div>
    </section>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);

  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    };
  }

  return {
    props: {
      session
    }
  };
}

export default SignInPage;
