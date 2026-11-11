/**
 * Advanced E-Commerce Analytics, Transformations & RFM Engine
 */

export const DATE_PRESETS = [
  { id: 'all', label: 'All Time' },
  { id: '2025', label: 'Year 2025' },
  { id: '2024', label: 'Year 2024' },
  { id: 'last-180', label: 'Last 6 Months' },
  { id: 'last-30', label: 'Last 30 Days' },
];

/**
 * Defensive date parser
 */
export function safeDate(dateVal) {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Computes Order Fulfillment Latency in Days
 */
export function computeFulfillmentDays(orderDate, shipDate) {
  const o = safeDate(orderDate);
  const s = safeDate(shipDate);
  if (!o || !s) return 0;
  const diffTime = s.getTime() - o.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Computes Profit Margin (%) safely with zero-division guard
 */
export function computeProfitMargin(profit, sales) {
  const p = Number(profit) || 0;
  const s = Number(sales) || 0;
  if (Math.abs(s) < 0.0001) return 0;
  return Number(((p / s) * 100).toFixed(2));
}

/**
 * Filter dataset according to global slicers
 */
export function applyGlobalFilters(dataset, filters) {
  if (!Array.isArray(dataset)) return [];

  // Determine reference max date
  let maxTimestamp = 0;
  for (const item of dataset) {
    const d = safeDate(item.OrderDate);
    if (d && d.getTime() > maxTimestamp) {
      maxTimestamp = d.getTime();
    }
  }
  const referenceDate = maxTimestamp > 0 ? new Date(maxTimestamp) : new Date();

  return dataset.filter(item => {
    // 1. Region filter
    if (filters.region && filters.region !== 'all' && item.Region !== filters.region) {
      return false;
    }

    // 2. Category filter
    if (filters.category && filters.category !== 'all' && item.Category !== filters.category) {
      return false;
    }

    // 3. Customer Segment filter
    if (filters.segment && filters.segment !== 'all' && item.Segment !== filters.segment) {
      return false;
    }

    // 4. Date range filter
    const orderDate = safeDate(item.OrderDate);
    if (!orderDate) return false;

    if (filters.dateRange === '2024') {
      if (orderDate.getFullYear() !== 2024) return false;
    } else if (filters.dateRange === '2025') {
      if (orderDate.getFullYear() !== 2025) return false;
    } else if (filters.dateRange === 'last-30') {
      const thirtyDaysAgo = new Date(referenceDate);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      if (orderDate < thirtyDaysAgo) return false;
    } else if (filters.dateRange === 'last-180') {
      const halfYearAgo = new Date(referenceDate);
      halfYearAgo.setDate(halfYearAgo.getDate() - 180);
      if (orderDate < halfYearAgo) return false;
    }

    // 5. Search keyword filter
    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      const match =
        (item.OrderID && item.OrderID.toLowerCase().includes(q)) ||
        (item.CustomerName && item.CustomerName.toLowerCase().includes(q)) ||
        (item.City && item.City.toLowerCase().includes(q)) ||
        (item.State && item.State.toLowerCase().includes(q)) ||
        (item.SubCategory && item.SubCategory.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });
}

/**
 * Computes Executive KPIs with trend comparisons
 */
export function computeExecutiveKPIs(filteredData, fullData = []) {
  if (!filteredData || filteredData.length === 0) {
    return {
      totalRevenue: 0,
      totalProfit: 0,
      profitMargin: 0,
      totalOrders: 0,
      totalUnits: 0,
      avgOrderValue: 0,
      avgFulfillmentDays: 0,
      revenueChangeMoM: 0,
      profitChangeMoM: 0,
      orderChangeMoM: 0
    };
  }

  let totalRevenue = 0;
  let totalProfit = 0;
  let totalUnits = 0;
  let totalFulfillmentDays = 0;
  const uniqueOrders = new Set();

  for (const row of filteredData) {
    const s = Number(row.Sales) || 0;
    const p = Number(row.Profit) || 0;
    const q = Number(row.Quantity) || 1;
    totalRevenue += s;
    totalProfit += p;
    totalUnits += q;
    uniqueOrders.add(row.OrderID);
    totalFulfillmentDays += computeFulfillmentDays(row.OrderDate, row.ShipDate);
  }

  const orderCount = uniqueOrders.size || filteredData.length;
  const overallMargin = computeProfitMargin(totalProfit, totalRevenue);
  const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;
  const avgFulfillment = filteredData.length > 0 ? (totalFulfillmentDays / filteredData.length).toFixed(1) : 0;

  // Compute MoM Revenue & Profit Growth based on monthly aggregation
  const monthlyAgg = aggregateByMonth(filteredData);
  let revenueChangeMoM = 0;
  let profitChangeMoM = 0;
  let orderChangeMoM = 0;

  if (monthlyAgg.length >= 2) {
    const curr = monthlyAgg[monthlyAgg.length - 1];
    const prev = monthlyAgg[monthlyAgg.length - 2];
    if (prev.sales > 0) {
      revenueChangeMoM = Number((((curr.sales - prev.sales) / prev.sales) * 100).toFixed(1));
    }
    if (Math.abs(prev.profit) > 0.01) {
      profitChangeMoM = Number((((curr.profit - prev.profit) / Math.abs(prev.profit)) * 100).toFixed(1));
    }
    if (prev.orders > 0) {
      orderChangeMoM = Number((((curr.orders - prev.orders) / prev.orders) * 100).toFixed(1));
    }
  }

  return {
    totalRevenue: Math.round(totalRevenue),
    totalProfit: Math.round(totalProfit),
    profitMargin: overallMargin,
    totalOrders: orderCount,
    totalUnits: totalUnits,
    avgOrderValue: Math.round(avgOrderValue),
    avgFulfillmentDays: Number(avgFulfillment),
    revenueChangeMoM,
    profitChangeMoM,
    orderChangeMoM
  };
}

/**
 * Monthly and Quarterly Aggregations for Sales Seasonality
 */
export function aggregateByMonth(data) {
  const monthMap = {};

  for (const item of data) {
    const d = safeDate(item.OrderDate);
    if (!d) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = d.toLocaleString('default', { month: 'short', year: '2-digit' });

    if (!monthMap[key]) {
      monthMap[key] = {
        key,
        period: monthLabel,
        sales: 0,
        profit: 0,
        orders: new Set(),
        units: 0
      };
    }

    monthMap[key].sales += Number(item.Sales) || 0;
    monthMap[key].profit += Number(item.Profit) || 0;
    monthMap[key].orders.add(item.OrderID);
    monthMap[key].units += Number(item.Quantity) || 1;
  }

  const sortedKeys = Object.keys(monthMap).sort();
  return sortedKeys.map(key => {
    const row = monthMap[key];
    const sales = Math.round(row.sales);
    const profit = Math.round(row.profit);
    const margin = computeProfitMargin(profit, sales);
    return {
      key: row.key,
      period: row.period,
      sales,
      profit,
      margin,
      orders: row.orders.size,
      units: row.units
    };
  });
}

export function aggregateByQuarter(data) {
  const qMap = {};

  for (const item of data) {
    const d = safeDate(item.OrderDate);
    if (!d) continue;
    const year = d.getFullYear();
    const q = Math.floor(d.getMonth() / 3) + 1;
    const key = `${year}-Q${q}`;

    if (!qMap[key]) {
      qMap[key] = {
        period: key,
        sales: 0,
        profit: 0,
        orders: new Set(),
        units: 0
      };
    }

    qMap[key].sales += Number(item.Sales) || 0;
    qMap[key].profit += Number(item.Profit) || 0;
    qMap[key].orders.add(item.OrderID);
    qMap[key].units += Number(item.Quantity) || 1;
  }

  const sorted = Object.keys(qMap).sort();
  return sorted.map(k => {
    const r = qMap[k];
    const sales = Math.round(r.sales);
    const profit = Math.round(r.profit);
    return {
      period: r.period,
      sales,
      profit,
      margin: computeProfitMargin(profit, sales),
      orders: r.orders.size,
      units: r.units
    };
  });
}

/**
 * Top & Bottom Performing Sub-Categories
 */
export function aggregateSubCategories(data) {
  const map = {};

  for (const row of data) {
    const sub = row.SubCategory || 'Other';
    if (!map[sub]) {
      map[sub] = {
        subCategory: sub,
        category: row.Category,
        sales: 0,
        profit: 0,
        quantity: 0,
        discounts: [],
        count: 0
      };
    }
    map[sub].sales += Number(row.Sales) || 0;
    map[sub].profit += Number(row.Profit) || 0;
    map[sub].quantity += Number(row.Quantity) || 1;
    map[sub].discounts.push(Number(row.Discount) || 0);
    map[sub].count += 1;
  }

  const list = Object.values(map).map(item => {
    const avgDiscount = item.discounts.length > 0 
      ? item.discounts.reduce((a, b) => a + b, 0) / item.discounts.length 
      : 0;
    const margin = computeProfitMargin(item.profit, item.sales);
    return {
      subCategory: item.subCategory,
      category: item.category,
      sales: Math.round(item.sales),
      profit: Math.round(item.profit),
      margin,
      quantity: item.quantity,
      avgDiscount: Number((avgDiscount * 100).toFixed(1)),
      isLossMaking: item.profit < 0
    };
  });

  // Sort by Sales descending
  return list.sort((a, b) => b.sales - a.sales);
}

/**
 * Discount vs. Profitability Correlation Data for Scatter Plot
 */
export function getDiscountProfitabilityPoints(data) {
  // Sample or full points with jitter reduction for high readability
  return data.map(item => {
    const discount = Number(item.Discount) || 0;
    const discountPct = Number((discount * 100).toFixed(0));
    const margin = computeProfitMargin(item.Profit, item.Sales);
    return {
      orderId: item.OrderID,
      customerName: item.CustomerName,
      subCategory: item.SubCategory,
      category: item.Category,
      sales: Math.round(Number(item.Sales) || 0),
      profit: Math.round(Number(item.Profit) || 0),
      discountPct,
      margin,
      isLoss: item.Profit < 0
    };
  });
}

/**
 * Regional & Geographic Distribution
 */
export function aggregateByRegion(data) {
  const map = {
    West: { region: 'West', sales: 0, profit: 0, orders: 0, states: new Set() },
    East: { region: 'East', sales: 0, profit: 0, orders: 0, states: new Set() },
    Central: { region: 'Central', sales: 0, profit: 0, orders: 0, states: new Set() },
    South: { region: 'South', sales: 0, profit: 0, orders: 0, states: new Set() }
  };

  for (const row of data) {
    const reg = row.Region || 'Other';
    if (!map[reg]) {
      map[reg] = { region: reg, sales: 0, profit: 0, orders: 0, states: new Set() };
    }
    map[reg].sales += Number(row.Sales) || 0;
    map[reg].profit += Number(row.Profit) || 0;
    map[reg].orders += 1;
    if (row.State) map[reg].states.add(row.State);
  }

  return Object.values(map).map(r => ({
    region: r.region,
    sales: Math.round(r.sales),
    profit: Math.round(r.profit),
    margin: computeProfitMargin(r.profit, r.sales),
    orders: r.orders,
    stateCount: r.states.size
  }));
}

/**
 * State Level Breakdown
 */
export function aggregateByState(data) {
  const map = {};
  for (const row of data) {
    const s = row.State || 'Unknown';
    if (!map[s]) {
      map[s] = { state: s, region: row.Region, sales: 0, profit: 0, orders: 0 };
    }
    map[s].sales += Number(row.Sales) || 0;
    map[s].profit += Number(row.Profit) || 0;
    map[s].orders += 1;
  }
  return Object.values(map)
    .map(st => ({
      ...st,
      sales: Math.round(st.sales),
      profit: Math.round(st.profit),
      margin: computeProfitMargin(st.profit, st.sales)
    }))
    .sort((a, b) => b.sales - a.sales);
}

/**
 * Automated RFM Customer Segmentation Engine
 * Computes:
 * - Recency (R): Days since last purchase
 * - Frequency (F): Total number of distinct orders
 * - Monetary (M): Total revenue generated by customer
 * Segment classification:
 * - Champions: High R, High F, High M
 * - Loyal Customers: Moderate to High R, High F, Good M
 * - Potential Loyalists: Recent buyers with good initial spend
 * - At Risk: Formerly frequent/high spenders who haven't ordered recently
 * - Lost Churn: Inactive for a long time, low frequency
 */
export function computeRFMSegmentation(data) {
  if (!data || data.length === 0) return { customers: [], segments: [] };

  // Reference date is latest order date in dataset
  let maxTime = 0;
  for (const d of data) {
    const parsed = safeDate(d.OrderDate);
    if (parsed && parsed.getTime() > maxTime) {
      maxTime = parsed.getTime();
    }
  }
  const refDate = maxTime > 0 ? new Date(maxTime) : new Date();

  // Aggregate by Customer
  const custMap = {};
  for (const row of data) {
    const id = row.CustomerID || 'UNKNOWN';
    if (!custMap[id]) {
      custMap[id] = {
        customerId: id,
        customerName: row.CustomerName || 'Anonymous',
        segment: row.Segment || 'Consumer',
        region: row.Region || 'West',
        city: row.City,
        state: row.State,
        orders: new Set(),
        totalSales: 0,
        totalProfit: 0,
        lastOrderDate: null
      };
    }

    custMap[id].orders.add(row.OrderID);
    custMap[id].totalSales += Number(row.Sales) || 0;
    custMap[id].totalProfit += Number(row.Profit) || 0;

    const rowDate = safeDate(row.OrderDate);
    if (rowDate) {
      if (!custMap[id].lastOrderDate || rowDate > custMap[id].lastOrderDate) {
        custMap[id].lastOrderDate = rowDate;
      }
    }
  }

  const rawCustomers = Object.values(custMap).map(c => {
    const daysSince = c.lastOrderDate 
      ? Math.max(0, Math.floor((refDate - c.lastOrderDate) / (1000 * 60 * 60 * 24)))
      : 365;

    return {
      customerId: c.customerId,
      customerName: c.customerName,
      segmentType: c.segment,
      region: c.region,
      city: c.city,
      state: c.state,
      frequency: c.orders.size,
      monetary: Math.round(c.totalSales),
      totalProfit: Math.round(c.totalProfit),
      margin: computeProfitMargin(c.totalProfit, c.totalSales),
      recencyDays: daysSince,
      lastOrderDate: c.lastOrderDate ? c.lastOrderDate.toISOString().split('T')[0] : 'N/A'
    };
  });

  // Score R, F, M (1-5 scale)
  const scored = rawCustomers.map(cust => {
    // Recency: Lower days = Higher score
    let rScore = 1;
    if (cust.recencyDays <= 30) rScore = 5;
    else if (cust.recencyDays <= 60) rScore = 4;
    else if (cust.recencyDays <= 120) rScore = 3;
    else if (cust.recencyDays <= 240) rScore = 2;
    else rScore = 1;

    // Frequency: More orders = Higher score
    let fScore = 1;
    if (cust.frequency >= 6) fScore = 5;
    else if (cust.frequency >= 4) fScore = 4;
    else if (cust.frequency >= 3) fScore = 3;
    else if (cust.frequency >= 2) fScore = 2;
    else fScore = 1;

    // Monetary: Higher spend = Higher score
    let mScore = 1;
    if (cust.monetary >= 3500) mScore = 5;
    else if (cust.monetary >= 2000) mScore = 4;
    else if (cust.monetary >= 1000) mScore = 3;
    else if (cust.monetary >= 500) mScore = 2;
    else mScore = 1;

    // Segment Assignment
    let rfmSegment = "Lost Churn";
    let color = "#ef4444"; // red

    if (rScore >= 4 && fScore >= 3 && mScore >= 4) {
      rfmSegment = "Champions";
      color = "#10b981"; // emerald
    } else if (fScore >= 3 && mScore >= 3 && rScore >= 3) {
      rfmSegment = "Loyal Customers";
      color = "#3b82f6"; // blue
    } else if (rScore >= 4 && (fScore >= 1 || mScore >= 2)) {
      rfmSegment = "Potential Loyalists";
      color = "#8b5cf6"; // purple
    } else if (rScore <= 2 && (fScore >= 2 || mScore >= 3)) {
      rfmSegment = "At Risk";
      color = "#f59e0b"; // amber
    } else {
      rfmSegment = "Lost Churn";
      color = "#64748b"; // slate
    }

    return {
      ...cust,
      rScore,
      fScore,
      mScore,
      rfmScore: `${rScore}${fScore}${mScore}`,
      rfmSegment,
      color
    };
  });

  // Segment Summary Aggregates
  const segmentStats = {
    "Champions": { name: "Champions", count: 0, revenue: 0, profit: 0, color: "#10b981", badge: "VIP Tier" },
    "Loyal Customers": { name: "Loyal Customers", count: 0, revenue: 0, profit: 0, color: "#3b82f6", badge: "High Value" },
    "Potential Loyalists": { name: "Potential Loyalists", count: 0, revenue: 0, profit: 0, color: "#8b5cf6", badge: "Promising" },
    "At Risk": { name: "At Risk", count: 0, revenue: 0, profit: 0, color: "#f59e0b", badge: "Needs Action" },
    "Lost Churn": { name: "Lost Churn", count: 0, revenue: 0, profit: 0, color: "#64748b", badge: "Dormant" }
  };

  let totalCustRevenue = 0;
  for (const c of scored) {
    if (segmentStats[c.rfmSegment]) {
      segmentStats[c.rfmSegment].count += 1;
      segmentStats[c.rfmSegment].revenue += c.monetary;
      segmentStats[c.rfmSegment].profit += c.totalProfit;
      totalCustRevenue += c.monetary;
    }
  }

  const segmentList = Object.values(segmentStats).map(s => ({
    ...s,
    revenueShare: totalCustRevenue > 0 ? Number(((s.revenue / totalCustRevenue) * 100).toFixed(1)) : 0,
    avgSpend: s.count > 0 ? Math.round(s.revenue / s.count) : 0,
    margin: computeProfitMargin(s.profit, s.revenue)
  }));

  return {
    customers: scored.sort((a, b) => b.monetary - a.monetary),
    segments: segmentList
  };
}

/**
 * Tab 2: Loss Diagnostic Center computations
 */
export function computeLossDiagnostics(data) {
  const lossOrders = data.filter(item => (Number(item.Profit) || 0) < 0);
  const totalOrdersCount = data.length;
  const lossCount = lossOrders.length;
  const totalLoss = lossOrders.reduce((acc, cur) => acc + (Number(cur.Profit) || 0), 0);
  const totalLossAbs = Math.abs(Math.round(totalLoss));
  const avgLossPerOrder = lossCount > 0 ? Math.round(totalLoss / lossCount) : 0;
  const lossRatePct = totalOrdersCount > 0 ? Number(((lossCount / totalOrdersCount) * 100).toFixed(1)) : 0;

  // Root cause 1: Loss by Category & Sub-Category
  const subCategoryLossMap = {};
  for (const row of lossOrders) {
    const sub = row.SubCategory || 'Other';
    if (!subCategoryLossMap[sub]) {
      subCategoryLossMap[sub] = {
        subCategory: sub,
        category: row.Category,
        lossAmount: 0,
        count: 0,
        avgDiscount: 0,
        discounts: []
      };
    }
    subCategoryLossMap[sub].lossAmount += Math.abs(Number(row.Profit) || 0);
    subCategoryLossMap[sub].count += 1;
    subCategoryLossMap[sub].discounts.push(Number(row.Discount) || 0);
  }

  const subCategoryLossList = Object.values(subCategoryLossMap).map(sc => {
    const avgDisc = sc.discounts.reduce((a, b) => a + b, 0) / sc.discounts.length;
    return {
      subCategory: sc.subCategory,
      category: sc.category,
      lossAmount: Math.round(sc.lossAmount),
      count: sc.count,
      avgDiscountPct: Math.round(avgDisc * 100)
    };
  }).sort((a, b) => b.lossAmount - a.lossAmount);

  // Root cause 2: Loss by Discount Bracket
  const bracketMap = {
    '0% - 10%': { bracket: '0% - 10%', lossAmount: 0, count: 0 },
    '10% - 20%': { bracket: '10% - 20%', lossAmount: 0, count: 0 },
    '20% - 40%': { bracket: '20% - 40%', lossAmount: 0, count: 0 },
    '40% - 60%': { bracket: '40% - 60%', lossAmount: 0, count: 0 },
    '> 60%': { bracket: '> 60%', lossAmount: 0, count: 0 }
  };

  for (const row of lossOrders) {
    const d = Number(row.Discount) || 0;
    const loss = Math.abs(Number(row.Profit) || 0);
    if (d <= 0.10) {
      bracketMap['0% - 10%'].lossAmount += loss;
      bracketMap['0% - 10%'].count += 1;
    } else if (d <= 0.20) {
      bracketMap['10% - 20%'].lossAmount += loss;
      bracketMap['10% - 20%'].count += 1;
    } else if (d <= 0.40) {
      bracketMap['20% - 40%'].lossAmount += loss;
      bracketMap['20% - 40%'].count += 1;
    } else if (d <= 0.60) {
      bracketMap['40% - 60%'].lossAmount += loss;
      bracketMap['40% - 60%'].count += 1;
    } else {
      bracketMap['> 60%'].lossAmount += loss;
      bracketMap['> 60%'].count += 1;
    }
  }

  const discountBracketLoss = Object.values(bracketMap).map(b => ({
    ...b,
    lossAmount: Math.round(b.lossAmount)
  }));

  // Root cause 3: Loss by Region
  const regionLossMap = {};
  for (const row of lossOrders) {
    const reg = row.Region || 'Other';
    if (!regionLossMap[reg]) regionLossMap[reg] = { region: reg, lossAmount: 0, count: 0 };
    regionLossMap[reg].lossAmount += Math.abs(Number(row.Profit) || 0);
    regionLossMap[reg].count += 1;
  }
  const regionLossList = Object.values(regionLossMap).map(r => ({
    ...r,
    lossAmount: Math.round(r.lossAmount)
  })).sort((a, b) => b.lossAmount - a.lossAmount);

  // Formatted loss transactions ledger
  const formattedLossOrders = lossOrders.map(row => {
    const discount = Number(row.Discount) || 0;
    let rootCause = "Excessive Discount";
    if (discount >= 0.50) {
      rootCause = `Severe Discount Overdose (${(discount * 100).toFixed(0)}%)`;
    } else if (row.SubCategory === "Tables" || row.SubCategory === "Machines") {
      rootCause = `High Base Cost with ${(discount * 100).toFixed(0)}% Discount`;
    } else if (discount >= 0.20) {
      rootCause = `Margin Erosion via ${(discount * 100).toFixed(0)}% Promo`;
    } else {
      rootCause = "High Shipping/Logistics Cost";
    }

    return {
      orderId: row.OrderID,
      orderDate: row.OrderDate,
      customerName: row.CustomerName,
      category: row.Category,
      subCategory: row.SubCategory,
      region: row.Region,
      state: row.State,
      sales: Math.round(Number(row.Sales) || 0),
      discountPct: Math.round(discount * 100),
      profit: Math.round(Number(row.Profit) || 0),
      margin: computeProfitMargin(row.Profit, row.Sales),
      rootCause
    };
  }).sort((a, b) => a.profit - b.profit); // worst negative first

  return {
    totalLossAbs,
    lossCount,
    avgLossPerOrder,
    lossRatePct,
    subCategoryLossList,
    discountBracketLoss,
    regionLossList,
    worstCategory: subCategoryLossList[0]?.subCategory || 'N/A',
    worstRegion: regionLossList[0]?.region || 'N/A',
    lossOrders: formattedLossOrders
  };
}

/**
 * Tab 3: Actionable Business Recommendations Engine
 */
export function generateBusinessRecommendations(data, rfmResult) {
  const lossData = computeLossDiagnostics(data);
  const subCats = aggregateSubCategories(data);
  
  // 1. Pricing Policy: Identify top losing category caused by discount > 20%
  const losingSubs = lossData.subCategoryLossList.filter(s => s.lossAmount > 200);
  const worstSub = losingSubs[0] || { subCategory: "Tables", lossAmount: 3200, avgDiscountPct: 35 };

  const pricingPolicy = {
    targetCategory: worstSub.subCategory,
    currentLoss: worstSub.lossAmount,
    avgDiscount: worstSub.avgDiscountPct,
    recommendedCap: 15, // recommend 15% discount cap
    estimatedRecovery: Math.round(worstSub.lossAmount * 0.72),
    ruleSummary: `Cap ${worstSub.subCategory} discounts strictly at 15%. Currently discounting averages ${worstSub.avgDiscountPct}%, resulting in $${worstSub.lossAmount.toLocaleString()} in cumulative red-ink losses.`
  };

  // 2. Inventory Forecast: Top 3 high velocity sub-categories
  const highVelocity = [...subCats]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 3)
    .map(item => ({
      name: item.subCategory,
      unitsSold: item.quantity,
      sales: item.sales,
      recommendedStockBuffer: "+25% Pre-stocking Buffer",
      turnoverLeadTime: "3.5 Days Fulfillment Target"
    }));

  // 3. Retention Engine: High value at-risk customers
  const atRiskCustomers = rfmResult.customers
    .filter(c => c.rfmSegment === "At Risk")
    .slice(0, 8)
    .map(c => ({
      customerId: c.customerId,
      customerName: c.customerName,
      monetary: c.monetary,
      frequency: c.frequency,
      daysDormant: c.recencyDays,
      recommendedAction: c.monetary > 2000 
        ? "Personal Account Executive outreach + 10% non-margin eroding VIP re-order credit"
        : "Automated Win-Back email campaign with curated top-selling product recommendations"
    }));

  return {
    pricingPolicy,
    highVelocity,
    atRiskCustomers,
    totalAtRiskRevenue: atRiskCustomers.reduce((acc, c) => acc + c.monetary, 0)
  };
}

/**
 * Convert dataset to clean CSV string
 */
export function exportToCSV(data, filename = 'superstore_export.csv') {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(field => {
      const val = row[field] === null || row[field] === undefined ? '' : String(row[field]);
      // Escape commas & quotes
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',')
  );

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
