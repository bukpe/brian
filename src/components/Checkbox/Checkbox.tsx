type CheckboxType = {
  id: string;
  isChecked: boolean;
  name: string;
  onChange(): void;
};

export const Checkbox = ({ id, isChecked, name, onChange }: CheckboxType) => {
  return <input type="checkbox" name={name} id={id} onChange={onChange} checked={isChecked} />;
};
