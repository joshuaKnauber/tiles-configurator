import KeyConfig from "./KeyConfig";

const SettingsButtons = ({ hardwareId }: { hardwareId: string }) => {
  return (
    <div className="flex flex-col gap-8 py-8 w-full items-center">
      <div className="flex flex-col gap-4">
        <span className="font-medium opacity-50">Button 1 Down</span>
        <KeyConfig hardwareId={hardwareId} action="one-down" />
      </div>
      <div className="flex flex-col gap-4">
        <span className="font-medium opacity-50">Button 1 Up</span>
        <KeyConfig hardwareId={hardwareId} action="one-up" />
      </div>
      <div className="flex flex-col gap-4">
        <span className="font-medium opacity-50">Button 2 Down</span>
        <KeyConfig hardwareId={hardwareId} action="two-down" />
      </div>
      <div className="flex flex-col gap-4">
        <span className="font-medium opacity-50">Button 2 Up</span>
        <KeyConfig hardwareId={hardwareId} action="two-up" />
      </div>
    </div>
  );
};

export default SettingsButtons;
