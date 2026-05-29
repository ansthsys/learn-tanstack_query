import { useState, type SubmitEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/ui/button";
import { PageHeader } from "@/components/molecules/PageHeader";
import { UserForm } from "@/components/organisms/UserForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/atoms/ui/alert-dialog";
import {
  getUserById,
  updateUser,
  deleteUser,
  type CreateUserPayload,
} from "@/api/users";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import NotFound from "./NotFound";

const defaultValue: CreateUserPayload = {
  name: "",
  email: "",
  role: "viewer",
  active: false,
};

function UsersEditInner({ id }: { id: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ["users", id],
    queryFn: () => getUserById(id),
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [dirtyFields, setDirtyFields] = useState<Partial<CreateUserPayload>>(
    {},
  );

  const userForm: CreateUserPayload = {
    ...(userQuery.data ?? defaultValue),
    ...dirtyFields,
  };

  const updateMutation = useMutation({
    mutationKey: ["users", "update"],
    mutationFn: (payload: CreateUserPayload) => updateUser(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      void navigate("/");
    },
    onError: (error) => {
      alert("Error: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationKey: ["users", "delete"],
    mutationFn: () => deleteUser(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "none",
      });
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
    setDirtyFields((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const onSubmitForm = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateMutation.mutateAsync(userForm).catch((err) => {
      console.error("update error:", err);
    });
  };

  if (userQuery.isFetched && !userQuery.data) {
    return <NotFound />;
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <PageHeader
        title="Edit User"
        description={`Editing user #${id}`}
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
          isLoading={updateMutation.isPending}
          isDisabled={updateMutation.isPending}
          values={userForm}
          submitText="Update"
          onValuesChange={onValuesChange}
          onSubmitForm={onSubmitForm}
        />
      </div>

      <div className="flex gap-2">
        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
          <Trash2 />
          <span className="hidden sm:inline">Delete</span>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/">Cancel</Link>
        </Button>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {userForm.name}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function UsersEdit() {
  const { id } = useParams();
  if (!id) return <NotFound />;
  return <UsersEditInner key={id} id={id} />;
}

export default UsersEdit;
