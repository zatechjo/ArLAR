"use client";

import { Check, Clock3, Plus, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createAdministratorAction,
  type AccessActionState,
} from "@/app/(admin)/admin/(panel)/access/actions";
import {
  AdminSearchField,
  AdminSelect,
  StatusPill,
} from "@/components/admin/admin-ui";
import { AdminPendingOverlay } from "@/components/admin/admin-pending-overlay";
import {
  accessPermissionDefinitions,
  roleDefaultPermissions,
  roleLabels,
  type AdminAccessAuditEntry,
  type AdminAccessUser,
  type AdminPermission,
  type AdminRole,
} from "@/lib/access-control-types";
import { useModalAccessibility } from "@/components/ui/use-modal-accessibility";

export function AccessManager({
  users,
  activity,
}: {
  users: AdminAccessUser[];
  activity: AdminAccessAuditEntry[];
}) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const filtered = useMemo(
    () =>
      users.filter(
        (user) =>
          (role === "all" || user.role === role) &&
          (status === "all" || user.status === status) &&
          (!deferredQuery ||
            `${user.name} ${user.email} ${roleLabels[user.role]}`
              .toLowerCase()
              .includes(deferredQuery)),
      ),
    [deferredQuery, role, status, users],
  );

  return (
    <>
      <div className="rounded-2xl border border-crimson-100 bg-crimson-50 p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-crimson-600 ring-1 ring-crimson-100">
            <ShieldCheck size={19} />
          </span>
          <div>
            <p className="text-sm font-semibold text-crimson-900">
              Protected owner workspace
            </p>
            <p className="mt-1 max-w-4xl text-xs leading-5 text-crimson-800/75">
              Only <strong>admin@arabrheumatology.org</strong> may create
              administrators, change permissions, suspend access, or remove
              accounts. Supabase enforces this rule at the session and
              database-policy levels when authentication is connected.
            </p>
          </div>
        </div>
      </div>

      <section className="mt-5 overflow-hidden rounded-2xl border border-[#e1e5e9] bg-white">
        <div className="flex flex-col justify-between gap-4 border-b border-[#edf0f2] p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-semibold tracking-[-0.02em] text-ink-950">
              People with access
            </h2>
            <p className="mt-1 text-xs text-ink-400">
              {users.length} administrator{users.length === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-crimson-600 px-4 text-sm font-semibold text-white transition hover:bg-crimson-700"
          >
            <Plus size={15} />
            Add administrator
          </button>
        </div>
        <div className="flex flex-col gap-3 border-b border-[#edf0f2] bg-[#fafbfb] p-4 lg:flex-row">
          <AdminSearchField
            value={query}
            onChange={setQuery}
            placeholder="Search administrators…"
          />
          <AdminSelect label="Role" value={role} onChange={setRole}>
            <option value="all">All roles</option>
            <option value="owner">Owner</option>
            <option value="editor">Editor</option>
            <option value="contributor">Contributor</option>
          </AdminSelect>
          <AdminSelect
            label="Access status"
            value={status}
            onChange={setStatus}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="invited">Invited</option>
            <option value="suspended">Suspended</option>
          </AdminSelect>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              <tr>
                <th className="px-5 py-3">Administrator</th>
                <th className="w-32 px-4 py-3">Role</th>
                <th className="w-40 px-4 py-3">Permissions</th>
                <th className="w-40 px-4 py-3">Last active</th>
                <th className="w-32 px-4 py-3">Status</th>
                <th className="w-28 px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((user) => (
                <tr key={user.id} className="transition hover:bg-slate-50/60">
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/access/${user.id}`}
                      className="group flex min-w-0 items-center gap-3"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#071421] text-xs font-bold text-white">
                        {initials(user.name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-slate-800 group-hover:text-crimson-700">
                          {user.name}
                        </span>
                        <span className="mt-1 block truncate text-xs text-slate-400">
                          {user.email}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <StatusPill
                      tone={
                        user.role === "owner"
                          ? "red"
                          : user.role === "editor"
                            ? "blue"
                            : "neutral"
                      }
                    >
                      {roleLabels[user.role]}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-500">
                    {user.role === "owner"
                      ? "Full access"
                      : `${user.permissions.length} modules`}
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-500">
                    {user.lastActiveAt
                      ? relativeDate(user.lastActiveAt)
                      : user.status === "invited"
                        ? "Invitation pending"
                        : "No activity"}
                  </td>
                  <td className="px-4 py-4">
                    <AccessStatus status={user.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end">
                      <Link
                        href={`/admin/access/${user.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#071421] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#142535]"
                      >
                        Manage
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-ink-700">
              No administrators match these filters
            </p>
            <p className="mt-2 text-xs text-ink-400">
              Try another name, role, or access status.
            </p>
          </div>
        ) : null}
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.15fr]">
        <RoleGuide />
        <section className="overflow-hidden rounded-2xl border border-[#e1e5e9] bg-white">
          <div className="border-b border-[#edf0f2] px-5 py-4">
            <h2 className="text-base font-semibold tracking-[-0.02em] text-ink-950">
              Recent access activity
            </h2>
            <p className="mt-1 text-xs text-ink-400">
              Changes made from this owner workspace.
            </p>
          </div>
          {activity.length ? (
            <div className="divide-y divide-ink-100">
              {activity.slice(0, 8).map((entry) => (
                <div key={entry.id} className="flex gap-3 px-5 py-4">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-ink-50 text-ink-400">
                    <Clock3 size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-ink-800">
                        {entry.action}
                      </p>
                      <time className="text-[10px] text-ink-400">
                        {relativeDate(entry.createdAt)}
                      </time>
                    </div>
                    <p className="mt-1 truncate text-[11px] text-crimson-700">
                      {entry.targetEmail}
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-ink-400">
                      {entry.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-14 text-center text-xs text-ink-400">
              Access changes will be recorded here.
            </div>
          )}
        </section>
      </div>

      {inviteOpen ? (
        <InviteAdministratorDialog onClose={() => setInviteOpen(false)} />
      ) : null}
    </>
  );
}

function InviteAdministratorDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [role, setRole] = useState<Exclude<AdminRole, "owner">>("editor");
  const [permissions, setPermissions] = useState<AdminPermission[]>(
    roleDefaultPermissions.editor,
  );
  const [state, formAction, pending] = useActionState<
    AccessActionState,
    FormData
  >(createAdministratorAction, { success: false, message: "" });
  const modalRef = useModalAccessibility<HTMLDivElement>({ onClose });

  useEffect(() => {
    if (!state.success) return;
    router.refresh();
  }, [router, state.success]);

  function chooseRole(nextRole: Exclude<AdminRole, "owner">) {
    setRole(nextRole);
    setPermissions(roleDefaultPermissions[nextRole]);
  }
  function togglePermission(permission: AdminPermission) {
    setPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission],
    );
  }

  return (
    <div
      className="fixed inset-0 z-[220] grid place-items-center overflow-y-auto bg-[#03101c]/65 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <AdminPendingOverlay visible={pending} label="Creating administrator…" />
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-admin-title"
        className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_30px_100px_rgba(0,0,0,.3)]"
      >
        <div className="flex items-start justify-between border-b border-ink-100 px-6 py-5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-crimson-600">
              Access control
            </p>
            <h2
              id="create-admin-title"
              className="mt-2 text-xl font-semibold tracking-[-0.025em] text-ink-950"
            >
              Add an administrator
            </h2>
            <p className="mt-1 text-xs text-ink-400">
              Create an active account, assign its password, and choose exactly
              what this person can manage.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close administrator dialog"
            className="grid size-9 cursor-pointer place-items-center rounded-lg bg-ink-50 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
          >
            <X size={16} />
          </button>
        </div>
        <form action={formAction}>
          <div className="max-h-[65vh] space-y-6 overflow-y-auto p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <input
                  name="name"
                  required
                  placeholder="Administrator’s name"
                  className="admin-input"
                />
              </Field>
              <Field label="Email address">
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="off"
                  placeholder="name@example.com"
                  className="admin-input"
                />
              </Field>
              <Field label="Password">
                <input
                  name="password"
                  type="password"
                  minLength={10}
                  required
                  autoComplete="new-password"
                  placeholder="At least 10 characters"
                  className="admin-input"
                />
              </Field>
              <Field label="Confirm password">
                <input
                  name="password_confirmation"
                  type="password"
                  minLength={10}
                  required
                  autoComplete="new-password"
                  placeholder="Repeat the password"
                  className="admin-input"
                />
              </Field>
            </div>
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] leading-5 text-amber-900">
              No invitation email will be sent. Share this password securely;
              the administrator can use it to sign in immediately.
            </p>
            <Field label="Role">
              <div className="grid gap-3 sm:grid-cols-2">
                {(["editor", "contributor"] as const).map((item) => (
                  <label
                    key={item}
                    className={`cursor-pointer rounded-xl border p-4 transition ${role === item ? "border-crimson-300 bg-crimson-50/60" : "border-ink-150 hover:border-ink-300"}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={item}
                      checked={role === item}
                      onChange={() => chooseRole(item)}
                      className="sr-only"
                    />
                    <span className="text-sm font-semibold text-ink-900">
                      {roleLabels[item]}
                    </span>
                    <span className="mt-1 block text-[11px] leading-5 text-ink-500">
                      {item === "editor"
                        ? "Can edit and publish within assigned modules."
                        : "Can prepare content within assigned modules for review."}
                    </span>
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Module permissions">
              <div className="grid gap-2 sm:grid-cols-2">
                {accessPermissionDefinitions
                  .filter((permission) => permission.id !== "access")
                  .map((permission) => (
                    <label
                      key={permission.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${permissions.includes(permission.id) ? "border-jade-200 bg-jade-50/60" : "border-ink-100"}`}
                    >
                      <input
                        type="checkbox"
                        name="permissions"
                        value={permission.id}
                        checked={permissions.includes(permission.id)}
                        onChange={() => togglePermission(permission.id)}
                        className="mt-0.5 size-4 accent-jade-600"
                      />
                      <span>
                        <span className="block text-xs font-semibold text-ink-800">
                          {permission.label}
                        </span>
                        <span className="mt-0.5 block text-[10px] leading-4 text-ink-400">
                          {permission.description}
                        </span>
                      </span>
                    </label>
                  ))}
              </div>
            </Field>
            {state.message ? (
              <p
                aria-live="polite"
                className={`rounded-xl border px-4 py-3 text-xs ${state.success ? "border-jade-200 bg-jade-50 text-jade-800" : "border-crimson-200 bg-crimson-50 text-crimson-800"}`}
              >
                {state.message}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap justify-end gap-2 border-t border-ink-100 bg-[#fafbfb] p-4">
            <button
              type="button"
              onClick={onClose}
              className="min-h-10 cursor-pointer rounded-xl border border-ink-200 bg-white px-4 text-xs font-semibold text-ink-700 hover:bg-ink-50"
            >
              Cancel
            </button>
            {state.success && state.userId ? (
              <Link
                href={`/admin/access/${state.userId}`}
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#071421] px-4 text-xs font-semibold text-white"
              >
                Manage administrator
              </Link>
            ) : (
              <button
                type="submit"
                disabled={pending || permissions.length === 0}
                className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-crimson-600 px-4 text-xs font-semibold text-white hover:bg-crimson-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check size={14} />
                {pending ? "Creating…" : "Create administrator"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function RoleGuide() {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#e1e5e9] bg-white">
      <div className="border-b border-[#edf0f2] px-5 py-4">
        <h2 className="text-base font-semibold tracking-[-0.02em] text-ink-950">
          Role guide
        </h2>
        <p className="mt-1 text-xs text-ink-400">
          Roles define capability; module permissions define scope.
        </p>
      </div>
      <div className="divide-y divide-ink-100">
        {[
          {
            role: "Owner",
            note: "Full control, including administrator access. Reserved for the primary account.",
          },
          {
            role: "Editor",
            note: "Can edit and publish content within assigned modules.",
          },
          {
            role: "Contributor",
            note: "Can prepare content within assigned modules for editorial review.",
          },
        ].map((item) => (
          <div key={item.role} className="px-5 py-4">
            <p className="text-sm font-semibold text-ink-900">{item.role}</p>
            <p className="mt-1 text-xs leading-5 text-ink-500">{item.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-ink-700">
        {label}
      </span>
      {children}
    </label>
  );
}
function AccessStatus({ status }: { status: AdminAccessUser["status"] }) {
  return (
    <StatusPill
      tone={
        status === "active" ? "green" : status === "invited" ? "amber" : "red"
      }
    >
      {status === "active"
        ? "Active"
        : status === "invited"
          ? "Invited"
          : "Suspended"}
    </StatusPill>
  );
}
function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
function relativeDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "Not available";
  const days = Math.floor((Date.now() - date.valueOf()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
