import { CardStatus } from 'src/infrastructure/common/enum';

export interface DefaultStatusDefinition {
  code: CardStatus;
  name: string;
  color: string;
  order: number;
  isDefault: boolean;
}

export interface DefaultColumnDefinition {
  name: string;
  statusCodes: CardStatus[];
}

/**
 * Initial statuses seeded for every new project. The codes intentionally reuse
 * the legacy `CardStatus` enum values so existing cards can be migrated by code.
 */
export const DEFAULT_STATUSES: DefaultStatusDefinition[] = [
  {
    code: CardStatus.PLANNING,
    name: 'Planning',
    color: '#90A4AE',
    order: 0,
    isDefault: false,
  },
  {
    code: CardStatus.TODO,
    name: 'To Do',
    color: '#42A5F5',
    order: 1,
    isDefault: true,
  },
  {
    code: CardStatus.IN_PROGRESS,
    name: 'In Progress',
    color: '#FFA726',
    order: 2,
    isDefault: false,
  },
  {
    code: CardStatus.PENDING,
    name: 'Pending',
    color: '#FFCA28',
    order: 3,
    isDefault: false,
  },
  {
    code: CardStatus.TESTING,
    name: 'Testing',
    color: '#AB47BC',
    order: 4,
    isDefault: false,
  },
  {
    code: CardStatus.TO_REALIZE,
    name: 'To Realize',
    color: '#26C6DA',
    order: 5,
    isDefault: false,
  },
  {
    code: CardStatus.REJECTED,
    name: 'Rejected',
    color: '#EF5350',
    order: 6,
    isDefault: false,
  },
  {
    code: CardStatus.DONE,
    name: 'Done',
    color: '#66BB6A',
    order: 7,
    isDefault: false,
  },
];

export const buildDefaultStatuses = (projectId: string) =>
  DEFAULT_STATUSES.map((definition) => ({ ...definition, projectId }));

/** Columns (and their status mappings) created for every new board. */
export const DEFAULT_COLUMNS: DefaultColumnDefinition[] = [
  { name: 'To Do', statusCodes: [CardStatus.PLANNING, CardStatus.TODO] },
  {
    name: 'In Progress',
    statusCodes: [
      CardStatus.IN_PROGRESS,
      CardStatus.PENDING,
      CardStatus.TESTING,
      CardStatus.TO_REALIZE,
    ],
  },
  { name: 'Done', statusCodes: [CardStatus.REJECTED, CardStatus.DONE] },
];
