import { Switch } from "@headlessui/react";

interface ToggleOptionProps {
  title: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

const ToggleOption = (props: ToggleOptionProps) => {
  const { title, value, onChange } = props;
  return (
    <div className="flex flex-row items-center gap-4">
      <Switch
        checked={value}
        onChange={onChange}
        className={`${
          value ? "bg-blue-600" : "bg-zinc-700"
        } relative inline-flex h-6 w-11 items-center rounded-full`}
      >
        <span
          className={`${
            value ? "translate-x-6" : "translate-x-1"
          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
        />
      </Switch>
      <span className="font-medium">{title}</span>
    </div>
  );
};

export default ToggleOption;
