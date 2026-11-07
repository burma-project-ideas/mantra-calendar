import { Alert, Label, ListBox, Select } from "@heroui/react";
import { CircleCheck, TriangleAlert } from "lucide-react";

export function Notice({
  children,
  error = false,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <Alert
      status={error ? "danger" : "success"}
      role={error ? "alert" : "status"}
      className="notice"
    >
      <Alert.Indicator>
        {error ? <TriangleAlert size={18} /> : <CircleCheck size={18} />}
      </Alert.Indicator>
      <Alert.Content>
        <Alert.Description>{children}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
}
export function Choice({
  label,
  value,
  items,
  onChange,
  disabled = false,
  id,
}: {
  label: string;
  value: string | null;
  items: { id: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
}) {
  return (
    <Select
      aria-label={label}
      value={value}
      onChange={(key) => {
        if (key !== null) onChange(String(key));
      }}
      isDisabled={disabled || !items.length}
      className="journal-select"
      id={id}
    >
      <Label>{label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {items.map((item) => (
            <ListBox.Item key={item.id} id={item.id} textValue={item.label}>
              <Label>{item.label}</Label>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="empty-state">
      <img src="/brand/logo.png" alt="" width="52" height="52" />
      <p>{children}</p>
    </div>
  );
}
