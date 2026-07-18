# Banco de Dados — THE SUPER 8

> Esquema do banco Supabase (PostgreSQL), tabelas, colunas e relacionamentos.

Projeto: `ylltshboiejlcbhksrci`
URL: `https://ylltshboiejlcbhksrci.supabase.co`

---

## Convenções
- **TEXT PRIMARY KEY** — IDs textuais tipo `"admin-001"`, `"torneio-001"`. Runtime usa `crypto.randomUUID()`.
- **Datas**: ISO strings (`"2026-06-21"` ou ISO completo)
- **Moeda**: `numeric` no banco, `Intl.NumberFormat('pt-BR')` na UI
- **Seed**: auto-executado quando banco vazio (`seed_version` guarda versão)

---

## Tabelas

### users
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | text PK | ID único |
| email | text | Email (único) |
| password | text | bcrypt hash (10 rounds) |
| name | text | Nome completo |
| role | text | admin / athlete / sponsor |
| phone | text? | Telefone |
| avatar | text? | URL do avatar |
| url | text? | Link (patrocinadores) |
| created_at | timestamptz | Data de criação |

### tournaments
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | text PK | ID único |
| title | text | Título do torneio |
| edition | text | Edição (ex: "4 Edição") |
| date | date | Data do evento |
| location | text? | Local |
| status | text | upcoming / registering / ongoing / completed |
| categories | jsonb | Array de categorias (ex: ["4e5","6e7"]) |
| registration_fee | numeric? | Taxa de inscrição |
| max_score | int? | Pontuação máxima por partida (default 5) |
| court_names | jsonb? | Nomes personalizados das quadras |
| created_at | timestamptz | Data de criação |
| created_by | text | FK → users.id |

### athlete_registrations
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | text PK | ID único |
| tournament_id | text FK | Torneio |
| athlete_id | text FK | Atleta (users.id) |
| status | text | pending / approved / rejected |
| payment_status | text? | pending / paid / cancelled |
| registration_order | int? | Ordem de inscrição (posição na fila) |
| is_waiting | boolean? | Se está na lista de espera |
| draw_number | int? | Número do sorteio |
| category | text? | Categoria escolhida |
| group_name | text? | Nome do grupo |
| confirmed | boolean? | Presença confirmada |
| confirmed_at | timestamptz? | Data da confirmação |
| created_at | timestamptz | Data de criação |

### pairings
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | text PK | ID único |
| tournament_id | text FK | Torneio |
| category | text | Categoria |
| group_name | text | Nome do grupo |
| round | int | Rodada (1-7) |
| court | text | Quadra |
| player1_id | text FK | Atleta 1 |
| player2_id | text FK | Atleta 2 (dupla de player1) |
| player3_id | text FK | Atleta 3 |
| player4_id | text FK | Atleta 4 (dupla de player3) |

### matches
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | text PK | ID único |
| pairing_id | text FK | FK → pairings.id |
| tournament_id | text FK | Torneio |
| category | text | Categoria |
| group_name | text | Nome do grupo |
| round | int | Rodada |
| court | text | Quadra |
| team1_player1_id | text FK | Dupla 1, jogador 1 |
| team1_player2_id | text FK | Dupla 1, jogador 2 |
| team2_player1_id | text FK | Dupla 2, jogador 1 |
| team2_player2_id | text FK | Dupla 2, jogador 2 |
| score_team1 | int | Games time 1 |
| score_team2 | int | Games time 2 |
| status | text | pending / live / finished |
| created_at | timestamptz | Data de criação |

### tournament_results
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | text PK | ID único |
| tournament_id | text FK | Torneio |
| category | text | Categoria |
| group_name | text | Grupo |
| athlete_id | text FK | Atleta |
| round_scores | jsonb | Array de scores por rodada |
| total_games | int | Total de games vencidos |
| position | int | Posição final (1º-8º) |
| points | int | Pontos do torneio (8-1) |

