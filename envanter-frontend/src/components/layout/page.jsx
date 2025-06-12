import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import FloatingChatBox from "../FloatingChatBox";
import PropTypes from 'prop-types';

export function Page({ children }) {
  return (
    <>
      <div className="w-screen h-screen flex">
        <Sidebar />
        <Navbar>{children}</Navbar>
      </div>
      <FloatingChatBox />
    </>
  );
}

Page.propTypes = {
  children: PropTypes.node.isRequired
};
