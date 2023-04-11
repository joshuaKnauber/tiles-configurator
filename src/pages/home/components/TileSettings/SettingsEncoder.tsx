import KeyConfig from "./KeyConfig";

const SettingsEncoder = ({ hardwareId }: { hardwareId: string }) => {
  return (
    <div className="flex flex-col gap-8 py-8 w-full items-center">
      <div className="flex flex-col gap-4">
        <span className="font-medium opacity-50">Click Down</span>
        <KeyConfig hardwareId={hardwareId} action="down" />
      </div>
      <div className="flex flex-col gap-4">
        <span className="font-medium opacity-50">Click Up</span>
        <KeyConfig hardwareId={hardwareId} action="up" />
      </div>
      <div className="flex flex-col gap-4">
        <span className="font-medium opacity-50">Rotate Right</span>
        <KeyConfig hardwareId={hardwareId} action="right" />
      </div>
      <div className="flex flex-col gap-4">
        <span className="font-medium opacity-50">Rotate Left</span>
        <KeyConfig hardwareId={hardwareId} action="left" />
      </div>
    </div>
  );
};

export default SettingsEncoder;
