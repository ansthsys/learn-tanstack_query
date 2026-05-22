import { useState } from "react";
import type { User } from "@/api/users";
import { Table, type Column } from "../molecules/Table";
import { Pagination } from "../molecules/Pagination";
import { Badge } from "../atoms/Badge";

const PAGE_SIZE = 5;

const columns: Column<User>[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  {
    key: "role",
    label: "Role",
    render: (user) => {
      return <Badge variant="secondary">{user.role}</Badge>;
    },
  },
  {
    key: "active",
    label: "Status",
    render: (user) => {
      return user.active ? (
        <Badge variant="info">Active</Badge>
      ) : (
        <Badge variant="error">Inactive</Badge>
      );
    },
  },
];

type UserTableProps = {
  data: User[];
  isLoading: boolean;
};

function UserTable({ data, isLoading }: UserTableProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const paginated = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <Table
        columns={columns}
        data={paginated}
        isLoading={isLoading}
        emptyMessage="No users found"
        emptyDescription="Create a user to get started"
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

export { UserTable };
