import { type SubmitEvent } from "react";
import type { CreateUserPayload, RoleEnum } from "@/api/users";
import { Input } from "@/components/atoms/ui/input";
import { Label } from "@/components/atoms/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/ui/select";
import { Checkbox } from "@/components/atoms/ui/checkbox";
import { Button } from "@/components/atoms/ui/button";
import { LoaderIcon } from "lucide-react";

type UserFormProps = {
  isLoading?: boolean;
  isDisabled?: boolean;
  values: CreateUserPayload;
  submitText?: string;
  onValuesChange: <K extends keyof CreateUserPayload>(
    field: K,
    value: CreateUserPayload[K],
  ) => void;
  onSubmitForm: (e: SubmitEvent<HTMLFormElement>) => void | Promise<void>;
};

function UserForm({
  isLoading,
  isDisabled,
  values,
  submitText = "Submit",
  onValuesChange,
  onSubmitForm,
}: UserFormProps) {
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => void onSubmitForm(e)}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="John Doe"
          value={values.name}
          onChange={(e) => onValuesChange("name", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          placeholder="john@mail.com"
          type="email"
          value={values.email}
          onChange={(e) => onValuesChange("email", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={values.role}
          onValueChange={(val) => onValuesChange("role", val as RoleEnum)}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Checkbox
          id="active"
          checked={values.active}
          onCheckedChange={(val) => onValuesChange("active", val === true)}
        />
        <Label htmlFor="active">Active</Label>
      </div>

      <Button type="submit" disabled={isDisabled || isLoading}>
        {isLoading && <LoaderIcon className="animate-spin" />}
        <span>{isLoading ? "Loading" : submitText}</span>
      </Button>
    </form>
  );
}

export { UserForm };
