export interface RoomState {
  mentor: string | null;
  students: Set<string>;
  currentCode: string;
}

export interface JoinRoomPayload {
  roomId: string;
  initialCode: string;
}

export interface CodeUpdatePayload {
  roomId: string;
  code: string;
  solution: string;
}

export interface RoleAssignmentPayload {
  role: "mentor" | "student";
  code: string;
  studentCount?: number;
}
