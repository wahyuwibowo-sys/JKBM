import React from 'react';
import { Sidebar, SidebarProps } from './Sidebar';

export type NavbarProps = SidebarProps;

export const Navbar: React.FC<NavbarProps> = (props) => {
  return <Sidebar {...props} />;
};

export default Navbar;
