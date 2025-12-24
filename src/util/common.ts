export function getPreviousPhaseAndDate(phaseCount, dateStr, phase) {
  const date = new Date(dateStr);
  let newDate = new Date(date);
  let newPhase;

  if (phaseCount === "1") {
    newPhase = phase;
    newDate.setDate(date.getDate() - 1);
  } else if (phase === "2") {
    // Evening → same date, morning
    newPhase = "1";
  } else if (phase === "1") {
    // Morning → previous day, evening
    newDate.setDate(date.getDate() - 1);
    newPhase = "2";
  } else {
    throw new Error('Invalid phase. Must be "morning" or "evening".');
  }

  // Format back to YYYY-MM-DD
  const formattedDate = newDate.toISOString().split("T")[0];

  return { date: formattedDate, phase: newPhase };
}

export function getPhase(phaseCount, phaseId) {
  if (phaseCount > "1") {
    if (phaseId === "1") {
      return "2";
    } else {
      return "1";
    }
  } else {
    return phaseId;
  }
}

export function reponseGenerator(name: String, id: number, status: String) {
  if (status === "ACTIVE" && !id) {
    return `${name} saved successfully`;
  } else if (status === "ACTIVE" && id) {
    return `${name} updated successfully`;
  } else if (status === "INACTIVE" || status === "DELETE") {
    return `${name} deleted successfully`;
  }
}
