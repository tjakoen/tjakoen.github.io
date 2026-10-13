export interface BuilderDraftRequirements {
  /** Copy must retain these supplied facts in the visible new blocks. */
  mustMention: string[][];
  /** Copy must not contain wording the brief explicitly forbids. */
  mustNotMention?: string[];
  /** Some requirements belong in a specific block field, not merely somewhere on the page. */
  mustMentionInField?: Record<string, string[][]>;
  /** The prompt should produce this many content blocks. */
  minimumBlocks: number;
}

export interface BuilderDraftField {
  block: string;
  field: string;
  value: string;
}

export function builderBlockKeyFromHeading(heading: string): string {
  const label = heading.split("·").at(-1)?.trim().toLowerCase() ?? "";
  return label === "intro" || label === "introduction" ? "lede" : label;
}

export function gradeBuilderDraft(
  requirements: BuilderDraftRequirements,
  draftText: string[],
  draftBlocks: number,
  draftFields: BuilderDraftField[] = [],
): string[] {
  const failures: string[] = [];
  if (draftBlocks < requirements.minimumBlocks)
    failures.push(`draft has ${draftBlocks} blocks, wanted at least ${requirements.minimumBlocks}`);

  const visibleCopy = draftText.join(" ").toLowerCase();
  for (const group of requirements.mustMention) {
    if (!group.some((value) => visibleCopy.includes(value.toLowerCase())))
      failures.push(`draft copy is missing any of [${group.join(", ")}]`);
  }

  for (const value of requirements.mustNotMention ?? []) {
    if (visibleCopy.includes(value.toLowerCase()))
      failures.push(`draft copy includes forbidden wording [${value}]`);
  }

  for (const [target, groups] of Object.entries(requirements.mustMentionInField ?? {})) {
    const [block, field] = target.split(".");
    const value = draftFields.filter((entry) => entry.block.toLowerCase() === block
      && entry.field.toLowerCase() === field).map((entry) => entry.value.toLowerCase()).join(" ");
    for (const group of groups) {
      if (!group.some((term) => value.includes(term.toLowerCase())))
        failures.push(`${target} is missing any of [${group.join(", ")}]`);
    }
  }

  return failures;
}
