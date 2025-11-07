import { useCallback, useEffect, useState } from "react";
import { userService, type User } from "../../../services/userService";

export interface UseUsersReturn {
  data: User[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
}

export const useUsers = (
  userObj: { id: number; agencyId: number } | null
): UseUsersReturn => {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!userObj?.agencyId) return;
    try {
      setLoading(true);
      const users = await userService.getUsers(userObj.agencyId);

      // ✅ Filter out the current user
      const filteredUsers = users.filter((u) => u.id !== userObj.id);

      setData(filteredUsers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [userObj]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { data, loading, fetchUsers };
};
