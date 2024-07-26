import { AppQueries } from '@/server/queries/apps/apps.queries';
import { notEmpty } from '@/server/common/typescript.helpers';
import { AppCatalogCommandParams, IAppCatalogCommand } from './types';
import { AppDataService } from '@runtipi/shared/node';

type ReturnValue = Awaited<ReturnType<InstanceType<typeof GetInstalledAppsCommand>['execute']>>;

export class GetInstalledAppsCommand implements IAppCatalogCommand<ReturnValue> {
  private queries: AppQueries;
  private appDataService: AppDataService;

  constructor(params: AppCatalogCommandParams) {
    this.queries = params.queries;
    this.appDataService = params.appDataService;
  }

  async execute() {
    const apps = await this.queries.getApps();

    const installedApps = await Promise.all(
      apps.map(async (app) => {
        try {
          const info = await this.appDataService.getInstalledInfo(app.id);
          const updateInfo = await this.appDataService.getUpdateInfo(app.id);
          if (info) {
            return { ...app, ...updateInfo, info };
          }
        } catch (e) {
          return null;
        }
      }),
    );

    return installedApps.filter(notEmpty);
  }
}
