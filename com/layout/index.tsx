/**
 * @file com / layout / index.tsx
 */

import { FunctionComponent, ReactNode, useState } from "react";
import { useSession } from "next-auth/react";
import Header from "./header";
import Nav from "./nav";

export type LayoutProps = {
  children?: ReactNode
};

const Layout: FunctionComponent<LayoutProps> = ({ children }) => {
  const session = useSession();
  const [navShown, setNavShown] = useState<boolean>(false);

  return (
    <>
      <Header navShown={navShown} onNavButtonClicked={() => setNavShown(shown => !shown)} />
      <Nav shown={navShown} session={session.data} />
      {children}
    </>
  );
};

export default Layout;
