# Feature Roadmap

## Current status

The project already includes the foundation for a Kanban-style task management system:

- authentication, users, roles, and permissions
- teams, projects, and boards
- workflow columns
- cards with CRUD operations
- cross-column card reorder
- assignee, assigner, and story-point support

## High-priority features to add next

### 1. Comments and discussion
- Add comments on a card
- Track author, timestamp, and edited state
- Support replies and mention notifications

### 2. Subtasks / checklists
- Break a card into smaller executable tasks
- Track completion status per subtask
- Show aggregate progress in the card summary

### 3. Labels and priorities
- Labels for categories such as bug, feature, frontend, backend, QA
- Priority levels: low, medium, high, critical
- Filtering by label and priority

### 4. Due dates and reminders
- Add due date to each card
- Highlight overdue items
- Send reminders to assignees or watchers

### 5. Activity / history log
- Record when a card is created, moved, edited, assigned, or completed
- Support timeline-style history views
- Useful for auditing and team transparency

### 6. File attachments
- Upload screenshots, documents, and design files
- Store metadata and preview references
- Support download and delete actions

## Important workflow improvements

### 7. Drag-and-drop board interactions
- Drag cards between columns in the UI
- Trigger reorder logic automatically on drop
- Preserve card ordering and column indexes consistently

### 8. Bulk actions
- Move multiple cards together
- Assign many cards to one user
- Update status or labels in bulk

### 9. Search and filtering
- Search cards by title, description, assignee, label, or status
- Filter by board, column, assignee, priority, and due date
- Save common filter presets

## Collaboration features

### 10. Notifications
- Card assigned to user
- Due date approaching
- Card moved to a different column
- Comment mentioned a user

### 11. Watchers and mentions
- Let users follow a card
- Mention teammates @username in comments
- Send contextual notifications for mentions

## Advanced planning capabilities

### 12. Sprint and iteration support
- Group cards into sprints
- View sprint goals and velocity
- Show completed work per sprint

### 13. Dashboard analytics
- Cards by status
- Workload per assignee
- Cycle time and lead time
- Story point burn-down / velocity trends

### 14. Board templates
- Reusable column and card templates
- Project startup templates for common workflows
- Faster onboarding for new teams

## Maturity and operations

### 15. Soft delete and restore
- Mark deleted cards/boards/columns as archived rather than hard deleting immediately
- Support restore flows for accidental deletes

### 16. Realtime updates
- WebSocket updates for card movement, comments, and assignments
- Immediate synchronization across multiple clients

### 17. API quality improvements
- Versioned endpoints
- Better validation and standardized error payloads
- Clear pagination and filtering conventions
- More concrete examples for front-end integration

## Recommended next implementation order

1. Comments
2. Subtasks
3. Activity history
4. Due dates + priority + labels
5. Notifications
6. Drag-and-drop reorder in UI
7. Dashboard analytics
8. Realtime updates

## Suggested product direction

For a practical task-management tool, the most valuable next step is to add:

- comments
- subtasks
- activity history
- due dates and priorities
- notifications

This combination turns the Kanban board from a basic workflow tracker into a collaborative task execution system.
