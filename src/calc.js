/**
 * Compute net balance per member.
 *
 * Logic:
 *   For each expense with N people in splitWith:
 *     share = amount / N
 *     Every participant who is NOT the payer owes the payer `share`.
 *     → participant's balance -= share
 *     → payer's balance     += share  (once per non-payer participant)
 *
 *   The payer's own share is implicitly handled:
 *     payer paid `amount`, their cost is `share`, so net = amount - share = share*(N-1)
 *     which equals the sum of credits they receive from the N-1 others. ✓
 *
 *   Sum of all balances is always 0 (zero-sum). ✓
 *
 * @param {Array} members  - [{id:number, ...}]
 * @param {Array} expenses - [{amount:number, paidBy:number, splitWith:number[]}]
 * @returns {Object} { [memberId]: netBalance }
 */
export function computeBalances(members, expenses) {
  const b = {}
  members.forEach(m => { b[m.id] = 0 })

  expenses.forEach(exp => {
    const n = exp.splitWith.length
    if (n === 0) return
    const share = exp.amount / n
    exp.splitWith.forEach(mid => {
      if (mid !== exp.paidBy) {
        b[mid]      = (b[mid]      ?? 0) - share
        b[exp.paidBy] = (b[exp.paidBy] ?? 0) + share
      }
    })
  })

  return b
}

/**
 * Compute minimum number of transfers to settle all debts (greedy).
 *
 * Algorithm:
 *   1. Split members into debtors (balance < 0) and creditors (balance > 0).
 *   2. Two-pointer: pair the largest debtor with the largest creditor.
 *      Transfer min(debt, credit). Advance the pointer that reaches 0.
 *   3. Repeat until all settled.
 *
 * This is optimal for minimizing transactions in the general case.
 *
 * @returns {Array} [{from, fromName, fromColor, to, toName, toColor, amount}]
 */
export function computeSettlements(members, balances) {
  const debtors   = []
  const creditors = []

  members.forEach(m => {
    const v = balances[m.id] ?? 0
    if (v < -0.005) debtors.push({ ...m, amount: -v })
    else if (v >  0.005) creditors.push({ ...m, amount: v })
  })

  // Sort descending so largest amounts are handled first (stable pairing)
  debtors.sort((a, b) => b.amount - a.amount)
  creditors.sort((a, b) => b.amount - a.amount)

  const txs = []
  let i = 0, j = 0
  const d = debtors.map(x => ({ ...x }))
  const c = creditors.map(x => ({ ...x }))

  while (i < d.length && j < c.length) {
    const pay = Math.min(d[i].amount, c[j].amount)
    txs.push({
      from:      d[i].id,    fromName:  d[i].name,  fromColor: d[i].color,
      to:        c[j].id,    toName:    c[j].name,   toColor:   c[j].color,
      amount:    pay
    })
    d[i].amount -= pay
    c[j].amount -= pay
    if (d[i].amount < 0.005) i++
    if (c[j].amount < 0.005) j++
  }

  return txs
}

/**
 * Round to 2 decimal places (avoid floating point display artifacts).
 */
export function euro(n) {
  return Math.round(n * 100) / 100
}

export function fmt(n) {
  return euro(n).toFixed(2)
}
