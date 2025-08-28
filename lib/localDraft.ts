import { get, set, del, keys } from 'idb-keyval';
import { PromptInput } from './promptSchema';

export interface LocalDraft {
  key: string;
  data: PromptInput;
  lastModified: Date;
  isDirty: boolean;
}

const DRAFT_PREFIX = 'prompt-draft:';

// Get draft key for IndexedDB
function getDraftKey(promptKey: string): string {
  return `${DRAFT_PREFIX}${promptKey}`;
}

// Save draft to IndexedDB
export async function saveDraft(promptKey: string, data: PromptInput): Promise<void> {
  const draft: LocalDraft = {
    key: promptKey,
    data,
    lastModified: new Date(),
    isDirty: true,
  };

  await set(getDraftKey(promptKey), draft);
}

// Load draft from IndexedDB
export async function loadDraft(promptKey: string): Promise<LocalDraft | null> {
  try {
    const draft = await get<LocalDraft>(getDraftKey(promptKey));
    return draft || null;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
}

// Delete draft from IndexedDB
export async function deleteDraft(promptKey: string): Promise<void> {
  await del(getDraftKey(promptKey));
}

// Mark draft as clean (not dirty)
export async function markDraftClean(promptKey: string): Promise<void> {
  const draft = await loadDraft(promptKey);
  if (draft) {
    draft.isDirty = false;
    await set(getDraftKey(promptKey), draft);
  }
}

// Get all draft keys
export async function getAllDraftKeys(): Promise<string[]> {
  try {
    const allKeys = await keys();
    const draftKeys = allKeys
      .filter(key => typeof key === 'string' && key.startsWith(DRAFT_PREFIX))
      .map(key => (key as string).replace(DRAFT_PREFIX, ''));
    return draftKeys;
  } catch (error) {
    console.error('Failed to get draft keys:', error);
    return [];
  }
}

// Get all drafts
export async function getAllDrafts(): Promise<LocalDraft[]> {
  const draftKeys = await getAllDraftKeys();
  const drafts: LocalDraft[] = [];

  for (const key of draftKeys) {
    const draft = await loadDraft(key);
    if (draft) {
      drafts.push(draft);
    }
  }

  return drafts.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
}

// Clear all drafts
export async function clearAllDrafts(): Promise<void> {
  const draftKeys = await getAllDraftKeys();
  
  for (const key of draftKeys) {
    await deleteDraft(key);
  }
}

// Check if draft exists and is dirty
export async function hasDirtyDraft(promptKey: string): Promise<boolean> {
  const draft = await loadDraft(promptKey);
  return draft?.isDirty || false;
}

