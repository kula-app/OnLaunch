export enum FilterKind {
  SIMPLE = "simple",
  ADVANCED = "advanced",
}

export function displayTextForFilterKind(kind: FilterKind) {
  switch (kind) {
    case FilterKind.SIMPLE:
      return "Simple Filter";
    case FilterKind.ADVANCED:
      return "Advanced Filter";
  }
}
