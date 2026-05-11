import type { ActionFunctionArgs } from 'react-router';
import SettingsPage from './settings/SettingsPage';

export async function loader() {
  return { draft: '' };
}

/**
 * Save intent: echoes note back (tests replace via stub for UI-only assertions).
 */
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');
  if (intent !== 'save') {
    return { ok: false, message: 'Unknown intent' };
  }
  const note = String(formData.get('note') ?? '');
  return { ok: true, savedNote: note };
}

export default SettingsPage;
