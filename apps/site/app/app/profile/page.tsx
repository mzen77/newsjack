import { requireUser } from "../../../lib/auth";
import { getCompanyProfile } from "../../../lib/saas-data";
import { AppShell } from "../app-shell";
import { saveProfileAction } from "../actions";

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getCompanyProfile(user.id);

  return (
    <AppShell user={user}>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold">Company profile</h1>
        <p className="mt-2 text-zinc-400">
          This is the explicit, user-owned context used by workflows. The app
          does not learn or persist inferred topics.
        </p>
        <form action={saveProfileAction} className="mt-8 space-y-5">
          <Field
            defaultValue={profile?.companyName}
            label="Company name"
            name="companyName"
          />
          <Field
            defaultValue={profile?.description}
            label="What the company does"
            multiline
            name="description"
          />
          <Field
            defaultValue={profile?.standing}
            label="Standing"
            multiline
            name="standing"
            help="Why this company or its named experts can credibly speak."
          />
          <Field
            defaultValue={profile?.beatTopics.join(", ")}
            label="Beat topics"
            name="beatTopics"
            help="Comma-separated; prefer 6–8 focused topics."
          />
          <button
            className="rounded-lg bg-emerald-300 px-5 py-2.5 font-semibold text-zinc-950"
            type="submit"
          >
            Save profile
          </button>
        </form>
      </div>
    </AppShell>
  );
}

function Field({
  defaultValue,
  help,
  label,
  multiline,
  name,
}: {
  defaultValue?: string;
  help?: string;
  label: string;
  multiline?: boolean;
  name: string;
}) {
  const className =
    "mt-2 w-full rounded-lg border border-white/15 bg-black px-3 py-2.5 outline-none focus:border-emerald-300";
  return (
    <label className="block text-sm font-medium">
      {label}
      {multiline ? (
        <textarea
          className={className}
          defaultValue={defaultValue}
          name={name}
          required
          rows={4}
        />
      ) : (
        <input
          className={className}
          defaultValue={defaultValue}
          name={name}
          required
          type="text"
        />
      )}
      {help && (
        <span className="mt-1 block text-xs font-normal text-zinc-500">
          {help}
        </span>
      )}
    </label>
  );
}
