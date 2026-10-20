export interface Island {
  name: string
  repository: string
  role: string
  concern: string
}

export interface ArcadiaSnapshot {
  source: { repository: string; path: string; roster: string; ref: string }
  charted: string
  islands: Island[]
}
