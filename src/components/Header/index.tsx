import Link from 'next/link';
import styles from './header.module.scss';

export default function Header() {
  return (
    <div className={styles.headingContainer}>
      <Link href="/">
        <a href="#">
          <img className={styles.logo} src="/logo.png" alt="logo" />
          <img
            className={styles.spacetraveling}
            src="/spacetraveling.png"
            alt="spacetraveling"
          />
          <img className={styles.dot} src="/dot.png" alt="dot" />
        </a>
      </Link>
    </div>
  );
}