### annual_rankings
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | text PK | ID único |
| athlete_id | text FK | Atleta |
| category | text | Categoria |
| year | int | Ano |
| total_points | int | Pontos acumulados |
| total_games | int | Games acumulados (normalizados) |
| tournaments_count | int | Torneios disputados |
| wins_count | int | Total de vitórias |

### sponsorships
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | text PK | ID único |
| tournament_id | text FK | Torneio |
| sponsor_id | text FK | Patrocinador (users.id) |
| tier | text | gold / silver / bronze |
| amount | numeric | Valor do patrocínio |
| description | text | Descrição |
| created_at | timestamptz | Data de criação |

### expenses
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | text PK | ID único |
| tournament_id | text FK | Torneio |
| category | text | premiacao / estrutura / marketing / arbitragem / alimentacao / fotografia / brindes / outros |
| description | text | Descrição |
| amount | numeric | Valor |
| receipt_url | text? | URL do comprovante |
| date | date | Data |
| created_by | text FK | Quem criou |
| created_at | timestamptz | Data de criação |

### revenues
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | text PK | ID único |
| tournament_id | text FK | Torneio |
| source | text | patrocinio / inscricao / outros |
| amount | numeric | Valor |
| description | text | Descrição |
| date | date | Data |
| created_by | text FK | Quem criou |
| created_at | timestamptz | Data de criação |

### photos
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | text PK | ID único |
| tournament_id | text? FK | Torneio (opcional) |
| url | text | URL da foto |
| caption | text? | Legenda |
| uploaded_by | text FK | Quem fez upload |
| created_at | timestamptz | Data de upload |

### notifications
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | text PK | ID único |
| user_id | text FK | Destinatário |
| type | text | jogo / resultado / ranking / sorteio / geral |
| title | text | Título |
| message | text | Mensagem |
| read | boolean | Lida ou não |
| created_at | timestamptz | Data de criação |

### apoiadores
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | text PK | ID único |
| tournament_id | text FK | Torneio |
| name | text | Nome |
| phone | text? | Telefone |
| created_at | timestamptz | Data de criação |

### brindes
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | text PK | ID único |
| tournament_id | text FK | Torneio |
| apoiador_id | text FK | FK → apoiadores.id |
| description | text | Descrição |
| quantity | int | Quantidade |
| type | text | kit / sorteio |
| created_at | timestamptz | Data de criação |

### raffle_records
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | text PK | ID único |
| tournament_id | text FK | Torneio |
| brinde_description | text | Descrição do brinde |
| winner_id | text FK | Ganhador (users.id) |
| winner_name | text | Nome do ganhador |
| created_at | timestamptz | Data do sorteio |

### notes
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | text PK | ID único |
| tournament_id | text? FK | Torneio (opcional) |
| title | text | Título |
| content | text | Conteúdo |
| pinned | boolean | Fixado ou não |
| created_at | timestamptz | Data de criação |
| updated_at | timestamptz | Data de atualização |

### config (tabela única)
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | text PK | "global" |
| pix_key | text | Chave PIX |
| pix_name | text | Nome do titular PIX |
| pix_city | text | Cidade do titular |
| admin_whatsapp | text | WhatsApp do admin |

---

## Relacionamentos

```
users ──┬── tournaments (created_by)
          ├── athlete_registrations (athlete_id)
          ├── tournament_results (athlete_id)
          ├── annual_rankings (athlete_id)
          ├── sponsorships (sponsor_id)
          ├── expenses (created_by)
          ├── revenues (created_by)
          ├── photos (uploaded_by)
          └── notifications (user_id)

tournaments ──┬── athlete_registrations
               ├── pairings
               ├── matches
               ├── tournament_results
               ├── sponsorships
               ├── expenses
               ├── revenues
               ├── photos
               └── apoiadores ─── brindes
```

---

## RLS (Row Level Security)
- **SELECT**: público (qualquer um com anon key pode ler)
- **INSERT/UPDATE/DELETE**: apenas service_role (server-side)
- **Storage**: bucket `photos` com `allow_public_upload` para upload via signed URL
- Migration: `supabase/migrations/20260705010000_enable_rls.sql`

---

_Última atualização: 18/07/2026 — THE SUPER 8_
