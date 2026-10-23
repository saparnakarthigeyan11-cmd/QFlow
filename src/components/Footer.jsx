import { COLLEGE } from "../data";

function Footer() {
  return (
    <footer className="footer">
      <strong>QFlow</strong> — Smart Queue Management System
      <span> | </span>
      {COLLEGE.name}
    </footer>
  );
}

export default Footer;
