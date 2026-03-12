import { Module } from '@nestjs/common';
import { MembershipController } from 'src/adapters';
import { MembershipFactoryImpl, MembershipRepositoryImpl } from 'src/domain';
import {
  CreateMembershipUsecaseImpl,
  DeleteMembershipUsecaseImpl,
  FindMembershipByIdUsecaseImpl,
  GetMembershipsUsecaseImpl,
  UpdateMembershipUsecaseImpl,
} from 'src/application';
import {
  CreateMembershipPresenterImpl,
  FindMembershipByIdPresenterImpl,
  GetMembershipsPresenterImpl,
} from 'src/adapters';
import {
  FactorySymbols,
  PresenterSymbols,
  RepositorySymbols,
  UsecaseSymbols,
} from 'src/infrastructure/dependency-injection';
import { UserModule } from '../users/user.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [UserModule, RolesModule],
  controllers: [MembershipController],
  providers: [
    {
      provide: FactorySymbols.MemebershipFactory,
      useClass: MembershipFactoryImpl,
    },
    {
      provide: RepositorySymbols.MembershipRepository,
      useClass: MembershipRepositoryImpl,
    },
    {
      provide: UsecaseSymbols.Membership.CreateMembershipUsecase,
      useClass: CreateMembershipUsecaseImpl,
    },
    {
      provide: PresenterSymbols.Membership.CreateMembershipPresenter,
      useClass: CreateMembershipPresenterImpl,
    },
    {
      provide: UsecaseSymbols.Membership.FindMembershipByIdUsecase,
      useClass: FindMembershipByIdUsecaseImpl,
    },
    {
      provide: PresenterSymbols.Membership.FindMembershipByIdPresenter,
      useClass: FindMembershipByIdPresenterImpl,
    },
    {
      provide: UsecaseSymbols.Membership.GetMembershipsUsecase,
      useClass: GetMembershipsUsecaseImpl,
    },
    {
      provide: PresenterSymbols.Membership.GetMembershipsPresenter,
      useClass: GetMembershipsPresenterImpl,
    },
    {
      provide: UsecaseSymbols.Membership.UpdateMembershipUsecase,
      useClass: UpdateMembershipUsecaseImpl,
    },
    {
      provide: PresenterSymbols.Membership.UpdateMembershipPresenter,
      useClass: CreateMembershipPresenterImpl,
    },
    {
      provide: UsecaseSymbols.Membership.DeleteMembershipUsecase,
      useClass: DeleteMembershipUsecaseImpl,
    },
  ],
  exports: [
    FactorySymbols.MemebershipFactory,
    RepositorySymbols.MembershipRepository,
    UsecaseSymbols.Membership.CreateMembershipUsecase,
    UsecaseSymbols.Membership.FindMembershipByIdUsecase,
    UsecaseSymbols.Membership.GetMembershipsUsecase,
    UsecaseSymbols.Membership.UpdateMembershipUsecase,
    UsecaseSymbols.Membership.DeleteMembershipUsecase,
  ],
})
export class MembershipsModule {}
