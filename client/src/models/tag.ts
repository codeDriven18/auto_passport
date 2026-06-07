export interface Tag {
  id: string;
  name: string;
  slug?: string;
}

export interface Source {
  id: string;
  name: string;
  type: number;
  externalIdentifier?: string;
  isActive: boolean;
}
