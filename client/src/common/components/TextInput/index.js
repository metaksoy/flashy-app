import styles from "./TextInput.module.css";

const TextInput = (props) => {
  return (
    <div className={styles.container}>
      {props.label && <label className={styles.label}>{props.label}</label>}
      <input
        className={props.className || styles.input}
        placeholder={props.placeholder}
        type={props.type || "text"}
        value={props.value}
        onChange={props.onChange}
        required={props.required}
      />
    </div>
  );
};

export default TextInput;
