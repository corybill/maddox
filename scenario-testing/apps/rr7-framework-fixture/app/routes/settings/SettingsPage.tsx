import { Form, useActionData, useLoaderData } from 'react-router';

export type SettingsLoaderData = {
  /** Initial draft shown in the form (loader-only). */
  draft: string;
};

export type SettingsActionData = {
  ok?: boolean;
  savedNote?: string;
  message?: string;
};

/**
 * Minimal save flow: POST with `intent=save`. Action return is read via {@link useActionData}.
 * Loader data is unchanged unless you add revalidation in the route module (not used here).
 */
export default function SettingsPage() {
  const { draft } = useLoaderData() as SettingsLoaderData;
  const actionData = useActionData() as SettingsActionData | undefined;

  return (
    <main data-testid="settings-page">
      <h1>Settings</h1>

      <Form method="post" data-testid="settings-save-form">
        <input type="hidden" name="intent" value="save" />
        <label htmlFor="settings-note">Note</label>
        <textarea
          id="settings-note"
          name="note"
          data-testid="settings-note"
          defaultValue={draft}
          rows={3}
        />
        <button type="submit">Save</button>
      </Form>

      {actionData?.ok ? (
        <p data-testid="settings-saved-banner">{actionData.savedNote}</p>
      ) : null}
      {actionData?.message ? (
        <p role="alert" data-testid="settings-error">
          {actionData.message}
        </p>
      ) : null}
    </main>
  );
}
