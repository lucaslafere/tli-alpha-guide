import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link to="/" className="nav-logo">
          TLI Guides
        </Link>
        <div className="nav-links">
          <Link to="/">Guides</Link>
        </div>
      </div>
    </nav>
  );
}
