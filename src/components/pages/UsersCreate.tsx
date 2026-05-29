import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/atoms/ui/button";
import { PageHeader } from "@/components/molecules/PageHeader";
import { UserForm } from "@/components/organisms/UserForm";
import { createUser, type CreateUserPayload } from "@/api/users";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const defaultValue: CreateUserPayload = {
  name: "",
  email: "",
  role: "viewer",
  active: false,
};

function UsersCreate() {
  const [userForm, setUserForm] = useState<CreateUserPayload>(defaultValue);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationKey: ["users", "create"],
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      setUserForm(defaultValue);
      void navigate("/");
    },
    onError: (error) => {
      alert("Error: " + error.message);
    },
  });

  const onValuesChange = <K extends keyof CreateUserPayload>(
    key: K,
    value: CreateUserPayload[K],
  ) => {
    setUserForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validateForm = (payload: CreateUserPayload) => {
    if (!payload.email || !payload.name) return true;
    return false;
  };

  const onSubmitForm = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm(userForm)) return;
    createMutation.mutate(userForm);
  };

  return (
    <div className="flex flex-col gap-6 py-8">
      <PageHeader
        title="Create User"
        description="Add a new user to the system"
        action={
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </Button>
        }
      />

      <div className="max-w-md">
        <UserForm
          isLoading={createMutation.isPending}
          isDisabled={createMutation.isPending}
          values={userForm}
          submitText="Create"
          onValuesChange={onValuesChange}
          onSubmitForm={onSubmitForm}
        />
      </div>
    </div>
  );
}

export default UsersCreate;
