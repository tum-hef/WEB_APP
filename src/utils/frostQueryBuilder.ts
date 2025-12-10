export const buildFilterQuery = (model: any): string => {
  const filters: string[] = [];

  Object.keys(model).forEach((field) => {
    const condition = model[field];
    if (!condition) return;

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


export const FilterQueryBuilderV2 = (model: any): string => {
  const filters: string[] = [];

  Object.keys(model).forEach((field) => {
    const condition = model[field];
    if (!condition) return;

    const isNumericField = field === "id";

    if (condition?.filterType === "date") {
  console.log("Processing date filter for field:", field, "with condition:", condition);

  // 1) Safe parser for AG-Grid inputs
  const toDate = (input: any): Date | null => {
    if (!input) return null;

    // Already a Date object
    if (input instanceof Date) {
      if (isNaN(input.getTime())) return null;
      return input;
    }

    // AG Grid often provides string like "2025-12-05 21:30:18"
    if (typeof input === "string") {
      const parsed = new Date(input.replace(" ", "T"));
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    return null;
  };

  // 2) Convert JS Date → backend SQL datetime
  const toSql = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  };

  // 3) Build expressions for equals / greaterThan / lessThan / inRange
  const buildExpr = (cond: any): string | null => {
    if (!cond) return null;

    const dateFrom = toDate(cond.dateFrom);
    const dateTo = toDate(cond.dateTo);

    // ---- EQUALS ----
    if (cond.type === "equals") {
      if (!dateFrom) return null;
      return `${field} eq '${toSql(dateFrom)}'`;
    }

    // ---- GREATER THAN ----
    if (cond.type === "greaterThan") {
      if (!dateFrom) return null;
      return `${field} gt '${toSql(dateFrom)}'`;
    }

    // ---- LESS THAN ----
    if (cond.type === "lessThan") {
      if (!dateFrom) return null;
      return `${field} lt '${toSql(dateFrom)}'`;
    }

    // ---- IN RANGE ----
    if (cond.type === "inRange") {
      if (!dateFrom && !dateTo) return null;

      // Only FROM → >=
      if (dateFrom && !dateTo) {
        return `${field} ge '${toSql(dateFrom)}'`;
      }

      // Only TO → <=
      if (!dateFrom && dateTo) {
        return `${field} le '${toSql(dateTo)}'`;
      }

      // Both given → VALIDATE
      if (dateFrom && dateTo) {
        if (dateFrom > dateTo) {
          return "__INVALID_RANGE__";
        }

        return `${field} ge '${toSql(dateFrom)}' and ${field} le '${toSql(dateTo)}'`;
      }
    }

    return null;
  };

  // Handle AG-Grid condition1/condition2 structure
  const expr1 = buildExpr(condition.condition1 || condition);
  const expr2 = buildExpr(condition.condition2);

  // Check for invalid range
  if (expr1 === "__INVALID_RANGE__" || expr2 === "__INVALID_RANGE__") {
    filters.push("__INVALID_RANGE__");
    return;
  }

  if (expr1 && expr2) {
    const op = condition.operator === "OR" ? "or" : "and";
    filters.push(`(${expr1} ${op} ${expr2})`);
  } else if (expr1) {
    filters.push(expr1);
  }

  return; // prevent handling by other filter types
}


    if (condition.filterType === "text") {
      const value = condition.filter;

      switch (condition.type) {
        case "equals":
          filters.push(`${field} eq '${value}'`);
          break;
        case "contains":
          filters.push(`contains(${field}, '${value}')`);
          break;
        case "startsWith":
          filters.push(`startswith(${field}, '${value}')`);
          break;
        case "endsWith":
          filters.push(`endswith(${field}, '${value}')`);
          break;
      }

      return;
    }

    if (condition.filterType === "number" && isNumericField) {

      switch (condition.type) {
        case "equals":
          filters.push(`${field} eq ${condition.filter}`);
          break;

        case "greaterThan":
          filters.push(`${field} gt ${condition.filter}`);
          break;

        case "lessThan":
          filters.push(`${field} lt ${condition.filter}`);
          break;

        case "inRange":
          if (condition.filterTo !== undefined) {
            filters.push(
              `${field} ge ${condition.filter} and ${field} le ${condition.filterTo}`
            );
          }
          break;
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
