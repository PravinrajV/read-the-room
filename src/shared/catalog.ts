import { promptIndexForDay } from './calendar';
import { getPromptById, getPromptByIndex, PROMPTS } from './prompts';
import type { Prompt } from './types';

export { getPromptById, getPromptByIndex, PROMPTS };

export function promptForDay(dayId: string): Prompt {
  return getPromptByIndex(promptIndexForDay(dayId, PROMPTS.length));
}

export function catalogSize(): number {
  return PROMPTS.length;
}
