import { useEffect, useMemo, useState } from 'react'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from './components/ui/card'
import { Input } from './components/ui/input'
import { Button } from './components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './components/ui/table'
import { Spinner } from './components/ui/spinner'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from './components/ui/empty'

type Task = {
  id: number
  userId: number
  todo: string
  completed: boolean
  priorityScore: number
  statusLabel: string
}

type Summary = {
  total: number
  completed: number
  pending: number
}

export default function App() {
  const [tasks, setTasks] = useState<Task[] | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<'id' | 'priorityScore' | 'statusLabel'>('id')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const backendUrl = import.meta.env.VITE_BACKEND_URL || '/api'
  const accessToken = import.meta.env.VITE_ACCESS_TOKEN

  useEffect(() => {
    async function fetchData() {
      if (!backendUrl) {
        setError('VITE_BACKEND_URL is not set')
        return
      }
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(backendUrl, {
          method: 'POST',
          body: JSON.stringify({ accessToken })
        })
        const payload = await res.json()
        if (!res.ok) {
          setError(payload && payload.error ? payload.error : 'Backend error')
          setTasks(null)
          setSummary(null)
        } else {
          setTasks(payload.tasks || [])
          setSummary(payload.summary || { total: 0, completed: 0, pending: 0 })
        }
      } catch (e: any) {
        setError(e.message || 'Network error')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [backendUrl, accessToken])

  const filtered = useMemo(() => {
    if (!tasks) return []
    const q = query.trim().toLowerCase()
    let out = tasks.filter(t =>
      !q ||
      String(t.id).includes(q) ||
      String(t.userId).includes(q) ||
      t.todo.toLowerCase().includes(q) ||
      t.statusLabel.toLowerCase().includes(q)
    )
    out = out.sort((a, b) => {
      let va: any = a[sortKey]
      let vb: any = b[sortKey]
      if (typeof va === 'string') {
        va = va.toLowerCase()
        vb = vb.toLowerCase()
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return out
  }, [tasks, query, sortKey, sortDir])

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Management Dashboard</CardTitle>
            <CardDescription>Frontend consuming Google Apps Script backend (see reqs.md)</CardDescription>
          </CardHeader>
        </Card>
      </header>

      <section className="mb-6">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> Loading...</div>
        )}
        {error && <div className="text-sm text-red-600">Error: {error}</div>}
        {!loading && !error && summary && (
          <div className="grid grid-cols-3 gap-4">
            <Card size="sm">
              <CardContent>
                <div className="text-xs text-muted-foreground">Total Tasks</div>
                <div className="text-2xl font-semibold">{summary.total}</div>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardContent>
                <div className="text-xs text-muted-foreground">Completed</div>
                <div className="text-2xl font-semibold">{summary.completed}</div>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardContent>
                <div className="text-xs text-muted-foreground">Pending</div>
                <div className="text-2xl font-semibold">{summary.pending}</div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      <section className="mb-6">
        <div className="flex items-center gap-4">
          <Input placeholder="Search by id, userId, text or status" value={query} onChange={e => setQuery((e.target as HTMLInputElement).value)} />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => toggleSort('id')}>ID {sortKey==='id' ? (sortDir==='asc' ? '↑' : '↓') : ''}</Button>
            <Button variant="outline" size="sm" onClick={() => toggleSort('priorityScore')}>Priority {sortKey==='priorityScore' ? (sortDir==='asc' ? '↑' : '↓') : ''}</Button>
            <Button variant="outline" size="sm" onClick={() => toggleSort('statusLabel')}>Status {sortKey==='statusLabel' ? (sortDir==='asc' ? '↑' : '↓') : ''}</Button>
          </div>
        </div>
      </section>

      <section>
        {(!tasks || tasks.length === 0) && !loading && !error && (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No tasks available</EmptyTitle>
              <EmptyDescription>Deploy and call the Apps Script backend to load tasks.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {tasks && tasks.length > 0 && (
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <tr>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Todo</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Priority Score</TableHead>
                    <TableHead>Status</TableHead>
                  </tr>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-6">No tasks</TableCell>
                    </TableRow>
                  )}
                  {filtered.map(t => (
                    <TableRow key={t.id}>
                      <TableCell>{t.id}</TableCell>
                      <TableCell>{t.userId}</TableCell>
                      <TableCell>{t.todo}</TableCell>
                      <TableCell>{t.completed ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{t.priorityScore}</TableCell>
                      <TableCell>{t.statusLabel}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
