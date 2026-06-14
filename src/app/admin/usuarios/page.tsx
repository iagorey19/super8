"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Modal } from "@/components/ui/modal"
import { Table, Td } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getAllUsers, createUser, updateUser, deleteUser } from "@/lib/store"
import type { User } from "@/lib/types"

const roleOptions = [
  { value: "athlete", label: "Atleta" },
  { value: "sponsor", label: "Patrocinador" },
  { value: "admin", label: "Administrador" },
]

const roleLabels: Record<string, string> = { admin: "Administrador", athlete: "Atleta", sponsor: "Patrocinador" }
const roleColors: Record<string, string> = {
  admin: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300",
  athlete: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300",
  sponsor: "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300",
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([])
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const [newModalOpen, setNewModalOpen] = useState(false)
  const [newForm, setNewForm] = useState({ name: "", email: "", password: "", role: "athlete", phone: "" })

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", password: "", phone: "" })

  function loadData() {
    setUsers(getAllUsers())
  }

  useEffect(() => { loadData() }, [])

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  function handleCreate() {
    if (!newForm.name || !newForm.email || !newForm.password) {
      showToast("error", "Preencha nome, email e senha")
      return
    }
    const result = createUser(newForm.name, newForm.email, newForm.password, newForm.role as User["role"], newForm.phone)
    if (!result) {
      showToast("error", "Email já cadastrado")
      return
    }
    showToast("success", "Usuário criado com sucesso!")
    setNewModalOpen(false)
    setNewForm({ name: "", email: "", password: "", role: "athlete", phone: "" })
    loadData()
  }

  function handleEdit() {
    if (!editingUser || !editForm.name || !editForm.email) return
    updateUser(editingUser.id, {
      name: editForm.name,
      email: editForm.email,
      password: editForm.password || undefined,
      phone: editForm.phone,
    })
    setEditModalOpen(false)
    loadData()
    showToast("success", "Usuário atualizado!")
  }

  function handleDelete(user: User) {
    if (!window.confirm(`Remover usuário "${user.name}" (${roleLabels[user.role]}) permanentemente?`)) return
    deleteUser(user.id)
    loadData()
    showToast("success", "Usuário removido!")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Usuários</h1>
        <Button onClick={() => setNewModalOpen(true)}>Novo Usuário</Button>
      </div>

      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      <Card>
        <CardHeader title="Todos os Usuários" subtitle={`${users.length} usuário(s) cadastrado(s)`} />
        <Table headers={["Nome", "Email", "Perfil", "Telefone", "Ações"]}>
          {users.length === 0 ? (
            <tr>
              <Td colSpan={5}>
                <p className="text-center text-gray-400 dark:text-gray-500 py-8">Nenhum usuário cadastrado</p>
              </Td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <Td className="font-medium text-gray-900 dark:text-white">{u.name}</Td>
                <Td>{u.email}</Td>
                <Td>
                  <Badge className={roleColors[u.role]}>{roleLabels[u.role]}</Badge>
                </Td>
                <Td>{u.phone || "-"}</Td>
                <Td>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingUser(u)
                        setEditForm({ name: u.name, email: u.email, password: "", phone: u.phone || "" })
                        setEditModalOpen(true)
                      }}
                    >
                      Editar
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(u)}>
                      Remover
                    </Button>
                  </div>
                </Td>
              </tr>
            ))
          )}
        </Table>
      </Card>

      <Modal open={newModalOpen} onClose={() => setNewModalOpen(false)} title="Novo Usuário">
        <div className="space-y-4">
          <Input
            label="Nome"
            placeholder="Nome completo"
            value={newForm.name}
            onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="email@exemplo.com"
            value={newForm.email}
            onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
          />
          <Input
            label="Senha"
            type="password"
            placeholder="Senha de acesso"
            value={newForm.password}
            onChange={(e) => setNewForm({ ...newForm, password: e.target.value })}
          />
          <Select
            label="Perfil"
            options={roleOptions}
            value={newForm.role}
            onChange={(e) => setNewForm({ ...newForm, role: e.target.value })}
          />
          <Input
            label="Telefone"
            placeholder="(11) 99999-9999"
            value={newForm.phone}
            onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setNewModalOpen(false)}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleCreate}>
              Criar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Editar Usuário - ${editingUser?.name || ""}`}
      >
        <div className="space-y-4">
          <Input
            label="Nome"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
          />
          <Input
            label="Nova Senha"
            type="password"
            placeholder="Deixe em branco para manter a atual"
            value={editForm.password}
            onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
          />
          <Input
            label="Telefone"
            placeholder="(11) 99999-9999"
            value={editForm.phone}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
          />
          {editingUser && (
            <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-lg text-sm text-gray-500 dark:text-gray-400">
              Perfil: <Badge className={roleColors[editingUser.role]}>{roleLabels[editingUser.role]}</Badge>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleEdit} disabled={!editForm.name || !editForm.email}>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
