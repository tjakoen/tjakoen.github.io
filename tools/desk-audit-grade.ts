export interface BuilderDraftRequirements {
  /** Copy must retain these supplied facts in the visible new blocks. */
  mustMention: string[][];
  /** Copy must not contain wording the brief explicitly forbids. */
  mustNotMention?: string[];
  /** Some requirements belong in a specific block field, not merely somewhere on the page. */
  mustMentionInField?: Record<string, string[][]>;
  /** Some visitor-facing forms need a complete, readable result, not just a keyword match. */
  mustEqualInField?: Record<string, string[]>;
  /** Repeated fields, in block order, must each retain wording from their own source phrase. */
  mustContainInFieldOccurrences?: Record<string, string[][][]>;
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

  for (const [target, alternatives] of Object.entries(requirements.mustEqualInField ?? {})) {
    const [block, field] = target.split(".");
    const value = draftFields.find((entry) => entry.block.toLowerCase() === block
      && entry.field.toLowerCase() === field)?.value.trim().toLocaleLowerCase();
    if (!value || !alternatives.some((expected) => value === expected.trim().toLocaleLowerCase()))
      failures.push(`${target} did not match an expected complete value`);
  }

  for (const [target, occurrences] of Object.entries(requirements.mustContainInFieldOccurrences ?? {})) {
    const [block, field] = target.split(".");
    const values = draftFields.filter((entry) => entry.block.toLowerCase() === block
      && entry.field.toLowerCase() === field).map((entry) => entry.value.toLowerCase());
    if (values.length !== occurrences.length)
      failures.push(`${target} appeared ${values.length} times, wanted ${occurrences.length}`);
    for (const [index, groups] of occurrences.entries()) {
      const value = values[index] ?? "";
      for (const group of groups) {
        if (!group.some((term) => value.includes(term.toLowerCase())))
          failures.push(`${target}[${index}] is missing any of [${group.join(", ")}]`);
      }
    }
  }

  return failures;
}
