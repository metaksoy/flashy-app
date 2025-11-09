import { Link } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import logo from "../../common/logo.svg";
import LanguageSelector from "../../common/components/LanguageSelector";
import styles from "./Navbar.module.css";

const Navbar = ({ setIsOpen, isOpen }) => {
  const GET_USER = gql`
    query getUser {
      user {
        id
        avatar
        name
      }
    }
  `;

  const { data } = useQuery(GET_USER);

  return (
    <nav className={styles.navbar}>
      <Link to="/" className="navbar-brand">
        <img src={logo} className={styles.logo} alt="logo" />
      </Link>
      <div className={styles.navbarRight}>
        <LanguageSelector />
        <Link to="/profile" className={styles.profileButton}>
          {data?.user?.avatar ? (
            <img src={data.user.avatar} alt="Profile" className={styles.profileAvatar} />
          ) : (
            <div className={styles.profileAvatarPlaceholder}>
              {data?.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}
        </Link>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={styles.sidebarToggle}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          onClick={() => setIsOpen(!isOpen)}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </div>
    </nav>
  );
};

export default Navbar;
