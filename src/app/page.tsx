'use client'

import { useEffect, useState, FormEvent } from 'react'

type Task = {
  id: number
  title: string
  description: string
  status: string
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  // Busca tarefas ao carregar
  useEffect(() => {
    fetchTasks()
  }, [])

  function fetchTasks() {
    setLoading(true)
    fetch('https://task-api-production-aca3.up.railway.app/tasks')
      .then(res => {
        if (!res.ok) throw new Error('Erro na resposta da API')
        return res.json()
      })
      .then(data => setTasks(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  // Envia nova tarefa
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      alert('O título é obrigatório.')
      return
    }

    try {
      const res = await fetch('https://task-api-production-aca3.up.railway.app/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      })

      if (!res.ok) throw new Error('Erro ao criar tarefa')

      const data = await res.json()
      setTasks(prev => [...prev, data])
      setTitle('')
      setDescription('')
    } catch {
      // vazio ou mensagem genérica
    }
  }

  const handleDelete = async (id: number) => {
    const confirm = window.confirm('Tem certeza que deseja excluir esta tarefa?')
    if (!confirm) return
  
    try {
      const res = await fetch(`https://task-api-production-aca3.up.railway.app/tasks/${id}`, {
        method: 'DELETE',
      })
  
      if (!res.ok) throw new Error('Erro ao excluir tarefa')
  
      // Atualiza a lista local
      setTasks(prev => prev.filter(task => task.id !== id))
    } catch {
      // vazio ou mensagem genérica
    }
  }

  const handleComplete = async (id: number) => {
    try {
      const res = await fetch(`https://task-api-production-aca3.up.railway.app/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'concluida' }),
      })
  
      if (!res.ok) throw new Error('Erro ao marcar tarefa como concluída')
  
      setTasks(prev =>
        prev.map(task =>
          task.id === id ? { ...task, status: 'concluida' } : task
        )
      )
    } catch {
      // vazio ou mensagem genérica
    }
  }
  
  
  

  return (
    <main className="p-8 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Lista de Tarefas</h1>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded shadow">
        <input
          className="w-full p-2 border rounded"
          type="text"
          placeholder="Título"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          className="w-full p-2 border rounded"
          placeholder="Descrição"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Criar Tarefa
        </button>
      </form>

      {/* Lista de tarefas */}
      {loading ? (
        <p>Carregando...</p>
      ) : error ? (
        <p className="text-red-500">Erro: {error}</p>
      ) : tasks.length === 0 ? (
        <p>Nenhuma tarefa encontrada.</p>
      ) : (
        <ul className="space-y-4">
  {tasks.map(task => (
    <li key={task.id} className={`p-4 border rounded shadow-sm ${task.status === 'concluida' ? 'bg-green-50' : ''}`}>
    <div className="flex justify-between items-center">
      <div>
        <h2 className={`font-semibold ${task.status === 'concluida' ? 'line-through text-gray-400' : ''}`}>
          {task.title}
        </h2>
        <p className="text-sm text-gray-600">{task.description}</p>
      </div>
      <div className="flex gap-2">
        {task.status !== 'concluida' && (
          <button
            onClick={() => handleComplete(task.id)}
            className="text-green-600 hover:underline text-sm"
          >
            Concluir
          </button>
        )}
        <button
          onClick={() => handleDelete(task.id)}
          className="text-red-600 hover:underline text-sm"
        >
          Excluir
        </button>
      </div>
    </div>
  </li>
  
  ))}
</ul>

      )}
    </main>
  )
}
