
export const buildFilterQuery = (model: any): string => {
  const filters: string[] = [];

  Object.keys(model).forEach((col) => {
    const filter = model[col];
    if (filter.filterType === "text") {
      if (filter.type === "contains") {
        filters.push(`substringof('${filter.filter}', ${col})`);
      } else if (filter.type === "equals") {
        filters.push(`${col} eq '${filter.filter}'`);
      } else if (filter.type === "startsWith") {
        filters.push(`startswith(${col},'${filter.filter}')`);
      } else if (filter.type === "endsWith") {
        filters.push(`endswith(${col},'${filter.filter}')`);
      }
    }
  });

  return filters.length > 0 ? filters.join(" and ") : "";
};

export const buildSortQuery = (
  model: Array<{ colId: string; sort: "asc" | "desc" }>
): string => {
  if (model.length === 0) return "";
  return model.map((s) => `${s.colId} ${s.sort}`).join(",");
};
