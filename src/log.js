import { toRows } from './to-rows.js'

const log = (timerified, { title = null } = {}) => {
  const rows = toRows(timerified)

  if (['test'].includes(process.env.NODE_ENV))
    return rows

  if (title)
    console.log('\n','\n', title, '\n', '-'.repeat(title.length))

  console.table(rows)

  return rows
}

export { log }
