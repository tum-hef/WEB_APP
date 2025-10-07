export const buildFilterQuery = (model: any): string => {
  const filters: string[] = [];

  Object.keys(model).forEach((field) => {
    const condition = model[field];
    if (!condition) return;

    // 📅 Date filter (FROST requires during() for phenomenonTime)
    if (condition.filterType === "date") {
      const conds: string[] = [];

      const buildDateExpr = (cond: any): string | null => {
        if (!cond?.dateFrom) return null;
        const dateFrom = new Date(cond.dateFrom);

        if (cond.type === "equals") {
          const startOfDay = new Date(
            Date.UTC(dateFrom.getUTCFullYear(), dateFrom.getUTCMonth(), dateFrom.getUTCDate(), 0, 0, 0, 0)
          );
          const endOfDay = new Date(
            Date.UTC(dateFrom.getUTCFullYear(), dateFrom.getUTCMonth(), dateFrom.getUTCDate(), 23, 59, 59, 999)
          );
          return `during(${field}, ${startOfDay.toISOString()}, ${endOfDay.toISOString()})`;

        } else if (cond.type === "greaterThan") {
          return `during(${field}, ${new Date(dateFrom).toISOString()}, 9999-12-31T23:59:59.999Z)`;

        } else if (cond.type === "lessThan") {
          return `during(${field}, 0001-01-01T00:00:00.000Z, ${new Date(dateFrom).toISOString()})`;

        } else if (cond.type === "inRange" && cond.dateTo) {
          const dateTo = new Date(cond.dateTo).toISOString();
          return `during(${field}, ${new Date(cond.dateFrom).toISOString()}, ${dateTo})`;
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

    // 🔤 Text filter
    else if (condition.filterType === "text") {
      if (condition.type === "equals") {
        filters.push(`${field} eq '${condition.filter}'`);
      } else if (condition.type === "contains") {
        filters.push(`contains(${field}, '${condition.filter}')`);
      } else if (condition.type === "startsWith") {
        filters.push(`startswith(${field}, '${condition.filter}')`);
      } else if (condition.type === "endsWith") {
        filters.push(`endswith(${field}, '${condition.filter}')`);
      }
    }

    // 🔢 Number filter
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
