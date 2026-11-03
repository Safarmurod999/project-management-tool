import { Module } from '@nestjs/common';
import {
  WorkflowController,
  GetWorkflowsPresenterImpl,
  WorkflowDetailsPresenterImpl,
  DeleteWorkflowPresenterImpl,
} from 'src/adapters';
import {
  CreateWorkflowUsecaseImpl,
  GetWorkflowsUsecaseImpl,
  FindWorkflowByIdUsecaseImpl,
  FindProjectWorkflowUsecaseImpl,
  UpdateWorkflowUsecaseImpl,
  DeleteWorkflowUsecaseImpl,
  AddWorkflowStatusUsecaseImpl,
  RemoveWorkflowStatusUsecaseImpl,
  CreateWorkflowTransitionUsecaseImpl,
  UpdateWorkflowTransitionUsecaseImpl,
  DeleteWorkflowTransitionUsecaseImpl,
} from 'src/application';
import {
  CardRepositoryImpl,
  WorkflowFactoryImpl,
  WorkflowRepositoryImpl,
  WorkflowStatusRepositoryImpl,
  WorkflowTransitionFactoryImpl,
  WorkflowTransitionRepositoryImpl,
} from 'src/domain';
import {
  FactorySymbols,
  PresenterSymbols,
  RepositorySymbols,
  UsecaseSymbols,
} from 'src/infrastructure/dependency-injection';
import { StatusesModule } from '../statuses/statuses.module';

/**
 * Owns project workflows: which statuses each workflow allows and the
 * transition rules between them. It imports only StatusesModule, so Projects,
 * Boards, Columns and Cards can depend on it without circular imports.
 */
@Module({
  imports: [StatusesModule],
  controllers: [WorkflowController],
  providers: [
    {
      provide: FactorySymbols.WorkflowFactory,
      useClass: WorkflowFactoryImpl,
    },
    {
      provide: FactorySymbols.WorkflowTransitionFactory,
      useClass: WorkflowTransitionFactoryImpl,
    },
    {
      provide: RepositorySymbols.WorkflowRepository,
      useClass: WorkflowRepositoryImpl,
    },
    {
      provide: RepositorySymbols.WorkflowStatusRepository,
      useClass: WorkflowStatusRepositoryImpl,
    },
    {
      provide: RepositorySymbols.WorkflowTransitionRepository,
      useClass: WorkflowTransitionRepositoryImpl,
    },
    // Local instance (as in StatusesModule): CardsModule depends on this module.
    {
      provide: RepositorySymbols.CardRepository,
      useClass: CardRepositoryImpl,
    },
    {
      provide: UsecaseSymbols.Workflow.CreateWorkflowUsecase,
      useClass: CreateWorkflowUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Workflow.GetWorkflowsUsecase,
      useClass: GetWorkflowsUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Workflow.FindWorkflowByIdUsecase,
      useClass: FindWorkflowByIdUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Workflow.FindProjectWorkflowUsecase,
      useClass: FindProjectWorkflowUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Workflow.UpdateWorkflowUsecase,
      useClass: UpdateWorkflowUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Workflow.DeleteWorkflowUsecase,
      useClass: DeleteWorkflowUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Workflow.AddWorkflowStatusUsecase,
      useClass: AddWorkflowStatusUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Workflow.RemoveWorkflowStatusUsecase,
      useClass: RemoveWorkflowStatusUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Workflow.CreateWorkflowTransitionUsecase,
      useClass: CreateWorkflowTransitionUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Workflow.UpdateWorkflowTransitionUsecase,
      useClass: UpdateWorkflowTransitionUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Workflow.DeleteWorkflowTransitionUsecase,
      useClass: DeleteWorkflowTransitionUsecaseImpl,
    },
    {
      provide: PresenterSymbols.Workflow.GetWorkflowsPresenter,
      useClass: GetWorkflowsPresenterImpl,
    },
    {
      provide: PresenterSymbols.Workflow.WorkflowDetailsPresenter,
      useClass: WorkflowDetailsPresenterImpl,
    },
    {
      provide: PresenterSymbols.Workflow.DeleteWorkflowPresenter,
      useClass: DeleteWorkflowPresenterImpl,
    },
  ],
  exports: [
    FactorySymbols.WorkflowFactory,
    FactorySymbols.WorkflowTransitionFactory,
    RepositorySymbols.WorkflowRepository,
    RepositorySymbols.WorkflowStatusRepository,
    RepositorySymbols.WorkflowTransitionRepository,
  ],
})
export class WorkflowsModule {}
