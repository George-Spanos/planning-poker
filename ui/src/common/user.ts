export interface User {
  voted: boolean;
  points?: number;
  username: string;
}

export type SortOrder = "none" | "asc" | "desc";

// Sort voters by their revealed points. Voters who haven't voted
// (undefined points) sink to the bottom; ties break alphabetically.
export function sortVoters(users: User[], order: Exclude<SortOrder, "none">): User[] {
  return [...users].sort((a, b) => {
    if (a.points === undefined && b.points === undefined) {
      return a.username.localeCompare(b.username);
    }
    if (a.points === undefined) return 1;
    if (b.points === undefined) return -1;
    if (a.points !== b.points) {
      return order === "asc" ? a.points - b.points : b.points - a.points;
    }
    return a.username.localeCompare(b.username);
  });
}
