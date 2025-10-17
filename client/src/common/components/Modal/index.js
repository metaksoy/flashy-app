import styles from "./Modal.module.css";

const Modal = ({ children, open, setOpen, fullscreen = false }) => {
  if (open) {
    return (
      <>
        <div className={styles.overlay} onClick={() => setOpen(false)} />
        <div className={`${styles.modal} ${fullscreen ? styles.fullscreen : ''}`}>{children}</div>
      </>
    );
  } else {
    return null;
  }
};

export default Modal;
