/**
 * Toggles "Day Went Sideways" recovery mode.
 * Non-essential, unchecked, skippable tasks move to tomorrow.
 * Toggling again (Restore Full Day) brings them back.
 */
export function applySideways(state) {
  if (state.sideways) {
    return {
      ...state,
      sideways: false,
      timeline: state.timeline.map((b) => ({ ...b, movedToTomorrow: false })),
    };
  }

  return {
    ...state,
    sideways: true,
    timeline: state.timeline.map((b) => {
      if (b.checked) return b;
      const essential = b.priority === "high" || !b.skippable;
      return essential ? b : { ...b, movedToTomorrow: true };
    }),
  };
}
