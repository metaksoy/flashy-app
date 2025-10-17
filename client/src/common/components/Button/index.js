import styles from "./Button.module.css";
import PropTypes from "prop-types";

const Button = (props) => {
  return (
    <button
      className={styles.button}
      style={props.style || (props.bgcolor && { backgroundColor: props.bgcolor })}
      onClick={props.onClick || props.callback}
      type={props.type || "button"}
      disabled={props.disabled}
    >
      {props.children || "Submit"}
    </button>
  );
};

Button.propTypes = {
  callback: PropTypes.func,
  onClick: PropTypes.func,
  children: PropTypes.node,
  bgcolor: PropTypes.string,
  style: PropTypes.object,
  type: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Button;
