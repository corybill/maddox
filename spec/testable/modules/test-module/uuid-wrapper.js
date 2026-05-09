import { v4 as uuidv4 } from 'uuid';

/** Plain object so Sinon can stub `v4` (ES module namespace exports from `uuid` cannot be stubbed). */
export default { v4: uuidv4 };
