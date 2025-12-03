export const buildFilterQuery = (model: any): string => {
  const filters: string[] = [];

  Object.keys(model).forEach((field) => {
    const condition = model[field];
    if (!condition) return;

    // ==========================
    // DATE FILTER
    // ==========================
    if (condition.filterType === "date") {
      const conds: string[] = [];

      const buildDateExpr = (cond: any): string | null => {
        if (!cond?.dateFrom) return null;
        const dateFrom = new Date(cond.dateFrom);

        const iso = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "Z");

        if (cond.type === "equals") {
          const startOfDay = new Date(
            Date.UTC(
              dateFrom.getUTCFullYear(),
              dateFrom.getUTCMonth(),
              dateFrom.getUTCDate(), 0, 0, 0
            )
          );
          const endOfDay = new Date(
            Date.UTC(
              dateFrom.getUTCFullYear(),
              dateFrom.getUTCMonth(),
              dateFrom.getUTCDate(), 23, 59, 59
            )
          );
          return `${field} ge ${iso(startOfDay)} and ${field} le ${iso(endOfDay)}`;

        } else if (cond.type === "greaterThan") {
          return `${field} gt ${iso(dateFrom)}`;

        } else if (cond.type === "lessThan") {
          return `${field} lt ${iso(dateFrom)}`;

        } else if (cond.type === "inRange" && cond.dateTo) {
          const dateTo = new Date(cond.dateTo);
          return `${field} ge ${iso(dateFrom)} and ${field} le ${iso(dateTo)}`;
        }

        return null;
      };

      const expr1 = buildDateExpr(condition.condition1 || condition);
      const expr2 = buildDateExpr(condition.condition2);

      if (expr1 && expr2) {
        const op = condition.operator === "OR" ? "or" : "and";
        conds.push(`(${expr1} ${op} ${expr2})`);
      } else if (expr1) {
        conds.push(expr1);
      }

      if (conds.length) filters.push(...conds);
    }

    // ==========================
    // TEXT FILTER
    // ==========================
    else if (condition.filterType === "text") {
      const value = condition.filter;
      const isNumericField = field === "@iot.id" || /^[0-9]+$/.test(value);

      if (condition.type === "equals") {
        filters.push(`${field} eq ${isNumericField ? value : `'${value}'`}`);
      } else if (condition.type === "contains") {
        if (isNumericField) {
          filters.push(`${field} eq ${value}`); // contains not valid for numeric
        } else {
          filters.push(`contains(${field}, '${value}')`);
        }
      } else if (condition.type === "startsWith") {
        if (isNumericField) {
          filters.push(`${field} eq ${value}`);
        } else {
          filters.push(`startswith(${field}, '${value}')`);
        }
      } else if (condition.type === "endsWith") {
        if (isNumericField) {
          filters.push(`${field} eq ${value}`);
        } else {
          filters.push(`endswith(${field}, '${value}')`);
        }
      }
    }

    // ==========================
    //  NUMBER FILTER
    // ==========================
    else if (condition.filterType === "number") {
      if (condition.type === "equals") {
        filters.push(`${field} eq ${condition.filter}`);
      } else if (condition.type === "greaterThan") {
        filters.push(`${field} gt ${condition.filter}`);
      } else if (condition.type === "lessThan") {
        filters.push(`${field} lt ${condition.filter}`);
      } else if (condition.type === "inRange" && condition.filterTo !== undefined) {
        filters.push(`${field} ge ${condition.filter} and ${field} le ${condition.filterTo}`);
      }
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


export const FilterQueryBuilder = (model: any): string => {
  const filters: string[] = [];

  Object.keys(model).forEach((field) => {
    const condition = model[field];
    if (!condition) return;

    const isNumericField = field === "id";


    if (condition.filterType === "date") {
      const conds: string[] = [];

      const toIso = (date: Date): string =>
        date.toISOString().replace(/\.\d{3}Z$/, "Z");

      const buildDateExpr = (cond: any): string | null => {
        if (!cond?.dateFrom) return null;

        const dateFrom = new Date(cond.dateFrom);

        if (cond.type === "equals") {
          const start = new Date(
            Date.UTC(
              dateFrom.getUTCFullYear(),
              dateFrom.getUTCMonth(),
              dateFrom.getUTCDate(),
              0, 0, 0
            )
          );
          const end = new Date(
            Date.UTC(
              dateFrom.getUTCFullYear(),
              dateFrom.getUTCMonth(),
              dateFrom.getUTCDate(),
              23, 59, 59
            )
          );
          return `${field} ge '${toIso(start)}' and ${field} le '${toIso(end)}'`;
        }

        if (cond.type === "greaterThan") {
          return `${field} gt '${toIso(dateFrom)}'`;
        }

        if (cond.type === "lessThan") {
          return `${field} lt '${toIso(dateFrom)}'`;
        }

        if (cond.type === "inRange" && cond.dateTo) {
          const dateTo = new Date(cond.dateTo);
          return `${field} ge '${toIso(dateFrom)}' and ${field} le '${toIso(dateTo)}'`;
        }

        return null;
      };

      const expr1 = buildDateExpr(condition.condition1 || condition);
      const expr2 = buildDateExpr(condition.condition2);

      if (expr1 && expr2) {
        const op = condition.operator === "OR" ? "or" : "and";
        filters.push(`(${expr1} ${op} ${expr2})`);
      } else if (expr1) {
        filters.push(expr1);
      }
    }

    else if (condition.filterType === "text") {
      const value = condition.filter;

      if (condition.type === "equals") {
        filters.push(`${field} eq '${value}'`);
      }

      if (condition.type === "contains") {
        filters.push(`contains(${field}, '${value}')`);
      }

      if (condition.type === "startsWith") {
        filters.push(`startswith(${field}, '${value}')`);
      }

      if (condition.type === "endsWith") {
        filters.push(`endswith(${field}, '${value}')`);
      }
    }


    else if (condition.filterType === "number" && isNumericField) {
      if (condition.type === "equals") {
        filters.push(`${field} eq ${condition.filter}`);
      }

      if (condition.type === "greaterThan") {
        filters.push(`${field} gt ${condition.filter}`);
      }

      if (condition.type === "lessThan") {
        filters.push(`${field} lt ${condition.filter}`);
      }

      if (
        condition.type === "inRange" &&
        condition.filterTo !== undefined
      ) {
        filters.push(
          `${field} ge ${condition.filter} and ${field} le ${condition.filterTo}`
        );
      }
    }
  });

  return filters.join(" and ");
};



export const SortQueryBuilder = (
  model: Array<{ colId: string; sort: "asc" | "desc" }>
): string => {
  if (!model || model.length === 0) return "";
  return model.map((s) => `${s.colId} ${s.sort}`).join(",");
};
