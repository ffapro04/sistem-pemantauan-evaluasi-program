/* eslint-disable react/prop-types */
import AppSwitch from "./ui/AppSwitch";

export default function Toggle({ checked, onChange }) {
  return (
    <AppSwitch
      checked={checked}
      onClick={onChange}
      size="md"
      tone="green"
      showText={false}
    />
  );
}
