/**
 * @file pages / user-setup.tsx
 */

import UserSetupForm from "@com/user-setup/form";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { authOptions } from "./api/auth/[...nextauth]";

const UserSetupPage = () => {
  const session = useSession();

  return (
    <section className="section">
      <div className="container containerLeftDesktop">
        <UserSetupForm session={session.data} />
      </div>
    </section>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: '/sign-in',
        permanent: false
      }
    };
  }

  return {
    props: {
      session
    }
  };
};

export default UserSetupPage;
