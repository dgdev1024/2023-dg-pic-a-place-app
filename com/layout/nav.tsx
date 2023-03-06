/**
 * @file com / layout / nav.tsx
 */

import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { ReactNode } from "react";
import Styles from './nav.module.css';

export type NavProps = {
  session: Session;
  shown: boolean;
  children?: ReactNode;
};

const Nav = (props: NavProps) => {
  return (
    <nav className={`
      ${Styles.nav}
      ${props.shown && Styles.navShown}
    `}>
      <div className={Styles.navContainer}>
        {/* Display Signin Status if Signed In. */}
        {
          props.session && (
            <>
              <p className={`
                ${Styles.navEntry}
                ${Styles.navInformation}
              `}>
                Signed in as: <span className={Styles.navEntryLarge}>
                  {props.session.user.email}
                </span>
              </p>
            </>
          )
        }

        {/* Display General Links */}
        <Link href="/" className={`
          ${Styles.navEntry}
          ${Styles.navLink}
        `} tabIndex={props.shown === true ? 0 : -1}>Home</Link>

        <Link href="/random-places" className={`
          ${Styles.navEntry}
          ${Styles.navLink}
        `} tabIndex={props.shown === true ? 0 : -1}>Random Places</Link>

        {/* Display Links For Those Not Signed In. */}
        {
          !props.session && (
            <>
              <Link href="/sign-in" className={`
                ${Styles.navEntry}
                ${Styles.navLink}
              `} tabIndex={props.shown === true ? 0 : -1}>Sign In</Link>
            </>
          )
        }

        {/* Display Links (and the Sign Out button) For Those Signed In. */}
        {
          props.session && (
            <>
              <Link href="/my-images" className={`
                ${Styles.navEntry}
                ${Styles.navLink}
              `} tabIndex={props.shown === true ? 0 : -1}>My Images</Link>
              <Link href="/upload-image" className={`
                ${Styles.navEntry}
                ${Styles.navLink}
              `} tabIndex={props.shown === true ? 0 : -1}>Upload Image</Link>
              <button
                className={`
                  ${Styles.navEntry}
                  ${Styles.navLink}
                `}
                onClick={() => signOut()}
                tabIndex={props.shown === true ? 0 : -1}
              >
                Sign Out
              </button>
            </>
          )
        }
      </div>
    </nav>
  );
};

export default Nav;
