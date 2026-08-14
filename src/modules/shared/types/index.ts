export interface BaseEntity {
  id: string;
  created_at: string;
}

export interface CatalogEntity extends BaseEntity {
  name: string;
}

export interface StratumEntity extends BaseEntity {
  level: number;
  name: string;
}
