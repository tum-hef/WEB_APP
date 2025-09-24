
export const buildFilterQuery = (model: any): string => {
  const filters: string[] = [];

  Object.keys(model).forEach((field) => {
    const condition = model[field];
    if (!condition) return;

    if (condition.filterType === "date") {
      const date = new Date(condition.dateFrom);
      const formatted = date.toISOString(); // e.g. 2025-09-23T12:00:00Z

      if (condition.type === "equals") {
        filters.push(`${field} eq ${formatted}`);
      } else if (condition.type === "greaterThan") {
        filters.push(`${field} gt ${formatted}`);
      } else if (condition.type === "lessThan") {
        filters.push(`${field} lt ${formatted}`);
      } else if (condition.type === "inRange") {
        const dateTo = new Date(condition.dateTo).toISOString();
        filters.push(`${field} ge ${formatted} and ${field} le ${dateTo}`);
      }
    } else {
      // fallback for text/numeric fields
      filters.push(`${field} eq '${condition.filter}'`);
    }
  });

  return filters.join(" and ");
};

export const buildSortQuery = (
  model: Array<{ colId: string; sort: "asc" | "desc" }>
): string => {
  if (model.length === 0) return "";
  return model.map((s) => `${s.colId} ${s.sort}`).join(",");
};
