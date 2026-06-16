-- ================================================================
-- LEARNIX — Migration: Invites + Groups
-- ================================================================

CREATE TABLE IF NOT EXISTS invites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token       TEXT UNIQUE NOT NULL DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  teacher_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id    UUID,
  email       TEXT,
  used_at     TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  teacher_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program_id  UUID REFERENCES programs(id),
  language    TEXT NOT NULL DEFAULT 'english',
  level       TEXT NOT NULL DEFAULT 'B1',
  max_students INT DEFAULT 8,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS group_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  student_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, student_id)
);

-- RLS
ALTER TABLE invites       ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups        ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Invites: teacher manages own invites, anyone can read by token (for signup)
CREATE POLICY "invites_teacher" ON invites FOR ALL
  USING (teacher_id = auth.uid());

CREATE POLICY "invites_public_read" ON invites FOR SELECT
  USING (true);

-- Groups: teacher manages own groups
CREATE POLICY "groups_teacher" ON groups FOR ALL
  USING (teacher_id = auth.uid());

-- Students can see groups they belong to
CREATE POLICY "groups_member_read" ON groups FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM group_members gm WHERE gm.group_id = groups.id AND gm.student_id = auth.uid()
  ));

-- Group members: teacher manages, student sees own
CREATE POLICY "group_members_teacher" ON group_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM groups g WHERE g.id = group_members.group_id AND g.teacher_id = auth.uid()
  ));

CREATE POLICY "group_members_self" ON group_members FOR SELECT
  USING (student_id = auth.uid());

-- Update student_profiles to link group
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id);
