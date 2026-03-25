import type { MedicationDetails } from '~/types/api'

export type MedicationForm = 
  | 'comprimé' 
  | 'gélule' 
  | 'sachet' 
  | 'dose' 
  | 'pastille' 
  | 'pilule' 
  | 'ampoule' 
  | 'suspension' 
  | 'unidose' 
  | 'aérosol' 
  | 'spray' 
  | 'patch' 
  | 'crème' 
  | 'pommade' 
  | 'gel' 
  | 'liquide' 
  | 'suppositoire' 
  | 'ovule' 
  | 'gouttes' 
  | 'inhalateur' 
  | 'autoinjecteur' 
  | 'seringue' 
  | 'compresse' 
  | 'pansement' 
  | 'bande' 
  | 'coton'

export const VALID_FORMS: MedicationForm[] = [
    'comprimé',
    'gélule',
    'sachet',
    'dose',
    'pastille',
    'pilule',
    'ampoule',
    'suspension',
    'unidose',
    'aérosol',
    'spray',
    'patch',
    'crème',
    'pommade',
    'gel',
    'liquide',
    'suppositoire',
    'ovule',
    'gouttes',
    'inhalateur',
    'autoinjecteur',
    'seringue',
    'compresse',
    'pansement',
    'bande',
    'coton'
]


export type Medication = {
    medicationId: string
    uid: string
    bareCode: string
    name: string
    expiryDate: Date
    expired: boolean
    quantity: number
    unitsPerBox: number
    numberOfBoxes: number
    image: string
    email: string
    details?: MedicationDetails
    createdAt: Date
    updatedAt: Date
}

